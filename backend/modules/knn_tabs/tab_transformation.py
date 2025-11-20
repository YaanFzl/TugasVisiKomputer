import streamlit as st
from modules.utils.encoder import encode_categorical


def render():
    """Render tab transformation"""
    st.subheader("🔄 Encoding Categorical Variables")

    if 'clean_data' not in st.session_state and 'train_clean' not in st.session_state:
        st.warning("⚠️ Lakukan preprocessing terlebih dahulu!")
        return

    if st.button("🔄 Encode Data", type="primary", key="knn_encode_btn"):
        upload_type = st.session_state.get('upload_type', 'single')

        if upload_type == 'separate':
            _encode_separate()
        else:
            _encode_single()


def _encode_separate():
    """Encode train & test terpisah"""
    train_df = st.session_state['train_clean'].copy()
    test_df = st.session_state['test_clean'].copy()

    # Encode menggunakan utility function
    train_encoded, test_encoded, encoders = encode_categorical(train_df, test_df)

    st.session_state['train_encoded'] = train_encoded
    st.session_state['test_encoded'] = test_encoded
    st.session_state['encoders'] = encoders

    st.success("✅ Encoding selesai!")

    col1, col2 = st.columns(2)
    with col1:
        st.write("**Train Encoded**")
        st.dataframe(train_encoded.head(), use_container_width=True)
    with col2:
        st.write("**Test Encoded**")
        st.dataframe(test_encoded.head(), use_container_width=True)


def _encode_single():
    """Encode single dataset"""
    df = st.session_state['clean_data'].copy()

    # Encode
    df_encoded, _, encoders = encode_categorical(df)

    st.session_state['encoded_data'] = df_encoded
    st.session_state['encoders'] = encoders

    st.success("✅ Encoding selesai!")
    st.dataframe(df_encoded.head(10), use_container_width=True)