# boxing

**BOXING / READ THE NEXT MOVE**

복싱의 내 행동 → 상대 대응 → 내 재대응을 조건과 함께 탐색하는 정적 웹사이트.

- [웹사이트](https://jm92767647-sketch.github.io/boxing/)
- `index.html` / `boxing-decision-network.html`: 행동별 분기 탐색
- `research-report.html`: 연구 보고서
- `boxing-state-network.html`: 기존 공동 상태 지도

세 페이지 사이를 이동할 수 있으며, 보고서와 기존 지도에 메인 페이지로 돌아오는 버튼이 있습니다.
외부 서비스나 빌드 없이 HTML을 직접 열어 사용할 수 있습니다.
GitHub Pages는 `main` 브랜치의 루트 폴더를 게시합니다.

## 데이터 범위

기존 작성 경로 48개와 조건부 보완 분기 16개. 실제 복싱의 모든 선택지를 완전히 망라하거나 성공률을 검증한 모델은 아닙니다.
기본 동작의 코칭 근거와 다단계 전술 추론을 구별하며, 모든 실행은 거리·타이밍·자세 조건에 의존합니다.

## 주요 데이터

- `boxing-network.json`: 기존 상태·행동·연결 원데이터
- `explorer-data.json`: 개정 탐색 데이터
- `validation.json`: 기존 검증 기록
- `explorer-validation.json`: 탐색 구조·버튼 동작 검사 기록

2026-10-02
