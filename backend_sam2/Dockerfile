FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Create cache dir for Ultralytics/Torch to avoid permission errors
RUN mkdir -p /app/.config && chmod 777 /app/.config
ENV HOME=/app

# Expose port (Hugging Face Spaces uses 7860)
EXPOSE 7860

# Run
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
