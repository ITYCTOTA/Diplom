import { gameVars } from '../services/format'
import type { Game, GameArtSize } from '../types'

export function GameArt({ game, size }: { game: Game; size: GameArtSize }) {
  return (
    <span className={`game-art ${size}`} style={gameVars(game)} aria-hidden="true">
      <span>{game.title}</span>
    </span>
  )
}
