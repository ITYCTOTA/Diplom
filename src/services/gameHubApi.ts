import { friends as fallbackFriends, games as fallbackGames, groups as fallbackGroups } from '../data/gamehub'
import type { AuthUser, Friend, Game, Group, GroupPost, Review, UserProfile } from '../types'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(
  /\/$/,
  '',
)
const TOKEN_STORAGE_KEY = 'gamehub.auth.token'
const USER_STORAGE_KEY = 'gamehub.auth.user'

export type AuthSession = {
  token: string
  user: AuthUser
}

type ApiRequestOptions = RequestInit & {
  token?: string
}

type ApiGameDto = {
  id: string
  slug: string
  title: string
  description: string
  priceCents: number
  rating: number
  coverTone: string
  coverToneTwo: string
  genres: string[]
  tags: string[]
}

type ApiGroupDto = {
  id: string
  slug: string
  title: string
  description: string
  coverTone: string
  coverToneTwo: string
  createdAt: string
  membersCount: number
  postsCount: number
  posts?: ApiGroupPostDto[]
}

type ApiGroupPostDto = {
  id: string
  title: string
  text: string
  createdAt: string
  author: {
    id: string
    nickname: string
  } | null
  likesCount: number
  commentsCount: number
}

type ApiFriendDto = {
  id: string
  nickname: string
  bio: string | null
  friendsSince: string
}

type ApiRecommendationDto = {
  game: ApiGameDto
  score: number
  reason: string
}

type ApiLibraryItemDto = {
  game: ApiGameDto
  addedAt: string
}

type ApiProfileResponse = {
  profile: UserProfile
}

type ApiReviewsResponse = {
  reviews: Review[]
}

const numberFormatter = new Intl.NumberFormat('ru-RU')

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message

    if (typeof message === 'string') {
      return message
    }
  }

  return fallback
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { token, headers, body, ...init } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const authToken = token ?? readStoredSession()?.token

  if (authToken) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    body,
    headers: requestHeaders,
  })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data: unknown = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Ошибка API: ${response.status}`))
  }

  return data as T
}

function formatCount(value: number) {
  return numberFormatter.format(value)
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'только что'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function mapApiGame(dto: ApiGameDto, overrides: Partial<Game> = {}): Game {
  const fallback = fallbackGames.find((game) => game.id === dto.slug || game.title === dto.title)
  const genre = dto.genres[0] ?? fallback?.genre ?? 'Без жанра'
  const tags = dto.tags.length > 0 ? dto.tags : fallback?.tags ?? []

  return {
    id: dto.slug,
    title: dto.title,
    genre,
    mood: fallback?.mood ?? genre,
    price: Math.round(dto.priceCents / 100),
    discount: fallback?.discount,
    rating: dto.rating,
    hours: fallback?.hours ?? 0,
    tags,
    summary: dto.description,
    reason: fallback?.reason ?? 'Подборка сформирована по жанрам, тегам и активности игрока.',
    activity: fallback?.activity ?? 'Данные синхронизированы с сервером',
    palette: [dto.coverTone, dto.coverToneTwo],
    ...overrides,
  }
}

function mapApiGroupPost(dto: ApiGroupPostDto): GroupPost {
  return {
    id: dto.id,
    author: dto.author?.nickname ?? 'Сообщество',
    title: dto.title,
    text: dto.text,
    time: formatDateTime(dto.createdAt),
    likes: dto.likesCount,
    comments: dto.commentsCount,
  }
}

function mapApiGroup(dto: ApiGroupDto): Group {
  const fallback = fallbackGroups.find((group) => group.id === dto.slug || group.title === dto.title)
  const createdAt = new Date(dto.createdAt)
  const founded = Number.isNaN(createdAt.getTime()) ? fallback?.founded ?? '2026' : String(createdAt.getFullYear())

  return {
    id: dto.slug,
    title: dto.title,
    members: formatCount(dto.membersCount),
    topic: fallback?.topic ?? 'последние публикации сообщества',
    description: dto.description,
    online: fallback?.online ?? formatCount(Math.max(1, Math.round(dto.membersCount / 3))),
    postsCount: formatCount(dto.postsCount),
    founded,
    gameIds: fallback?.gameIds ?? [],
    palette: [dto.coverTone, dto.coverToneTwo],
    rules: fallback?.rules ?? ['Публикации должны относиться к теме группы'],
    posts: dto.posts?.map(mapApiGroupPost) ?? fallback?.posts ?? [],
    discussions: fallback?.discussions ?? [],
  }
}

function mapApiFriend(dto: ApiFriendDto, index: number): Friend {
  const fallback = fallbackFriends[index]

  return {
    id: dto.id,
    name: dto.nickname,
    status: 'в друзьях',
    game: fallback?.game ?? dto.bio ?? 'GameHub',
    level: fallback?.level ?? 1,
  }
}

export function readStoredSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const rawUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!token || !rawUser) {
    return null
  }

  try {
    const user = JSON.parse(rawUser) as AuthUser
    return { token, user }
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function storeSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Неизвестная ошибка API'
}

export async function fetchGames() {
  const response = await apiRequest<{ games: ApiGameDto[] }>('/games')
  return response.games.map((game) => mapApiGame(game))
}

export async function fetchGroups() {
  const response = await apiRequest<{ groups: ApiGroupDto[] }>('/groups')
  return response.groups.map((group) => mapApiGroup(group))
}

export async function fetchGroup(groupId: string) {
  const response = await apiRequest<{ group: ApiGroupDto }>(`/groups/${groupId}`)
  return mapApiGroup(response.group)
}

export async function loginUser(email: string, password: string) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(email: string, password: string, nickname: string) {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nickname }),
  })
}

export async function fetchLibrary(token: string) {
  const response = await apiRequest<{ library: ApiLibraryItemDto[] }>('/library', { token })
  return response.library.map((item) => mapApiGame(item.game))
}

export async function fetchRecommendations(token: string) {
  const response = await apiRequest<{ recommendations: ApiRecommendationDto[] }>('/recommendations', {
    token,
  })

  return response.recommendations.map((item) =>
    mapApiGame(item.game, {
      reason: item.reason,
    }),
  )
}

export async function fetchProfile(token: string) {
  const response = await apiRequest<ApiProfileResponse>('/profile/me', { token })
  return response.profile
}

export async function fetchFriends(token: string) {
  const response = await apiRequest<{ friends: ApiFriendDto[] }>('/friends', { token })
  return response.friends.map(mapApiFriend)
}

export async function createPurchase(gameId: string, token: string) {
  return apiRequest<{ purchase: unknown }>(`/purchases/${gameId}`, {
    method: 'POST',
    token,
  })
}

export async function joinGroup(groupId: string, token: string) {
  const response = await apiRequest<{ group: ApiGroupDto }>(`/groups/${groupId}/join`, {
    method: 'POST',
    token,
  })

  return mapApiGroup(response.group)
}

export async function leaveGroup(groupId: string, token: string) {
  const response = await apiRequest<{ group: ApiGroupDto }>(`/groups/${groupId}/join`, {
    method: 'DELETE',
    token,
  })

  return mapApiGroup(response.group)
}

export async function fetchGameReviews(gameId: string) {
  const response = await apiRequest<ApiReviewsResponse>(`/games/${gameId}/reviews`)
  return response.reviews
}
