type TabType = 'CHAT' | 'MODULE' | 'FILTER' | 'ANALYSIS';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: Props) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'CHAT', label: '채팅' },
    { id: 'MODULE', label: '모듈/강도' },
    { id: 'FILTER', label: '필터링 단어' },
    { id: 'ANALYSIS', label: '분석' },
  ];

  return (
    <nav className="flex w-full bg-white shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 py-4 text-sm font-medium transition-colors relative
            ${activeTab === tab.id ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600'}
          `}
        >
          {tab.label}
          {/* 활성화된 탭 하단 검은색 바 */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;