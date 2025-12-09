from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import numpy as np
from PIL import Image
import io
from skimage.feature import graycomatrix, graycoprops
from skimage import color
import base64

router = APIRouter(prefix="/glcm", tags=["glcm"])

@router.post("/analyze")
async def analyze_glcm(
    file: UploadFile = File(...),
    degrees: str = Form(...), # Comma separated string: "0,45,90"
    distance: int = Form(...)
):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        img_array = np.array(image)

        # Convert to grayscale
        if len(img_array.shape) == 3:
            img_gray = color.rgb2gray(img_array)
        else:
            img_gray = img_array
        
        img_gray = (img_gray * 255).astype(np.uint8)

        # Parse degrees
        degree_list = [int(d) for d in degrees.split(",")]
        angles = [np.deg2rad(deg) for deg in degree_list]

        # Calculate GLCM
        glcm = graycomatrix(
            img_gray,
            distances=[distance],
            angles=angles,
            levels=256,
            symmetric=True,
            normed=True
        )

        # Extract features
        features = {
            'contrast': graycoprops(glcm, 'contrast')[0].tolist(),
            'dissimilarity': graycoprops(glcm, 'dissimilarity')[0].tolist(),
            'homogeneity': graycoprops(glcm, 'homogeneity')[0].tolist(),
            'energy': graycoprops(glcm, 'energy')[0].tolist(),
            'correlation': graycoprops(glcm, 'correlation')[0].tolist(),
            'ASM': graycoprops(glcm, 'ASM')[0].tolist()
        }

        # Prepare matrices for all angles
        glcm_matrices = {}
        for i, deg in enumerate(degree_list):
            glcm_matrices[str(deg)] = glcm[:, :, 0, i].tolist()

        return {
            "status": "success",
            "features": features,
            "degrees": degree_list,
            "glcm_matrices": glcm_matrices
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== LBP (Local Binary Pattern) Endpoints ==============

from backend.modules.lbp_module import compute_lbp, compute_lbp_histogram, analyze_texture_uniformity


@router.post("/lbp/analyze")
async def lbp_analyze(
    file: UploadFile = File(...),
    radius: int = Form(1),
    n_points: int = Form(8),
    method: str = Form("uniform")
):
    """Compute LBP and return analysis results"""
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = np.array(image)
        
        # Compute LBP
        lbp_normalized, lbp_raw, info = compute_lbp(img_array, radius, n_points, method)
        
        # Get histogram
        histogram_data = compute_lbp_histogram(lbp_raw, n_bins=n_points + 2 if method == 'uniform' else 256)
        
        # Get uniformity analysis
        uniformity = analyze_texture_uniformity(lbp_raw)
        
        # Convert LBP image to base64
        lbp_img = Image.fromarray(lbp_normalized)
        buffer = io.BytesIO()
        lbp_img.save(buffer, format="PNG")
        lbp_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            "status": "success",
            "lbp_image": lbp_base64,
            "info": info,
            "histogram": histogram_data,
            "uniformity": uniformity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
