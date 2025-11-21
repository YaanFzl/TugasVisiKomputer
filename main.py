from backend.main import app
import uvicorn
import os

if __name__ == "__main__":
    # Run the FastAPI application
    # Reload is enabled for development convenience, but can be disabled for production
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
