import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수를 불러와 시스템에 등록
load_dotenv()

# ===========================================================
# [시스템 설정]
# ===========================================================

# 보안 레벨 (1:관찰 ~ 5:최대보호)
# .env에서 값을 가져오되, 없으면 기본값 3(일반) 사용
SECURITY_LEVEL = int(os.getenv("SECURITY_LEVEL", 3))

# 2차 정밀 AI 모델(별도 학습 모델) 사용 여부
USE_DETAIL_AI_MODEL = os.getenv("USE_DETAIL_AI_MODEL", "False").lower() == "true"

# 위험도 기준 점수 (0.0 ~ 1.0)
# 이 점수 이상이면 규정 위반으로 간주
RISK_THRESHOLD = float(os.getenv("RISK_THRESHOLD", 0.65))

# AI 모델 경로 (추후 사용)
BASE_MODEL_PATH = "resources/models/AI_model.h5"


# ===========================================================
# [API 키 관리]
# ===========================================================

# YouTube Data API Key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# OpenAI API Key (GPT 사용)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# ===========================================================
# [AI 필터링 모듈 지침]
# ===========================================================

# [특수 AI 모듈 정의]
_SPECIAL_AI_MODULE_DEFINITIONS = {
    'MODIFIED': '자음/모음 분리(예: ㅂㅅ), 특수문자 삽입, 야민정음 등 필터링 회피 시도',
    'SEXUAL': '성적 수치심 유발, 음란한 묘사, 성희롱',
    'PRIVACY': '전화번호, 주소, 실명, 계좌번호 등 개인정보 유출',
    'AGGRESSION': '특정 대상에 대한 맹목적 비난, 살해 협박, 저주',
    'POLITICAL': '영상 맥락과 무관한 정치적 선동, 혐오 발언',
    'SPAM': '광고, 도배, 무의미한 문자열 반복',
    'FAMILY': '가족(부모, 자녀 등)을 비하하거나 모욕하는 패륜적 발언'
}

# [특수 AI 모듈 로드]
# .env에서 "MODIFIED,SEXUAL,SPAM" 형태로 가져옴
# 값이 없으면 기본적으로 '모두 활성화' (ALL)
enabled_modules = os.getenv("ENABLED_MODULES", "ALL")

if enabled_modules.upper() == "ALL":
    # 전체 사용
    SPECIAL_AI_MODULES = _SPECIAL_AI_MODULE_DEFINITIONS.copy()
else:
    # 콤마로 쪼개서 선택된 것만 필터링
    selected_keys = [k.strip().upper() for k in enabled_modules.split(',') if k.strip()]
    SPECIAL_AI_MODULES = {
        key: desc 
        for key, desc in _SPECIAL_AI_MODULE_DEFINITIONS.items() 
        if key in selected_keys
    }

# [기본 AI 모듈]
# 특정 태그가 없을 때 적용할 범용 분석 지침
BASIC_AI_MODULE = [
    '공격적이거나 모욕적인 내용이 포함되어 있는지',
    '사회적 통념상 용인되기 어려운 혐오 표현이 있는지'
]