from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from ultralytics import SAM
import numpy as np
import cv2
import io
import json
from PIL import Image, ImageOps
import torch
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Set precision as per user script (if available in this torch version)
try:
    torch.set_float32_matmul_precision("high")
except:
    pass

# 1. SAM 2 (For Interactive Segmentation)
sam_model = SAM("sam2.1_b.pt")

# 2. BiRefNet (For Auto Background Removal)
print("Loading BiRefNet...")
try:
    birefnet = AutoModelForImageSegmentation.from_pretrained(
        "ZhengPeng7/BiRefNet", trust_remote_code=True
    )
    birefnet.to(device)
    print("BiRefNet Loaded Successfully.")
except Exception as e:
    print(f"Failed to load BiRefNet: {e}")
    birefnet = None

# Stats
transform_image = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

@app.get("/")
def health_check():
    return {"status": "running", "device": device, "models": ["sam2.1_b", "BiRefNet"]}

@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    if not birefnet:
        return {"error": "BiRefNet model failed to load on server."}

    # 1. Read Image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # --- FIX: Handle EXIF Rotation (User's 'load_img' likely did this) ---
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    # 2. Preprocess
    image_size = image.size
    input_images = transform_image(image).unsqueeze(0).to(device)

    # 3. Inference
    with torch.no_grad():
       preds = birefnet(input_images)[-1].sigmoid().cpu()

    pred = preds[0].squeeze()

    # 4. Process Mask
    pred_pil = transforms.ToPILImage()(pred)
    mask = pred_pil.resize(image_size)

    # 5. Apply Alpha
    image.putalpha(mask)

    # 6. Return PNG
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    return Response(content=img_byte_arr.getvalue(), media_type="image/png")

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    points: str = Form(...), # JSON string: "[[x,y], [x,y]]"
    labels: str = Form(...)  # JSON string: "[1, 0]" (1=include, 0=exclude)
):
    # 1. Read Image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 2. Parse Points
    # Ultralytics expects points in a specific format.
    # We'll need to pass them to the predict method.
    points_list = json.loads(points)
    labels_list = json.loads(labels)
    
    # 3. Run Inference
    # Note: Ultralytics SAM integration for prompt-based segmentation 
    # might differ slightly by version.
    # If standard ultralytics 'predict' doesn't support interactive points easily via this API,
    # we use the underlying predictor. 
    # However, 'model.predict(source=img, bboxes=...)' is supported. 
    # Points are supported via 'points' argument in recent versions.
    
    results = sam_model.predict(
        source=img,
        points=points_list,
        labels=labels_list,
        retina_masks=True
    )
    
    # 4. Process Result
    # specific logic to get the best mask
    # For now, we take the first object mask
    if not results or not results[0].masks:
        return {"error": "No mask found"}
    
    # Get the mask (H, W)
    mask_data = results[0].masks.data[0].cpu().numpy() # take 1st mask
    
    # Convert to PNG
    # Evaluate mask: 0 or 1. Scale to 255.
    mask_img = (mask_data * 255).astype(np.uint8)
    
    # Encode
    success, encoded_image = cv2.imencode('.png', mask_img)
    if not success:
        return {"error": "Failed to encode mask"}
        
    return Response(content=encoded_image.tobytes(), media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
