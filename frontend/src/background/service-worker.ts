// 확장 프로그램이 설치되거나 업데이트되었을 때 실행되는 이벤트
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[GuardFilter] 확장 프로그램이 성공적으로 설치되었습니다!');
    
    // 초기 설정값 세팅
    const defaultSettings = {
      intensity: 3,
      modules: { 
        criticism: true, 
        conflict: true, 
        gaslighting: true, 
        sexual: true, 
        relevance: true 
      },
      whiteList: ['바보', '멍청이'],
      blackList: ['비하 별명', '경쟁 채널']
    };
    
    chrome.storage.local.set({ 'guard-filter-settings': defaultSettings });
  } else if (details.reason === 'update') {
    console.log('[GuardFilter] 확장 프로그램이 업데이트되었습니다.');
  }
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Background] 메시지 수신:', message);
   sendResponse({ status: 'ok' });
   return true;
});