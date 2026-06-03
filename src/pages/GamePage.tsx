import { useEffect, useState } from 'react'
import { GameArt } from '../components/GameArt'
import { Fact, Post, SectionTitle, TagRow } from '../components/ui'
import { gameVars, priceLabel } from '../services/format'
import { getGameBackLabel } from '../services/navigation'
import { fetchGameReviews, getApiErrorMessage } from '../services/gameHubApi'
import type { Game, Review, ViewId } from '../types'

type GamePageProps = {
  game: Game
  games: Game[]
  inLibrary: boolean
  isAuthenticated: boolean
  backView: ViewId
  onAdd: (game: Game) => void
  onBack: () => void
  onOpen: (game: Game) => void
}

export function GamePage({
  game,
  games,
  inLibrary,
  isAuthenticated,
  backView,
  onAdd,
  onBack,
  onOpen,
}: GamePageProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsError, setReviewsError] = useState('')
  const similarGames = games
    .filter((item) => item.id !== game.id && item.genre === game.genre)
    .slice(0, 3)

  useEffect(() => {
    let isActive = true

    async function loadReviews() {
      setReviewsError('')

      try {
        const apiReviews = await fetchGameReviews(game.id)

        if (isActive) {
          setReviews(apiReviews)
        }
      } catch (error) {
        if (isActive) {
          setReviews([])
          setReviewsError(getApiErrorMessage(error))
        }
      }
    }

    void loadReviews()

    return () => {
      isActive = false
    }
  }, [game.id])

  return (
    <div className="view-stack">
      <button type="button" className="inline-back" onClick={onBack}>
        {getGameBackLabel(backView)}
      </button>
      <section className="detail-layout">
        <article className="detail-hero panel" style={gameVars(game)}>
          <GameArt game={game} size="detail" />
          <div>
            <span className="eyebrow">{game.genre}</span>
            <h2>{game.title}</h2>
            <p>{game.summary}</p>
            <TagRow tags={game.tags} />
            <div className="button-row">
              <button
                type="button"
                className="primary-button"
                disabled={inLibrary || !isAuthenticated}
                onClick={() => onAdd(game)}
              >
                {inLibrary ? 'В библиотеке' : `Купить за ${priceLabel(game.price)}`}
              </button>
            </div>
          </div>
        </article>

        <aside className="panel facts-panel">
          <Fact label="Оценка" value={game.rating.toFixed(1)} />
          <Fact label="Жанр" value={game.genre} />
        </aside>
      </section>

      <section className="two-column">
        <article className="panel">
          <SectionTitle title="Отзывы" />
          <div className="post-list">
            {reviewsError ? (
              <div className="empty-state compact">
                <div>
                  <h2>Отзывы недоступны</h2>
                  <p>Проверьте соединение с сервером: {reviewsError}</p>
                </div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <Post
                  key={review.id}
                  author={`${review.author.nickname} · ${review.rating}/5`}
                  text={review.text}
                />
              ))
            ) : (
              <div className="empty-state compact">
                <div>
                  <h2>Отзывов пока нет</h2>
                  <p>Когда появятся реальные отзывы, они будут показаны здесь.</p>
                </div>
              </div>
            )}
          </div>
        </article>
        <article className="panel">
          <SectionTitle title="Похожие игры" />
          <div className="similar-game-list">
            {similarGames.map((item) => (
              <div key={item.id} className="similar-game-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.reason}</p>
                </div>
                <button type="button" className="secondary-button" onClick={() => onOpen(item)}>
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
