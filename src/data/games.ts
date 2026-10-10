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
]
