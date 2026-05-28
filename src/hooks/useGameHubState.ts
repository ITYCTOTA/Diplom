import { useCallback, useEffect, useMemo, useState } from 'react'
import { games as fallbackGames, groups as fallbackGroups } from '../data/gamehub'
import {
  createFriendRequest,
  createGroup as createGroupRequest,
  createPurchase,
  createProfilePost as createProfilePostRequest,
  fetchFriends,
  fetchCurrentUser,
  fetchGames,
  fetchGroups,
  fetchLibrary,
  fetchProfile,
  fetchRecommendations,
  getApiErrorMessage,
  joinGroup,
  leaveGroup,
  loginUser,
  readStoredSession,
  registerUser,
  searchUsers as searchUsersRequest,
  storeSession,
  type AuthSession,
} from '../services/gameHubApi'
import type { Friend, Game, Group, UserProfile } from '../types'

export function useGameHubState() {
  const [games, setGames] = useState<Game[]>(fallbackGames)
  const [groups, setGroups] = useState<Group[]>(fallbackGroups)
  const [friends, setFriends] = useState<Friend[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recommendationGames, setRecommendationGames] = useState<Game[]>([])
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => readStoredSession())
  const [libraryIds, setLibraryIds] = useState<string[]>([])
  const [joinedGroups, setJoinedGroups] = useState<string[]>([])
  const [notice, setNotice] = useState('Каталог игр загружен из базы данных')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(Boolean(authSession))
  const [syncError, setSyncError] = useState<string | null>(null)
  const authToken = authSession?.token

  const librarySet = useMemo(() => new Set(libraryIds), [libraryIds])
  const genres = useMemo(
    () => ['Все', ...Array.from(new Set(games.map((game) => game.genre)))],
    [games],
  )
  const libraryGames = useMemo(
    () => games.filter((game) => librarySet.has(game.id)),
    [games, librarySet],
  )

  useEffect(() => {
    let isActive = true

    async function syncPublicData() {
      setIsSyncing(true)

      try {
        const [apiGames, apiGroups] = await Promise.all([fetchGames(), fetchGroups()])

        if (!isActive) {
          return
        }

        setGames(apiGames.length > 0 ? apiGames : fallbackGames)
        setGroups(apiGroups.length > 0 ? apiGroups : fallbackGroups)
        setSyncError(null)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = getApiErrorMessage(error)
        setSyncError(message)
        setNotice(`API недоступен, показаны локальные данные: ${message}`)
      } finally {
        if (isActive) {
          setIsSyncing(false)
        }
      }
    }

    void syncPublicData()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      return
    }

    let isActive = true

    async function syncPrivateData(token: string) {
      setIsAuthChecking(true)

      try {
        const [apiUser, apiLibrary, apiRecommendations, apiProfile, apiFriends] = await Promise.all([
          fetchCurrentUser(token),
          fetchLibrary(token),
          fetchRecommendations(token),
          fetchProfile(token),
          fetchFriends(token),
        ])

        if (!isActive) {
          return
        }

        const verifiedSession = { token, user: apiUser }
        storeSession(verifiedSession)
        setAuthSession(verifiedSession)
        setLibraryIds(apiLibrary.map((game) => game.id))
        setRecommendationGames(apiRecommendations)
        setProfile(apiProfile)
        setFriends(apiFriends)
        setSyncError(null)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = getApiErrorMessage(error)
        storeSession(null)
        setAuthSession(null)
        setProfile(null)
        setFriends([])
        setRecommendationGames([])
        setSyncError(message)
        setNotice(`Сессия не подтверждена: ${message}`)
      } finally {
        if (isActive) {
          setIsAuthChecking(false)
        }
      }
    }

    void syncPrivateData(authToken)

    return () => {
      isActive = false
    }
  }, [authToken])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginUser(email, password)
    storeSession(session)
    setAuthSession(session)
    setNotice(`Вы вошли как ${session.user.nickname}`)
  }, [])

  const register = useCallback(async (email: string, password: string, nickname: string) => {
    const session = await registerUser(email, password, nickname)
    storeSession(session)
    setAuthSession(session)
    setNotice(`Аккаунт ${session.user.nickname} создан`)
  }, [])

  const logout = useCallback(() => {
    storeSession(null)
    setAuthSession(null)
    setProfile(null)
    setFriends([])
    setRecommendationGames([])
    setLibraryIds([])
    setJoinedGroups([])
    setNotice('Вы вышли из аккаунта')
  }, [])

  const addToLibrary = useCallback(
    async (game: Game) => {
      if (librarySet.has(game.id)) {
        return
      }

      if (!authToken) {
        setNotice('Войдите в аккаунт, чтобы покупать игры')
        return
      }

      try {
        await createPurchase(game.id, authToken)
        setLibraryIds((current) => (current.includes(game.id) ? current : [...current, game.id]))
        setNotice(`${game.title} куплена и добавлена в библиотеку`)
      } catch (error) {
        setNotice(`Покупка не выполнена: ${getApiErrorMessage(error)}`)
      }
    },
    [authToken, librarySet],
  )

  const createProfilePost = useCallback(
    async (text: string) => {
      if (!authToken) {
        throw new Error('Требуется авторизация')
      }

      try {
        const post = await createProfilePostRequest(text, authToken)

        setProfile((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            stats: {
              ...current.stats,
              postsCount: current.stats.postsCount + 1,
            },
            posts: [post, ...current.posts].slice(0, 6),
          }
        })
        setNotice('Публикация добавлена')

        return post
      } catch (error) {
        setNotice(`Публикация не добавлена: ${getApiErrorMessage(error)}`)
        throw error
      }
    },
    [authToken],
  )

  const createGroup = useCallback(
    async (title: string, description: string) => {
      if (!authToken) {
        throw new Error('Требуется авторизация')
      }

      try {
        const group = await createGroupRequest(authToken, title, description)

        setGroups((current) => [group, ...current.filter((item) => item.id !== group.id)])
        setJoinedGroups((current) =>
          current.includes(group.id) ? current : [group.id, ...current],
        )
        setNotice(`Группа ${group.title} создана`)

        return group
      } catch (error) {
        setNotice(`Группа не создана: ${getApiErrorMessage(error)}`)
        throw error
      }
    },
    [authToken],
  )

  const searchUsers = useCallback(
    async (query: string) => {
      if (!authToken) {
        throw new Error('Требуется авторизация')
      }

      return searchUsersRequest(authToken, query)
    },
    [authToken],
  )

  const requestFriend = useCallback(
    async (userId: string) => {
      if (!authToken) {
        throw new Error('Требуется авторизация')
      }

      await createFriendRequest(userId, authToken)
      setNotice('Заявка в друзья отправлена')
    },
    [authToken],
  )

  const toggleGroup = useCallback(
    async (groupId: string) => {
      if (!authToken) {
        setNotice('Войдите в аккаунт, чтобы подписываться на группы')
        return
      }

      const willJoin = !joinedGroups.includes(groupId)

      setJoinedGroups((current) =>
        current.includes(groupId)
          ? current.filter((id) => id !== groupId)
          : [...current, groupId],
      )

      try {
        const group = willJoin
          ? await joinGroup(groupId, authToken)
          : await leaveGroup(groupId, authToken)

        setGroups((current) => current.map((item) => (item.id === group.id ? group : item)))
      } catch (error) {
        setJoinedGroups((current) =>
          willJoin ? current.filter((id) => id !== groupId) : [...current, groupId],
        )
        setNotice(`Действие с группой не выполнено: ${getApiErrorMessage(error)}`)
        return
      }

      setNotice(willJoin ? 'Вы подписались на группу' : 'Подписка отменена')
    },
    [authToken, joinedGroups],
  )

  const refreshGroup = useCallback(async (groupId: string) => {
    try {
      const apiGroups = await fetchGroups()
      const freshGroup = apiGroups.find((group) => group.id === groupId)

      if (freshGroup) {
        setGroups((current) => current.map((group) => (group.id === groupId ? freshGroup : group)))
      }
    } catch {
      setGroups((current) => current)
    }
  }, [])

  return {
    addToLibrary,
    authUser: authSession?.user ?? null,
    createProfilePost,
    createGroup,
    friends,
    games,
    genres,
    groups,
    isAuthChecking,
    isSyncing,
    joinedGroups,
    libraryGames,
    librarySet,
    login,
    logout,
    notice,
    profile,
    recommendationGames,
    refreshGroup,
    register,
    requestFriend,
    searchUsers,
    setNotice,
    syncError,
    toggleGroup,
  }
}
