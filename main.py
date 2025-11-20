import uvicorn
import os

if __name__ == "__main__":
    # Run the FastAPI application
    # Reload is enabled for development convenience, but can be disabled for production
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, app_dir="web")
