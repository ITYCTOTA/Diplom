import { GameArt } from '../components/GameArt'
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
              Подробнее
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
