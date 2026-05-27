import type { ViewId } from '../types'

const titles: Record<ViewId, { eyebrow: string; title: string }> = {
  home: { eyebrow: 'Добро пожаловать', title: 'Привет, ITYCTOTA' },
  store: { eyebrow: 'Каталог', title: 'Магазин игр' },
  game: { eyebrow: 'Карточка игры', title: 'Подробности' },
  library: { eyebrow: 'Моя коллекция', title: 'Библиотека' },
  recommendations: { eyebrow: 'Подборка', title: 'Рекомендации' },
  groups: { eyebrow: 'Сообщество', title: 'Группы' },
  group: { eyebrow: 'Страница группы', title: 'Сообщество' },
  friends: { eyebrow: 'Социальный центр', title: 'Друзья' },
  profile: { eyebrow: 'Аккаунт', title: 'Профиль' },
}

export function Topbar({
  activeView,
  notice,
  userName,
  query,
  onAuth,
  onLogout,
  onQuery,
}: {
  activeView: ViewId
  notice: string
  userName?: string
  query: string
  onAuth: () => void
  onLogout: () => void
  onQuery: (query: string) => void
}) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">{titles[activeView].eyebrow}</span>
        <h1>{titles[activeView].title}</h1>
        <p>{notice}</p>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <input
            type="search"
            value={query}
            placeholder="Название, жанр, тег"
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>
        <button type="button" className="avatar-button" onClick={onAuth}>
          {userName ?? 'Войти'}
        </button>
        {userName && (
          <button type="button" className="ghost-button" onClick={onLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  )
}
