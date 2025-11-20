import streamlit as st
import pandas as pd
from modules.utils.sample_data import get_sample_data


def render():
    """Render tab dataset upload"""
    st.subheader("📁 Upload Dataset")

    upload_type = st.radio(
        "Pilih tipe upload:",
        ["Sample Data", "Upload Train & Test", "Upload Single File"],
        horizontal=True,
        key="knn_upload_type"
    )

    if upload_type == "Sample Data":
        _handle_sample_data()
    elif upload_type == "Upload Train & Test":
        _handle_separate_upload()
    else:
        _handle_single_upload()


def _handle_sample_data():
    """Handle sample data"""
    df = get_sample_data()
    st.session_state['raw_data'] = df
    st.session_state['upload_type'] = 'single'

    st.success("✅ Sample data loaded!")
    st.dataframe(df, use_container_width=True)


def _handle_separate_upload():
    """Handle upload train & test terpisah"""
    col1, col2 = st.columns(2)

    with col1:
        train_file = st.file_uploader("Upload Train CSV", type=['csv'], key='train')
    with col2:
        test_file = st.file_uploader("Upload Test CSV", type=['csv'], key='test')

    if train_file and test_file:
        train_df = pd.read_csv(train_file)
        test_df = pd.read_csv(test_file)

        st.session_state['train_raw'] = train_df
        st.session_state['test_raw'] = test_df
        st.session_state['upload_type'] = 'separate'
        st.session_state['has_test_label'] = 'Loan_Status' in test_df.columns

        st.success(f"✅ Train: {len(train_df)} rows | Test: {len(test_df)} rows")

        col_prev1, col_prev2 = st.columns(2)
        with col_prev1:
            st.write("**Train Preview**")
            st.dataframe(train_df.head(), use_container_width=True)
        with col_prev2:
            st.write("**Test Preview**")
            st.dataframe(test_df.head(), use_container_width=True)


def _handle_single_upload():
    """Handle single file upload"""
    single_file = st.file_uploader("Upload CSV", type=['csv'], key='single')

    if single_file:
        df = pd.read_csv(single_file)
        st.session_state['raw_data'] = df
        st.session_state['upload_type'] = 'single'

        st.success(f"✅ Loaded {len(df)} rows")
        st.dataframe(df.head(10), use_container_width=True)