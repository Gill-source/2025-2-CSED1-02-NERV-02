const ChatTab = () => {
  // UI 확인용 더미 데이터
  const dummyComments = [
    { id: 1, user: '@TheDiscfanatic', time: '1 minute ago', text: 'Was glad to see the Pixel 7 win those two awards...', avatar: 'bg-gray-400' },
    { id: 2, user: '@ayushjangta', time: '10 seconds ago', text: 'Always found your content to be professional...', avatar: 'bg-red-500' },
    { id: 3, user: '@BadUser', time: '2 minutes ago', text: '이 멍청이들아 ㅋㅋ 다 속고있네', avatar: 'bg-blue-400', isFiltered: true },
  ];

  return (
    <div className="flex flex-col space-y-6 p-2">
      {dummyComments.map((comment) => (
        <div key={comment.id} className={`flex items-start space-x-3 ${comment.isFiltered ? 'opacity-50' : ''}`}>
          {/* 아바타 */}
          <div className={`w-10 h-10 rounded-full shrink-0 ${comment.avatar}`} />
          
          {/* 내용 */}
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-sm text-gray-800">{comment.user}</span>
              <span className="text-xs text-gray-400">{comment.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {comment.isFiltered ? '🚫 필터링된 메시지입니다.' : comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatTab;