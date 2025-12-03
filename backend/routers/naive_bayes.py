from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import CategoricalNB
import pandas as pd
import numpy as np
from typing import List, Dict

router = APIRouter(prefix="/naive-bayes", tags=["naive-bayes"])

class TrainingData(BaseModel):
    data: List[Dict[str, str]]  # List of data rows
    features: List[str]  # Feature column names
    target: str  # Target column name

class PredictionRequest(BaseModel):
    training_data: List[Dict[str, str]]
    features: List[str]
    target: str
    test_case: Dict[str, str]

def naive_bayes_manual(df, test, target_col):
    """Perhitungan manual Naive Bayes dengan Laplace smoothing"""
    kelas = df[target_col].unique()
    
    # Hitung prior
    prior = {}
    for k in kelas:
        prior[k] = len(df[df[target_col] == k]) / len(df)
    
    # Hitung likelihood
    likelihood = {k: 1 for k in kelas}
    for feature in test.keys():
        for k in kelas:
            subset = df[df[target_col] == k]
            count_feature_value = len(subset[subset[feature] == test[feature]])
            # Laplace smoothing
            likelihood[k] *= (count_feature_value + 1) / (len(subset) + len(df[feature].unique()))
    
    # Hitung posterior
    posterior = {k: prior[k] * likelihood[k] for k in kelas}
    
    # Normalisasi posterior
    total_posterior = sum(posterior.values())
    for k in posterior:
        posterior[k] /= total_posterior
        
    return posterior, prior, likelihood
    
def calculate_conditional_probabilities(df, target_col):
    """Calculate conditional probabilities for all features and classes"""
    classes = df[target_col].unique()
    features = [col for col in df.columns if col != target_col]
    
    conditional_probs = {}
    
    for feature in features:
        conditional_probs[feature] = {}
        unique_values = df[feature].unique()
        
        for k in classes:
            subset = df[df[target_col] == k]
            conditional_probs[feature][k] = {}
            
            for val in unique_values:
                count = len(subset[subset[feature] == val])
                # Laplace smoothing
                prob = (count + 1) / (len(subset) + len(unique_values))
                conditional_probs[feature][k][val] = float(prob)
                
    return conditional_probs

@router.post("/train-predict")
async def train_and_predict(request: PredictionRequest):
    try:
        # Convert to DataFrame
        df = pd.DataFrame(request.training_data)
        
        # Validasi
        if request.target not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{request.target}' not found")
        
        for feature in request.features:
            if feature not in df.columns:
                raise HTTPException(status_code=400, detail=f"Feature '{feature}' not found")
        
        # 1. Perhitungan Manual
        posterior_manual, prior, likelihood = naive_bayes_manual(df, request.test_case, request.target)
        prediction_manual = max(posterior_manual, key=posterior_manual.get)
        
        # 2. Sklearn
        encoders = {}
        df_encoded = df.copy()
        
        # Encode all columns
        for col in df.columns:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df[col])
            encoders[col] = le
        
        X = df_encoded[request.features]
        y = df_encoded[request.target]
        
        # Train model
        model = CategoricalNB()
        model.fit(X, y)
        
        # Encode test case
        test_encoded = []
        for feature in request.features:
            try:
                encoded_val = encoders[feature].transform([request.test_case[feature]])[0]
                test_encoded.append(encoded_val)
            except:
                raise HTTPException(status_code=400, detail=f"Unknown value '{request.test_case[feature]}' for feature '{feature}'")
        
        # Predict
        test_df = pd.DataFrame([test_encoded], columns=request.features)
        pred = model.predict(test_df)[0]
        pred_label = encoders[request.target].inverse_transform([pred])[0]
        
        # Probabilitas
        probabilities = model.predict_proba(test_df)[0]
        prob_sklearn = {}
        for i, class_label in enumerate(encoders[request.target].classes_):
            prob_sklearn[class_label] = float(probabilities[i])
        
        # Get unique values for each feature
        feature_values = {}
        for col in df.columns:
            feature_values[col] = df[col].unique().tolist()
        
        return {
            "conditional_probabilities": calculate_conditional_probabilities(df, request.target),
            "dataset": request.training_data,
            "test_case": request.test_case,
            "manual_calculation": {
                "prior": {k: float(v) for k, v in prior.items()},
                "posterior": {k: float(v) for k, v in posterior_manual.items()},
                "prediction": prediction_manual
            },
            "sklearn_calculation": {
                "probabilities": prob_sklearn,
                "prediction": pred_label
            },
            "feature_values": feature_values,
            "num_samples": len(df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/default-dataset")
async def get_default_dataset():
    """Return default dataset from lecturer's example"""
    data = {
        'Penghasilan': ['Tinggi','Sedang','Rendah','Tinggi','Sedang','Rendah','Tinggi','Sedang','Rendah','Tinggi'],
        'Pekerjaan': ['PNS','Swasta','Mahasiswa','Swasta','PNS','PNS','Mahasiswa','Swasta','Swasta','Swasta'],
        'Promo': ['Ada','Tidak','Ada','Ada','Tidak','Ada','Tidak','Ada','Tidak','Ada'], 
        'Beli': ['Ya','Tidak','Ya','Ya','Tidak','Ya','Tidak','Ya','Tidak','Ya'] 
    }
    
    return {
        "data": pd.DataFrame(data).to_dict('records'),
        "features": ['Penghasilan', 'Pekerjaan', 'Promo'],
        "target": 'Beli',
        "default_test": {
            'Penghasilan': 'Sedang',
            'Pekerjaan': 'PNS',
            'Promo': 'Ada'
        }
    }
