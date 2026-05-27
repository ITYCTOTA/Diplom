import { useMemo, useState, type CSSProperties } from 'react'
import gamehubBackground from './assets/gamehub-bg.png'
import { AuthModal } from './components/AuthModal'
import { PurchaseModal } from './components/PurchaseModal'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { useGameHubRoute } from './hooks/useGameHubRoute'
import { useGameHubState } from './hooks/useGameHubState'
import { FriendsPage } from './pages/FriendsPage'
import { GamePage } from './pages/GamePage'
import { GroupPage } from './pages/GroupPage'
import { GroupsPage } from './pages/GroupsPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ProfilePage } from './pages/ProfilePage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { StorePage } from './pages/StorePage'
import type { Game } from './types'
import './styles/App.css'

function App() {
  const { activeView, selectedGameId, selectedGroupId, navigate } = useGameHubRoute()
  const {
    addToLibrary,
    authUser,
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
    register,
    syncError,
    toggleGroup,
    toggleWishlist,
    wishlistGames,
    wishlistSet,
  } = useGameHubState()

  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('Все')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [purchaseGame, setPurchaseGame] = useState<Game | null>(null)
  const [isPurchasePending, setIsPurchasePending] = useState(false)

  const selectedGame = games.find((game) => game.id === selectedGameId) ?? games[0]
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0]
  const recommendations =
    recommendationGames.length > 0
      ? recommendationGames
      : games.filter((game) => !librarySet.has(game.id))
  const noticeText = isSyncing
    ? 'Синхронизируем данные с сервером...'
    : syncError
      ? `Последняя синхронизация не выполнена: ${syncError}`
      : notice

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU')

    return games.filter((game) => {
      const genreMatches = genre === 'Все' || game.genre === genre
      const queryMatches =
        normalizedQuery.length === 0 ||
        [game.title, game.genre, game.mood, game.summary, ...game.tags]
          .join(' ')
          .toLocaleLowerCase('ru-RU')
          .includes(normalizedQuery)

      return genreMatches && queryMatches
    })
  }, [games, genre, query])

  const openGame = (game: Game) => navigate('game', game.id)
  const openGroup = (groupId: string) => navigate('group', groupId)
  const requestPurchase = (game: Game) => setPurchaseGame(game)
  const confirmPurchase = async () => {
    if (!purchaseGame) {
      return
    }

    setIsPurchasePending(true)
    await addToLibrary(purchaseGame)
    setIsPurchasePending(false)
    setPurchaseGame(null)
  }

  const page = (() => {
    switch (activeView) {
      case 'store':
        return (
          <StorePage
            activeGenre={genre}
            games={filteredGames}
            genres={genres}
            librarySet={librarySet}
            wishlistSet={wishlistSet}
            onAdd={requestPurchase}
            onGenreChange={setGenre}
            onOpen={openGame}
            onWish={toggleWishlist}
          />
        )
      case 'game':
        return (
          <GamePage
            game={selectedGame}
            games={games}
            inLibrary={librarySet.has(selectedGame.id)}
            isWishlisted={wishlistSet.has(selectedGame.id)}
            onAdd={requestPurchase}
            onBack={() => navigate('store')}
            onOpen={openGame}
            onWish={toggleWishlist}
          />
        )
      case 'library':
        return <LibraryPage games={libraryGames} onOpen={openGame} />
      case 'recommendations':
        return (
          <RecommendationsPage
            games={recommendations}
            wishlistSet={wishlistSet}
            onAdd={requestPurchase}
            onOpen={openGame}
            onWish={toggleWishlist}
          />
        )
      case 'groups':
        return (
          <GroupsPage
            groups={groups}
            joinedGroups={joinedGroups}
            onOpenGroup={(group) => openGroup(group.id)}
            onToggleGroup={toggleGroup}
          />
        )
      case 'group':
        return (
          <GroupPage
            group={selectedGroup}
            games={games}
            isJoined={joinedGroups.includes(selectedGroup.id)}
            onBack={() => navigate('groups')}
            onOpenGame={openGame}
            onToggleGroup={toggleGroup}
          />
        )
      case 'friends':
        return <FriendsPage friends={friends} />
      case 'profile':
        return (
          <ProfilePage
            libraryCount={libraryGames.length}
            profile={profile}
            wishlistGames={wishlistGames}
            onOpen={openGame}
          />
        )
      case 'home':
      default:
        return (
          <HomePage
            games={games}
            libraryGames={libraryGames}
            wishlistSet={wishlistSet}
            onAdd={requestPurchase}
            onOpen={openGame}
            onWish={toggleWishlist}
          />
        )
    }
  })()

  return (
    <div
      className="app-shell"
      style={{ '--gamehub-bg': `url(${gamehubBackground})` } as CSSProperties}
    >
      <Sidebar activeView={activeView} onNavigate={navigate} />
      <main className="workspace">
        <Topbar
          activeView={activeView}
          notice={noticeText}
          query={query}
          onAuth={() => setIsAuthOpen(true)}
          onLogout={logout}
          onQuery={setQuery}
          userName={authUser?.nickname}
        />
        {page}
      </main>
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLogin={login}
          onRegister={register}
        />
      )}
      {purchaseGame && (
        <PurchaseModal
          game={purchaseGame}
          isPending={isPurchasePending}
          onCancel={() => setPurchaseGame(null)}
          onConfirm={confirmPurchase}
        />
      )}
    </div>
  )
}

export default App
