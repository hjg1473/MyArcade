import type { Language } from '../types'

export const translations = {
  ko: {
    home: '홈', about: '소개', welcome: 'Welcome to My Arcade!',
    subtitle: '직접 만든 게임, 시뮬레이션, 작은 실험들을 모아두는 공간이에요.',
    browse: '게임 둘러보기', all: '전체', games: '게임', simulations: '시뮬레이션',
    play: '플레이', preview: '준비 중', demo: '샘플 콘텐츠', game: '게임', simulation: '시뮬레이션',
    aboutTitle: '작고 친근한 디지털 놀이터',
    aboutText: '직접 만든 게임과 인터랙티브 실험을 한곳에 기록합니다. 새 프로젝트가 완성될 때마다 천천히 채워갈 예정이에요.',
    back: '목록으로', fullscreen: '전체화면', controls: '조작 방법', details: '제작 정보',
    notReadyTitle: '아직 플레이할 수 없어요',
    notReadyText: '이 카드는 레이아웃 확인용 샘플입니다. 실제 빌드가 준비되면 이곳에서 바로 실행할 수 있어요.',
    missingTitle: '게임을 찾을 수 없어요', missingText: '주소가 잘못되었거나 게임 정보가 변경되었어요.',
    loadError: '게임을 불러오지 못했어요. 빌드 파일 경로를 확인해 주세요.',
    keyboardNotice: '이 게임은 키보드 조작이 필요해 모바일에서는 플레이하기 어려울 수 있어요.',
    loading: '게임을 불러오는 중…', builtWith: '제작 엔진', released: '공개일',
    footer: '작은 게임, 큰 즐거움.', github: 'GitHub',
  },
  en: {
    home: 'Home', about: 'About', welcome: 'Welcome to My Arcade!',
    subtitle: "A little collection of games, simulations, and experiments I've made.",
    browse: 'Browse games', all: 'All', games: 'Games', simulations: 'Simulations',
    play: 'Play', preview: 'Coming soon', demo: 'Sample content', game: 'Game', simulation: 'Simulation',
    aboutTitle: 'A small, friendly digital playground',
    aboutText: 'A home for games and interactive experiments I make. The shelves will slowly fill as new projects are finished.',
    back: 'Back to games', fullscreen: 'Fullscreen', controls: 'How to play', details: 'Project details',
    notReadyTitle: 'Not playable yet',
    notReadyText: 'This is placeholder content for previewing the layout. Once a real build is ready, you can play it right here.',
    missingTitle: 'Game not found', missingText: 'The link may be incorrect or the game information has changed.',
    loadError: 'The game could not be loaded. Please check the build path.',
    keyboardNotice: 'This game needs a keyboard, so it may be difficult to play on mobile.',
    loading: 'Loading game…', builtWith: 'Engine', released: 'Released',
    footer: 'Small games, big fun.', github: 'GitHub',
  },
} satisfies Record<Language, Record<string, string>>

export type TranslationKey = keyof typeof translations.ko
