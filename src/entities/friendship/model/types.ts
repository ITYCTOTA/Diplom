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
