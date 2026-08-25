export type AuthUser = {
  id: string
  email: string
  nickname: string
}

export type UserPost = {
  id: string
  text: string
  createdAt: string
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
