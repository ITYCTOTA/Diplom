import { GameArt } from '../components/GameArt'
import { Metric, SectionTitle } from '../components/ui'
import { groupVars } from '../services/format'
import type { Game, Group } from '../types'

type GroupPageProps = {
  group: Group
  games: Game[]
  isJoined: boolean
  onBack: () => void
  onOpenGame: (game: Game) => void
  onToggleGroup: (groupId: string) => void
}

export function GroupPage({
  group,
  games,
  isJoined,
  onBack,
  onOpenGame,
  onToggleGroup,
}: GroupPageProps) {
  const relatedGames = group.gameIds
    .map((gameId) => games.find((game) => game.id === gameId))
    .filter((game): game is Game => Boolean(game))

  return (
    <div className="view-stack">
      <button type="button" className="inline-back" onClick={onBack}>
        Назад к группам
      </button>

      <section className="group-profile-grid">
        <article className="group-profile-card panel" style={groupVars(group)}>
          <span className="group-profile-cover" aria-hidden="true" />
          <div className="group-profile-body">
            <div className="group-avatar" aria-hidden="true">
              {group.title.slice(0, 1)}
            </div>
            <div>
              <span className="eyebrow">Открытое игровое сообщество</span>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div className="button-row">
                <button
                  type="button"
                  className={isJoined ? 'secondary-button' : 'primary-button'}
                  onClick={() => onToggleGroup(group.id)}
                >
                  {isJoined ? 'Вы подписаны' : 'Вступить'}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="profile-stats panel">
          <Metric value={group.members} label="участников" />
          <Metric value={group.online} label="сейчас онлайн" />
          <Metric value={group.postsCount} label="публикаций" />
        </article>
      </section>

      <section className="two-column group-content-grid">
        <article className="panel">
          <SectionTitle title="Закреплено" meta={group.founded} />
          <div className="post-list">
            {group.posts.map((post) => (
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
              </article>
            ))}
          </div>
        </article>

        <aside className="panel">
          <SectionTitle title="Обсуждения" meta={String(group.discussions.length)} />
          <div className="discussion-list">
            {group.discussions.map((discussion) => (
              <button type="button" className="discussion-item" key={discussion.id}>
                <span>
                  <strong>{discussion.title}</strong>
                  <small>{discussion.lastActivity}</small>
                </span>
                <b>{discussion.replies}</b>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="two-column">
        <article className="panel">
          <SectionTitle title="Связанные игры" meta={String(relatedGames.length)} />
          <div className="mini-grid">
            {relatedGames.map((game) => (
              <button
                key={game.id}
                type="button"
                className="mini-game"
                onClick={() => onOpenGame(game)}
              >
                <GameArt game={game} size="small" />
                <span>
                  <strong>{game.title}</strong>
                  <small>{game.activity}</small>
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="Правила группы" meta="модерация" />
          <div className="rule-list">
            {group.rules.map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
