import { GameArt } from '../components/GameArt'
import { TagRow } from '../components/ui'
import { priceLabel } from '../services/format'
import type { Game } from '../types'

type RecommendationsPageProps = {
  games: Game[]
  wishlistSet: Set<string>
  onAdd: (game: Game) => void
  onOpen: (game: Game) => void
  onWish: (game: Game) => void
}

export function RecommendationsPage({
  games,
  wishlistSet,
  onAdd,
  onOpen,
  onWish,
}: RecommendationsPageProps) {
  return (
    <div className="recommendation-list">
      {games.map((game) => (
        <article className="recommendation-row panel" key={game.id}>
          <GameArt game={game} size="medium" />
          <div>
            <span className="eyebrow">{game.discount ?? 'Подборка'}</span>
            <h2>{game.title}</h2>
            <p>{game.reason}</p>
            <TagRow tags={game.tags.slice(0, 3)} />
          </div>
          <div className="recommendation-actions">
            <strong>{game.discount ?? priceLabel(game.price)}</strong>
            <button type="button" className="primary-button" onClick={() => onAdd(game)}>
              Купить
            </button>
            <button type="button" className="secondary-button" onClick={() => onWish(game)}>
              {wishlistSet.has(game.id) ? 'В желаемом' : 'Запомнить'}
            </button>
            <button type="button" className="ghost-button" onClick={() => onOpen(game)}>
              Карточка
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
