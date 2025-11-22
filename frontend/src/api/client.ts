import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // 만약 인증 토큰이 필요하다면 여기서 추가합니다.
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status} :`, error.response.data);
      
      if (error.response.status === 422) {
        console.warn('입력 데이터 형식이 잘못되었습니다 (Validation Error).');
      }
    } else if (error.request) {
      console.error('[API Error] 서버로부터 응답이 없습니다.');
    } else {
      console.error('[API Error] 요청 설정 오류:', error.message);
    }

    return Promise.reject(error);
  }
);

export default client;