export type Language = 'ko' | 'en'
export type LocalizedText = Record<Language, string>
export type GameCategory = 'game' | 'simulation'

export interface Game {
  id: string
  title: LocalizedText
  description: LocalizedText
  thumbnail: string
  category: GameCategory
  buildPath: string
  controls: LocalizedText
  engine?: string
  releaseDate?: string
  playable: boolean
  featured?: boolean
  keyboardOnly?: boolean
}
