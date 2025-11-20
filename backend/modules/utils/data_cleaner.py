import pandas as pd

def clean_missing_values(df, reference_df=None):
    """
    Handle missing values in dataframe

    Args:
        df: DataFrame to clean
        reference_df: Optional reference DataFrame untuk statistik (untuk test data)

    Returns:
        Cleaned DataFrame
    """
    df_clean = df.copy()

    for col in df_clean.columns:
        if df_clean[col].isnull().sum() > 0:
            if df_clean[col].dtype == 'object':
                # Categorical - use mode
                if reference_df is not None and col in reference_df.columns:
                    mode_val = reference_df[col].mode()
                else:
                    mode_val = df_clean[col].mode()

                fill_value = mode_val[0] if len(mode_val) > 0 else 'Unknown'
                df_clean[col].fillna(fill_value, inplace=True)
            else:
                # Numeric - use median
                if reference_df is not None and col in reference_df.columns:
                    fill_value = reference_df[col].median()
                else:
                    fill_value = df_clean[col].median()

                df_clean[col].fillna(fill_value, inplace=True)

    return df_clean