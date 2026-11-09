# KCSE 연도별 홈페이지

이 폴더 하나에 해당 연도 홈페이지의 HTML, 공통 UI, 데이터, 자산이 모두 들어 있습니다.
브라우저가 JSON과 공통 UI 파일을 직접 읽으므로 **빌드 없이 수정한 파일을 커밋·push하면 됩니다.**

## 수정할 파일

| 경로 | 수정할 내용 |
| --- | --- |
| `data/schedule.json` | 모든 페이지에서 공유하는 일정 |
| `data/site.json` | 연도(`year`), 회차(`edition`), 행사장, 등록·논문 제출 주소 |
| `index.html`, `attendance/`, `papers/` 등 | 페이지별 본문, 등록비, 위원회, 프로그램 |
| `components/hero.html` | 공통 배너 |
| `components/navigation.html` | 공통 메뉴 |
| `components/sidebar.html` | 바로가기 및 Important Dates 영역 |
| `components/footer.html` | 공통 푸터 |
| `assets/css/style.css` | 공통 스타일 |
| `assets/js/site.js` | JSON 및 공통 UI 로딩, 날짜 표시, 이전 해시 URL 호환 |
| `assets/files/` | 논문 양식 등 다운로드 자료 |

HTML 파일을 직접 수정합니다. 별도의 템플릿이나 생성된 HTML은 없습니다.

기존 공개 URL은 유지합니다. 페이지 경로와 논문 양식 ZIP 파일명은 CFP 등으로
이미 배포되었을 수 있으므로 변경하거나 삭제하지 않습니다.
`/2027/#call-for-papers` 같은 이전 해시 링크도 해당 페이지로 연결합니다.

## 일정 변경

**`data/schedule.json`만 수정합니다.** `events` 아래에서 해당 일정의
`start`(시작일 또는 마감일), `end`(종료일), `time`(시간)을 변경합니다.
날짜는 `YYYY-MM-DD`, 시간은 `HH:mm` 형식이며 한국 시간 기준입니다.
종료일과 시간이 없는 일정은 해당 항목을 생략합니다.
요일과 행사개요의 행사 일수는 날짜에서 자동 계산합니다.

| 일정 키 | 표시되는 곳 |
| --- | --- |
| `paper_submission` | 논문 접수, 주요 일정, 모든 페이지의 Important Dates |
| `proposals` | 튜토리얼/워크숍 제안, 주요 일정, Important Dates |
| `registration` | 참가 등록, 주요 일정, Important Dates |
| `notification` | 주요 일정, Important Dates |
| `conference` | 행사개요, 배너와 배너 설명, 주요 일정, Important Dates |
| `banquet` | 특별 행사 |

예를 들어 사전 등록 기간은 `events.registration`의 `start`와 `end`를 수정합니다.
`label`은 주요 일정과 사이드바에 표시할 이름입니다. `important_dates`는
두 목록에서 공통으로 사용할 일정 키와 표시 순서입니다.

HTML에는 날짜 대신 일정 키를 지정합니다. 이 자리에는 JSON의 최신 값이 표시됩니다.

```html
<span data-schedule="registration"></span>
<span data-schedule="conference" data-schedule-duration></span>
```

일정 변경 후 로컬에서는 새로고침하고, 운영 사이트에는 수정한 JSON을
커밋·push합니다. 빌드 명령이나 HTML 재생성은 필요하지 않습니다.

## 로컬 확인

저장소 루트에서 일반 정적 웹서버를 실행합니다.

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

<http://127.0.0.1:8000/2027/>에 접속하고, 수정 후 새로고침합니다.
서버는 `Ctrl+C`로 종료합니다. JSON과 공통 UI를 HTTP로 읽으므로
HTML 파일을 더블클릭하는 대신 이 주소로 확인합니다.
GitHub Pages에서도 같은 HTML과 JavaScript가 동작합니다.

## 다음 해 홈페이지 만들기

1. `2027/` 폴더 전체를 `2028/`로 복사합니다.
2. `2028/data/site.json`의 `year`를 `2028`, `edition`을 `30`으로 바꾸고 행사장과 등록·제출 주소를 수정합니다.
3. `2028/data/schedule.json`의 일정을 변경합니다.
4. `2028/` 아래 HTML에서 인사말, 주제, 위원회, 등록비, 프로그램 등을 수정하고 `assets/files/`의 논문 양식을 교체합니다. 행사장이 달라지면 배너 그림과 오시는 길·관광 안내도 확인합니다.
5. <http://127.0.0.1:8000/2028/>에서 확인하고 수정한 파일을 커밋·push합니다.

내부 링크, CSS/JS, 데이터와 공통 UI 경로는 현재 스크립트의 위치를 기준으로
연도 폴더를 자동 인식합니다. `2027` 경로를 일일이 치환할 필요가 없으며,
기존 `2027/` 홈페이지는 유지됩니다.
새 연도를 전체 학술대회 목록에 노출하려면 저장소 루트의 `index.html`에
해당 연도 링크를 추가합니다.
