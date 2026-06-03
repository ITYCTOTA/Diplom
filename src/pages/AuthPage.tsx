import { useState, type FormEvent } from 'react'
import { SectionTitle } from '../components/ui'
import type { AuthUser } from '../types'

type AuthPageProps = {
  user: AuthUser | null
  isChecking: boolean
  onLogin: (email: string, password: string) => Promise<void>
  onLogout: () => void
  onOpenProfile: () => void
  onRegister: (email: string, password: string, nickname: string) => Promise<void>
  onSuccess: () => void
}

export function AuthPage({
  user,
  isChecking,
  onLogin,
  onLogout,
  onOpenProfile,
  onRegister,
  onSuccess,
}: AuthPageProps) {
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

      onSuccess()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить вход')
    } finally {
      setIsPending(false)
    }
  }

  if (isChecking) {
    return (
      <div className="auth-page-wrap">
        <section className="auth-page panel">
          <SectionTitle title="Проверка сессии" />
          <p>Проверяем сохранённый вход.</p>
        </section>
      </div>
    )
  }

  if (user) {
    return (
      <div className="auth-page-wrap">
        <section className="auth-page panel">
          <SectionTitle title="Вы уже вошли" />
          <div className="auth-user-card">
            <div className="profile-avatar">{user.nickname.slice(0, 1)}</div>
            <div>
              <h2>{user.nickname}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={onOpenProfile}>
              Открыть профиль
            </button>
            <button type="button" className="secondary-button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="auth-page-wrap">
      <section className="auth-page panel">
        <SectionTitle title={mode === 'login' ? 'Вход в GameHub' : 'Регистрация'} />
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              placeholder="example@example.com"
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
                placeholder="Введите никнейм"
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
            {mode === 'login' ? 'Зарегистрироваться' : 'У меня уже есть аккаунт'}
          </button>
        </form>
      </section>
    </div>
  )
}
