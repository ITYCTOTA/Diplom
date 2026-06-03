import { useEffect, useState } from 'react'
import { gameArtUrl, gameVars } from '../services/format'
import type { Game, GameArtSize } from '../types'

type GameArtProps = {
  game: Game
  size: GameArtSize
  priority?: 'auto' | 'high'
}

export function GameArt({ game, size, priority = 'auto' }: GameArtProps) {
  const hasCover = Boolean(game.coverUrl)
  const isHighPriority = priority === 'high' || size === 'large'
  const optimizedCoverUrl = gameArtUrl(game.coverUrl, size)
  const [imgSrc, setImgSrc] = useState(optimizedCoverUrl ?? game.coverUrl ?? '')

  useEffect(() => {
    setImgSrc(optimizedCoverUrl ?? game.coverUrl ?? '')
  }, [game.coverUrl, optimizedCoverUrl])

  return (
    <span
      className={`game-art ${size}${hasCover ? ' has-cover' : ''}`}
      style={gameVars(game)}
      aria-hidden="true"
    >
      {hasCover ? (
        <img
          className="game-art-media"
          src={imgSrc}
          alt=""
          loading={isHighPriority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={isHighPriority ? 'high' : 'auto'}
          onError={() => {
            if (game.coverUrl && imgSrc !== game.coverUrl) {
              setImgSrc(game.coverUrl)
            }
          }}
        />
      ) : null}
      <span>{game.title}</span>
    </span>
  )
}
