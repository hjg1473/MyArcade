import type { Game } from '../types'

export const games: Game[] = [
  {
    id: 'star-catcher',
    title: { ko: '별빛 캐처', en: 'Star Catcher' },
    description: { ko: '바구니를 움직여 떨어지는 별을 모으는 짧은 HTML5 데모 게임입니다.', en: 'A tiny HTML5 demo about catching falling stars in your basket.' },
    thumbnail: 'thumbnails/star-catcher.svg', category: 'game', buildPath: 'games/star-catcher/index.html',
    controls: { ko: '← → 또는 A D로 이동 · 모바일에서는 화면 아래 버튼 사용', en: 'Move with ← → or A D · On mobile, use the buttons below the game' },
    engine: 'HTML5 Canvas', releaseDate: '2026-10-09', playable: true, featured: true,
  },
  {
    id: 'tiny-garden', title: { ko: '조그만 정원', en: 'Tiny Garden' },
    description: { ko: '작은 화분의 생태계를 관찰하고 돌보는 편안한 시뮬레이션.', en: 'A cozy simulation about observing and caring for a tiny ecosystem.' },
    thumbnail: 'thumbnails/tiny-garden.svg', category: 'simulation', buildPath: 'games/tiny-garden/index.html',
    controls: { ko: '마우스 또는 터치로 물과 햇빛을 조절', en: 'Use mouse or touch to adjust water and sunlight' },
    engine: 'Unity WebGL', playable: false,
  },
  {
    id: 'idle-merge-miner', title: { ko: '방치형 머지 광부', en: 'Idle Merge Miner' },
    description: { ko: '자동으로 광물을 캐고, 같은 광물을 합쳐 성장시키며 분쇄기로 코인을 버는 물리 기반 방치형 게임.', en: 'A physics-driven idle game about mining, merging minerals, and crushing them into coins.' },
    thumbnail: 'thumbnails/idle-merge-miner.svg', category: 'game', buildPath: 'games/idle-merge-miner/index.html',
    controls: { ko: '광물을 마우스 또는 터치로 끌기 · 업그레이드 버튼으로 채굴 능력 강화', en: 'Drag minerals with mouse or touch · Use upgrade buttons to improve mining abilities' },
    engine: 'HTML5 Canvas · Matter.js', playable: true,
  },
  {
    id: 'cloud-cafe', title: { ko: '구름 카페', en: 'Cloud Café' },
    description: { ko: '하늘 손님들의 엉뚱한 주문을 맞추는 캐주얼 타임 매니지먼트 게임.', en: 'A casual time-management game serving whimsical orders in the sky.' },
    thumbnail: 'thumbnails/cloud-cafe.svg', category: 'game', buildPath: 'games/cloud-cafe/index.html',
    controls: { ko: '마우스로 재료를 선택하고 드래그', en: 'Select and drag ingredients with the mouse' },
    engine: 'Godot Web', playable: false,
  },
  {
    id: 'orbit-lab', title: { ko: '궤도 연구소', en: 'Orbit Lab' },
    description: { ko: '중력과 속도를 바꿔 행성의 움직임을 살펴보는 물리 실험.', en: 'A physics sandbox for exploring planetary motion, gravity, and speed.' },
    thumbnail: 'thumbnails/orbit-lab.svg', category: 'simulation', buildPath: 'games/orbit-lab/index.html',
    controls: { ko: '마우스로 행성을 배치하고 슬라이더로 중력 조절', en: 'Place planets with the mouse and adjust gravity with sliders' },
    engine: 'HTML5', playable: false,
  },
  {
    id: 'neon-hop', title: { ko: '네온 홉', en: 'Neon Hop' },
    description: { ko: '발판을 가볍게 뛰어오르며 최고 높이에 도전하는 미니 게임.', en: 'A bite-sized platformer about hopping ever higher.' },
    thumbnail: 'thumbnails/neon-hop.svg', category: 'game', buildPath: 'games/neon-hop/index.html',
    controls: { ko: '← → 이동 · Space 점프', en: '← → to move · Space to jump' },
    engine: 'Unity WebGL', playable: false, keyboardOnly: true,
  },
]
