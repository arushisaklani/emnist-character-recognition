# EMNIST Character Recognition

Full project for a 47-class EMNIST Balanced CNN.

IMPORTANT: the ZIP intentionally does not include your trained model. Add these two files to `backend/` from Colab:
- emnist_model.pth
- classes.json

Render: root `backend`, build `pip install -r requirements.txt`, start `gunicorn -k uvicorn.workers.UvicornWorker main:app`

Vercel: root `frontend`, framework `Other`, no build command.
