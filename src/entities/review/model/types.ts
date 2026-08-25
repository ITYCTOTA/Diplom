export type Review = {
  id: string
  rating: number
  text: string
  createdAt: string
  author: {
    id: string
    nickname: string
  }
}
