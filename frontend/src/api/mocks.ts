import type { YoutubeAnalysisResponse } from './types';

export const MOCK_ANALYSIS_DATA: YoutubeAnalysisResponse = {
  video_info: {
    title: "Pixel 7 Review: The Best Android Phone?",
    channel: "Tech Reviewer",
  },
  stats: {
    total_comments: 120,
    filtered_count: 15,
  },
  results: [
    {
      author: "@TheDiscfanatic",
      published_at: "1 minute ago",
      original: "Was glad to see the Pixel 7 win those two awards...",
      processed: "Was glad to see the Pixel 7 win those two awards...",
      action: "PASS",
      risk_score: 0.05,
      violation_tags: [],
    },
    {
      author: "@Hater123",
      published_at: "5 minutes ago",
      original: "야이 개새끼야 ㅋㅋ 니네 집 주소 다 털었다",
      processed: "야이 **** ㅋㅋ 니네 집 주소 다 털었다",
      action: "AUTO_HIDE",
      risk_score: 0.98,
      violation_tags: ["SYSTEM_KEYWORD", "AI_AGGRESSION"],
    },
    {
      author: "@Spammer",
      published_at: "10 minutes ago",
      original: "돈 버는 법 알려드림. 링크 클릭 -> http://...",
      processed: "돈 버는 법 알려드림. 링크 클릭 -> http://...",
      action: "MASK",
      risk_score: 0.85,
      violation_tags: ["AI_SPAM"],
    },
  ],
};