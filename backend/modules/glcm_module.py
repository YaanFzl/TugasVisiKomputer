import streamlit as st
import numpy as np
from PIL import Image
from skimage.feature import graycomatrix, graycoprops
from skimage import color
import pandas as pd


def glcm_analysis():
    """Fungsi untuk analisis tekstur menggunakan GLCM"""

    uploaded_file = st.file_uploader(
        "Upload Gambar",
        type=['png', 'jpg', 'jpeg', 'bmp'],
        key='glcm_uploader'
    )

    if uploaded_file is not None:
        # Load dan konversi gambar
        image = Image.open(uploaded_file)
        img_array = np.array(image)

        # Konversi ke grayscale
        if len(img_array.shape) == 3:
            img_gray = color.rgb2gray(img_array)
        else:
            img_gray = img_array

        img_gray = (img_gray * 255).astype(np.uint8)

        # Tampilkan gambar
        _display_images(image, img_gray)

        st.markdown("---")
        st.subheader("⚙️ Pengaturan GLCM")

        # Pengaturan parameter
        degrees, distance = _get_glcm_settings()

        # Proses GLCM
        if st.button("🔍 Proses Analisis GLCM", type="primary"):
            if len(degrees) == 0:
                st.error("⚠️ Pilih minimal satu derajat!")
            else:
                _process_glcm(img_gray, degrees, distance)
    else:
        st.info("👆 Silakan upload gambar untuk memulai analisis GLCM")


def _display_images(original, grayscale):
    """Tampilkan gambar asli dan grayscale"""
    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Gambar Asli")
        st.image(original, use_container_width=True)

    with col2:
        st.subheader("Gambar Grayscale")
        st.image(grayscale, use_container_width=True)


def _get_glcm_settings():
    """Ambil pengaturan GLCM dari user"""
    col_settings1, col_settings2 = st.columns(2)

    with col_settings1:
        degrees = st.multiselect(
            "Pilih Derajat (Orientasi)",
            options=[0, 45, 90, 135],
            default=[0, 45, 90, 135],
            help="Pilih sudut orientasi untuk analisis GLCM",
            key="glcm_degrees"
        )

    with col_settings2:
        distance = st.slider(
            "Jarak Pixel",
            min_value=1,
            max_value=10,
            value=1,
            key="glcm_distance"
        )

    return degrees, distance


def _process_glcm(img_gray, degrees, distance):
    """Proses perhitungan GLCM dan tampilkan hasil"""
    with st.spinner("Memproses gambar..."):
        # Hitung GLCM
        angles = [np.deg2rad(deg) for deg in degrees]
        glcm = graycomatrix(
            img_gray,
            distances=[distance],
            angles=angles,
            levels=256,
            symmetric=True,
            normed=True
        )

        # Ekstrak fitur
        features = _extract_glcm_features(glcm)

        st.success("✅ Analisis selesai!")
        st.markdown("---")

        # Tampilkan hasil
        _display_results(features, degrees)
        _display_detailed_tabs(features, degrees)


def _extract_glcm_features(glcm):
    """Ekstrak semua fitur GLCM"""
    return {
        'contrast': graycoprops(glcm, 'contrast')[0],
        'dissimilarity': graycoprops(glcm, 'dissimilarity')[0],
        'homogeneity': graycoprops(glcm, 'homogeneity')[0],
        'energy': graycoprops(glcm, 'energy')[0],
        'correlation': graycoprops(glcm, 'correlation')[0],
        'ASM': graycoprops(glcm, 'ASM')[0]
    }


def _display_results(features, degrees):
    """Tampilkan hasil dalam tabel"""
    st.subheader("📊 Hasil Fitur GLCM")

    results = []
    for i, deg in enumerate(degrees):
        results.append({
            'Derajat': f"{deg}°",
            'Kontras': f"{features['contrast'][i]:.4f}",
            'Dissimilarity': f"{features['dissimilarity'][i]:.4f}",
            'Homogeneity': f"{features['homogeneity'][i]:.4f}",
            'Energy': f"{features['energy'][i]:.4f}",
            'Correlation': f"{features['correlation'][i]:.4f}",
            'ASM': f"{features['ASM'][i]:.4f}"
        })

    df = pd.DataFrame(results)
    st.dataframe(df, use_container_width=True, hide_index=True)


def _display_detailed_tabs(features, degrees):
    """Tampilkan detail per derajat dalam tabs"""
    st.markdown("---")
    st.subheader("🔎 Detail Per Derajat")
    tabs = st.tabs([f"{deg}°" for deg in degrees])

    for i, (tab, deg) in enumerate(zip(tabs, degrees)):
        with tab:
            col_a, col_b, col_c = st.columns(3)

            with col_a:
                st.metric("Kontras", f"{features['contrast'][i]:.4f}")
                st.metric("Dissimilarity", f"{features['dissimilarity'][i]:.4f}")

            with col_b:
                st.metric("Homogeneity", f"{features['homogeneity'][i]:.4f}")
                st.metric("Energy", f"{features['energy'][i]:.4f}")

            with col_c:
                st.metric("Correlation", f"{features['correlation'][i]:.4f}")
                st.metric("ASM", f"{features['ASM'][i]:.4f}")