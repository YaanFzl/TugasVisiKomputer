from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directory to path to allow importing 'backend' package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import routers with optional GLCM (requires scikit-image which may not be installed)
from backend.routers import knn, naive_bayes, decision_tree

try:
    from backend.routers import glcm
    GLCM_AVAILABLE = True
except ImportError as e:
    print(f"Warning: GLCM module not available: {e}")
    GLCM_AVAILABLE = False

app = FastAPI(title="VisKom WebGL Clone")

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Content Security Policy (CSP)
        # Starting with a permissive policy for dev/demo, but restricting object-src and base-uri
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' *; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        response.headers["Content-Security-Policy"] = csp
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    # In production, hide details. In dev, we might want them, but the requirement is to hide them.
    # Assuming "production" behavior is desired for security.
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please contact support."}
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
if GLCM_AVAILABLE:
    app.include_router(glcm.router, prefix="/api")
app.include_router(knn.router, prefix="/api")
app.include_router(naive_bayes.router, prefix="/api")
app.include_router(decision_tree.router, prefix="/api")

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
