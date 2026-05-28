import { GameArt } from '../components/GameArt'
import { TagRow } from '../components/ui'
import { priceLabel } from '../services/format'
import type { Game } from '../types'

type RecommendationsPageProps = {
  isAuthenticated: boolean
  games: Game[]
  searchQuery: string
  onAdd: (game: Game) => void
  onOpen: (game: Game) => void
}

export function RecommendationsPage({
  isAuthenticated,
  games,
  searchQuery,
  onAdd,
  onOpen,
}: RecommendationsPageProps) {
  if (games.length === 0) {
    return (
      <section className="empty-state">
        <div>
          <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Рекомендации пока пусты'}</h2>
          <p>
            {searchQuery.trim().length > 0
              ? 'Попробуйте другой запрос в рекомендациях.'
              : 'Когда система подберёт игры, они появятся здесь.'}
          </p>
        </div>
      </section>
    )
  }

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
            <button
              type="button"
              className="primary-button"
              disabled={!isAuthenticated}
              onClick={() => onAdd(game)}
            >
              Купить
            </button>
            <button type="button" className="ghost-button" onClick={() => onOpen(game)}>
              Подробнее
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
