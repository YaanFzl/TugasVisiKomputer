"""
LBP (Local Binary Pattern) Module

A texture operator used for texture classification and analysis in computer vision.
LBP labels pixels by thresholding the neighborhood of each pixel and creates 
a binary pattern from the result.
"""

import numpy as np
from PIL import Image
from skimage.feature import local_binary_pattern
from skimage import color


def compute_lbp(image_array: np.ndarray, radius: int = 1, n_points: int = 8, method: str = 'uniform') -> tuple[np.ndarray, dict]:
    """
    Compute Local Binary Pattern of an image.
    
    Args:
        image_array: NumPy array of the image (RGB or grayscale)
        radius: Radius of circle for neighbor sampling
        n_points: Number of circularly symmetric neighbor points
        method: LBP method ('default', 'ror', 'uniform', 'var')
    
    Returns:
        Tuple of (lbp_image, info_dict)
    """
    # Convert to grayscale if needed
    if len(image_array.shape) == 3:
        img_gray = color.rgb2gray(image_array)
        img_gray = (img_gray * 255).astype(np.uint8)
    else:
        img_gray = image_array.astype(np.uint8)
    
    # Compute LBP
    lbp = local_binary_pattern(img_gray, n_points, radius, method=method)
    
    # Normalize LBP for visualization
    lbp_normalized = ((lbp - lbp.min()) / (lbp.max() - lbp.min() + 1e-10) * 255).astype(np.uint8)
    
    info = {
        "radius": radius,
        "n_points": n_points,
        "method": method,
        "unique_patterns": int(len(np.unique(lbp))),
        "lbp_min": float(lbp.min()),
        "lbp_max": float(lbp.max())
    }
    
    return lbp_normalized, lbp, info


def compute_lbp_histogram(lbp_array: np.ndarray, n_bins: int = 256) -> dict:
    """
    Compute histogram of LBP values for texture feature extraction.
    
    Args:
        lbp_array: Raw LBP array (not normalized)
        n_bins: Number of histogram bins
    
    Returns:
        Dictionary with histogram data
    """
    # Compute histogram
    hist, bin_edges = np.histogram(lbp_array.ravel(), bins=n_bins, range=(0, n_bins))
    
    # Normalize histogram
    hist_normalized = hist.astype(float) / (hist.sum() + 1e-10)
    
    return {
        "histogram": hist.tolist(),
        "histogram_normalized": hist_normalized.tolist(),
        "bin_edges": bin_edges.tolist(),
        "total_pixels": int(lbp_array.size),
        "entropy": float(-np.sum(hist_normalized * np.log2(hist_normalized + 1e-10)))
    }


def compare_lbp_histograms(hist1: list, hist2: list, method: str = 'chi_square') -> dict:
    """
    Compare two LBP histograms for texture similarity.
    
    Args:
        hist1: First histogram (normalized)
        hist2: Second histogram (normalized)
        method: Comparison method ('chi_square', 'intersection', 'bhattacharyya')
    
    Returns:
        Dictionary with similarity metrics
    """
    h1 = np.array(hist1)
    h2 = np.array(hist2)
    
    # Chi-Square distance
    chi_square = np.sum((h1 - h2) ** 2 / (h1 + h2 + 1e-10))
    
    # Histogram intersection
    intersection = np.sum(np.minimum(h1, h2))
    
    # Bhattacharyya distance
    bhattacharyya = -np.log(np.sum(np.sqrt(h1 * h2)) + 1e-10)
    
    # Euclidean distance
    euclidean = np.sqrt(np.sum((h1 - h2) ** 2))
    
    return {
        "chi_square": float(chi_square),
        "intersection": float(intersection),
        "bhattacharyya": float(bhattacharyya),
        "euclidean": float(euclidean)
    }


def analyze_texture_uniformity(lbp_array: np.ndarray) -> dict:
    """
    Analyze texture uniformity using LBP patterns.
    
    Args:
        lbp_array: Raw LBP array
    
    Returns:
        Dictionary with uniformity metrics
    """
    unique, counts = np.unique(lbp_array, return_counts=True)
    total = lbp_array.size
    
    # Find dominant patterns
    sorted_indices = np.argsort(counts)[::-1]
    top_patterns = []
    for i in range(min(5, len(unique))):
        idx = sorted_indices[i]
        top_patterns.append({
            "pattern": int(unique[idx]),
            "count": int(counts[idx]),
            "percentage": float(counts[idx] / total * 100)
        })
    
    # Calculate uniformity score (how concentrated the distribution is)
    probs = counts / total
    entropy = -np.sum(probs * np.log2(probs + 1e-10))
    max_entropy = np.log2(len(unique)) if len(unique) > 1 else 1
    uniformity_score = 1 - (entropy / max_entropy) if max_entropy > 0 else 1
    
    return {
        "unique_patterns": len(unique),
        "top_patterns": top_patterns,
        "entropy": float(entropy),
        "uniformity_score": float(uniformity_score),
        "texture_type": "uniform" if uniformity_score > 0.7 else ("moderate" if uniformity_score > 0.4 else "complex")
    }
