import { SectionTitle } from '../components/ui'
import { groupVars } from '../services/format'
import type { Group } from '../types'

type GroupsPageProps = {
  groups: Group[]
  joinedGroups: string[]
  isAuthenticated: boolean
  currentUserId?: string | null
  onOpenGroup: (group: Group) => void
  onToggleGroup: (groupId: string) => void
  onOpenCreateGroup: () => void
  searchQuery: string
}

export function GroupsPage({
  groups,
  joinedGroups,
  isAuthenticated,
  currentUserId,
  onOpenGroup,
  onToggleGroup,
  onOpenCreateGroup,
  searchQuery,
}: GroupsPageProps) {
  const ownedGroups = currentUserId
    ? groups.filter((group) => group.creator?.id === currentUserId)
    : []
  const trackedGroups = currentUserId
    ? groups.filter(
        (group) => joinedGroups.includes(group.id) && group.creator?.id !== currentUserId,
      )
    : []
  const otherGroups = currentUserId
    ? groups.filter(
        (group) => group.creator?.id !== currentUserId && !joinedGroups.includes(group.id),
      )
    : groups

  const renderGroupCard = (group: Group, options: { canToggle: boolean; joined: boolean }) => (
    <article className="group-card panel" key={group.id} style={groupVars(group)}>
      <span className="group-cover" aria-hidden="true" />
      <div>
        <span className="eyebrow">{group.members} участников</span>
        <h2>{group.title}</h2>
        <p>Сейчас обсуждают: {group.topic}</p>
      </div>
      <div className="button-row compact">
        <button type="button" className="secondary-button" onClick={() => onOpenGroup(group)}>
          Открыть
        </button>
        {options.canToggle ? (
          <button
            type="button"
            className={options.joined ? 'secondary-button' : 'primary-button'}
            onClick={() => onToggleGroup(group.id)}
          >
            {options.joined ? 'Вы подписаны' : 'Вступить'}
          </button>
        ) : (
          <button type="button" className="secondary-button" disabled>
            Моя группа
          </button>
        )}
      </div>
    </article>
  )

  if (groups.length === 0) {
    return (
      <div className="view-stack">
        <section className="panel page-toolbar">
          <SectionTitle title="Группы" />
          {isAuthenticated ? (
            <button type="button" className="primary-button" onClick={onOpenCreateGroup}>
              Создать группу
            </button>
          ) : null}
        </section>
        <section className="empty-state">
          <div>
            <h2>{searchQuery.trim().length > 0 ? 'Ничего не найдено' : 'Групп пока нет'}</h2>
            <p>
              {searchQuery.trim().length > 0
                ? 'Попробуйте другой запрос для поиска групп.'
                : 'После появления групп они будут отображаться здесь.'}
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="view-stack">
      <section className="panel page-toolbar">
        <SectionTitle title="Группы" />
        {isAuthenticated ? (
          <button type="button" className="primary-button" onClick={onOpenCreateGroup}>
            Создать группу
          </button>
        ) : null}
      </section>

      {isAuthenticated && ownedGroups.length > 0 ? (
        <section>
          <SectionTitle title="Мои группы" />
          <div className="group-grid">
            {ownedGroups.map((group) => renderGroupCard(group, { canToggle: false, joined: true }))}
          </div>
        </section>
      ) : null}

      {isAuthenticated && trackedGroups.length > 0 ? (
        <section>
          <SectionTitle title="Отслеживаемые группы" />
          <div className="group-grid">
            {trackedGroups.map((group) => renderGroupCard(group, { canToggle: true, joined: true }))}
          </div>
        </section>
      ) : null}

      {otherGroups.length > 0 ? (
        <section>
          <SectionTitle title="Все группы" />
          <div className="group-grid">
            {otherGroups.map((group) =>
              renderGroupCard(group, {
                canToggle: isAuthenticated,
                joined: joinedGroups.includes(group.id),
              }),
            )}
          </div>
        </section>
      ) : null}

      {!isAuthenticated ? (
        <section className="empty-state compact">
          <div>
            <h2>Войдите в аккаунт</h2>
            <p>Социальная лента и личные подписки доступны после авторизации.</p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
