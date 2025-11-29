import os
import json
import re
from konlpy.tag import Okt

class FirstPassFilter:
    def __init__(self):
        print("[System] 1차 필터 리소스 로딩 시작...")
        
        # 1. 형태소 분석기 초기화 (메모리 로드)
        self.okt = Okt()
        
        # 2. 경로 설정
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.dict_dir = os.path.join(self.base_dir, 'resources', 'dictionaries')
        
        self.user_dict_path = os.path.join(self.dict_dir, 'user_dictionary.json')
        self.system_dict_path = os.path.join(self.dict_dir, 'word_dictionary.json')
        
        # 3. 데이터 컨테이너 초기화
        self.user_whitelist = set()
        self.user_blacklist = set()
        self.system_dictionary = set()
        
        # 4. 로드
        self._load_user_dictionary()
        self._load_system_dictionary()
        
        print("[System] 1차 필터 준비 완료.")

    def get_user_dictionary(self, list_type: str) -> dict:
        """
        현재 메모리에 로드된 사용자 사전을 반환합니다.
        """

        if list_type == 'whitelist':
            return {"whitelist": sorted(list(self.user_whitelist))}
        
        elif list_type == 'blacklist':
            return {"blacklist": sorted(list(self.user_blacklist))}
        
        return {}

    def _update_user_dictionary(self, words: list, list_type: str, action: str) -> int:
        """
        사용자 사전을 갱신(추가/삭제)하고 파일에 저장합니다.
        """
        if list_type == 'whitelist':
            target_set = self.user_whitelist
        elif list_type == 'blacklist':
            target_set = self.user_blacklist
        else:
            return 0

        changed_count = 0
        
        for word in words:
            word = word.strip().lower()
            if not word: continue

            if action == 'add':
                if word not in target_set:
                    target_set.add(word)
                    changed_count += 1
                    
            elif action == 'remove':
                if word in target_set:
                    target_set.remove(word)
                    changed_count += 1
        
        if changed_count > 0:
            self._save_user_dictionary()
            
        return changed_count

    def _save_user_dictionary(self) -> bool:
        """
        현재 메모리의 화이트/블랙리스트를 파일에 덮어씁니다.
        """
        try:
            data = {
                "user_whitelist": sorted(list(self.user_whitelist)),
                "user_blacklist": sorted(list(self.user_blacklist))
            }
            with open(self.user_dict_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[Error] 사용자 사전 저장 실패: {e}")
            return False

    def _load_user_dictionary(self):
        """사용자 사전 로드 """
        try:
            with open(self.user_dict_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self.user_whitelist = set(w.strip().lower() for w in data.get("user_whitelist", []))
            self.user_blacklist = set(w.strip().lower() for w in data.get("user_blacklist", []))
            
            print(f"  ㄴ 사용자 사전 로드됨: 화이트({len(self.user_whitelist)}), 블랙({len(self.user_blacklist)})")
            
        except Exception as e: print(f"  [Error] 사용자 사전 로드 실패: {e}")           

    def _load_system_dictionary(self):
        """시스템 사전 로드 """
        try:
            with open(self.system_dict_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                for category, content in data.items():
                    for word in content.get("words", []):
                        self.system_dictionary.add(word.strip().lower())
            
            print(f"  ㄴ 시스템 사전 로드됨: {len(self.system_dictionary)}개 단어")

        except Exception as e: print(f"  [Error] 시스템 사전 로드 실패: {e}")

    def normalize_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        return text

    def execute(self, original_text: str) -> dict:
        """외부에서 호출하는 메인 메서드"""
        status = "PASSED"
        
        # 1. 정규화
        normalized_text = self.normalize_text(original_text)
        
        # 2. 형태소 분석 (self.okt 사용)
        tokened_text = self.okt.pos(normalized_text)
        
        text_for_filtering = normalized_text
        detected_words = []

        for word, pos in tokened_text:
            word_lower = word.lower() # 혹시 몰라 한 번 더 소문자 처리

            # [A] 화이트리스트
            if word_lower in self.user_whitelist:
                text_for_filtering = text_for_filtering.replace(word, "__W__")
                continue

            # [B] 블랙리스트
            if word_lower in self.user_blacklist:
                detected_words.append({'word': word, 'type': 'USER_BLACKLIST'})
                text_for_filtering = text_for_filtering.replace(word, "__B__")
                continue
            
            # [C] 시스템 사전
            if word_lower in self.system_dictionary:
                detected_words.append({'word': word, 'type': 'SYSTEM_KEYWORD'})
                text_for_filtering = text_for_filtering.replace(word, "__F__")
                continue

        if detected_words:
            status = 'FILTERED_BY_FIRST_PASS'
        
        return {
            'original_text': original_text,
            'status': status,
            'detected_words': detected_words,
            'text_for_filtering': text_for_filtering
        }

if __name__ == "__main__":
    import json

    print("==========================================")
    print("▶ [Debug] FirstPassFilter 독립 실행 테스트")
    print("==========================================")

    # 1. 클래스 인스턴스 생성 (이때 사전 로드됨)
    filter_instance = FirstPassFilter()
    
    # 2. 테스트 케이스
    test_comments = [
        "유튜버 개새끼",          # 사용자 블랙리스트 (USER_BLACKLIST)
        "유튜버 천사",            # 사용자 화이트리스트 (허용 -> __W__)
        "유튜버 씨발",            # 시스템 욕설 (SYSTEM_KEYWORD)
        "씨#!@#@#@#발 새끼",     # 특수문자 섞인 욕설 (정규화 후 차단)
        "안녕하세요 좋은 하루",      # 정상
        "이거 개노잼이네"          # 욕설은 아니지만 2차 필터 감 (PENDING_AI)
    ]
    
    # 3. 테스트 실행
    for comment in test_comments:
        print(f"\n[Input] : {comment}")
        
        # 클래스의 메서드 호출
        result = filter_instance.execute(comment)
        
        # 결과 출력 (JSON 형태로 예쁘게)
        print("[Result]:")
        print(json.dumps(result, indent=4, ensure_ascii=False))
        print("-" * 40)