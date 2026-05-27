import { priceLabel } from '../services/format'
import type { Game } from '../types'
import { GameArt } from './GameArt'
import { SectionTitle } from './ui'

type PurchaseModalProps = {
  game: Game
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function PurchaseModal({ game, isPending, onCancel, onConfirm }: PurchaseModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="purchase-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-title"
      >
        <SectionTitle title="Подтверждение оплаты" />
        <div className="purchase-body">
          <GameArt game={game} size="medium" />
          <div>
            <span className="eyebrow">{game.genre}</span>
            <h2 id="purchase-title">{game.title}</h2>
            <p>{game.summary}</p>
          </div>
        </div>

        <div className="purchase-total">
          <span>Стоимость</span>
          <strong>{priceLabel(game.price)}</strong>
        </div>

        <div className="button-row">
          <button type="button" className="primary-button" disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Выполняем оплату...' : 'Подтвердить оплату'}
          </button>
          <button type="button" className="secondary-button" disabled={isPending} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </section>
    </div>
  )
}
