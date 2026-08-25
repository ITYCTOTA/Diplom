export type Game = {
  id: string
  title: string
  genre: string
  mood: string
  price: number
  discount?: string
  rating: number | null
  hours: number
  tags: string[]
  summary: string
  reason: string
  activity: string
  palette: [string, string]
  coverUrl?: string | null
}

export type GameArtSize = 'small' | 'medium' | 'card' | 'large' | 'detail'
