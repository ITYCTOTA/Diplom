import { GameArt } from '../components/GameArt'
import { GameCard } from '../components/GameCard'
import { Metric, SectionTitle, TagRow } from '../components/ui'
import { gameVars } from '../services/format'
import type { Game } from '../types'

type HomePageProps = {
  games: Game[]
  libraryGames: Game[]
  wishlistSet: Set<string>
  onAdd: (game: Game) => void
  onOpen: (game: Game) => void
  onWish: (game: Game) => void
}

export function HomePage({
  games,
  libraryGames,
  wishlistSet,
  onAdd,
  onOpen,
  onWish,
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
              <button type="button" className="secondary-button" onClick={() => onWish(heroGame)}>
                В желаемое
              </button>
            </div>
          </div>
          <GameArt game={heroGame} size="large" />
        </article>

        <section className="panel">
          <SectionTitle title="Недавно играли" meta={`${libraryGames.length} в библиотеке`} />
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
        </section>
      </section>

      <section className="metrics-grid" aria-label="Сводка">
        <Metric value={String(libraryGames.length)} label="игр в библиотеке" />
        <Metric value="4" label="друга в сети" />
        <Metric value={String(games.length)} label="игр в каталоге" />
      </section>

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
                isWishlisted={wishlistSet.has(game.id)}
                onAdd={onAdd}
                onOpen={onOpen}
                onWish={onWish}
              />
            ))}
        </div>
      </section>
    </div>
  )
}
