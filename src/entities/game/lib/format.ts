import type { CSSProperties } from 'react'
import type { Game, GameArtSize } from '../model/types'

export function gameVars(game: Game) {
  return {
    '--tone': game.palette[0],
    '--tone-two': game.palette[1],
  } as CSSProperties
}

export function priceLabel(price: number) {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function wikimediaThumbUrl(url: string, width: number) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname !== 'upload.wikimedia.org') {
      return url
    }

    const match = parsed.pathname.match(/^\/wikipedia\/([^/]+)\/(thumb\/)?(.+\/)([^/]+)$/)

    if (!match) {
      return url
    }

    const [, langSegment, , directory, fileName] = match
    const baseDirectory = directory.replace(/^thumb\//, '')
    const thumbPath = `/wikipedia/${langSegment}/thumb/${baseDirectory}${fileName}/${width}px-${fileName}`

    return `${parsed.origin}${thumbPath}`
  } catch {
    return url
  }
}

export function gameArtUrl(url: string | null | undefined, size: GameArtSize) {
  if (!url) {
    return null
  }

  const widthBySize = {
    small: 160,
    medium: 320,
    card: 420,
    large: 720,
    detail: 720,
  } as const

  return wikimediaThumbUrl(url, widthBySize[size])
}
