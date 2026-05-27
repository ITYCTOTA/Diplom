import { GameArt } from '../components/GameArt'
import type { Game } from '../types'

export function LibraryPage({
  games,
  onOpen,
}: {
  games: Game[]
  onOpen: (game: Game) => void
}) {
  return (
    <div className="library-list">
      {games.map((game) => (
        <article className="library-item panel" key={game.id}>
          <GameArt game={game} size="medium" />
          <div>
            <span className="eyebrow">{game.genre}</span>
            <h2>{game.title}</h2>
            <p>{game.activity}</p>
          </div>
          <div className="library-action">
            <button type="button" className="secondary-button" onClick={() => onOpen(game)}>
              Открыть
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
