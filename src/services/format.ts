import type { CSSProperties } from 'react'
import type { Game, Group } from '../types'

export function gameVars(game: Game) {
  return {
    '--tone': game.palette[0],
    '--tone-two': game.palette[1],
  } as CSSProperties
}

export function groupVars(group: Group) {
  return {
    '--tone': group.palette[0],
    '--tone-two': group.palette[1],
  } as CSSProperties
}

export function priceLabel(price: number) {
  return `${price.toLocaleString('ru-RU')} ₽`
}

export function moneyLabel(amountCents: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}
