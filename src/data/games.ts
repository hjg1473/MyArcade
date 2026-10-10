import type { Game } from '../types'

export const games: Game[] = [
  {
    id: 'idle-merge-miner', title: { ko: '방치형 머지 광부', en: 'Idle Merge Miner' },
    description: { ko: '자동으로 광물을 캐고, 같은 광물을 합쳐 성장시키며 분쇄기로 코인을 버는 물리 기반 방치형 게임.', en: 'A physics-driven idle game about mining, merging minerals, and crushing them into coins.' },
    longDescription: { ko: '광물이 자동으로 생성되는 광산에서 같은 종류의 광물을 합쳐 더 높은 단계로 성장시키는 방치형 게임입니다. 성장한 광물을 분쇄기에 넣어 코인을 얻고, 채굴 속도와 힘을 강화하며 생산 흐름을 만들어 보세요.', en: 'An idle game where minerals are generated automatically and matching pieces merge into stronger tiers. Feed upgraded minerals into the crusher, earn coins, and improve mining speed and power to build a satisfying production loop.' },
    thumbnail: 'thumbnails/idle-merge-miner.svg', category: 'game', delivery: 'web', buildPath: 'games/idle-merge-miner/index.html',
    controls: { ko: '광물을 마우스 또는 터치로 끌기 · 업그레이드 버튼으로 채굴 능력 강화', en: 'Drag minerals with mouse or touch · Use upgrade buttons to improve mining abilities' },
    engine: 'HTML5 Canvas · Matter.js', platform: 'Web', playable: true,
  },
  {
    id: '100k-cubes-simulation', title: { ko: '10만 큐브 시뮬레이션', en: '100K Cubes Simulation' },
    description: { ko: 'GPU로 10만 개 큐브의 움직임과 충돌을 실험하는 Windows 시뮬레이션입니다.', en: 'A Windows simulation experimenting with the movement and collision of 100,000 GPU-driven cubes.' },
    longDescription: { ko: '대규모 오브젝트를 한 장면에서 처리하는 실험으로 제작한 Unity 시뮬레이션입니다. 웹 빌드가 아닌 Windows 실행 파일이며, ZIP을 내려받아 압축을 푼 뒤 실행할 수 있습니다.', en: 'A Unity experiment built to explore handling a large number of objects in one scene. This is a downloadable Windows build rather than a web build; download the ZIP, extract it, and launch the executable.' },
    thumbnail: 'thumbnails/100k-cubes-simulation.svg', category: 'simulation', delivery: 'download',
    downloadPath: 'downloads/100k-cubes-simulation.zip', downloadFileName: '100k Cubes Simulation.zip', downloadSize: '36.6 MB',
    controls: { ko: 'Windows PC에서 ZIP 압축을 푼 뒤 실행 파일을 실행해 주세요.', en: 'On a Windows PC, extract the ZIP and launch the executable.' },
    engine: 'Unity', platform: 'Windows', playable: false,
  },
  {
    id: 'blackhole-tde-simulation', title: { ko: '블랙홀 TDE 시뮬레이션', en: 'Black Hole TDE Simulation' },
    description: { ko: '블랙홀 주변에서 일어나는 조석 파괴 현상을 시각화한 Windows 시뮬레이션입니다.', en: 'A Windows simulation visualizing a tidal disruption event around a black hole.' },
    longDescription: { ko: '별이 블랙홀의 강한 조석력에 의해 변형되고 붕괴되는 TDE(Tidal Disruption Event)를 시각적으로 살펴볼 수 있도록 제작한 Unity 시뮬레이션입니다. 웹 빌드가 아닌 Windows 실행 파일이며, ZIP을 내려받아 압축을 푼 뒤 Blackhole.exe를 실행할 수 있습니다.', en: 'A Unity simulation created to visualize a tidal disruption event, where a star is deformed and disrupted by the intense tidal forces around a black hole. This is a downloadable Windows build; download the ZIP, extract it, and launch Blackhole.exe.' },
    thumbnail: 'thumbnails/blackhole-tde-simulation.svg', category: 'simulation', delivery: 'download',
    downloadPath: 'downloads/blackhole-tde-simulation.zip', downloadFileName: 'Blackhole TDE Simulation.zip', downloadSize: '94 MB',
    controls: { ko: 'Windows PC에서 ZIP 압축을 푼 뒤 Blackhole.exe를 실행해 주세요.', en: 'On a Windows PC, extract the ZIP and launch Blackhole.exe.' },
    engine: 'Unity', platform: 'Windows', playable: false,
  },
  {
    id: 'go-west', title: { ko: 'Go West ~ 계단을 오르다 ~', en: 'Go West ~ Climb the Stairs ~' },
    description: { ko: '하늘 높이 이어지는 계단을 따라 서쪽으로 달려가는 Roblox 체험입니다.', en: 'A Roblox experience about running westward along a staircase stretching high into the sky.' },
    longDescription: { ko: '밝고 경쾌한 하늘 위 코스를 달리며 계속해서 계단을 오르는 Roblox 프로젝트입니다. 설치 파일을 내려받을 필요 없이 공식 Roblox 게임 페이지에서 바로 실행할 수 있습니다.', en: 'A Roblox project about racing upward through a bright sky course and continuing to climb. No separate download is required; launch it directly from the official Roblox game page.' },
    thumbnail: 'thumbnails/go-west.png', category: 'game', delivery: 'roblox',
    externalUrl: 'https://www.roblox.com/ko/games/92155393757517/Go-West',
    controls: { ko: 'Roblox 기본 이동 조작으로 계단을 따라 올라가세요.', en: 'Use the standard Roblox movement controls to climb the course.' },
    engine: 'Roblox Studio', platform: 'Roblox · PC / Mobile', releaseDate: '2026-09-28', playable: true,
  },
  {
    id: 'loan-game', title: { ko: '대출해서 돈 버는 게임', en: 'Make Money with Loans' },
    description: { ko: '대출과 돈 벌기를 소재로 만든 Android 모바일 게임입니다.', en: 'An Android mobile game built around loans and making money.' },
    longDescription: { ko: '대출과 자금 운용이라는 독특한 소재를 가볍게 풀어낸 모바일 게임입니다. 별도의 파일을 받을 필요 없이 공식 Google Play 스토어에서 Android 기기에 설치할 수 있습니다.', en: 'A mobile game with a playful take on loans and managing money. No separate file download is needed; install it on an Android device from the official Google Play Store.' },
    thumbnail: 'thumbnails/loan-game.webp', category: 'game', delivery: 'googleplay',
    externalUrl: 'https://play.google.com/store/apps/details?id=com.hygeonstudio.loangame&hl=ko',
    controls: { ko: 'Android 기기의 터치 화면으로 조작합니다.', en: 'Play using the touchscreen on an Android device.' },
    engine: 'Mobile Game', platform: 'Android · Google Play', playable: true,
  },
]
