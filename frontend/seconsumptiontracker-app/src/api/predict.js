// src/api/predict.ts
import axios from 'axios';

export const fetchPrediction = async () => {
  const response = await axios.get('http://localhost:8000/api/predict/');
  return response.data;
};
