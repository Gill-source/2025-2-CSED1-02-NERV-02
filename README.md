## 🚨 [ About 'GuardFilter' ]
GuardFilter는 온라인 플랫폼(예: 유튜브) 댓글에서 **악성·비난·갈등 조장·성희롱·신뢰도 저하** 등 크리에이터에게 유해한 댓글을,
**사전 기반 1차 필터링 + 다중 AI 모듈 기반 2차 필터링 + 실시간 정책 엔진**으로 처리하는 개인화 필터링 시스템입니다.
## 🧠 [ Team NERV ]
| [황종길](https://github.com/Gill-source) | [류민주](https://github.com/minij02) | [김현근](https://github.com/v1340414) | [박현수](https://github.com/phs314) |
|-----|----|----|----| 
| 팀장 | 팀원 | 팀원 | 팀원 | 
| <img src="https://github.com/user-attachments/assets/467fd96c-5403-41a6-a700-5fe07a26d1db" width="250" height="300"> |  <img src="https://github.com/user-attachments/assets/057a591b-03d3-4991-8074-054ec74e8c73" width="250" height="300"> | <img src="https://github.com/user-attachments/assets/998c4544-f430-4f5a-a560-49f91ec71bd4" width="250" height="300"> | <img src="https://github.com/user-attachments/assets/2ba03cb7-0b6d-46d4-aabc-9fd6d64da799" width="250" height="300">| 

---

## 한눈에 보기
- **문제의식**: 기존 필터링은 키워드 차단 중심이라 **문맥에 따라 의미가 달라지는 표현**(문맥 의존 표현)을 정교하게 구분하기 어렵고, 채널마다 다른 커뮤니티 문화/허용 범위를 반영하기도 어렵습니다. 그 결과 **오탐(정상 댓글 차단)** 및 **누락(악성 댓글 통과)** 문제가 발생합니다.
- **해결 아이디어**: (1) 사용자 정의 화이트/블랙리스트 + 시스템 사전(Type 1/2) 기반 1차 필터링, (2) 범용 악성 탐지 + 유형별 특화 AI 모듈을 병렬 실행하는 2차 필터링, (3) 정책 강도(레벨) 기반 후속 조치로 정밀도를 높입니다.
- **핵심 차별점**: AI가 댓글을 **건전한 비판(Criticism)** 으로 판정하면 정책 조건보다 우선하여 **PRIORITY_REVIEW**로 분류해, 필요한 피드백이 부당하게 삭제/숨김 처리되는 문제를 줄입니다.
- **학습/개선**: 관리자 검토 결과 및 사용자 피드백을 재학습/사전 갱신에 반영하는 **피드백 루프**로 시간이 지날수록 정확도를 높입니다.

---

## 데모 / 결과 화면
-데모영상: https://www.youtube.com/watch?v=j2JIK_5GeII
<img width="1786" height="826" alt="image" src="https://github.com/user-attachments/assets/c684509a-2505-4320-8793-e05867909f28" />


---

## 주요 기능

### 1) 사전 기반 1차 필터링 (Dictionary Layer)
- 입력 데이터 수집: 댓글 원문(`textOriginal`) 및 영상 메타데이터(`videoInfo`)
- **화이트리스트 중화**: 특정 표현을 예외 처리/완화(문맥 중화)
- **사용자 블랙리스트**: 크리에이터별 금지 단어/표현 즉시 플래그
- **시스템 사전**
  - **Type 1**: 명백한 악성(즉시 조치 대상)
  - **Type 2**: **문맥 의존 표현**(2차 AI 검토로 이관)

### 2) 다중 AI 모듈 기반 2차 필터링 (Multi-AI Layer)
- 범용 악성/혐오 탐지 모듈
- 특화 모듈(예시)
  - 인격 비난 탐지
  - 갈등 조장 탐지
  - 신뢰도 훼손/가스라이팅성 발언 탐지
  - 성희롱성 표현 탐지
  - 영상 주제 연관성 분석(주제 일탈 탐지)
  - 비판/피드백(건전한 비판) 분석
- 각 모듈은 `violation_score` 및 `violation_type`(또는 `criticism_type`)을 출력
- **최고 점수 기준 통합**: 가장 높은 위반 점수를 기준으로 최종 판정

### 3) 정책 기반 후속 조치 (Policy Engine)
- 사용자 설정 정책 레벨(예: 1~5)에 따라
  - 자동 숨김 / 삭제 / 관리자 검토로 분기
- **건전한 비판 판정 시 우선 보호**
  - `PRIORITY_REVIEW` 등 우선 검토 상태로 전이

### 4) 피드백 루프 (Continuous Improvement)
- 관리자 검토 결과/사용자 피드백을 재학습 데이터로 반영
- 화이트/블랙리스트 및 시스템 사전 지속 갱신

---

## 처리 흐름 (요약)

1. 댓글/영상 메타데이터 수집 → `RAW` 저장  
2. 1차 필터링(화이트/블랙리스트, 시스템 사전 Type1/Type2)  
3. `PENDING_AI` 인 경우 2차 AI 모듈 병렬 실행  
4. 위반/비판 판정 + 정책 엔진 적용  
5. 숨김/삭제/검토 상태 저장 + 피드백 반영

---
