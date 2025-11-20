import streamlit as st
from modules.utils.data_cleaner import clean_missing_values


def render():
    """Render tab preprocessing"""
    st.subheader("🔧 Preprocessing - Handle Missing Values")

    if 'raw_data' not in st.session_state and 'train_raw' not in st.session_state:
        st.warning("⚠️ Upload dataset terlebih dahulu!")
        return

    if st.button("🔧 Preprocess Data", type="primary", key="knn_preprocess_btn"):
        upload_type = st.session_state.get('upload_type', 'single')

        if upload_type == 'separate':
            _preprocess_separate()
        else:
            _preprocess_single()


def _preprocess_separate():
    """Preprocess train & test terpisah"""
    train_df = st.session_state['train_raw'].copy()
    test_df = st.session_state['test_raw'].copy()

    # Clean train
    train_clean = clean_missing_values(train_df)

    # Clean test using train statistics
    test_clean = clean_missing_values(test_df, reference_df=train_df)

    st.session_state['train_clean'] = train_clean
    st.session_state['test_clean'] = test_clean

    st.success("✅ Preprocessing selesai!")

    col1, col2 = st.columns(2)
    with col1:
        st.write("**Train Clean**")
        st.dataframe(train_clean.head(), use_container_width=True)
    with col2:
        st.write("**Test Clean**")
        st.dataframe(test_clean.head(), use_container_width=True)


def _preprocess_single():
    """Preprocess single dataset"""
    df = st.session_state['raw_data'].copy()
    df_clean = clean_missing_values(df)

    st.session_state['clean_data'] = df_clean
    st.success("✅ Preprocessing selesai!")
    st.dataframe(df_clean.head(10), use_container_width=True)