import { useMemo, useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'
import type { FriendSearchResult } from '../types'

type FriendSearchModalProps = {
  onClose: () => void
  onRequestFriend: (userId: string) => Promise<void>
  onAcceptFriend: (requestId: string) => Promise<void>
  onSearchUsers: (query: string) => Promise<FriendSearchResult[]>
}

const relationLabel: Record<FriendSearchResult['relation'], string> = {
  available: 'Можно добавить',
  friend: 'Уже в друзьях',
  request_sent: 'Заявка отправлена',
  request_received: 'Есть входящая заявка',
}

const actionLabel: Record<FriendSearchResult['relation'], string> = {
  available: 'Добавить',
  friend: 'В друзьях',
  request_sent: 'Отправлено',
  request_received: 'Принять',
}

export function FriendSearchModal({
  onClose,
  onRequestFriend,
  onAcceptFriend,
  onSearchUsers,
}: FriendSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FriendSearchResult[]>([])
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  const normalizedQuery = useMemo(() => query.trim(), [query])

  const refreshResults = async () => {
    if (normalizedQuery.length === 0) {
      setResults([])
      return
    }

    const users = await onSearchUsers(normalizedQuery)
    setResults(users)
  }

  const runSearch = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError('')
    setIsSearching(true)

    try {
      await refreshResults()
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Не удалось найти пользователей')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAction = async (user: FriendSearchResult) => {
    setError('')
    setActiveUserId(user.id)

    try {
      if (user.relation === 'available') {
        await onRequestFriend(user.id)
      } else if (user.relation === 'request_received') {
        if (!user.requestId) {
          throw new Error('Не удалось определить входящую заявку')
        }

        await onAcceptFriend(user.requestId)
      }

      await refreshResults()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Не удалось выполнить действие')
    } finally {
      setActiveUserId(null)
    }
  }

  return (
    <ModalShell
      title="Найти друзей"
      description="Введите имя, почту или описание пользователя, чтобы отправить заявку или принять входящую."
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
          {results.map((user) => {
            const isDisabled = user.relation === 'friend' || user.relation === 'request_sent'
            const isPending = activeUserId === user.id

            return (
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
                  className={user.relation === 'request_received' ? 'primary-button' : 'secondary-button'}
                  disabled={isDisabled || isPending}
                  onClick={() => void handleAction(user)}
                >
                  {isPending ? 'Обрабатываем...' : actionLabel[user.relation]}
                </button>
              </article>
            )
          })}
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
