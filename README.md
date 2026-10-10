# HAM GROUND

직접 만든 게임과 시뮬레이션을 전시하고 브라우저에서 실행하는 정적 개인 아케이드입니다. React, Vite, TypeScript, Tailwind CSS, HashRouter로 구성되어 있으며 백엔드는 사용하지 않습니다.

## 로컬 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

배포용 결과물을 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run preview
```

## 게임 추가하기

게임은 브라우저에서 바로 실행하는 `web` 방식과 ZIP을 내려받는 `download` 방식을 지원합니다. 두 방식 모두 카드, 자동 캐러셀, `#/play/{gameId}` 상세 페이지가 데이터에서 자동 생성됩니다.

### 웹 게임

1. 게임 빌드 전체를 `public/games/{gameId}/`에 넣습니다. 진입 파일은 `index.html`이어야 합니다.
2. 16:9 썸네일을 `public/thumbnails/`에 추가합니다.
3. `src/data/games.ts`에 `Game` 객체 하나를 추가합니다.

```ts
{
  id: 'my-game',
  title: { ko: '내 게임', en: 'My Game' },
  description: { ko: '한국어 설명', en: 'English description' },
  thumbnail: 'thumbnails/my-game.webp',
  category: 'game', // 또는 'simulation'
  delivery: 'web',
  buildPath: 'games/my-game/index.html',
  controls: { ko: '방향키로 이동', en: 'Move with arrow keys' },
  longDescription: { ko: '상세한 프로젝트 설명', en: 'A longer project description' },
  gallery: ['screenshots/my-game-01.webp'],
  youtubeUrl: 'https://www.youtube.com/watch?v=...', // 선택 사항
  engine: 'Unity WebGL',
  releaseDate: '2026-10-09',
  playable: true,
  keyboardOnly: true,
}
```

모바일 조작이 어려운 게임은 `keyboardOnly: true`를 지정하세요. `gallery`를 비워 두면 상세 페이지에 향후 이미지를 넣을 수 있는 슬롯이 표시되고, `youtubeUrl`을 비워 두면 영상 준비 중 영역이 표시됩니다.

### Windows 다운로드 게임

ZIP 파일을 `public/downloads/`에 넣고 다음처럼 등록합니다.

```ts
{
  id: 'my-windows-game',
  title: { ko: '내 Windows 게임', en: 'My Windows Game' },
  description: { ko: '짧은 설명', en: 'Short description' },
  longDescription: { ko: '상세 설명', en: 'Long description' },
  thumbnail: 'thumbnails/my-windows-game.webp',
  category: 'simulation',
  delivery: 'download',
  downloadPath: 'downloads/my-windows-game.zip',
  downloadFileName: 'My Windows Game.zip',
  downloadSize: '120 MB',
  controls: { ko: '압축 해제 후 실행', en: 'Extract and launch' },
  engine: 'Unity',
  platform: 'Windows',
  playable: false,
}
```

### 엔진별 참고

- Unity WebGL: 생성된 폴더 구조와 압축 파일을 그대로 복사하고 서버 압축 헤더가 필요한 설정은 피하세요. GitHub Pages는 사용자 지정 응답 헤더를 제공하지 않습니다.
- Godot Web: 스레드 사용 빌드는 COOP/COEP 헤더가 필요할 수 있으므로 단일 스레드 웹 내보내기가 가장 단순합니다.
- HTML5: 상대 경로 에셋은 게임의 `index.html`을 기준으로 배치하세요.

## GitHub Pages 배포

1. 저장소의 기본 브랜치를 `main`으로 설정하고 GitHub에 push합니다.
2. **Settings → Pages → Source**에서 **GitHub Actions**를 선택합니다.
3. `.github/workflows/deploy.yml`이 빌드하고 Pages에 자동 배포합니다.

프로젝트 Pages 기본 주소(`https://사용자명.github.io/저장소명/`)에서는 워크플로가 저장소 이름을 Vite base 경로로 자동 사용합니다. 커스텀 도메인 또는 사용자 사이트(`사용자명.github.io`)라면 Repository **Settings → Secrets and variables → Actions → Variables**에 `CUSTOM_DOMAIN=true`를 등록해 base를 `/`로 바꾸세요. 커스텀 도메인은 GitHub Pages 설정에서 별도로 연결하고 필요하면 `public/CNAME`도 추가합니다.

로컬에서 하위 경로 빌드를 직접 시험하려면 PowerShell에서 다음을 실행할 수 있습니다.

```powershell
$env:VITE_BASE_PATH='/repository-name/'; npm run build
```

HashRouter를 사용하므로 상세 페이지 새로고침 시 GitHub Pages의 404 리다이렉트 설정이 필요하지 않습니다.

## 정적 호스팅 한계

GitHub Pages는 소규모 정적 사이트를 위한 서비스입니다. 공식 사용 제한과 저장소 제한은 변경될 수 있으므로 큰 Unity/Godot 빌드를 올리기 전 GitHub Pages 문서를 확인하세요. 대용량 빌드는 저장소 크기와 배포 시간, 월간 대역폭에 부담을 줄 수 있으며 Git LFS 파일은 Pages 결과물에서 기대한 방식으로 제공되지 않을 수 있습니다. 빌드가 커지면 게임 파일을 별도 정적 호스팅/CDN에 두고 `buildPath` 대신 허용된 외부 URL을 지원하도록 확장하는 방식을 권장합니다.

## 주요 폴더

```text
src/components/      공통 UI
src/context/         언어 상태와 localStorage 연동
src/data/            게임 및 번역 데이터
src/pages/           홈/플레이 페이지
public/games/        실제 게임 빌드
public/downloads/    다운로드용 Windows 빌드 ZIP
public/thumbnails/   게임 썸네일
```
