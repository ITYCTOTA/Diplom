export type ViewId =
  | 'home'
  | 'store'
  | 'game'
  | 'library'
  | 'recommendations'
  | 'groups'
  | 'group'
  | 'friends'
  | 'profile'

export type Game = {
  id: string
  title: string
  genre: string
  mood: string
  price: number
  discount?: string
  rating: number
  hours: number
  tags: string[]
  summary: string
  reason: string
  activity: string
  palette: [string, string]
}

export type Group = {
  id: string
  title: string
  members: string
  topic: string
  description: string
  online: string
  postsCount: string
  founded: string
  gameIds: string[]
  palette: [string, string]
  rules: string[]
  posts: GroupPost[]
  discussions: GroupDiscussion[]
}

export type GroupPost = {
  id: string
  author: string
  title: string
  text: string
  time: string
  likes: number
  comments: number
}

export type GroupDiscussion = {
  id: string
  title: string
  replies: number
  lastActivity: string
}

export type Friend = {
  id: string
  name: string
  status: string
  game: string
  level: number
}

export type AuthUser = {
  id: string
  email: string
  nickname: string
}

export type UserProfile = {
  id: string
  email: string
  nickname: string
  bio: string | null
  createdAt: string
  stats: {
    libraryCount: number
    totalMinutes: number
    friendsCount: number
    postsCount: number
    favoriteGameTitle: string | null
  }
}

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

export type RouteState = {
  view: ViewId
  gameId: string
  groupId: string
}

export type GameArtSize = 'small' | 'medium' | 'card' | 'large' | 'detail'
