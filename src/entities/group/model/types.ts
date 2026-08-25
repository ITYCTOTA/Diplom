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
