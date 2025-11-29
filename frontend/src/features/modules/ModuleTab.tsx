import { useSettings, useUpdateSettings } from '../../hooks/useSystemConfig';
import type { AppSettings } from '../../api/types';

const ModuleTab = () => {
  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  if (!settings) return null;

  const handleIntensityChange = (val: number) => {
    updateSettingsMutation.mutate({ ...settings, intensity: val });
  };

  const toggleModule = (key: keyof typeof settings.modules) => {
    updateSettingsMutation.mutate({
      ...settings,
      modules: { ...settings.modules, [key]: !settings.modules[key] }
    });
  };

  // 5단계 강도별 설명 데이터 정의
  const intensityDescriptions: Record<number, { title: string; desc: string }> = {
    1: {
      title: "관찰",
      desc: "최소한의 개입으로, 명백한 욕설만 마스킹 처리하여 로그를 기록합니다."
    },
    2: {
      title: "관대함",
      desc: "블랙리스트 및 확실한 악성 댓글만 '숨김' 처리하고, AI 탐지 댓글은 조치하지 않습니다."
    },
    3: {
      title: "일반 (권장)",
      desc: "확실한 악성은 즉시 숨기고, AI 탐지 댓글은 관리자 검토 대기로 분류합니다."
    },
    4: {
      title: "적극",
      desc: "AI를 신뢰하여 악성으로 판단된 대부분의 댓글을 즉시 '숨김' 처리합니다. (오탐 가능성 있음)"
    },
    5: {
      title: "최대 보호",
      desc: "모든 잠재적 악성 댓글을 '숨김' 처리하고 강력하게 차단합니다. (높은 오탐 가능성)"
    }
  };

  const currentInfo = intensityDescriptions[settings.intensity] || intensityDescriptions[3];

 const moduleList = [
    { 
      key: 'aggression', 
      label: '악성 비난/협박', 
      desc: '특정 대상에 대한 맹목적 비난, 살해 협박, 저주 등을 탐지합니다.'
    },
    { 
      key: 'sexual', 
      label: '성희롱/음란물', 
      desc: '성적 수치심을 유발하거나 음란한 묘사가 포함된 댓글을 탐지합니다.'
    },
    { 
      key: 'family', 
      label: '패륜/가족 비하', 
      desc: '부모, 자녀 등 가족을 비하하거나 모욕하는 패륜적 발언을 탐지합니다.'
    },
    { 
      key: 'privacy', 
      label: '개인정보 유출', 
      desc: '전화번호, 주소, 실명, 계좌번호 등 개인정보가 포함된 댓글을 차단합니다.' 
    },
    { 
      key: 'political', 
      label: '정치/혐오 발언', 
      desc: '영상 맥락과 무관한 정치적 선동이나 혐오 발언을 필터링합니다.' 
    },
    { 
      key: 'spam', 
      label: '스팸/도배/광고', 
      desc: '광고성 링크, 도배, 무의미한 문자열 반복 등을 탐지합니다.' 
    },
    { 
      key: 'modified', 
      label: '필터 회피/변형 시도', 
      desc: '자음/모음 분리(예: ㅂㅅ), 특수문자 삽입, 야민정음 등 필터링 회피 시도를 잡아냅니다.' 
    },
  ] as const;

  return (
    <div className="p-4 space-y-8">
      {/* 강도 설정 섹션 */}
      <section>
        <h3 className="text-sm font-bold mb-4">강도 설정</h3>
        <div className="px-2">
          <input 
            type="range" 
            min="1" 
            max="5"
            step="1"
            value={settings.intensity} 
            onChange={(e) => handleIntensityChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
            <span>1단계</span>
            <span>5단계</span>
          </div>
        </div>
        
        {/* 선택된 단계 설명 표시 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center mb-2">
            <span className="font-bold text-lg text-indigo-600 mr-2">
              {settings.intensity}단계: {currentInfo.title}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {currentInfo.desc}
          </p>
        </div>
      </section>

      {/* 모듈 설정 섹션 */}
<section className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-bold mb-2">모듈 설정</h3>
        {moduleList.map((item) => {
          const moduleKey = item.key as keyof AppSettings['modules'];
          const isActive = settings.modules[moduleKey] ?? false;

          return (
            <div key={item.key} className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</div>
              </div>
              <button 
                onClick={() => toggleModule(item.key)}
                className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isActive ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default ModuleTab;