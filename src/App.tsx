import { Suspense, lazy, useEffect, useMemo, useState, type CSSProperties } from 'react'
import gamehubBackground from './assets/gamehub-bg.png'
import { WorkspaceLoader } from './components/WorkspaceLoader'
import { WorkspaceError } from './components/WorkspaceError'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { useGameHubRoute } from './hooks/useGameHubRoute'
import { useGameHubState } from './hooks/useGameHubState'
import { HomePage } from './pages/HomePage'
import type { Game, ViewId } from './types'
import './styles/App.css'

const StorePage = lazy(() => import('./pages/StorePage').then((module) => ({ default: module.StorePage })))
const GamePage = lazy(() => import('./pages/GamePage').then((module) => ({ default: module.GamePage })))
const LibraryPage = lazy(() =>
  import('./pages/LibraryPage').then((module) => ({ default: module.LibraryPage })),
)
const RecommendationsPage = lazy(() =>
  import('./pages/RecommendationsPage').then((module) => ({ default: module.RecommendationsPage })),
)
const GroupsPage = lazy(() =>
  import('./pages/GroupsPage').then((module) => ({ default: module.GroupsPage })),
)
const GroupPage = lazy(() => import('./pages/GroupPage').then((module) => ({ default: module.GroupPage })))
const FriendsPage = lazy(() =>
  import('./pages/FriendsPage').then((module) => ({ default: module.FriendsPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const PurchaseModal = lazy(() =>
  import('./components/PurchaseModal').then((module) => ({ default: module.PurchaseModal })),
)
const FriendSearchModal = lazy(() =>
  import('./components/FriendSearchModal').then((module) => ({ default: module.FriendSearchModal })),
)
const CreateGroupModal = lazy(() =>
  import('./components/CreateGroupModal').then((module) => ({ default: module.CreateGroupModal })),
)

type SearchScope = 'games' | 'friends' | 'groups'

const searchScopeByView: Partial<Record<ViewId, SearchScope>> = {
  store: 'games',
  library: 'games',
  recommendations: 'games',
  friends: 'friends',
  groups: 'groups',
}

const searchPlaceholderByScope: Record<SearchScope, string> = {
  games: 'Название, жанр, тег',
  friends: 'Имя, статус, игра',
  groups: 'Название, описание, тема',
}

const emptySearchState: Record<SearchScope, string> = {
  games: '',
  friends: '',
  groups: '',
}

type WorkspaceAction = 'reload' | 'auth' | 'home'

type WorkspaceErrorState = {
  code: string
  title: string
  message: string
  actionLabel: string
  action: WorkspaceAction
}

function buildWorkspaceError(message: string): WorkspaceErrorState {
  const normalized = message.toLocaleLowerCase('ru-RU')
  const status = message.match(/\b(301|302|307|308|401|403|404|409|500|502|503)\b/)?.[1]

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network') ||
    normalized.includes('fetch failed')
  ) {
    return {
      code: '503',
      title: 'Сервер недоступен',
      message: 'Не удалось подключиться к серверу.',
      actionLabel: 'Повторить',
      action: 'reload',
    }
  }

  if (status === '401' || normalized.includes('авторизац') || normalized.includes('token')) {
    return {
      code: '401',
      title: 'Требуется вход',
      message: 'Сессия не подтверждена. Войдите в аккаунт заново.',
      actionLabel: 'Открыть вход',
      action: 'auth',
    }
  }

  if (status === '403') {
    return {
      code: '403',
      title: 'Нет доступа',
      message,
      actionLabel: 'Вернуться на главную',
      action: 'home',
    }
  }

  if (status === '404' || normalized.includes('не найден')) {
    return {
      code: '404',
      title: 'Ресурс не найден',
      message,
      actionLabel: 'Вернуться на главную',
      action: 'home',
    }
  }

  if (status === '409') {
    return {
      code: '409',
      title: 'Конфликт данных',
      message,
      actionLabel: 'Повторить',
      action: 'reload',
    }
  }

  if (status === '500' || status === '502' || status === '503') {
    return {
      code: status,
      title: 'Сервер недоступен',
      message: 'На стороне backend возникла ошибка. Попробуйте еще раз позже.',
      actionLabel: 'Повторить',
      action: 'reload',
    }
  }

  return {
    code: status ?? 'ERROR',
    title: 'Не удалось загрузить данные',
    message,
    actionLabel: 'Повторить',
    action: 'reload',
  }
}

function App() {
  const { activeView, selectedBackView, selectedGameId, selectedGroupId, navigate } = useGameHubRoute()
  const {
    addToLibrary,
    acceptFriendRequest,
    authUser,
    createProfilePost,
    createGroup,
    friends,
    games,
    genres,
    groups,
    incomingFriendRequests,
    isAuthChecking,
    isSyncing,
    joinedGroups,
    libraryGames,
    librarySet,
    login,
    logout,
    notice,
    outgoingFriendRequests,
    profile,
    recommendationGames,
    register,
    requestFriend,
    searchUsers,
    syncError,
    toggleGroup,
  } = useGameHubState()

  const [genre, setGenre] = useState('Все')
  const [searchDrafts, setSearchDrafts] = useState<Record<SearchScope, string>>(emptySearchState)
  const [searchTerms, setSearchTerms] = useState<Record<SearchScope, string>>(emptySearchState)
  const [purchaseGame, setPurchaseGame] = useState<Game | null>(null)
  const [isPurchasePending, setIsPurchasePending] = useState(false)
  const [isFriendSearchOpen, setIsFriendSearchOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  const selectedGame = games.find((game) => game.id === selectedGameId) ?? games[0] ?? null
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null
  const recommendations =
    recommendationGames.length > 0
      ? recommendationGames.filter((game) => !librarySet.has(game.id))
      : games.filter((game) => !librarySet.has(game.id))
  const searchScope = searchScopeByView[activeView] ?? null
  const gameSearchQuery = searchTerms.games.trim().toLocaleLowerCase('ru-RU')
  const friendSearchQuery = searchTerms.friends.trim().toLocaleLowerCase('ru-RU')
  const groupSearchQuery = searchTerms.groups.trim().toLocaleLowerCase('ru-RU')
  const noticeText = isSyncing
    ? 'Синхронизируем данные с сервером...'
    : syncError
      ? `Последняя синхронизация не выполнена: ${syncError}`
      : notice
  const profileGuestView = activeView === 'profile' && !authUser
  const workspaceError = !isSyncing && syncError ? buildWorkspaceError(syncError) : null
  const isAwaitingSelectedEntity =
    (activeView === 'game' && !selectedGame && (isSyncing || games.length === 0)) ||
    (activeView === 'group' && !selectedGroup && (isSyncing || groups.length === 0))
  const workspaceLoading = !workspaceError && (isAwaitingSelectedEntity || (isSyncing && games.length === 0))
  const topbarNotice = profileGuestView || workspaceError ? '' : noticeText

  useEffect(() => {
    setIsFriendSearchOpen(false)
    setIsCreateGroupOpen(false)
    setPurchaseGame(null)
    setIsPurchasePending(false)
  }, [activeView])

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const genreMatches = genre === 'Все' || game.genre === genre
      const queryMatches =
        gameSearchQuery.length === 0 ||
        [game.title, game.genre, game.mood, game.summary, ...game.tags]
          .join(' ')
          .toLocaleLowerCase('ru-RU')
          .includes(gameSearchQuery)

      return genreMatches && queryMatches
    })
  }, [games, genre, gameSearchQuery])

  const filteredLibraryGames = useMemo(
    () =>
      libraryGames.filter((game) =>
        gameSearchQuery.length === 0
          ? true
          : [game.title, game.genre, game.mood, game.summary, ...game.tags]
              .join(' ')
              .toLocaleLowerCase('ru-RU')
              .includes(gameSearchQuery),
      ),
    [libraryGames, gameSearchQuery],
  )

  const filteredRecommendationGames = useMemo(
    () =>
      recommendations.filter((game) =>
        gameSearchQuery.length === 0
          ? true
          : [game.title, game.genre, game.mood, game.summary, ...game.tags]
              .join(' ')
              .toLocaleLowerCase('ru-RU')
              .includes(gameSearchQuery),
      ),
    [gameSearchQuery, recommendations],
  )

  const filteredFriends = useMemo(
    () =>
      friends.filter((friend) => {
        if (friendSearchQuery.length === 0) {
          return true
        }

        return [friend.name, friend.status, friend.game, String(friend.level)]
          .join(' ')
          .toLocaleLowerCase('ru-RU')
          .includes(friendSearchQuery)
      }),
    [friendSearchQuery, friends],
  )

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) => {
        if (groupSearchQuery.length === 0) {
          return true
        }

        return [group.title, group.description, group.topic, group.rules.join(' '), group.members]
          .join(' ')
          .toLocaleLowerCase('ru-RU')
          .includes(groupSearchQuery)
      }),
    [groupSearchQuery, groups],
  )

  const searchConfig = searchScope
    ? {
        value: searchDrafts[searchScope],
        placeholder: searchPlaceholderByScope[searchScope],
        onChange: (value: string) => {
          setSearchDrafts((current) => ({ ...current, [searchScope]: value }))
        },
        onSubmit: () => {
          setSearchTerms((current) => ({
            ...current,
            [searchScope]: searchDrafts[searchScope],
          }))
        },
      }
    : undefined

  const openGame = (game: Game) => navigate('game', game.id)
  const openGroup = (groupId: string) => navigate('group', groupId)
  const openFriendSearch = () => setIsFriendSearchOpen(true)
  const openCreateGroup = () => setIsCreateGroupOpen(true)
  const requestPurchase = (game: Game) => {
    if (!authUser) {
      navigate('auth')
      return
    }

    setPurchaseGame(game)
  }
  const confirmPurchase = async () => {
    if (!purchaseGame) {
      return
    }

    setIsPurchasePending(true)
    await addToLibrary(purchaseGame)
    setIsPurchasePending(false)
    setPurchaseGame(null)
  }

  const createGroupFromModal = async (title: string, description: string) => {
    const group = await createGroup(title, description)
    setIsCreateGroupOpen(false)
    navigate('group', group.id)
  }

  const page = (() => {
    switch (activeView) {
      case 'store':
        return (
          <StorePage
            activeGenre={genre}
            isAuthenticated={Boolean(authUser)}
            games={filteredGames}
            genres={genres}
            librarySet={librarySet}
            onAdd={requestPurchase}
            onGenreChange={setGenre}
            onOpen={openGame}
          />
        )
      case 'game':
        if (!selectedGame) {
          return (
            <section className="empty-state">
              <h2>Игра не найдена</h2>
              <p>Карточка станет доступна после загрузки каталога или при корректном адресе.</p>
            </section>
          )
        }

        return (
          <GamePage
            game={selectedGame}
            games={games}
            inLibrary={librarySet.has(selectedGame.id)}
            isAuthenticated={Boolean(authUser)}
            backView={selectedBackView}
            onAdd={requestPurchase}
            onBack={() => navigate(selectedBackView)}
            onOpen={openGame}
          />
        )
      case 'library':
        return (
          <LibraryPage
            games={filteredLibraryGames}
            isAuthenticated={Boolean(authUser)}
            onOpen={openGame}
            searchQuery={searchTerms.games}
          />
        )
      case 'recommendations':
        return (
          <RecommendationsPage
            isAuthenticated={Boolean(authUser)}
            games={filteredRecommendationGames}
            onAdd={requestPurchase}
            onOpen={openGame}
            searchQuery={searchTerms.games}
          />
        )
      case 'groups':
        return (
          <GroupsPage
            groups={filteredGroups}
            joinedGroups={joinedGroups}
            isAuthenticated={Boolean(authUser)}
            currentUserId={authUser?.id}
            onOpenGroup={(group) => openGroup(group.id)}
            onToggleGroup={toggleGroup}
            onOpenCreateGroup={openCreateGroup}
            searchQuery={searchTerms.groups}
          />
        )
      case 'group':
        if (!selectedGroup) {
          return (
            <section className="empty-state">
              <h2>Группа не найдена</h2>
              <p>Страница группы станет доступна после загрузки списка групп или при корректном адресе.</p>
            </section>
          )
        }

        return (
          <GroupPage
            currentUserId={authUser?.id}
            group={selectedGroup}
            onBack={() => navigate('groups')}
          />
        )
      case 'friends':
        return (
          <FriendsPage
            friends={filteredFriends}
            incomingRequests={incomingFriendRequests}
            isAuthenticated={Boolean(authUser)}
            onAcceptRequest={acceptFriendRequest}
            onOpenSearch={openFriendSearch}
            outgoingRequests={outgoingFriendRequests}
            searchQuery={searchTerms.friends}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            onCreatePost={createProfilePost}
          />
        )
      case 'auth':
        return (
          <AuthPage
            user={authUser}
            isChecking={isAuthChecking}
            onLogin={login}
            onLogout={logout}
            onOpenProfile={() => navigate('profile')}
            onRegister={register}
            onSuccess={() => navigate('home')}
          />
        )
      case 'home':
      default:
        return (
          <HomePage
            isAuthenticated={Boolean(authUser)}
            friendsCount={friends.length}
            games={games}
            libraryGames={libraryGames}
            onAdd={requestPurchase}
            onOpen={openGame}
          />
        )
    }
  })()

  return (
    <div
      className="app-shell"
      style={{ '--gamehub-bg': `url(${gamehubBackground})` } as CSSProperties}
    >
      <Sidebar
        activeView={activeView}
        authUser={authUser}
        onAuth={() => navigate('auth')}
        onLogout={logout}
        onNavigate={navigate}
      />
      <main className="workspace">
        <Topbar
          activeView={activeView}
          notice={topbarNotice}
          search={workspaceError ? undefined : searchConfig}
          headerOverride={
            workspaceError
              ? {
                  eyebrow: 'Ошибка',
                  title: 'Сбой подключения',
                }
              : undefined
          }
        />
        {workspaceError ? (
          <WorkspaceError
            code={workspaceError.code}
            title={workspaceError.title}
            message={workspaceError.message}
            actionLabel={workspaceError.actionLabel}
            onAction={() => {
              if (workspaceError.action === 'auth') {
                navigate('auth')
                return
              }

              if (workspaceError.action === 'home') {
                navigate('home')
                return
              }

              window.location.reload()
            }}
          />
        ) : workspaceLoading ? (
          <WorkspaceLoader />
        ) : (
          <Suspense fallback={<WorkspaceLoader />}>{page}</Suspense>
        )}
      </main>
      {purchaseGame && (
        <Suspense fallback={null}>
          <PurchaseModal
            game={purchaseGame}
            isPending={isPurchasePending}
            onCancel={() => setPurchaseGame(null)}
            onConfirm={confirmPurchase}
          />
        </Suspense>
      )}
      {isFriendSearchOpen && authUser && (
        <Suspense fallback={null}>
          <FriendSearchModal
            onAcceptFriend={acceptFriendRequest}
            onClose={() => setIsFriendSearchOpen(false)}
            onRequestFriend={requestFriend}
            onSearchUsers={searchUsers}
          />
        </Suspense>
      )}
      {isCreateGroupOpen && authUser && (
        <Suspense fallback={null}>
          <CreateGroupModal
            onClose={() => setIsCreateGroupOpen(false)}
            onCreateGroup={createGroupFromModal}
          />
        </Suspense>
      )}
    </div>
  )
}

export default App
