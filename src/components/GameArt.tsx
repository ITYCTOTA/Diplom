import { gameVars } from '../services/format'
import type { Game, GameArtSize } from '../types'

export function GameArt({ game, size }: { game: Game; size: GameArtSize }) {
  const hasCover = Boolean(game.coverUrl)

  return (
    <span className={`game-art ${size}${hasCover ? ' has-cover' : ''}`} style={gameVars(game)} aria-hidden="true">
      {hasCover ? <img className="game-art-media" src={game.coverUrl ?? ''} alt="" loading="lazy" /> : null}
      <span>{game.title}</span>
    </span>
  )
}
