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
