import { useEffect, useState, type FormEvent } from 'react'
import { SectionTitle } from '../components/ui'
import { createGroupPost, fetchGroup, getApiErrorMessage } from '../services/gameHubApi'
import { groupVars } from '../services/format'
import type { Group } from '../types'

type GroupPageProps = {
  currentUserId?: string
  group: Group
  onBack: () => void
}

export function GroupPage({ currentUserId, group, onBack }: GroupPageProps) {
  const [loadedGroup, setLoadedGroup] = useState<Group | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postText, setPostText] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeGroup = loadedGroup?.id === group.id ? loadedGroup : group
  const isCreator = Boolean(currentUserId && activeGroup.creator?.id === currentUserId)

  useEffect(() => {
    let isActive = true

    async function loadGroup() {
      try {
        const freshGroup = await fetchGroup(group.id)

        if (isActive) {
          setLoadedGroup(freshGroup)
          setError('')
        }
      } catch (loadError) {
        if (isActive) {
          setError(getApiErrorMessage(loadError))
        }
      }
    }

    void loadGroup()

    return () => {
      isActive = false
    }
  }, [group])

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const createdPost = await createGroupPost(activeGroup.id, postTitle, postText)
      setLoadedGroup((current) => {
        const baseGroup = current?.id === activeGroup.id ? current : activeGroup

        return {
          ...baseGroup,
          posts: [createdPost, ...baseGroup.posts],
        }
      })
      setPostTitle('')
      setPostText('')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="view-stack">
      <button type="button" className="inline-back" onClick={onBack}>
        Назад к группам
      </button>

      <section className="group-feed-layout">
        <article className="group-feed-header panel" style={groupVars(activeGroup)}>
          <span className="group-profile-cover" aria-hidden="true" />
          <div className="group-feed-title">
            <div className="group-avatar" aria-hidden="true">
              {activeGroup.title.slice(0, 1)}
            </div>
            <div>
              <span className="eyebrow">Игровое сообщество</span>
              <h2>{activeGroup.title}</h2>
              <p>{activeGroup.description}</p>
            </div>
          </div>
        </article>

        {isCreator && (
          <section className="panel">
            <SectionTitle title="Новый пост" />
            <form className="group-post-form" onSubmit={submitPost}>
              <label>
                <span>Заголовок</span>
                <input
                  required
                  value={postTitle}
                  placeholder="Тема публикации"
                  onChange={(event) => setPostTitle(event.target.value)}
                />
              </label>
              <label>
                <span>Текст</span>
                <textarea
                  required
                  value={postText}
                  placeholder="Напишите сообщение для участников группы"
                  rows={4}
                  onChange={(event) => setPostText(event.target.value)}
                />
              </label>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Публикуем...' : 'Опубликовать'}
              </button>
            </form>
          </section>
        )}

        <section className="panel">
          <SectionTitle title="Посты" meta={activeGroup.postsCount} />
          {error && <p className="auth-error">{error}</p>}
          <div className="post-list">
            {activeGroup.posts.length > 0 ? (
              activeGroup.posts.map((post) => (
                <article className="group-post" key={post.id}>
                  <div>
                    <span className="eyebrow">
                      {post.author} · {post.time}
                    </span>
                    <h3>{post.title}</h3>
                    <p>{post.text}</p>
                  </div>
                  <div className="group-post-meta">
                    <span>{post.likes} лайков</span>
                    <span>{post.comments} комментариев</span>
                  </div>
                  {post.commentList && post.commentList.length > 0 && (
                    <div className="group-comments">
                      {post.commentList.map((comment) => (
                        <article className="group-comment" key={comment.id}>
                          <span>
                            {comment.author} · {comment.time}
                          </span>
                          <p>{comment.text}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="empty-state compact">
                <h2>Постов пока нет</h2>
                <p>Публикации появятся здесь после создания.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  )
}
