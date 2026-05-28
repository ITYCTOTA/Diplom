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
  | 'auth'

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
  coverUrl?: string | null
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
  creator?: {
    id: string
    nickname: string | null
  } | null
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
  commentList?: GroupComment[]
}

export type GroupComment = {
  id: string
  author: string
  text: string
  time: string
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

export type FriendSearchResult = {
  id: string
  name: string
  bio: string | null
  relation: 'available' | 'friend' | 'request_sent' | 'request_received'
}

export type AuthUser = {
  id: string
  email: string
  nickname: string
  walletBalanceCents: number
}

export type UserProfile = {
  id: string
  email: string
  nickname: string
  bio: string | null
  createdAt: string
  walletBalanceCents: number
  stats: {
    libraryCount: number
    totalMinutes: number
    friendsCount: number
    postsCount: number
    favoriteGameTitle: string | null
  }
  posts: UserPost[]
}

export type UserPost = {
  id: string
  text: string
  createdAt: string
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
  backView: ViewId
}

export type GameArtSize = 'small' | 'medium' | 'card' | 'large' | 'detail'
