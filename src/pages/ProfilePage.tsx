import { GameArt } from '../components/GameArt'
import { Metric, SectionTitle } from '../components/ui'
import type { Game, UserProfile } from '../types'

export function ProfilePage({
  libraryCount,
  profile,
  wishlistGames,
  onOpen,
}: {
  libraryCount: number
  profile: UserProfile | null
  wishlistGames: Game[]
  onOpen: (game: Game) => void
}) {
  const heat = Array.from({ length: 35 }, (_, index) => (index * 17) % 5)
  const createdYear = profile ? new Date(profile.createdAt).getFullYear() : 2026
  const profileLibraryCount = profile?.stats.libraryCount ?? libraryCount
  const monthlyHours = profile ? Math.round(profile.stats.totalMinutes / 60) : 128

  return (
    <div className="view-stack">
      <section className="profile-grid">
        <article className="profile-card panel">
          <div className="profile-avatar">{(profile?.nickname ?? 'ITYCTOTA').slice(0, 1)}</div>
          <div>
            <span className="eyebrow">Игрок с {createdYear}</span>
            <h2>{profile?.nickname ?? 'ITYCTOTA'}</h2>
            <p>{profile?.bio ?? 'Любит RPG, стратегии и короткие вечерние сессии.'}</p>
          </div>
        </article>
        <article className="profile-stats panel">
          <Metric value={String(profileLibraryCount)} label="игр" />
          <Metric value={`${monthlyHours} ч`} label="в активности" />
          <Metric value={String(profile?.stats.postsCount ?? 12)} label="публикаций" />
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <SectionTitle title="Активность" meta="5 недель" />
          <div className="heatmap" aria-label="Игровая активность">
            {heat.map((level, index) => (
              <span key={`${index}-${level}`} data-level={level} />
            ))}
          </div>
        </article>
        <article className="panel">
          <SectionTitle title="Желаемое" meta={String(wishlistGames.length)} />
          <div className="mini-grid">
            {wishlistGames.map((game) => (
              <button key={game.id} type="button" className="mini-game" onClick={() => onOpen(game)}>
                <GameArt game={game} size="small" />
                <span>
                  <strong>{game.title}</strong>
                  <small>{game.discount ?? game.reason}</small>
                </span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
