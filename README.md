# VisKomClean

A modern web application showcasing advanced UI/UX features with 3D background transitions, animated splash screen, and machine‑learning visualizations (GLCM, KNN, Naive Bayes).

## Features
- **Animated splash screen** with particles and scanning line effect.
- **Smooth page transitions** powered by `framer‑motion`.
- **Dynamic 3D backgrounds** per module using `@react‑three/fiber`:
  - Home: particle cloud & wave grid
  - GLCM: scattered texture pixels
  - KNN: network nodes
  - Naive Bayes: floating probability spheres
- **Backend API** built with FastAPI (Python) exposing ML endpoints.
- **Responsive design** with a cyber‑punk aesthetic.

## Getting Started
```bash
# Clone the repo
git clone https://github.com/YaanFzl/TugasVisiKomputer.git
cd TugasVisiKomputer/web

# Install dependencies (frontend)
npm install
npm run dev   # start Vite dev server

# Backend (Python)
python -m venv .venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deploying to Railway
1. Sign up at https://railway.app and create a new project.
2. Choose **Deploy from GitHub** and connect the `YaanFzl/TugasVisiKomputer` repository.
3. Railway will detect the `backend` (FastAPI) and `frontend` (Vite) services.
   - For the backend, set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - For the frontend, set the build command `npm run build` and the start command `npm run preview` (or use a static site service).
4. Add any required environment variables (e.g., `PORT` is provided by Railway automatically).
5. Click **Deploy** – Railway will build and launch both services, giving you a public URL.

## License
MIT © 2025
