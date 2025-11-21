from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import io
import pickle
import json

router = APIRouter(prefix="/knn", tags=["knn"])

# In-memory storage for the model (for simplicity in this session)
# In a real app, use a database or file storage
model_store = {
    "model": None,
    "encoders": {},
    "X_train": None,
    "y_train": None
}

class TrainRequest(BaseModel):
    k_value: int
    test_size: float

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Basic preprocessing (encoding categorical variables)
        encoders = {}
        df_encoded = df.copy()
        
        # Drop Loan_ID if exists
        if 'Loan_ID' in df_encoded.columns:
            df_encoded = df_encoded.drop('Loan_ID', axis=1)
            
        # Fill NA (simple strategy for now)
        df_encoded = df_encoded.ffill().bfill()
        # Fill any remaining NaN with 0
        df_encoded = df_encoded.fillna(0)

        for col in df_encoded.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
            encoders[col] = le
            
        # Store data temporarily (in a real app, save to disk/db)
        # For this demo, we'll just return the preview and columns
        
        # Convert to native Python types to avoid NaN issues in JSON
        preview_data = df.head().fillna(0).replace([np.inf, -np.inf], 0).to_dict(orient='records')
        encoded_preview_data = df_encoded.head().fillna(0).replace([np.inf, -np.inf], 0).to_dict(orient='records')
        
        return {
            "columns": df.columns.tolist(),
            "preview": preview_data,
            "encoded_preview": encoded_preview_data,
            "data_json": df_encoded.to_json() # Send back to client to hold state? Or keep on server?
            # Better to keep on server if large, but for this demo we might need to send it back 
            # or store in a global variable (not thread safe but ok for single user demo)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train")
async def train_model(
    k_value: int = Form(...),
    test_size: float = Form(...),
    data_json: str = Form(...) # Receive the encoded data back
):
    try:
        from sklearn.metrics import confusion_matrix, classification_report, precision_score, recall_score, f1_score
        
        df = pd.read_json(io.StringIO(data_json))
        
        X = df.drop('Loan_Status', axis=1)
        y = df['Loan_Status']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size/100, random_state=42
        )
        
        knn = KNeighborsClassifier(n_neighbors=k_value)
        knn.fit(X_train, y_train)
        
        y_pred = knn.predict(X_test)
        accuracy = knn.score(X_test, y_test)
        
        # Calculate detailed metrics
        cm = confusion_matrix(y_test, y_pred)
        
        # For binary classification
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Classification report as dict
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        
        # Store model
        model_store["model"] = knn
        model_store["X_train"] = X_train
        model_store["y_train"] = y_train
        
        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "k_value": k_value,
            "confusion_matrix": cm.tolist(),
            "classification_report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
