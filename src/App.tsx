import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import gamehubBackground from './assets/gamehub-bg.png'
import { CreateGroupModal } from './components/CreateGroupModal'
import { FriendSearchModal } from './components/FriendSearchModal'
import { PurchaseModal } from './components/PurchaseModal'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { useGameHubRoute } from './hooks/useGameHubRoute'
import { useGameHubState } from './hooks/useGameHubState'
import { AuthPage } from './pages/AuthPage'
import { FriendsPage } from './pages/FriendsPage'
import { GamePage } from './pages/GamePage'
import { GroupPage } from './pages/GroupPage'
import { GroupsPage } from './pages/GroupsPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ProfilePage } from './pages/ProfilePage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { StorePage } from './pages/StorePage'
import type { Game, ViewId } from './types'
import './styles/App.css'

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

function App() {
  const { activeView, selectedBackView, selectedGameId, selectedGroupId, navigate } = useGameHubRoute()
  const {
    addToLibrary,
    authUser,
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

  const selectedGame = games.find((game) => game.id === selectedGameId) ?? games[0]
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0]
  const recommendations =
    recommendationGames.length > 0
      ? recommendationGames
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
            onOpenGroup={(group) => openGroup(group.id)}
            onToggleGroup={toggleGroup}
            onOpenCreateGroup={openCreateGroup}
            searchQuery={searchTerms.groups}
          />
        )
      case 'group':
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
            isAuthenticated={Boolean(authUser)}
            onOpenSearch={openFriendSearch}
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
        <Topbar activeView={activeView} notice={profileGuestView ? '' : noticeText} search={searchConfig} />
        {page}
      </main>
      {purchaseGame && (
        <PurchaseModal
          game={purchaseGame}
          isPending={isPurchasePending}
          onCancel={() => setPurchaseGame(null)}
          onConfirm={confirmPurchase}
        />
      )}
      {isFriendSearchOpen && authUser && (
        <FriendSearchModal
          onClose={() => setIsFriendSearchOpen(false)}
          onRequestFriend={requestFriend}
          onSearchUsers={searchUsers}
        />
      )}
      {isCreateGroupOpen && authUser && (
        <CreateGroupModal
          onClose={() => setIsCreateGroupOpen(false)}
          onCreateGroup={createGroupFromModal}
        />
      )}
    </div>
  )
}

export default App
