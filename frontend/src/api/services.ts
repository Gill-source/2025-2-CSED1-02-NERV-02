import axios from 'axios';
import type { YoutubeAnalysisResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- API FUNCTIONS ---

export const fetchAnalysis = async (videoId: string): Promise<YoutubeAnalysisResponse> => {
  // 로컬 개발 환경이거나 videoId가 테스트용이면 Mock 데이터 반환
  // if (!import.meta.env.PROD || videoId === 'test_video_id') {
  //   console.log(`[Mock API] Fetching analysis for ${videoId}`);
  //   await new Promise((resolve) => setTimeout(resolve, 800)); // 0.8초 딜레이 시뮬레이션
  //   return MOCK_ANALYSIS_DATA;
  // }

  // 실제 API 호출
  const response = await client.post(`/api/workflow/analyze-youtube`, null, {
    params: { video_id: videoId, max_pages: 1 },
  });
  return response.data;
};