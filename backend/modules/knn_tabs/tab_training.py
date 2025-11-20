import streamlit as st
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split


def render():
    """Render tab training"""
    st.subheader("🤖 Train K-Nearest Neighbor Model")

    if 'encoded_data' not in st.session_state and 'train_encoded' not in st.session_state:
        st.warning("⚠️ Lakukan encoding terlebih dahulu!")
        return

    # Settings
    col1, col2 = st.columns(2)
    with col1:
        k_value = st.slider("Nilai K", min_value=1, max_value=20, value=5, key="knn_k_value")
    with col2:
        test_size = st.slider("Test Size (%)", min_value=10, max_value=40, value=20, key="knn_test_size")

    if st.button("🚀 Train Model", type="primary", key="knn_train_btn"):
        upload_type = st.session_state.get('upload_type', 'single')

        if upload_type == 'separate':
            _train_separate(k_value)
        else:
            _train_single(k_value, test_size)


def _train_separate(k_value):
    """Train dengan data terpisah"""
    train_df = st.session_state['train_encoded'].copy()
    test_df = st.session_state['test_encoded'].copy()

    # Remove Loan_ID
    if 'Loan_ID' in train_df.columns:
        train_df = train_df.drop('Loan_ID', axis=1)
    if 'Loan_ID' in test_df.columns:
        test_df = test_df.drop('Loan_ID', axis=1)

    # Prepare features
    X_train = train_df.drop('Loan_Status', axis=1)
    y_train = train_df['Loan_Status']

    has_label = st.session_state.get('has_test_label', True)
    if has_label:
        X_test = test_df.drop('Loan_Status', axis=1)
        y_test = test_df['Loan_Status']
    else:
        X_test = test_df
        y_test = None

    # Train and predict
    model, y_pred = _train_knn(X_train, y_train, X_test, k_value)

    # Save to session
    _save_model_results(model, X_train, X_test, y_train, y_test, y_pred, k_value)


def _train_single(k_value, test_size):
    """Train dengan single dataset"""
    df = st.session_state['encoded_data'].copy()

    if 'Loan_ID' in df.columns:
        df = df.drop('Loan_ID', axis=1)

    X = df.drop('Loan_Status', axis=1)
    y = df['Loan_Status']

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size / 100, random_state=42
    )

    # Train and predict
    model, y_pred = _train_knn(X_train, y_train, X_test, k_value)

    # Save to session
    _save_model_results(model, X_train, X_test, y_train, y_test, y_pred, k_value)


def _train_knn(X_train, y_train, X_test, k_value):
    """Train KNN model"""
    knn = KNeighborsClassifier(n_neighbors=k_value)
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    return knn, y_pred


def _save_model_results(model, X_train, X_test, y_train, y_test, y_pred, k_value):
    """Save model and results to session state"""
    st.session_state['model'] = model
    st.session_state['X_train'] = X_train
    st.session_state['X_test'] = X_test
    st.session_state['y_train'] = y_train
    st.session_state['y_test'] = y_test
    st.session_state['y_pred'] = y_pred

    st.success("✅ Model trained successfully!")

    col1, col2, col3 = st.columns(3)
    col1.metric("Train Size", len(X_train))
    col2.metric("Test Size", len(X_test))
    col3.metric("K Value", k_value)