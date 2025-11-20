from sklearn.preprocessing import LabelEncoder

def encode_categorical(train_df, test_df=None):
    """
    Encode categorical variables menggunakan LabelEncoder

    Args:
        train_df: Training DataFrame
        test_df: Optional test DataFrame

    Returns:
        tuple: (train_encoded, test_encoded, encoders_dict)
    """
    train_encoded = train_df.copy()
    test_encoded = test_df.copy() if test_df is not None else None
    encoders = {}

    # Get categorical columns
    cat_cols = train_encoded.select_dtypes(include=['object']).columns.tolist()
    if 'Loan_ID' in cat_cols:
        cat_cols.remove('Loan_ID')

    # Encode each categorical column
    for col in cat_cols:
        le = LabelEncoder()

        # Fit with train data
        train_encoded[col] = le.fit_transform(train_encoded[col].astype(str))

        # Transform test data if exists
        if test_encoded is not None and col in test_encoded.columns:
            # Handle unseen labels in test
            test_encoded[col] = test_encoded[col].astype(str).apply(
                lambda x: x if x in le.classes_ else le.classes_[0]
            )
            test_encoded[col] = le.transform(test_encoded[col])

        encoders[col] = le

    return train_encoded, test_encoded, encoders