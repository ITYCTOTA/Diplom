import { useState, type FormEvent } from 'react'
import { ModalShell } from './ModalShell'

type CreateGroupModalProps = {
  onClose: () => void
  onCreateGroup: (title: string, description: string) => Promise<void>
}

export function CreateGroupModal({ onClose, onCreateGroup }: CreateGroupModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onCreateGroup(title, description)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось создать группу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell
      title="Создать группу"
      description="Задайте название и описание сообщества. Группа появится сразу после сохранения."
      onClose={onClose}
      widthClass="wide"
    >
      <form className="modal-form" onSubmit={submit}>
        <label>
          <span>Название</span>
          <input
            autoFocus
            required
            value={title}
            placeholder="Например, Стратегии на вечер"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label>
          <span>Описание</span>
          <textarea
            required
            value={description}
            placeholder="Коротко опишите, о чём будет группа"
            rows={5}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        {error ? <p className="auth-error modal-error">{error}</p> : null}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Создаём...' : 'Создать группу'}
          </button>
          <button type="button" className="secondary-button" disabled={isSubmitting} onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
