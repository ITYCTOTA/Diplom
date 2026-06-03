import { GameCard } from '../components/GameCard'
import type { Game } from '../types'

export function LibraryPage({
  games,
  isAuthenticated,
  searchQuery,
  onOpen,
}: {
  games: Game[]
  isAuthenticated: boolean
  searchQuery: string
  onOpen: (game: Game) => void
}) {
  if (!isAuthenticated) {
    return (
      <section className="empty-state">
        <div>
          <h2>Войдите в аккаунт</h2>
          <p>Библиотека появляется после авторизации и загрузки ваших покупок.</p>
        </div>
      </section>
    )
  }

  if (games.length === 0) {
    return (
      <section className="empty-state">
        <div>
          <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Библиотека пуста'}</h2>
          <p>
            {searchQuery.trim().length > 0
              ? 'Попробуйте другой запрос в библиотеке.'
              : 'Купленные игры появятся здесь после подтверждения оплаты.'}
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
          inLibrary
          isAuthenticated={isAuthenticated}
          onAdd={() => undefined}
          onOpen={onOpen}
          showPurchaseAction={false}
        />
      ))}
    </section>
  )
}
