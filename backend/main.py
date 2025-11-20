from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.routers import glcm, knn, naive_bayes

app = FastAPI(title="VisKom WebGL Clone")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(glcm.router)
app.include_router(knn.router)
app.include_router(naive_bayes.router, prefix="/api")

# API Routes (Placeholder)
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Serve Frontend Static Files (Production Mode)
# In dev, we use Vite's dev server. In prod, we serve the 'dist' folder.
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    print(f"Warning: Frontend build not found at {frontend_dist}. Run 'npm run build' in frontend directory.")
