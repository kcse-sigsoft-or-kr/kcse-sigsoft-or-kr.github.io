# KCSE 2027 페이지 구조

KCSE 2027 사이트는 GitHub Pages의 Jekyll 기능을 이용해 공통 UI와 페이지별
콘텐츠를 분리합니다.

- `index.html`: 행사개요 시작 페이지
- `introduction/`: 모시는 글, 오시는 길, 근처 가볼만한 곳
- `attendance/`: 참가 등록, 주요 일정
- `papers/`: 논문 모집, 논문 접수, 튜토리얼/워크숍 제안, 초청 논문, 논문상
- `program/`: 기조연설, 튜토리얼, 신진 연구자, 특별 행사
- `committee/`: 조직위원회, 학술위원회
- `assets/css/style.css`: 공통 스타일
- `assets/js/site.js`: 기존 해시 URL 호환 처리
- `../_layouts/kcse-2027.html`: 모든 2027 페이지의 공통 레이아웃
- `../_includes/kcse-2027/`: 배너, 내비게이션, 사이드바, 푸터

페이지를 추가할 때는 기존 콘텐츠 페이지를 복사하고 front matter의 `title`,
`nav_group`, `nav_id`를 변경한 뒤 공통 내비게이션에 링크를 추가합니다.

## 로컬 미리보기

이 페이지들은 Jekyll 레이아웃을 사용하므로 일반 HTML 미리보기 확장에서는
공통 레이아웃과 include가 렌더링되지 않습니다.

저장소 루트의 터미널에서 다음 명령을 실행합니다.

```bash
python3 scripts/preview_2027.py
```

그다음 브라우저 또는 VS Code의 `Simple Browser: Show` 명령에서 아래 주소를
엽니다.

```text
http://127.0.0.1:8765/2027/
```

파일을 수정한 뒤 새로고침하면 변경 사항이 반영됩니다. 서버는 `Ctrl+C`로
종료합니다. VS Code에서는 `Tasks: Run Task`에서
`KCSE 2027: 미리보기 서버`를 선택해도 됩니다.
