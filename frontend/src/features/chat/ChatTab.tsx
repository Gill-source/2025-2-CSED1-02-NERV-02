import { useEffect, useState } from 'react';
import { useYoutubeAnalysis, useSettings } from '../../hooks/useYoutubeQuery';

const ChatTab = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. 현재 탭의 Video ID 추출
  useEffect(() => {
    // 크롬 익스텐션 환경인지 확인
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      // 현재 활성화된 탭 정보 가져오기
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const urlStr = currentTab?.url;

        if (urlStr && urlStr.includes('youtube.com/watch')) {
          try {
            const url = new URL(urlStr);
            const v = url.searchParams.get('v'); // URL에서 'v' 파라미터 추출
            if (v) {
              setVideoId(v); // 성공! Video ID 설정
              setErrorMsg(null);
            } else {
              setErrorMsg("유튜브 영상 ID를 찾을 수 없습니다.");
            }
          } catch (e) {
            setErrorMsg("URL을 분석할 수 없습니다.");
          }
        } else {
          // 유튜브가 아니거나 탭 정보를 못 가져온 경우
          setErrorMsg("유튜브 영상 페이지에서 실행해주세요.");
        }
      });
    } 
    // 로컬 개발 환경 (pnpm dev)
    else {
      console.log("로컬 개발 환경: 테스트용 ID 사용");
      setVideoId('Z7_WWJEj-j8');
    }
  }, []);

  // 2. TanStack Query로 데이터 가져오기
  const { data, isLoading, isError } = useYoutubeAnalysis(videoId);
  const { data: settings } = useSettings(); // 설정값도 가져옴 (필터링 로직용)

  if (errorMsg) return <div className="p-4 text-center text-gray-500">{errorMsg}</div>;
  if (isLoading) return <div className="p-8 text-center">분석 중입니다... 🛡️</div>;
  if (isError || !data) return <div className="p-4 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="flex flex-col space-y-4 p-2">
      {data.results.map((comment, index) => {
        // 간단한 필터링 표시 로직: AUTO_HIDE 상태이거나 위험 점수가 높으면 흐리게 표시
        const isHidden = comment.action === 'AUTO_HIDE';
        const isUserBlacklisted = settings?.blackList.some(word => comment.original.includes(word));
        
        // 최종적으로 숨길지 결정 (API 결과 OR 사용자 블랙리스트)
        const shouldBlur = isHidden || isUserBlacklisted;

        return (
          <div key={index} className={`flex items-start space-x-3 p-2 rounded-lg transition-colors ${shouldBlur ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
            {/* 아바타 */}
            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs ${shouldBlur ? 'bg-red-300' : 'bg-indigo-400'}`}>
              {comment.author.substring(1, 3).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-sm text-gray-800 truncate">{comment.author}</span>
                <span className="text-xs text-gray-400">{comment.published_at}</span>
              </div>
              
              <p className={`text-sm mt-1 leading-relaxed break-words ${shouldBlur ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                {shouldBlur ? 
                  (isUserBlacklisted ? "🚫 사용자 블랙리스트 단어가 포함되어 숨겨졌습니다." : "🛡️ 규정 위반으로 숨겨진 메시지입니다.") 
                  : comment.processed
                }
              </p>
              
              {/* 디버깅용 태그 표시 */}
              {comment.violation_tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {comment.violation_tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatTab;