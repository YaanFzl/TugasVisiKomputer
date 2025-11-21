import axios from 'axios'

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'

export const glcmService = {
    analyze: async (file, degrees, distance) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('degrees', degrees.join(','))
        formData.append('distance', distance)

        const response = await axios.post(`${API_URL}/glcm/analyze`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    }
}

export const knnService = {
    uploadDataset: async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await axios.post(`${API_URL}/knn/upload-dataset`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },
    train: async (kValue, testSize, dataJson) => {
        const formData = new FormData()
        formData.append('k_value', kValue)
        formData.append('test_size', testSize)
        formData.append('data_json', dataJson)

        const response = await axios.post(`${API_URL}/knn/train`, formData)
        return response.data
    }
}

export const naiveBayesService = {
    getDefaultDataset: async () => {
        const response = await axios.get(`${API_URL}/naive-bayes/default-dataset`)
        return response.data
    },
    trainAndPredict: async (trainingData, features, target, testCase) => {
        const response = await axios.post(`${API_URL}/naive-bayes/train-predict`, {
            training_data: trainingData,
            features: features,
            target: target,
            test_case: testCase
        })
        return response.data
    }
}

