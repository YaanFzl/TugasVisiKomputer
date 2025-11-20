import pandas as pd

def get_sample_data():
    """Return sample loan data for testing"""
    data = {
        'Loan_ID': ['LP001002', 'LP001003', 'LP001005', 'LP001006', 'LP001008'],
        'Gender': ['Male', 'Male', 'Male', 'Male', 'Male'],
        'Married': ['No', 'Yes', 'Yes', 'Yes', 'No'],
        'Dependents': [0, 1, 0, 0, 0],
        'Education': ['Graduate', 'Graduate', 'Graduate', 'Not Graduate', 'Graduate'],
        'Self_Employed': ['No', 'No', 'Yes', 'No', 'No'],
        'ApplicantIncome': [5849, 4583, 3000, 2583, 6000],
        'CoapplicantIncome': [0, 1508, 0, 2358, 0],
        'LoanAmount': [128, 128, 66, 120, 141],
        'Loan_Amount_Term': [360, 360, 360, 360, 360],
        'Credit_History': [1, 1, 1, 1, 1],
        'Property_Area': ['Urban', 'Rural', 'Urban', 'Urban', 'Urban'],
        'Loan_Status': ['Y', 'N', 'Y', 'Y', 'Y']
    }
    return pd.DataFrame(data)