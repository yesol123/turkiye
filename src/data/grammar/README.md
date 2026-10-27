# 문법 데이터 작성

`temel1.json`, `temel2.json`에 문법 본문을 추가합니다. 각 `.ts` 파일은 JSON을 읽고 공통 `GrammarCourse` / `GrammarLesson` 타입과 ID를 검증하는 진입점입니다. 페이지는 `src/pages/language/GrammarPage.tsx`, 수업 본문 렌더러는 `src/components/grammar/LessonContent.tsx`에서 관리합니다.

문법 ID는 `temel1-vowels`, `temel1-present-tense`처럼 고정합니다. 제목이나 순서를 변경해도 ID를 바꾸지 않습니다. 본문 항목과 예문도 상위 ID를 접두사로 쓰며 중복할 수 없습니다. `order`는 각 단계 안에서 고유한 양의 정수입니다.

아래는 구조 예시이며 실제 수업에 포함된 내용은 아닙니다.

```json
{
  "id": "temel1-vowels",
  "level": "temel1",
  "order": 1,
  "title": "모음",
  "summary": "여기에 문법의 짧은 소개를 작성합니다.",
  "sections": [
    {
      "id": "temel1-vowels-overview",
      "heading": "핵심 설명",
      "paragraphs": ["제공받은 설명을 문단별로 작성합니다."],
      "rules": [{ "pattern": "규칙 또는 형태", "description": "규칙 설명" }],
      "examples": [
        {
          "id": "temel1-vowels-overview-example-1",
          "turkish": "Merhaba.",
          "korean": "안녕하세요."
        }
      ]
    }
  ]
}
```

이 객체를 해당 JSON의 `lessons` 배열에 추가합니다. Temel 2는 `level`과 ID 접두사에 `temel2`를 사용합니다. 예문에 검수한 `pronunciation`을 선택적으로 지정하면 해당 발음을 우선 표시하고, 없으면 UI에서 자동 생성합니다. `turkishTitle`로 터키어 제목도 지정할 수 있습니다.

`npm run validate:grammar`로 실제 JSON 전체를 검사할 수 있습니다. 빌드에도 이 검사가 포함되어 형식 불일치나 중복 ID를 배포 전에 발견합니다. 수업에는 `level`, `summary`, `sections`가 필수입니다. 설명은 `summary` 또는 섹션의 `paragraphs`, 예문은 섹션의 `examples`에 작성하세요.

`rules`는 문자열 목록과 `{ "pattern": "...", "description": "..." }` 객체 목록을 모두 지원하며 한 배열에 혼합해도 됩니다. 문자열은 설명 카드로, 객체는 형태와 설명을 구분한 카드로 표시합니다. 원본 JSON을 변환하지 않고 그대로 읽습니다.
