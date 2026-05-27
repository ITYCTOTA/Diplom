import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  friends as fallbackFriends,
  games as fallbackGames,
  groups as fallbackGroups,
} from '../data/gamehub'
import {
  createPurchase,
  fetchFriends,
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
  storeSession,
  type AuthSession,
} from '../services/gameHubApi'
import type { Friend, Game, Group, UserProfile } from '../types'

export function useGameHubState() {
  const [games, setGames] = useState<Game[]>(fallbackGames)
  const [groups, setGroups] = useState<Group[]>(fallbackGroups)
  const [friends, setFriends] = useState<Friend[]>(fallbackFriends)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recommendationGames, setRecommendationGames] = useState<Game[]>([])
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => readStoredSession())
  const [libraryIds, setLibraryIds] = useState(['starfall', 'neon-runners', 'iron-valley'])
  const [wishlistIds, setWishlistIds] = useState(['moon-station'])
  const [joinedGroups, setJoinedGroups] = useState(['space-rpg'])
  const [notice, setNotice] = useState('Каталог игр загружен из базы данных')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const authToken = authSession?.token

  const librarySet = useMemo(() => new Set(libraryIds), [libraryIds])
  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds])
  const genres = useMemo(
    () => ['Все', ...Array.from(new Set(games.map((game) => game.genre)))],
    [games],
  )
  const libraryGames = useMemo(
    () => games.filter((game) => librarySet.has(game.id)),
    [games, librarySet],
  )
  const wishlistGames = useMemo(
    () => games.filter((game) => wishlistSet.has(game.id)),
    [games, wishlistSet],
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
      try {
        const [apiLibrary, apiRecommendations, apiProfile, apiFriends] = await Promise.all([
          fetchLibrary(token),
          fetchRecommendations(token),
          fetchProfile(token),
          fetchFriends(token),
        ])

        if (!isActive) {
          return
        }

        setLibraryIds(apiLibrary.map((game) => game.id))
        setRecommendationGames(apiRecommendations)
        setProfile(apiProfile)
        setFriends(apiFriends.length > 0 ? apiFriends : fallbackFriends)
        setSyncError(null)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = getApiErrorMessage(error)
        setSyncError(message)
        setNotice(`Не удалось получить данные аккаунта: ${message}`)
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
    setFriends(fallbackFriends)
    setRecommendationGames([])
    setLibraryIds(['starfall', 'neon-runners', 'iron-valley'])
    setNotice('Вы вышли из аккаунта')
  }, [])

  const addToLibrary = useCallback(
    async (game: Game) => {
      if (librarySet.has(game.id)) {
        return
      }

      if (authToken) {
        try {
          await createPurchase(game.id, authToken)
          setLibraryIds((current) => (current.includes(game.id) ? current : [...current, game.id]))
          setNotice(`${game.title} куплена и добавлена в библиотеку`)
        } catch (error) {
          setNotice(`Покупка не выполнена: ${getApiErrorMessage(error)}`)
        }

        return
      }

      setLibraryIds((current) => [...current, game.id])
      setNotice(`${game.title} добавлена в библиотеку в демо-режиме`)
    },
    [authToken, librarySet],
  )

  const toggleWishlist = useCallback(
    (game: Game) => {
      const willAdd = !wishlistIds.includes(game.id)
      setWishlistIds((current) =>
        current.includes(game.id)
          ? current.filter((id) => id !== game.id)
          : [...current, game.id],
      )
      setNotice(willAdd ? `${game.title} добавлена в желаемое` : `${game.title} удалена`)
    },
    [wishlistIds],
  )

  const toggleGroup = useCallback(
    async (groupId: string) => {
      const willJoin = !joinedGroups.includes(groupId)

      setJoinedGroups((current) =>
        current.includes(groupId)
          ? current.filter((id) => id !== groupId)
          : [...current, groupId],
      )

      if (authToken) {
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
    friends,
    games,
    genres,
    groups,
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
    setNotice,
    syncError,
    toggleGroup,
    toggleWishlist,
    wishlistGames,
    wishlistSet,
  }
}
