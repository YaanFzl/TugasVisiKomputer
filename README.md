# VisKom WebGL Clone

A futuristic computer vision web application with WebGL visualizations and machine learning modules.

## 🚀 Quick Start

### Option 1: Using the Start Script (Easiest!)
Simply double-click `start.bat` or run:
```bash
npm run dev
```

This will start both the frontend and backend simultaneously:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

### Option 2: Manual Start
If you prefer to run them separately:

**Backend:**
```bash
uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📦 Installation

First-time setup:
```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
npm run install:all
```

## 🏗️ Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
web/
├── backend/           # FastAPI backend
│   ├── main.py       # Main app entry
│   ├── routers/      # API routes
│   └── modules/      # ML modules
├── frontend/         # React + Vite + Three.js
│   ├── src/
│   └── dist/         # Production build
├── package.json      # Root package (unified scripts)
└── start.bat        # Easy startup script
```

## 🎯 Features

- **GLCM** - Gray Level Co-occurrence Matrix analysis
- **KNN** - K-Nearest Neighbors classification
- **Naive Bayes** - Probabilistic classification
- **Decision Tree** - Tree-based classification with 3D visualization
- **3D WebGL Visualizations** - Powered by Three.js
- **Modern UI** - Glassmorphic design with smooth animations

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Three.js + React Three Fiber
- TailwindCSS
- Framer Motion
- GSAP

**Backend:**
- FastAPI
- NumPy, Pandas
- Scikit-learn
- OpenCV

---

Made with ❤️ for Computer Vision
