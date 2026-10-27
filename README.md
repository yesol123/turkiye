# merhaba.

한국어 사용자를 위한 튀르키예 여행·기초 터키어 학습 웹사이트입니다. 지도로 지방을 살펴보고, 알파벳과 문법을 익히며, 한국어 문장을 터키어로 번역하고 들어볼 수 있습니다.

React · TypeScript · Vite로 구성되어 있으며, 번역과 음성 합성은 Node 서버 또는 Vercel Functions에서 처리합니다.

## 주요 기능

| 화면 | 기능 |
| --- | --- |
| 홈 | 7개 지방으로 구분한 3D 지도, 앙카라·이스탄불·안탈리야 위치 표시, 선택 지방 강조·설명, 좌우 360도 회전 |
| 알파벳 | 29개 글자, 글자별 예시 단어와 발음 설명, 사전의 뜻·예문·문법 정보 |
| 기본 문법 | Temel 1·2 과정, 문법별 목차·규칙·예문·한글 발음 |
| 번역 | 한국어 → 터키어 번역, 한글 발음 표시, 터키어 음성 재생 |
| 음성 | Google Cloud TTS, 0.75·1·1.2·1.5배 재생, 속도 저장, 일시정지·다시 듣기 |

한글 발음은 터키어 소리를 가깝게 표기한 참고 자료입니다. 사전에서 제공하지 않는 항목은 미제공으로 표시하며, 학습용 보충 자료는 구분해 안내합니다.

## 시작하기

Node.js 22.20 이상과 npm을 권장합니다.

```bash
npm ci
```

프로젝트 루트에 `.env`를 만들고 Google API 키를 설정합니다. 처음 설정할 때는 [`.env.example`](.env.example)을 참고하세요. 기존 `.env`가 있다면 덮어쓰지 마세요.

```dotenv
GOOGLE_TRANSLATION_API_KEY=발급받은_키

# 선택: 음성 합성에 별도 키를 사용할 때만 설정
GOOGLE_TTS_API_KEY=별도_음성_API_키
```

```bash
npm run dev
```

터미널에 표시되는 주소로 접속합니다. 기본 주소는 `http://localhost:5173`이며, 포트 사용 여부에 따라 달라질 수 있습니다. `.env`를 수정했다면 개발 서버를 재시작하세요.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행. 번역·음성 API 포함 |
| `npm run dev:reset` | 의존성 캐시를 강제로 재생성하고 개발 서버 실행 |
| `npm run validate:grammar` | 실제 문법 JSON의 구조·ID·순서 검사 |
| `npm run build` | 문법 검증 → TypeScript 검사 → Vite 빌드. 결과는 `dist/` |
| `npm run preview` | 빌드 결과 미리보기. 번역·음성 API 포함 |
| `npm start` | `dist/`와 API를 Node 서버로 제공. 기본 `http://127.0.0.1:3000` |
| `npm run test:translation` | 번역·음성 서버 테스트 |
| `npm run lint` | ESLint 검사 |

`preview`와 `start`는 먼저 `npm run build`를 실행해야 합니다. Node 서버의 포트는 `PORT` 환경 변수로 바꿀 수 있으며, 현재 서버는 로컬 주소에 바인딩됩니다.

전체 자동 테스트:

```bash
node --test tests/grammar.test.mjs tests/turkishPronunciation.test.mjs server/translation.test.mjs
```

서버 테스트는 Google 응답을 모의 처리합니다. 통과하더라도 실제 API 키의 유효성이나 Google 결제·할당량 설정까지 검증되는 것은 아닙니다.

## 폴더 구조

```text
.
├─ api/                             # Vercel Functions 진입점
│  ├─ translate.js
│  └─ speech.js
├─ server/
│  ├─ index.mjs                     # 로컬 Node 정적 파일·API 서버
│  ├─ translation.mjs               # 번역·음성 공통 요청 처리
│  ├─ translation.d.mts             # 서버 모듈 TypeScript 선언
│  └─ translation.test.mjs
├─ scripts/
│  └─ validate-grammar.mjs          # 빌드 전 문법 데이터 검증
├─ tests/
│  ├─ grammar.test.mjs
│  └─ turkishPronunciation.test.mjs
├─ public/                          # 정적 파일
├─ src/
│  ├─ App.tsx                      # 상위 메뉴·페이지 전환·유지할 상태
│  ├─ main.tsx                     # React 시작점
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ LanguagePage.tsx           # 언어 사이드바와 하위 화면 구성
│  │  └─ language/
│  │     ├─ AlphabetPage.tsx
│  │     ├─ GrammarPage.tsx
│  │     └─ TranslatePage.tsx
│  ├─ components/
│  │  ├─ common/                   # Flag, PageIntro
│  │  ├─ layout/                   # Header, Footer, LanguageSidebar
│  │  ├─ map/                      # RegionMap
│  │  ├─ audio/                    # TranslationSpeech
│  │  ├─ dictionary/               # WordDictionary
│  │  └─ grammar/                  # LessonContent, GrammarErrorBoundary
│  ├─ hooks/
│  │  └─ useTranslation.ts         # 번역 입력·결과·요청 상태
│  ├─ data/
│  │  ├─ alphabet.ts               # 알파벳·단어·발음 설명
│  │  ├─ navigation.ts             # 언어 메뉴 순서·제목
│  │  ├─ provinces.ts              # 주별 지방 분류·색상·설명
│  │  └─ grammar/
│  │     ├─ temel1.json            # Temel 1 문법 원본
│  │     ├─ temel2.json            # Temel 2 문법 원본
│  │     ├─ temel1.ts              # JSON 로딩·검증
│  │     ├─ temel2.ts
│  │     ├─ index.ts               # 과정 목록
│  │     ├─ validate.ts            # 공통 데이터 검증
│  │     └─ README.md              # 문법 작성 규칙·예시
│  ├─ types/                       # grammar, navigation 공통 타입
│  ├─ utils/
│  │  ├─ turkishPronunciation.ts   # 터키어 → 한글 발음 변환
│  │  └─ dictionary.ts             # 사전 응답 처리·학습용 보충 자료
│  ├─ styles/
│  │  ├─ index.css                 # 전역 기본 스타일
│  │  ├─ app.css                   # 앱·홈·지도·공통 기능 스타일
│  │  └─ language.css              # 언어·사전·문법 화면 스타일
│  └─ assets/
├─ .env.example                    # 환경 변수 예시. 실제 키 제외
├─ vite.config.ts                  # 개발·미리보기 API와 캐시 설정
├─ vercel.json                     # Vercel 빌드·함수 설정
└─ package.json
```

## 구조와 상태 관리

- **페이지**는 화면을 구성하고 **컴포넌트**는 기능별 UI를 담당합니다.
- **데이터**는 `data/`, **타입**은 `types/`, **변환 로직**은 `utils/`에 둡니다.
- `App.tsx`가 선택한 언어 메뉴·알파벳과 번역 상태를 유지합니다. 탭을 오가도 번역 입력과 결과가 남습니다.
- 번역 요청은 `useTranslation` 훅에서 처리하고, 페이지는 입력과 결과를 표시합니다.
- 문법 페이지는 필요할 때 불러옵니다. 문법 로딩 오류는 `GrammarErrorBoundary`가 처리해 홈까지 중단되지 않도록 합니다.
- 현재 메뉴 전환은 React 상태를 사용합니다. 별도 라우터나 페이지별 URL은 없습니다.

## 기능별 수정 위치

| 수정할 내용 | 파일 |
| --- | --- |
| 홈의 소개 문구·배치 | [HomePage.tsx](src/pages/HomePage.tsx) |
| 언어 메뉴 순서·이름 | [navigation.ts](src/data/navigation.ts) |
| 사이드바 UI | [LanguageSidebar.tsx](src/components/layout/LanguageSidebar.tsx) |
| 알파벳·예시 단어·발음 안내 | [alphabet.ts](src/data/alphabet.ts) |
| 단어 카드·사전 상태 안내 | [WordDictionary.tsx](src/components/dictionary/WordDictionary.tsx) |
| 사전 응답 해석·보충 예문 | [dictionary.ts](src/utils/dictionary.ts) |
| 문법 본문·규칙·예문 | [temel1.json](src/data/grammar/temel1.json), [temel2.json](src/data/grammar/temel2.json) |
| 문법 표시 방식 | [LessonContent.tsx](src/components/grammar/LessonContent.tsx) |
| 번역 화면 | [TranslatePage.tsx](src/pages/language/TranslatePage.tsx) |
| 번역 요청·오류 상태 | [useTranslation.ts](src/hooks/useTranslation.ts) |
| 한글 발음 변환 | [turkishPronunciation.ts](src/utils/turkishPronunciation.ts) |
| 음성 재생·속도 조절 | [TranslationSpeech.tsx](src/components/audio/TranslationSpeech.tsx) |
| 지도 회전·도시 표시·지방 강조 | [RegionMap.tsx](src/components/map/RegionMap.tsx) |
| 지방 분류·색상·설명 | [provinces.ts](src/data/provinces.ts) |
| Google API 호출·응답 처리 | [translation.mjs](server/translation.mjs) |

## 문법 데이터 작성

본문은 JSX에 직접 넣지 않고 `temel1.json`, `temel2.json`에서 관리합니다. 공통 구조는 [GrammarLesson](src/types/grammar.ts)을 따릅니다.

- 문법 ID는 `temel1-vowels`처럼 단계와 주제를 조합합니다. 제목이나 순서를 바꿔도 기존 ID는 유지합니다.
- 섹션·예문에도 고유 ID를 부여하며, 상위 항목 ID로 시작합니다.
- `order`는 같은 과정 안에서 중복되지 않는 양의 정수입니다.
- `rules`는 설명 문자열과 `{ "pattern": "...", "description": "..." }` 객체를 모두 지원합니다.
- 예문의 `pronunciation`이 있으면 그 값을 표시하고, 없으면 한글 발음을 자동 생성합니다.
- `label`로 모음 이름 같은 짧은 표제를 붙일 수 있습니다.

구조 예시와 필수 필드는 [문법 데이터 작성 안내](src/data/grammar/README.md)를 참고하세요. 변경 후 `npm run validate:grammar`로 확인합니다. 같은 검사가 빌드에도 포함됩니다.

## 외부 API와 데이터 흐름

### 번역

```text
TranslatePage → useTranslation → POST /api/translate
             → Google Cloud Translation Basic v2 → 터키어 결과
```

요청은 `{ "text": "한국어 문장" }`이며, 최대 1,000자를 한국어(`ko`)에서 터키어(`tr`)로 번역합니다. 성공 응답은 `{ "translation": "..." }`, 오류 응답은 `{ "error": "..." }`입니다.

### 음성 재생

```text
TranslationSpeech → POST /api/speech
                  → Google Cloud Text-to-Speech → MP3 → 브라우저 재생
```

알파벳과 번역 화면이 같은 음성 컴포넌트를 사용합니다. `tr-TR-Standard-A` 음성으로 생성하고, 속도 변경은 브라우저 재생 속도로 적용합니다. 같은 컴포넌트에 남아 있는 음성은 다시 요청하지 않고 재생합니다. 화면을 떠나면 요청과 음성 URL을 정리합니다.

Google 키는 서버에서만 읽습니다. 두 API를 같은 키로 이용하거나, `GOOGLE_TTS_API_KEY`로 음성 전용 키를 지정할 수 있습니다. Google Cloud 프로젝트의 API 활성화·결제·키 제한이 해당 서비스 사용을 허용해야 합니다.

### 사전과 지도

- 사전은 브라우저에서 [Free Dictionary API](https://freedictionaryapi.com/)를 조회합니다. 뜻·예문·활용형의 제공 범위는 단어마다 다릅니다. 준비된 학습 정보가 있으면 함께 표시합니다.
- 지도는 외부 GeoJSON을 불러와 7개 지방으로 묶습니다. Three.js는 CDN에서 로드합니다. 3D 로딩에 실패하면 평면 지도를 제공하며, 경계 데이터 자체를 가져오지 못하면 재시도 안내를 표시합니다.
- 사전·지도·웹폰트·Google API 사용에는 인터넷 연결이 필요합니다.

## Vercel 배포

`api/translate.js`, `api/speech.js`가 Vercel Functions 진입점이며, 로컬 서버와 동일한 요청 처리 코드를 사용합니다.

1. GitHub 저장소를 Vercel에 연결하거나 프로젝트 폴더에서 `npx vercel`로 직접 배포합니다.
2. 프로젝트 환경 변수에 `GOOGLE_TRANSLATION_API_KEY`를 등록합니다. 별도 음성 키를 쓴다면 `GOOGLE_TTS_API_KEY`도 등록합니다.
3. 사용할 Production/Preview 환경을 선택하고 배포합니다. 환경 변수 변경 후에는 재배포합니다.

| 설정 | 값 |
| --- | --- |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`.env`는 업로드하지 않습니다. 실제 키에 `VITE_` 접두사를 붙이면 클라이언트에 노출될 수 있으므로 사용하지 마세요. GitHub에는 소스 코드를 올리고 빌드 결과는 Vercel에서 생성합니다.

Google 키에 로컬 PC의 공인 IP만 허용했다면 Vercel 서버의 요청은 거부될 수 있습니다. 배포 서버에 맞는 키 제한과 네트워크 구성을 확인하세요.

정적 `dist/`만 다른 호스팅에 올리면 번역·음성 API는 실행되지 않습니다. 해당 환경에도 `/api/translate`, `/api/speech` 서버 경로가 필요합니다.

## 문제 해결

| 증상 | 확인 방법 |
| --- | --- |
| 흰 화면, `504 (Outdated Optimize Dep)` | 개발 서버 종료 → `npm run dev:reset` → 브라우저 강력 새로고침. 개발 캐시는 `node_modules/.vite-browser` 사용 |
| 문법 수정 후 검증 실패 | `npm run validate:grammar`로 필수 필드·고유 ID·순서 확인 |
| Google 키 변경 후 반영되지 않음 | 로컬 서버 재시작. Vercel 환경 변수라면 재배포 |
| Google API 거부 | 화면의 오류 코드로 API 활성화·결제·서비스 허용·웹사이트/IP 제한 확인 |
| 배포 후 번역·음성만 실패 | Vercel 환경 변수와 두 API 함수 배포 여부 확인 |
| 사전·지도 로딩 실패 | 외부 데이터 서비스와 CDN 접속 상태 확인 후 다시 시도 |

## 데이터 출처

- 사전: [FreeDictionaryAPI.com](https://freedictionaryapi.com/), [Wiktionary](https://en.wiktionary.org/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 단어 카드에도 원문·라이선스를 표시합니다.
- 지도 경계: [theaiagent/turkiye_iller_geojson](https://github.com/theaiagent/turkiye_iller_geojson), cihadturhan/tr-geojson, © [OpenStreetMap 기여자](https://www.openstreetmap.org/copyright), [ODbL](https://opendatacommons.org/licenses/odbl/1-0/).
- 지방 분류는 프로젝트의 주별 매핑을 따르는 학습용 구분이며 공식 측량 자료가 아닙니다.
