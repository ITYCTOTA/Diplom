import { GameArt } from '../components/GameArt'
import { GameCard } from '../components/GameCard'
import { Metric, SectionTitle, TagRow } from '../components/ui'
import { gameVars } from '../services/format'
import type { Game } from '../types'

type HomePageProps = {
  isAuthenticated: boolean
  friendsCount: number
  games: Game[]
  libraryGames: Game[]
  onAdd: (game: Game) => void
  onOpen: (game: Game) => void
}

export function HomePage({
  isAuthenticated,
  friendsCount,
  games,
  libraryGames,
  onAdd,
  onOpen,
}: HomePageProps) {
  const heroGame = games.find((game) => game.id === 'starfall') ?? games[0]

  if (!heroGame) {
    return (
      <section className="empty-state">
        <h2>Каталог загружается</h2>
        <p>Проверьте, что API доступен на http://localhost:4000/api.</p>
      </section>
    )
  }

  return (
    <div className="view-stack">
      <section className="hero-grid">
        <article className="hero-card" style={gameVars(heroGame)}>
          <div className="hero-copy">
            <span>Сезон уже доступен</span>
            <h2>{heroGame.title}</h2>
            <p>{heroGame.summary}</p>
            <TagRow tags={heroGame.tags} />
            <div className="button-row">
              <button type="button" className="primary-button" onClick={() => onOpen(heroGame)}>
                Продолжить
              </button>
            </div>
          </div>
          <GameArt game={heroGame} size="large" />
        </article>

        <section className="panel">
          {isAuthenticated ? (
            <>
              <SectionTitle title="Недавно играли" meta={`${libraryGames.length} в библиотеке`} />
              {libraryGames.length > 0 ? (
                <div className="recent-list">
                  {libraryGames.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      className="recent-item"
                      onClick={() => onOpen(game)}
                    >
                      <GameArt game={game} size="small" />
                      <span>
                        <strong>{game.title}</strong>
                        <small>{game.activity}</small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact">
                  <div>
                    <h2>Библиотека пуста</h2>
                    <p>Купленные игры появятся здесь после подтверждения оплаты.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state compact">
              <div>
                <h2>Войдите в аккаунт</h2>
                <p>Недавние игры и личная активность появятся после авторизации.</p>
              </div>
            </div>
          )}
        </section>
      </section>

      {isAuthenticated ? (
        <section className="metrics-grid" aria-label="Сводка">
          <Metric value={String(libraryGames.length)} label="игр в библиотеке" />
          <Metric value={String(friendsCount)} label="друга в сети" />
          <Metric value={String(games.length)} label="игр в каталоге" />
        </section>
      ) : null}

      <section>
        <SectionTitle
          title="Рекомендации на вечер"
          description="Короткие сессии, скидки и игры, которые обсуждают друзья."
        />
        <div className="game-grid">
          {games
            .filter((game) => game.id !== heroGame.id)
            .slice(0, 4)
            .map((game) => (
              <GameCard
                key={game.id}
                game={game}
                inLibrary={libraryGames.some((item) => item.id === game.id)}
                isAuthenticated={isAuthenticated}
                onAdd={onAdd}
                onOpen={onOpen}
              />
            ))}
        </div>
      </section>
    </div>
  )
}
