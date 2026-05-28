import { gameVars, priceLabel } from '../services/format'
import type { Game } from '../types'
import { GameArt } from './GameArt'
import { TagRow } from './ui'

type GameCardProps = {
  game: Game
  inLibrary: boolean
  isAuthenticated: boolean
  onAdd: (game: Game) => void
  onOpen: (game: Game) => void
}

export function GameCard({
  game,
  inLibrary,
  isAuthenticated,
  onAdd,
  onOpen,
}: GameCardProps) {
  return (
    <article className="game-card" style={gameVars(game)}>
      <button type="button" className="game-open" onClick={() => onOpen(game)}>
        <GameArt game={game} size="card" />
      </button>
      <div className="game-card-body">
        <div className="card-head">
          <span>{game.genre}</span>
          <strong>{game.discount ?? priceLabel(game.price)}</strong>
        </div>
        <h3>{game.title}</h3>
        <p className="game-card-summary">{game.summary}</p>
        <TagRow tags={game.tags.slice(0, 2)} />
        <div className="card-actions">
          <button type="button" className="secondary-button" onClick={() => onOpen(game)}>
            Подробнее
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={inLibrary || !isAuthenticated}
            onClick={() => onAdd(game)}
          >
            {inLibrary ? 'В библиотеке' : 'Купить'}
          </button>
        </div>
      </div>
    </article>
  )
}
