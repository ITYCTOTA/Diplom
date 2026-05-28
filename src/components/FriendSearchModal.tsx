import { useMemo, useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'
import type { FriendSearchResult } from '../types'

type FriendSearchModalProps = {
  onClose: () => void
  onRequestFriend: (userId: string) => Promise<void>
  onSearchUsers: (query: string) => Promise<FriendSearchResult[]>
}

const relationLabel: Record<FriendSearchResult['relation'], string> = {
  available: 'Можно добавить',
  friend: 'Уже в друзьях',
  request_sent: 'Заявка отправлена',
  request_received: 'Они ждут ответа',
}

const actionLabel: Record<FriendSearchResult['relation'], string> = {
  available: 'Добавить',
  friend: 'В друзьях',
  request_sent: 'Отправлено',
  request_received: 'Без действия',
}

export function FriendSearchModal({ onClose, onRequestFriend, onSearchUsers }: FriendSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FriendSearchResult[]>([])
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)

  const normalizedQuery = useMemo(() => query.trim(), [query])

  const runSearch = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError('')
    setIsSearching(true)

    try {
      const users = await onSearchUsers(normalizedQuery)
      setResults(users)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Не удалось найти пользователей')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const sendRequest = async (userId: string) => {
    setError('')
    setActiveRequestId(userId)

    try {
      await onRequestFriend(userId)
      if (normalizedQuery.length > 0) {
        const users = await onSearchUsers(normalizedQuery)
        setResults(users)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось отправить заявку')
    } finally {
      setActiveRequestId(null)
    }
  }

  return (
    <ModalShell
      title="Найти друзей"
      description="Введите имя, почту или короткое описание, чтобы найти пользователей."
      onClose={onClose}
      widthClass="wide"
    >
      <form className="modal-form" onSubmit={runSearch}>
        <label>
          <span>Поиск</span>
          <input
            autoFocus
            value={query}
            placeholder="Имя, почта или описание"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="button-row compact">
          <button type="submit" className="primary-button" disabled={isSearching}>
            {isSearching ? 'Ищем...' : 'Найти'}
          </button>
        </div>
      </form>

      {error ? <p className="auth-error modal-error">{error}</p> : null}

      {results.length > 0 ? (
        <div className="friend-search-list">
          {results.map((user) => (
            <article className="friend-search-item" key={user.id}>
              <div className="friend-avatar" aria-hidden="true">
                {user.name.slice(0, 1)}
              </div>
              <div>
                <span className="eyebrow">{relationLabel[user.relation]}</span>
                <h3>{user.name}</h3>
                <p>{user.bio ?? 'Без описания'}</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                disabled={user.relation !== 'available' || activeRequestId === user.id}
                onClick={() => sendRequest(user.id)}
              >
                {activeRequestId === user.id ? 'Отправляем...' : actionLabel[user.relation]}
              </button>
            </article>
          ))}
        </div>
      ) : normalizedQuery.length > 0 && !isSearching ? (
        <section className="empty-state compact">
          <div>
            <h2>Ничего не найдено</h2>
            <p>Проверьте запрос или попробуйте другой вариант имени.</p>
          </div>
        </section>
      ) : (
        <section className="empty-state compact">
          <div>
            <h2>Начните поиск</h2>
            <p>Поиск работает по имени, почте и описанию пользователя.</p>
          </div>
        </section>
      )}
    </ModalShell>
  )
}
