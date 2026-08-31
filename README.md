# Backend

Add `emnist_model.pth` and `classes.json` from your Colab notebook to this folder.

Render:
- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `gunicorn -k uvicorn.workers.UvicornWorker main:app`

Test `/health` before connecting the frontend.
