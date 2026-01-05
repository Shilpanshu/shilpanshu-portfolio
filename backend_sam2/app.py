from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from ultralytics import SAM
import numpy as np
import cv2
import io
import json
from PIL import Image

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load SAM 2 model (Base version for speed/memory balance on Free Tier)
# It will auto-download on first run
model = SAM("sam2.1_b.pt")

@app.get("/")
def health_check():
    return {"status": "running", "model": "sam2.1_b"}

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
    
    results = model.predict(
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
