import { useState } from 'react';
import Header from '../components/layout/Header';
import TabNavigation from '../components/layout/TabNavigation';
import ChatTab from '../features/chat/ChatTab';
import ModuleTab from '../features/modules/ModuleTab';
import FilterTab from '../features/filter/FilterTab';
import AnalysisTab from '../features/analysis/AnalysisTab';

// 탭 타입 정의
type TabType = 'CHAT' | 'MODULE' | 'FILTER' | 'ANALYSIS';

const Popup = () => {
  const [activeTab, setActiveTab] = useState<TabType>('CHAT');

  return (
    <div className="w-[800px] h-[600px] flex flex-col bg-white">
      {/* 상단 헤더 */}
      <Header />
      
      {/* 탭 메뉴 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {activeTab === 'CHAT' && <ChatTab />}
        {activeTab === 'MODULE' && <ModuleTab />}
        {activeTab === 'FILTER' && <FilterTab />}
        {activeTab === 'ANALYSIS' && <AnalysisTab />}
      </main>
    </div>
  );
};

export default Popup;