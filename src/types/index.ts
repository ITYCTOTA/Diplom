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
  memberList: GroupMember[]
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

export type GroupMember = {
  id: string
  nickname: string
  role: string
  joinedAt: string
}

export type GroupPost = {
  id: string
  author: string
  title: string
  text: string
  time: string
  likes: number
  likedByMe?: boolean
  comments: number
  commentList?: GroupComment[]
}

export type GroupComment = {
  id: string
  author: string
  text: string
  time: string
  likes: number
  likedByMe?: boolean
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
  bio?: string | null
  friendsSince?: string
}

export type FriendRequest = {
  id: string
  userId: string
  name: string
  bio: string | null
  direction: 'incoming' | 'outgoing'
  createdAt: string
}

export type FriendSearchResult = {
  id: string
  name: string
  bio: string | null
  relation: 'available' | 'friend' | 'request_sent' | 'request_received'
  requestId?: string | null
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
