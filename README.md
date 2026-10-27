# merhaba.

React + TypeScript + Vite 기반 튀르키예 지도와 기초 터키어 학습 페이지.

## 실행

- 개발: `npm run dev`
- 빌드: `npm run build`
- 빌드 결과와 번역 API 실행: `npm start` (기본 http://127.0.0.1:3000)
- 빌드 미리보기: `npm run preview` (번역 API 포함)
- 번역 서버 테스트: `npm run test:translation`

## Google 번역

프로젝트 루트 `.env`에 `GOOGLE_TRANSLATION_API_KEY=발급받은_키`를 설정하고 서버를 시작합니다. `.env` 수정 후 서버를 재시작하세요. 키에 `VITE_` 접두사를 붙이지 마세요.

Google Cloud 프로젝트에서 Cloud Translation API (Basic v2)를 활성화하고 결제 및 API 키 제한을 확인해야 합니다. 서버에서 Google API로 연결할 수 있는 네트워크가 필요합니다.

브라우저는 같은 서버의 `POST /api/translate`에 `{ "text": "한국어 문장" }`을 전송합니다. 서버는 한국어(ko) → 터키어(tr), 일반 텍스트 형식으로 최대 1,000자를 번역합니다. 키는 서버에서만 읽고 클라이언트 번들·응답에 포함하지 않습니다.

정적 `dist` 폴더만 배포하면 번역 API는 실행되지 않습니다. `npm start`로 Node 서버를 함께 실행하거나 배포 환경에 `/api/translate` 서버 경로를 연결하세요.

공식 API 문서: https://docs.cloud.google.com/translate/docs/reference/rest/v2/translate

## 번역 음성 듣기

`POST /api/speech`는 번역된 터키어를 Cloud Text-to-Speech의 `tr-TR-Standard-A` 음성으로 합성하고 MP3로 반환합니다. 동일한 키를 사용하므로 Google Cloud의 키 API 제한에 Cloud Translation API와 Cloud Text-to-Speech API를 모두 허용하세요. 별도 키를 쓰려면 `.env`에 `GOOGLE_TTS_API_KEY`를 추가하세요. 값이 없으면 번역 키를 사용합니다.

같은 번역 결과를 다시 들을 때는 브라우저에 남아 있는 음성을 재생하고, 번역 결과가 바뀌면 정리합니다. 정적 빌드만 호스팅하면 음성 API도 실행되지 않으므로 Node 서버가 필요합니다.

## Vercel 배포

루트의 `api/translate.js`, `api/speech.js`가 Vercel Node Functions로 실행됩니다. `vercel.json`은 Vite 빌드와 `dist` 출력 경로를 지정합니다.

1. GitHub 저장소에 소스를 올리고 Vercel에서 Import하거나, 프로젝트 폴더에서 `npx vercel`로 직접 배포합니다.
2. Vercel 프로젝트 Settings → Environment Variables에 `GOOGLE_TRANSLATION_API_KEY`를 등록합니다. 별도 음성 키가 있다면 `GOOGLE_TTS_API_KEY`도 등록합니다. `.env` 파일은 업로드하지 않습니다.
3. 환경 변수는 Production/Preview 중 사용할 환경에 설정한 후 배포합니다. 값 변경 후에는 재배포해야 합니다.

서버 호출용 Google 키에 Cloud Translation API와 Cloud Text-to-Speech API 사용을 허용해야 합니다. IP 제한을 설정했다면 Vercel 서버의 발신 IP를 허용해야 하며, 로컬 PC의 공인 IP만 허용한 키는 배포 서버에서 작동하지 않습니다. Vercel의 고정 발신 IP 제공 여부는 계정과 네트워크 구성에 따라 확인하세요.

빌드 명령: `npm run build` / 출력 디렉터리: `dist` / 프레임워크: `Vite`. GitHub에는 소스 코드를 올리면 되고 `dist`는 빌드 시 생성됩니다.
