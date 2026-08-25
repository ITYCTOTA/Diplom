import type { CSSProperties } from 'react'
import type { Group } from '../model/types'

export function groupVars(group: Group) {
  return {
    '--tone': group.palette[0],
    '--tone-two': group.palette[1],
  } as CSSProperties
}
