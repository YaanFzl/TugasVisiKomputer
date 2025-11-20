import streamlit as st
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt


def render():
    """Render tab evaluation"""
    st.subheader("📈 Model Evaluation & Prediction")

    if 'model' not in st.session_state:
        st.warning("⚠️ Train model terlebih dahulu!")
        return

    y_test = st.session_state['y_test']
    y_pred = st.session_state['y_pred']

    if y_test is not None:
        _show_evaluation(y_test, y_pred)
    else:
        _show_predictions_only()

    # Form untuk prediksi baru
    st.markdown("---")
    _show_prediction_form()


def _show_evaluation(y_test, y_pred):
    """Tampilkan evaluasi model"""
    acc = accuracy_score(y_test, y_pred)
    st.metric("Accuracy", f"{acc * 100:.2f}%")

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    st.pyplot(fig)


def _show_predictions_only():
    """Tampilkan prediksi tanpa evaluasi"""
    st.info("ℹ️ Test data tidak punya label. Tampilkan hasil prediksi saja.")

    encoders = st.session_state['encoders']
    y_pred = st.session_state['y_pred']
    y_pred_decoded = encoders['Loan_Status'].inverse_transform(y_pred)

    test_original = st.session_state['test_raw'].copy()
    test_original['Prediction'] = y_pred_decoded

    st.dataframe(test_original, use_container_width=True)

    # Download button
    csv = test_original.to_csv(index=False)
    st.download_button(
        "📥 Download Predictions",
        csv,
        "predictions.csv",
        "text/csv",
        key="download_predictions_btn"
    )


def _show_prediction_form():
    """Form untuk prediksi data baru"""
    st.subheader("🎯 Predict New Data")

    with st.form("predict_form_knn"):
        col1, col2, col3 = st.columns(3)

        with col1:
            gender = st.selectbox("Gender", ["Male", "Female"], key="pred_gender")
            married = st.selectbox("Married", ["Yes", "No"], key="pred_married")
            dependents = st.number_input("Dependents", 0, 4, 0, key="pred_dependents")
            education = st.selectbox("Education", ["Graduate", "Not Graduate"], key="pred_education")

        with col2:
            self_employed = st.selectbox("Self Employed", ["Yes", "No"], key="pred_self_employed")
            applicant_income = st.number_input("Applicant Income", 0, 100000, 5000, key="pred_app_income")
            coapplicant_income = st.number_input("Coapplicant Income", 0, 100000, 0, key="pred_coapp_income")

        with col3:
            loan_amount = st.number_input("Loan Amount", 0, 1000, 100, key="pred_loan_amount")
            loan_term = st.number_input("Loan Term (months)", 0, 480, 360, key="pred_loan_term")
            credit_history = st.selectbox("Credit History", [1, 0], key="pred_credit_history")
            property_area = st.selectbox("Property Area", ["Urban", "Semiurban", "Rural"], key="pred_property_area")

        submitted = st.form_submit_button("🔮 Predict", type="primary")

        if submitted:
            _make_prediction(
                gender, married, dependents, education, self_employed,
                applicant_income, coapplicant_income, loan_amount,
                loan_term, credit_history, property_area
            )


def _make_prediction(gender, married, dependents, education, self_employed,
                     applicant_income, coapplicant_income, loan_amount,
                     loan_term, credit_history, property_area):
    """Buat prediksi dari input user"""
    encoders = st.session_state['encoders']

    input_data = {
        'Gender': encoders['Gender'].transform([gender])[0],
        'Married': encoders['Married'].transform([married])[0],
        'Dependents': dependents,
        'Education': encoders['Education'].transform([education])[0],
        'Self_Employed': encoders['Self_Employed'].transform([self_employed])[0],
        'ApplicantIncome': applicant_income,
        'CoapplicantIncome': coapplicant_income,
        'LoanAmount': loan_amount,
        'Loan_Amount_Term': loan_term,
        'Credit_History': credit_history,
        'Property_Area': encoders['Property_Area'].transform([property_area])[0]
    }

    input_df = pd.DataFrame([input_data])
    model = st.session_state['model']
    prediction = model.predict(input_df)[0]
    pred_label = encoders['Loan_Status'].inverse_transform([prediction])[0]

    if pred_label == 'Y':
        st.success("✅ LOAN APPROVED!")
        st.balloons()
    else:
        st.error("❌ LOAN REJECTED")