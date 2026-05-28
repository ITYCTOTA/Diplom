import { GameCard } from '../components/GameCard'
import { SectionTitle } from '../components/ui'
import type { Game } from '../types'

type StorePageProps = {
  activeGenre: string
  isAuthenticated: boolean
  games: Game[]
  genres: string[]
  librarySet: Set<string>
  onAdd: (game: Game) => void
  onGenreChange: (genre: string) => void
  onOpen: (game: Game) => void
}

export function StorePage({
  activeGenre,
  isAuthenticated,
  games,
  genres,
  librarySet,
  onAdd,
  onGenreChange,
  onOpen,
}: StorePageProps) {
  return (
    <div className="view-stack">
      <section className="panel filters-panel">
        <SectionTitle title="Фильтры" meta={`${games.length} игр найдено`} />
        <label className="filter-select-field">
          <span>Жанр</span>
          <select
            className="filter-select"
            value={activeGenre}
            onChange={(event) => onGenreChange(event.target.value)}
          >
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {games.length > 0 ? (
        <section className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              inLibrary={librarySet.has(game.id)}
              isAuthenticated={isAuthenticated}
              onAdd={onAdd}
              onOpen={onOpen}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Измените фильтр или выберите другой жанр.</p>
        </section>
      )}
    </div>
  )
}
