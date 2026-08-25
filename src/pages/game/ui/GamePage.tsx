import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { GameArt } from '@/entities/game'
import { Fact, Post, SectionTitle, TagRow } from '@/shared/ui'
import { gameVars, priceLabel } from '@/entities/game'
import { createGameReview, fetchGameReviews, getApiErrorMessage } from '@/shared/api'
import { getGameBackLabel } from '@/app/router'
import type { Game } from '@/entities/game'
import type { Review } from '@/entities/review'
import type { ViewId } from '@/app/router'

type GamePageProps = {
  authUserId?: string
  game: Game
  games: Game[]
  inLibrary: boolean
  isAuthenticated: boolean
  backView: ViewId
  onAdd: (game: Game) => void
  onBack: () => void
  onOpen: (game: Game) => void
  onRatingChange: (gameId: string, rating: number | null) => void
}

function getAverageRating(reviews: Review[]) {
  if (reviews.length === 0) {
    return null
  }

  return Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
}

export function GamePage({
  authUserId,
  game,
  games,
  inLibrary,
  isAuthenticated,
  backView,
  onAdd,
  onBack,
  onOpen,
  onRatingChange,
}: GamePageProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsError, setReviewsError] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSubmitError, setReviewSubmitError] = useState('')
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

  const similarGames = games
    .filter((item) => item.id !== game.id && item.genre === game.genre)
    .slice(0, 3)
  const displayedRating = getAverageRating(reviews)

  const currentUserReview = useMemo(
    () => reviews.find((review) => review.author.id === authUserId) ?? null,
    [authUserId, reviews],
  )

  useEffect(() => {
    let isActive = true

    async function loadReviews() {
      setReviewsError('')

      try {
        const apiReviews = await fetchGameReviews(game.id)

        if (!isActive) {
          return
        }

        setReviews(apiReviews)
        onRatingChange(game.id, getAverageRating(apiReviews))
        const ownReview = apiReviews.find((review) => review.author.id === authUserId)

        if (ownReview) {
          setReviewRating(ownReview.rating)
          setReviewText(ownReview.text)
        } else {
          setReviewRating(5)
          setReviewText('')
        }
      } catch (error) {
        if (!isActive) {
          return
        }

        setReviews([])
        setReviewsError(getApiErrorMessage(error))
      }
    }

    void loadReviews()

    return () => {
      isActive = false
    }
  }, [authUserId, game.id, onRatingChange])

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = reviewText.trim()

    if (!text || isReviewSubmitting) {
      return
    }

    setReviewSubmitError('')
    setIsReviewSubmitting(true)

    try {
      const review = await createGameReview(game.id, reviewRating, text)
      const nextReviews = [review, ...reviews.filter((item) => item.id !== review.id)]
      const nextRating = getAverageRating(nextReviews)

      setReviews(nextReviews)
      onRatingChange(game.id, nextRating)
      setReviewRating(review.rating)
      setReviewText(review.text)
    } catch (error) {
      setReviewSubmitError(getApiErrorMessage(error))
    } finally {
      setIsReviewSubmitting(false)
    }
  }

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
          <Fact label="Оценка" value={displayedRating === null ? 'Нет оценок' : displayedRating.toFixed(1)} />
          <Fact label="Жанр" value={game.genre} />
        </aside>
      </section>

      <section className="two-column">
        <article className="panel">
          <SectionTitle title="Отзывы" />

          {isAuthenticated ? (
            <form className="review-form" onSubmit={submitReview}>
              <div className="review-form-head">
                <label className="review-rating-field">
                  <span>Оценка</span>
                  <select
                    value={String(reviewRating)}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="review-text-field">
                <span>{currentUserReview ? 'Обновить отзыв' : 'Ваш отзыв'}</span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Коротко опишите впечатления от игры."
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                />
              </label>

              {reviewSubmitError ? <p className="auth-error">{reviewSubmitError}</p> : null}

              <div className="button-row compact">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isReviewSubmitting || reviewText.trim().length === 0}
                >
                  {isReviewSubmitting
                    ? 'Сохраняем...'
                    : currentUserReview
                      ? 'Обновить отзыв'
                      : 'Оставить отзыв'}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state compact">
              <div>
                <h2>Войдите в аккаунт</h2>
                <p>После авторизации можно оставить отзыв и поставить оценку игре.</p>
              </div>
            </div>
          )}

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
                  <p>Когда пользователи начнут делиться впечатлениями, они появятся здесь.</p>
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
