from flask import Flask, render_template, request, jsonify
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

from model import EMNIST_CNN

app = Flask(__name__)

device = torch.device("cpu")

model = EMNIST_CNN()

model.load_state_dict(
    torch.load(
        "emnist_model.pth",
        map_location=device
    )
)

model.eval()

transform = transforms.Compose([
    transforms.Grayscale(),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    file = request.files["image"]

    image = Image.open(
        io.BytesIO(file.read())
    )

    image = transform(image)
    image = image.unsqueeze(0)

    with torch.no_grad():

        output = model(image)

        prediction = torch.argmax(
            output,
            dim=1
        ).item()

    return jsonify({
        "prediction": prediction
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )
