import streamlit as st
from modules.knn_tabs import (
    tab_dataset,
    tab_preprocessing,
    tab_transformation,
    tab_training,
    tab_evaluation
)


def knn_classification():
    """Main function untuk klasifikasi KNN"""

    st.markdown("### 📊 Dataset: Loan Prediction Dataset")

    # Create tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📁 Dataset",
        "🔧 Preprocessing",
        "🔄 Transformasi",
        "🤖 Training KNN",
        "📈 Evaluasi & Prediksi"
    ])

    # Render each tab
    with tab1:
        tab_dataset.render()

    with tab2:
        tab_preprocessing.render()

    with tab3:
        tab_transformation.render()

    with tab4:
        tab_training.render()

    with tab5:
        tab_evaluation.render()