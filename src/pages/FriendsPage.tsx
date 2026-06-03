import { SectionTitle } from '../components/ui'
import type { Friend, FriendRequest } from '../types'

type FriendsPageProps = {
  friends: Friend[]
  incomingRequests: FriendRequest[]
  outgoingRequests: FriendRequest[]
  isAuthenticated: boolean
  searchQuery: string
  onOpenSearch: () => void
  onAcceptRequest: (requestId: string) => Promise<void>
}

function formatRequestTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function FriendsPage({
  friends,
  incomingRequests,
  outgoingRequests,
  isAuthenticated,
  searchQuery,
  onOpenSearch,
  onAcceptRequest,
}: FriendsPageProps) {
  if (!isAuthenticated) {
    return (
      <section className="empty-state">
        <div>
          <h2>Войдите в аккаунт</h2>
          <p>Список друзей и заявки доступны после авторизации.</p>
        </div>
      </section>
    )
  }

  const hasFriendData =
    friends.length > 0 || incomingRequests.length > 0 || outgoingRequests.length > 0

  return (
    <div className="view-stack">
      <section className="panel page-toolbar">
        <SectionTitle title="Друзья" />
        <button type="button" className="primary-button" onClick={onOpenSearch}>
          Найти друзей
        </button>
      </section>

      {incomingRequests.length > 0 ? (
        <section className="panel">
          <SectionTitle title="Входящие заявки" />
          <div className="friend-grid">
            {incomingRequests.map((request) => (
              <article className="friend-card panel" key={request.id}>
                <div className="friend-avatar" aria-hidden="true">
                  {request.name.slice(0, 1)}
                </div>
                <div>
                  <span className="eyebrow">Ожидает ответа</span>
                  <h2>{request.name}</h2>
                  <p>{request.bio ?? 'Без описания'}</p>
                  {formatRequestTime(request.createdAt) ? (
                    <small>{formatRequestTime(request.createdAt)}</small>
                  ) : null}
                </div>
                <div className="button-row compact">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void onAcceptRequest(request.id)}
                  >
                    Принять
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {outgoingRequests.length > 0 ? (
        <section className="panel">
          <SectionTitle title="Исходящие заявки" />
          <div className="friend-grid">
            {outgoingRequests.map((request) => (
              <article className="friend-card panel" key={request.id}>
                <div className="friend-avatar" aria-hidden="true">
                  {request.name.slice(0, 1)}
                </div>
                <div>
                  <span className="eyebrow">Заявка отправлена</span>
                  <h2>{request.name}</h2>
                  <p>{request.bio ?? 'Без описания'}</p>
                  {formatRequestTime(request.createdAt) ? (
                    <small>{formatRequestTime(request.createdAt)}</small>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {friends.length > 0 ? (
        <section className="friend-grid">
          {friends.map((friend) => (
            <article className="friend-card panel" key={friend.id}>
              <div className="friend-avatar" aria-hidden="true">
                {friend.name.slice(0, 1)}
              </div>
              <div>
                <span className="eyebrow">{friend.status}</span>
                <h2>{friend.name}</h2>
                <p>{friend.bio ?? 'Без описания'}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!hasFriendData ? (
        <section className="empty-state">
          <div>
            <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Друзей пока нет'}</h2>
            <p>
              {searchQuery.trim().length > 0
                ? 'Попробуйте другой запрос для поиска друзей.'
                : 'После добавления друзей и получения заявок они появятся здесь.'}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
