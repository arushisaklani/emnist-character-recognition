from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import io, json
from pathlib import Path

app = FastAPI(title="EMNIST Character Recognition API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"]
)

class EMNIST_CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.25)
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, 47)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = self.pool(x)
        x = torch.relu(self.conv2(x))
        x = self.pool(x)
        x = self.dropout(x)
        x = x.view(-1, 64 * 7 * 7)
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        return self.fc2(x)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "emnist_model.pth"
CLASSES_PATH = BASE_DIR / "classes.json"
device = torch.device("cpu")
model = None
classes = None
model_error = None

try:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("emnist_model.pth is missing. Upload your trained Colab model to backend/.")
    if not CLASSES_PATH.exists():
        raise FileNotFoundError("classes.json is missing. Upload the class mapping from Colab to backend/.")
    model = EMNIST_CNN().to(device)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    with open(CLASSES_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)
    if len(classes) != 47:
        raise ValueError(f"Expected 47 classes, found {len(classes)}.")
except Exception as exc:
    model_error = str(exc)

def preprocess_image(image):
    image = image.convert("L")
    image = image.rotate(90, expand=True)
    image = ImageOps.mirror(image)
    image = image.resize((28, 28))
    tensor = transforms.ToTensor()(image)
    tensor = transforms.Normalize((0.5,), (0.5,))(tensor)
    return tensor.unsqueeze(0)

@app.get("/")
def root():
    return {"message": "EMNIST Character Recognition API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {
        "status": "ok" if model is not None else "error",
        "model_loaded": model is not None,
        "classes": len(classes) if classes else 0,
        "error": model_error
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None or classes is None:
        raise HTTPException(status_code=500, detail=model_error or "Model is not loaded.")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a PNG, JPG/JPEG, or WebP image.")
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        input_tensor = preprocess_image(image).to(device)
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            confidence, prediction = torch.max(probabilities, dim=1)
        class_index = prediction.item()
        return {
            "prediction": str(classes[class_index]),
            "class_index": class_index,
            "confidence": round(confidence.item() * 100, 2),
            "model": "EMNIST CNN",
            "dataset": "EMNIST Balanced"
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
