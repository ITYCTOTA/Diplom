import { useEffect, useState } from 'react'
import { GameArt } from '../components/GameArt'
import { Fact, Post, SectionTitle, TagRow } from '../components/ui'
import { gameVars, priceLabel } from '../services/format'
import { fetchGameReviews, getApiErrorMessage } from '../services/gameHubApi'
import type { Game, Review } from '../types'

type GamePageProps = {
  game: Game
  games: Game[]
  inLibrary: boolean
  isWishlisted: boolean
  onAdd: (game: Game) => void
  onBack: () => void
  onOpen: (game: Game) => void
  onWish: (game: Game) => void
}

export function GamePage({
  game,
  games,
  inLibrary,
  isWishlisted,
  onAdd,
  onBack,
  onOpen,
  onWish,
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
        Назад в магазин
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
                disabled={inLibrary}
                onClick={() => onAdd(game)}
              >
                {inLibrary ? 'В библиотеке' : `Купить за ${priceLabel(game.price)}`}
              </button>
              <button type="button" className="secondary-button" onClick={() => onWish(game)}>
                {isWishlisted ? 'Убрать из желаемого' : 'В желаемое'}
              </button>
            </div>
          </div>
        </article>

        <aside className="panel facts-panel">
          <Fact label="Оценка" value={game.rating.toFixed(1)} />
          <Fact label="Жанр" value={game.genre} />
          <Fact label="Настроение" value={game.mood} />
          <Fact label="Время" value={`${game.hours} ч`} />
        </aside>
      </section>

      <section className="two-column">
        <article className="panel">
          <SectionTitle
            title="Отзывы"
            meta={reviewsError ? 'локально' : `${reviews.length} публикаций`}
          />
          <div className="post-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Post
                  key={review.id}
                  author={`${review.author.nickname} · ${review.rating}/5`}
                  text={review.text}
                />
              ))
            ) : (
              <>
                <Post author="Nika" text="Сильная атмосфера и понятный темп, без лишнего гринда." />
                <Post author="Oleg" text="Лучше всего играть вечером: миссии короткие, но цепляют." />
              </>
            )}
          </div>
        </article>
        <article className="panel">
          <SectionTitle title="Похожие игры" meta={String(similarGames.length)} />
          <div className="mini-grid">
            {similarGames.map((item) => (
              <button key={item.id} type="button" className="mini-game" onClick={() => onOpen(item)}>
                <GameArt game={item} size="small" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.reason}</small>
                </span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
