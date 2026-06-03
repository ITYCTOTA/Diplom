import { GameCard } from '../components/GameCard'
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
    <section className="game-grid">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          artPriority={index < 4 ? 'high' : 'auto'}
          game={game}
          inLibrary={false}
          isAuthenticated={isAuthenticated}
          onAdd={onAdd}
          onOpen={onOpen}
        />
      ))}
    </section>
  )
}
