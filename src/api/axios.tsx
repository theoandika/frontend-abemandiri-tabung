import axios from "axios";
import { LOCAL_STORAGE_KEYS as LS_KEYS } from "@/constants";

export const baseUrl = "http://localhost:8000/api/v1"

axios.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem(LS_KEYS.token);
    
    if (token) {
      const token2 = JSON.parse(token);
      config.headers.Authorization = `Bearer ${token2}`;
    }
    config.headers.Accept = 'application/json';
    config.baseURL = baseUrl;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const token = localStorage.getItem('token');
    if (error.response && error.response.status === 401 && token) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/';
    } else {
      return Promise.reject(error);
    }

  }
);

axios.defaults.withCredentials = true;

export default axios;