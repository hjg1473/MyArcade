export type Language = 'ko' | 'en'
export type LocalizedText = Record<Language, string>
export type GameCategory = 'game' | 'simulation'
export type GameDelivery = 'web' | 'download' | 'roblox' | 'googleplay'

export interface Game {
  id: string
  title: LocalizedText
  description: LocalizedText
  thumbnail: string
  category: GameCategory
  delivery: GameDelivery
  buildPath?: string
  downloadPath?: string
  downloadFileName?: string
  downloadSize?: string
  externalUrl?: string
  controls: LocalizedText
  longDescription: LocalizedText
  gallery?: string[]
  youtubeUrl?: string
  platform?: string
  engine?: string
  releaseDate?: string
  playable: boolean
  keyboardOnly?: boolean
}
