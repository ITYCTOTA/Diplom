import { SectionTitle } from '../components/ui'
import type { Friend } from '../types'

export function FriendsPage({
  friends,
  isAuthenticated,
  searchQuery,
  onOpenSearch,
}: {
  friends: Friend[]
  isAuthenticated: boolean
  searchQuery: string
  onOpenSearch: () => void
}) {
  if (!isAuthenticated) {
    return (
      <section className="empty-state">
        <div>
          <h2>Войдите в аккаунт</h2>
          <p>Список друзей и их статус доступны после авторизации.</p>
        </div>
      </section>
    )
  }

  return (
    <div className="view-stack">
      <section className="panel page-toolbar">
        <SectionTitle title="Друзья" meta={`${friends.length}`} />
        <button type="button" className="primary-button" onClick={onOpenSearch}>
          Найти друзей
        </button>
      </section>

      {friends.length === 0 ? (
        <section className="empty-state">
          <div>
            <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Друзей пока нет'}</h2>
            <p>
              {searchQuery.trim().length > 0
                ? 'Попробуйте другой запрос для поиска друзей.'
                : 'После добавления друзей они появятся здесь без шаблонных заглушек.'}
            </p>
          </div>
        </section>
      ) : (
        <section className="friend-grid">
          {friends.map((friend) => (
            <article className="friend-card panel" key={friend.id}>
              <div className="friend-avatar" aria-hidden="true">
                {friend.name.slice(0, 1)}
              </div>
              <div>
                <span className="eyebrow">{friend.status}</span>
                <h2>{friend.name}</h2>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
