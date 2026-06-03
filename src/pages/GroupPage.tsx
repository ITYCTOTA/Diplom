import { useEffect, useState, type FormEvent } from 'react'
import { SectionTitle } from '../components/ui'
import {
  createGroupComment,
  createGroupPost,
  fetchGroup,
  getApiErrorMessage,
  toggleGroupCommentLike,
  toggleGroupPostLike,
} from '../services/gameHubApi'
import { groupVars } from '../services/format'
import type { Group } from '../types'

type GroupPageProps = {
  currentUserId?: string
  group: Group
  onBack: () => void
}

function roleLabel(role: string) {
  switch (role) {
    case 'creator':
      return 'Создатель'
    case 'admin':
      return 'Администратор'
    case 'moderator':
      return 'Модератор'
    default:
      return 'Подписчик'
  }
}

function joinedLabel(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function GroupPage({ currentUserId, group, onBack }: GroupPageProps) {
  const [loadedGroup, setLoadedGroup] = useState<Group | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postText, setPostText] = useState('')
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingCommentPostId, setPendingCommentPostId] = useState<string | null>(null)
  const [pendingPostLikeId, setPendingPostLikeId] = useState<string | null>(null)
  const [pendingCommentLikeId, setPendingCommentLikeId] = useState<string | null>(null)
  const activeGroup = loadedGroup?.id === group.id ? loadedGroup : group
  const isCreator = Boolean(currentUserId && activeGroup.creator?.id === currentUserId)
  const canInteract = Boolean(currentUserId)

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

  const reloadGroup = async () => {
    const freshGroup = await fetchGroup(activeGroup.id)
    setLoadedGroup(freshGroup)
  }

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await createGroupPost(activeGroup.id, postTitle, postText)
      await reloadGroup()
      setPostTitle('')
      setPostText('')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitComment = async (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault()

    const text = commentDrafts[postId]?.trim() ?? ''

    if (!text) {
      return
    }

    setError('')
    setPendingCommentPostId(postId)

    try {
      await createGroupComment(postId, text)
      await reloadGroup()
      setCommentDrafts((current) => ({ ...current, [postId]: '' }))
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setPendingCommentPostId(null)
    }
  }

  const handlePostLike = async (postId: string) => {
    if (!canInteract) {
      return
    }

    setError('')
    setPendingPostLikeId(postId)

    try {
      const result = await toggleGroupPostLike(postId)
      setLoadedGroup((current) => {
        const baseGroup = current?.id === activeGroup.id ? current : activeGroup

        return {
          ...baseGroup,
          posts: baseGroup.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: result.likesCount,
                  likedByMe: result.liked,
                }
              : post,
          ),
        }
      })
    } catch (likeError) {
      setError(getApiErrorMessage(likeError))
    } finally {
      setPendingPostLikeId(null)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!canInteract) {
      return
    }

    setError('')
    setPendingCommentLikeId(commentId)

    try {
      const result = await toggleGroupCommentLike(commentId)
      setLoadedGroup((current) => {
        const baseGroup = current?.id === activeGroup.id ? current : activeGroup

        return {
          ...baseGroup,
          posts: baseGroup.posts.map((post) => ({
            ...post,
            commentList: post.commentList?.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likes: result.likesCount,
                    likedByMe: result.liked,
                  }
                : comment,
            ),
          })),
        }
      })
    } catch (likeError) {
      setError(getApiErrorMessage(likeError))
    } finally {
      setPendingCommentLikeId(null)
    }
  }

  return (
    <div className="view-stack">
      <button type="button" className="inline-back" onClick={onBack}>
        Назад к группам
      </button>

      <section className="group-page-grid">
        <div className="group-feed-layout">
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

          {isCreator ? (
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
          ) : null}

          <section className="panel">
            <SectionTitle title="Посты" />
            {error ? <p className="auth-error">{error}</p> : null}
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

                    <div className="group-post-actions">
                      <button
                        type="button"
                        className={post.likedByMe ? 'secondary-button group-action-button active' : 'ghost-button group-action-button'}
                        disabled={!canInteract || pendingPostLikeId === post.id}
                        onClick={() => void handlePostLike(post.id)}
                      >
                        {post.likedByMe ? 'Убрать лайк' : 'Лайк'} · {post.likes}
                      </button>
                      <span className="group-post-count">{post.comments} комментариев</span>
                    </div>

                    {post.commentList?.length ? (
                      <div className="group-comments">
                        {post.commentList.map((comment) => (
                          <article className="group-comment" key={comment.id}>
                            <span>
                              {comment.author} · {comment.time}
                            </span>
                            <p>{comment.text}</p>
                            <div className="group-comment-actions">
                              <button
                                type="button"
                                className={comment.likedByMe ? 'secondary-button group-action-button active' : 'ghost-button group-action-button'}
                                disabled={!canInteract || pendingCommentLikeId === comment.id}
                                onClick={() => void handleCommentLike(comment.id)}
                              >
                                {comment.likedByMe ? 'Убрать лайк' : 'Лайк'} · {comment.likes}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {canInteract ? (
                      <form className="group-comment-form" onSubmit={(event) => void submitComment(event, post.id)}>
                        <label>
                          <span>Комментарий</span>
                          <textarea
                            rows={3}
                            value={commentDrafts[post.id] ?? ''}
                            placeholder="Напишите комментарий к посту"
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [post.id]: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className="group-comment-form-actions">
                          <button
                            type="submit"
                            className="primary-button"
                            disabled={pendingCommentPostId === post.id || !(commentDrafts[post.id]?.trim())}
                          >
                            {pendingCommentPostId === post.id ? 'Отправляем...' : 'Оставить комментарий'}
                          </button>
                        </div>
                      </form>
                    ) : null}
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
        </div>

        <aside className="group-members-panel panel">
          <SectionTitle title="Подписчики" />
          {activeGroup.memberList.length > 0 ? (
            <div className="group-member-list">
              {activeGroup.memberList.map((member) => (
                <article className="group-member-card" key={member.id}>
                  <div className="group-member-avatar" aria-hidden="true">
                    {member.nickname.slice(0, 1)}
                  </div>
                  <div className="group-member-copy">
                    <strong>{member.nickname}</strong>
                    <p>{roleLabel(member.role)}</p>
                    {joinedLabel(member.joinedAt) ? <small>{joinedLabel(member.joinedAt)}</small> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <div>
                <h2>Подписчиков пока нет</h2>
                <p>Список участников появится после вступления в группу.</p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
