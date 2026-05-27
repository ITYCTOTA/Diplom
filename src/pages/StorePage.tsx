import { GameCard } from '../components/GameCard'
import { SectionTitle } from '../components/ui'
import type { Game } from '../types'

type StorePageProps = {
  activeGenre: string
  games: Game[]
  genres: string[]
  librarySet: Set<string>
  wishlistSet: Set<string>
  onAdd: (game: Game) => void
  onGenreChange: (genre: string) => void
  onOpen: (game: Game) => void
  onWish: (game: Game) => void
}

export function StorePage({
  activeGenre,
  games,
  genres,
  librarySet,
  wishlistSet,
  onAdd,
  onGenreChange,
  onOpen,
  onWish,
}: StorePageProps) {
  return (
    <div className="view-stack">
      <section className="panel filters-panel">
        <SectionTitle title="Фильтры" meta={`${games.length} игр найдено`} />
        <div className="chip-row">
          {genres.map((item) => (
            <button
              key={item}
              type="button"
              className={item === activeGenre ? 'filter-chip active' : 'filter-chip'}
              onClick={() => onGenreChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {games.length > 0 ? (
        <section className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              inLibrary={librarySet.has(game.id)}
              isWishlisted={wishlistSet.has(game.id)}
              onAdd={onAdd}
              onOpen={onOpen}
              onWish={onWish}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Измените запрос или выберите другой жанр.</p>
        </section>
      )}
    </div>
  )
}
