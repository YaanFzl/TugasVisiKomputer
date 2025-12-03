from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from math import log2
import io
import base64
import matplotlib.pyplot as plt
from sklearn import tree
from sklearn.preprocessing import LabelEncoder

router = APIRouter(prefix="/decision-tree", tags=["decision-tree"])

# Golf dataset - hardcoded
GOLF_DATA = {
    'Outlook': ['Sunny', 'Sunny', 'Overcast', 'Rainy', 'Rainy', 'Rainy', 'Overcast', 'Sunny',
                'Sunny', 'Rainy', 'Sunny', 'Overcast', 'Overcast', 'Rainy'],
    'Temperature': ['Hot', 'Hot', 'Hot', 'Mild', 'Cool', 'Cool', 'Cool', 'Mild',
                    'Cool', 'Mild', 'Mild', 'Mild', 'Hot', 'Mild'],
    'Humidity': ['High', 'High', 'High', 'High', 'Normal', 'Normal', 'Normal', 'High',
                 'Normal', 'Normal', 'Normal', 'High', 'Normal', 'High'],
    'Windy': ['False', 'False', 'True', 'False', 'False', 'True', 'True', 'False',
              'False', 'False', 'True', 'True', 'False', 'True'],
    'PlayGolf': ['No', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'No',
                 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'No']
}

class PredictRequest(BaseModel):
    Outlook: str
    Temperature: str
    Humidity: str
    Windy: str

def entropy(target_col):
    """Calculate entropy of a target column"""
    elements, counts = np.unique(target_col, return_counts=True)
    entropy_value = 0
    for i in range(len(elements)):
        probability = counts[i] / np.sum(counts)
        if probability > 0:
            entropy_value -= probability * log2(probability)
    return round(entropy_value, 4)

def info_gain(data, split_attribute_name, target_name="PlayGolf"):
    """Calculate information gain for a split attribute"""
    total_entropy = entropy(data[target_name])
    vals, counts = np.unique(data[split_attribute_name], return_counts=True)
    
    weighted_entropy = 0
    for i in range(len(vals)):
        subset = data[data[split_attribute_name] == vals[i]]
        weighted_entropy += (counts[i] / np.sum(counts)) * entropy(subset[target_name])
    
    information_gain = total_entropy - weighted_entropy
    return round(information_gain, 4)

def Id3(data, originaldata, features, target_attribute_name="PlayGolf", parent_node_class=None):
    """ID3 Algorithm - Recursive decision tree builder"""
    # If all target values are the same, return that value
    if len(np.unique(data[target_attribute_name])) <= 1:
        return np.unique(data[target_attribute_name])[0]

    # If data is empty, return majority class from original data
    elif len(data) == 0:
        return np.unique(originaldata[target_attribute_name])[
            np.argmax(np.unique(originaldata[target_attribute_name], return_counts=True)[1])
        ]

    # If no features left, return majority class
    elif len(features) == 0:
        return parent_node_class

    # Otherwise, continue building the tree
    else:
        parent_node_class = np.unique(data[target_attribute_name])[
            np.argmax(np.unique(data[target_attribute_name], return_counts=True)[1])
        ]
        
        # Calculate gain for each attribute
        gains = [info_gain(data, feature, target_attribute_name) for feature in features]
        best_feature_index = np.argmax(gains)
        best_feature = features[best_feature_index]

        # Build tree structure
        tree_structure = {best_feature: {}}

        # Remove best feature from remaining features
        remaining_features = [f for f in features if f != best_feature]

        for value in np.unique(data[best_feature]):
            sub_data = data[data[best_feature] == value]
            
            subtree = Id3(sub_data, data, remaining_features, target_attribute_name, parent_node_class)
            tree_structure[best_feature][value] = subtree
    
    return tree_structure

def tree_to_list(tree_dict, parent_id=0, nodes=None, edges=None, depth=0):
    """Convert tree dictionary to list format for frontend visualization"""
    if nodes is None:
        nodes = []
        edges = []
    
    if isinstance(tree_dict, str):
        # Leaf node (this case might be reached if root is a leaf)
        return tree_dict, parent_id
    
    # Get the root attribute
    root_attr = list(tree_dict.keys())[0]
    current_id = len(nodes)
    
    nodes.append({
        "id": current_id,
        "label": root_attr,
        "type": "decision",
        "depth": depth
    })
    
    if parent_id != current_id:
        edges.append({
            "from": parent_id,
            "to": current_id
        })
    
    # Process children
    for branch_value, subtree in tree_dict[root_attr].items():
        child_id = len(nodes)
        
        if isinstance(subtree, str):
            # Leaf node
            nodes.append({
                "id": child_id,
                "label": subtree,
                "type": "leaf",
                "value": subtree,
                "depth": depth + 1
            })
            edges.append({
                "from": current_id,
                "to": child_id,
                "label": branch_value
            })
        else:
            # Create a branch node (representing the edge value/decision)
            # Actually, in 3D we might want the branch value to be on the edge, 
            # but for the node structure, we'll keep the current logic where 
            # the attribute is the node.
            # Wait, the current logic adds a "branch" node?
            # Lines 143-149:
            # nodes.append({ "id": branch_node_id, "label": branch_value, "type": "branch" })
            # This seems to be adding intermediate nodes for the branch values.
            
            branch_node_id = len(nodes)
            nodes.append({
                "id": branch_node_id,
                "label": branch_value,
                "type": "branch",
                "depth": depth + 1
            })
            edges.append({
                "from": current_id,
                "to": branch_node_id,
                "label": branch_value
            })
            
            # Recurse
            tree_to_list(subtree, branch_node_id, nodes, edges, depth + 2)
    
    return nodes, edges

def predict_with_tree(tree_dict, sample):
    """Predict using the decision tree"""
    if isinstance(tree_dict, str):
        return tree_dict
    
    attribute = list(tree_dict.keys())[0]
    attribute_value = sample.get(attribute)
    
    if attribute_value in tree_dict[attribute]:
        subtree = tree_dict[attribute][attribute_value]
        return predict_with_tree(subtree, sample)
    else:
        # If value not in tree, return the most common value
        return "Unknown"

@router.post("/train-golf")
async def train_golf():
    """Train Decision Tree on the Play Golf dataset"""
    try:
        df = pd.DataFrame(GOLF_DATA)
        
        # Build decision tree using ID3
        features = list(df.columns[:-1])
        decision_tree = Id3(df, df, features)
        
        # Calculate information gains
        feature_importance = {}
        for feature in features:
            feature_importance[feature] = info_gain(df, feature)
        
        # Convert tree to list format for visualization
        nodes, edges = tree_to_list(decision_tree)
        
        # Generate sklearn visualization
        le = LabelEncoder()
        df_encoded = df.apply(le.fit_transform)
        
        X = df_encoded.drop(columns=['PlayGolf'])
        y = df_encoded['PlayGolf']
        
        clf = tree.DecisionTreeClassifier(criterion='entropy', random_state=42)
        clf = clf.fit(X, y)
        
        # Create visualization
        plt.figure(figsize=(14, 8))
        tree.plot_tree(clf, feature_names=list(X.columns), class_names=['No', 'Yes'], 
                      filled=True, rounded=True, fontsize=10)
        plt.tight_layout()
        
        # Convert to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        accuracy = clf.score(X, y)
        
        return {
            "tree_structure": decision_tree,
            "nodes": nodes,
            "edges": edges,
            "feature_importance": feature_importance,
            "accuracy": float(accuracy),
            "visualization": f"data:image/png;base64,{image_base64}",
            "dataset_size": len(df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
async def predict(request: PredictRequest):
    """Predict PlayGolf outcome for given features"""
    try:
        df = pd.DataFrame(GOLF_DATA)
        features = list(df.columns[:-1])
        decision_tree = Id3(df, df, features)
        
        # Prepare sample
        sample = {
            "Outlook": request.Outlook,
            "Temperature": request.Temperature,
            "Humidity": request.Humidity,
            "Windy": request.Windy
        }
        
        prediction = predict_with_tree(decision_tree, sample)
        
        # Calculate confidence based on training data
        matching_samples = df[
            (df['Outlook'] == request.Outlook) &
            (df['Temperature'] == request.Temperature) &
            (df['Humidity'] == request.Humidity) &
            (df['Windy'] == request.Windy)
        ]
        
        if len(matching_samples) > 0:
            confidence = len(matching_samples[matching_samples['PlayGolf'] == prediction]) / len(matching_samples)
        else:
            # Calculate partial matching confidence
            partial_matches = df[
                (df['Outlook'] == request.Outlook) |
                (df['Temperature'] == request.Temperature)
            ]
            if len(partial_matches) > 0:
                confidence = len(partial_matches[partial_matches['PlayGolf'] == prediction]) / len(partial_matches)
            else:
                confidence = 0.5
        
        return {
            "prediction": prediction,
            "confidence": round(float(confidence), 2),
            "input_features": sample
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
