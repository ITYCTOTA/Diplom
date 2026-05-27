import { useState, type FormEvent } from 'react'
import { SectionTitle } from './ui'

type AuthModalProps = {
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string, nickname: string) => Promise<void>
}

export function AuthModal({ onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsPending(true)

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        await onRegister(email, password, nickname)
      }

      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить вход')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <SectionTitle title={mode === 'login' ? 'Вход в GameHub' : 'Новый аккаунт'} meta="аккаунт" />
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              placeholder="user@mail.ru"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {mode === 'register' && (
            <label>
              <span>Никнейм</span>
              <input
                required
                type="text"
                value={nickname}
                placeholder="ITYCTOTA"
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>
          )}
          <label>
            <span>Пароль</span>
            <input
              required
              minLength={3}
              type="password"
              value={password}
              placeholder="Введите пароль"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={isPending}>
            {isPending ? 'Проверяем...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
          >
            {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
          </button>
          <button type="button" className="ghost-button" onClick={onClose}>
            Закрыть
          </button>
        </form>
      </section>
    </div>
  )
}
