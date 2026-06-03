import { useEffect, useRef, useState } from 'react'
import { GameCard } from '../components/GameCard'
import { SectionTitle } from '../components/ui'
import type { Game } from '../types'

type StorePageProps = {
  activeGenre: string
  isAuthenticated: boolean
  games: Game[]
  genres: string[]
  librarySet: Set<string>
  onAdd: (game: Game) => void
  onGenreChange: (genre: string) => void
  onOpen: (game: Game) => void
}

export function StorePage({
  activeGenre,
  isAuthenticated,
  games,
  genres,
  librarySet,
  onAdd,
  onGenreChange,
  onOpen,
}: StorePageProps) {
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)
  const genreMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!genreMenuRef.current?.contains(event.target as Node)) {
        setIsGenreMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsGenreMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="view-stack">
      <section className="panel filters-panel">
        <SectionTitle title="Фильтры" />
        <div className="filter-select-field" ref={genreMenuRef}>
          <span>Жанр</span>
          <button
            type="button"
            className="filter-select filter-select-button"
            aria-haspopup="listbox"
            aria-expanded={isGenreMenuOpen}
            onClick={() => setIsGenreMenuOpen((current) => !current)}
          >
            <span>{activeGenre}</span>
          </button>
          {isGenreMenuOpen ? (
            <div className="filter-dropdown" role="listbox" aria-label="Жанр">
              {genres.map((item) => {
                const isActive = item === activeGenre

                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={isActive ? 'filter-option active' : 'filter-option'}
                    onClick={() => {
                      onGenreChange(item)
                      setIsGenreMenuOpen(false)
                    }}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>

      {games.length > 0 ? (
        <section className="game-grid">
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              artPriority={index < 4 ? 'high' : 'auto'}
              game={game}
              inLibrary={librarySet.has(game.id)}
              isAuthenticated={isAuthenticated}
              onAdd={onAdd}
              onOpen={onOpen}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Измените фильтр или выберите другой жанр.</p>
        </section>
      )}
    </div>
  )
}
