const AnalysisTab = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">분석 리포트</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-xs">총 댓글 수</div>
          <div className="text-2xl font-bold text-gray-900">1,240</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-xs">필터링됨</div>
          <div className="text-2xl font-bold text-red-500">156</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="font-bold text-sm mb-4">주요 적발 유형</h3>
        {/* 간단한 막대 그래프 예시 */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>욕설/비하</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>스팸/광고</span>
              <span>30%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTab;