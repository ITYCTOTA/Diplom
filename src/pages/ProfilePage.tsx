import { useState, type FormEvent } from 'react'
import { Metric, SectionTitle } from '../components/ui'
import type { UserProfile } from '../types'

type ProfilePageProps = {
  profile: UserProfile | null
  onCreatePost: (text: string) => Promise<unknown>
}

function formatPostTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Только что'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function ProfilePage({ profile, onCreatePost }: ProfilePageProps) {
  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!profile) {
    return (
      <div className="view-stack">
        <section className="empty-state">
          <div>
            <h2>Войдите в аккаунт</h2>
            <p>Профиль, личные записи и игровая активность доступны только после авторизации.</p>
          </div>
        </section>
      </div>
    )
  }

  const heat = Array.from({ length: 35 }, (_, index) => (index * 17) % 5)
  const createdYear = new Date(profile.createdAt).getFullYear()
  const monthlyHours = Math.round(profile.stats.totalMinutes / 60)
  const visiblePosts = profile.posts.slice(0, 6)
  const userName = profile.nickname

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = draft.trim()

    if (!text || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onCreatePost(text)
      setDraft('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось опубликовать запись')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="view-stack">
      <section className="profile-grid">
        <article className="profile-card panel">
          <div className="profile-avatar">{userName.slice(0, 1)}</div>
          <div>
            <span className="eyebrow">{`Игрок с ${createdYear}`}</span>
            <h2>{userName}</h2>
            <p>{profile.bio ?? 'Описание профиля не указано.'}</p>
          </div>
        </article>
        <article className="profile-stats panel">
          <Metric value={String(profile.stats.libraryCount)} label="игр" />
          <Metric value={`${monthlyHours} ч`} label="в активности" />
        </article>
      </section>

      <section className="panel profile-feed">
        <SectionTitle
          title="Лента"
          description="Личные публикации без лайков и комментариев"
          meta="Личная"
        />

        <form className="profile-post-form" onSubmit={handleSubmit}>
          <label>
            Новая запись
            <textarea
              maxLength={500}
              placeholder="Короткая заметка о текущей игре, впечатлении или планах."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          {submitError && <p className="auth-error">{submitError}</p>}
          <div className="button-row compact">
            <button
              className="primary-button"
              disabled={isSubmitting || draft.trim().length === 0}
              type="submit"
            >
              {isSubmitting ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>
        </form>

        {visiblePosts.length > 0 ? (
          <div className="profile-post-list">
            {visiblePosts.map((post) => (
              <article className="profile-post" key={post.id}>
                <span className="post-avatar" aria-hidden="true">
                  {userName.slice(0, 1)}
                </span>
                <div>
                  <div className="profile-post-meta">
                    <strong>{userName}</strong>
                    <span>{formatPostTime(post.createdAt)}</span>
                  </div>
                  <p>{post.text}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <div>
              <h2>Лента пока пустая</h2>
              <p>Добавь первую личную запись, чтобы она появилась здесь.</p>
            </div>
          </div>
        )}
      </section>

      <section className="panel">
        <SectionTitle title="Активность" meta="5 недель" />
        <div className="heatmap" aria-label="Игровая активность">
          {heat.map((level, index) => (
            <span key={`${index}-${level}`} data-level={level} />
          ))}
        </div>
      </section>
    </div>
  )
}
