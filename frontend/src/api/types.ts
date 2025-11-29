export interface YoutubeCommentSummary {
  author: string;
  published_at: string;
  original: string;
  processed: string;
  action: 'PASS' | 'MASK' | 'AUTO_HIDE';
  risk_score: number;
  violation_tags: string[]; // e.g., ["AI_AGGRESSION", "SYSTEM_KEYWORD"]
}

export interface YoutubeAnalysisResponse {
  video_info: {
    title?: string;
    channel?: string;
    [key: string]: string | undefined;
  };
  stats: {
    total_comments?: number;
    filtered_count?: number;
    [key: string]: number | undefined;
  };
  results: YoutubeCommentSummary[];
}

export interface SystemConfigResponse {
  security_level: number;       // UI의 intensity (1~5)
  risk_threshold: number;       // 위험도 임계값
  use_detail_ai_model: boolean; // 정밀 AI 사용 여부
  enabled_modules: string[];    // 활성화된 모듈 키 리스트 (예: ["SEXUAL", "AGGRESSION"])
}

export interface SystemConfigUpdate {
  security_level?: number | null;
  risk_threshold?: number | null;
  use_detail_ai?: boolean | null;
  enabled_modules?: string[] | null;
}

export interface AppSettings {
  intensity: number; // 1~5
  modules: {
    modified: boolean;   // MODIFIED
    sexual: boolean;     // SEXUAL
    privacy: boolean;    // PRIVACY
    aggression: boolean; // AGGRESSION
    political: boolean;  // POLITICAL
    spam: boolean;       // SPAM
    family: boolean;     // FAMILY
  };
  whiteList: string[];
  blackList: string[];
}