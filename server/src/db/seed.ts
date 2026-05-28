import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { pool } from './pool.js'
import { genreLabelFor, tagsFor } from './gameLocalization.js'

type GameSeed = {
  slug: string
  title: string
  description: string
  priceCents: number
  rating: number
  coverTone: string
  coverToneTwo: string
  coverUrl: string
  genres: string[]
  tags: string[]
}

type QueryClient = {
  query: (text: string, params?: unknown[]) => Promise<unknown>
}

const PASSWORD_HASH = '$2a$10$.9Fw4tAv9fM.QrrUqDGZRuB4hSXW/8CPVt8Nq2H791iTQFpGQxfhy'
const GAMES_PATH = new URL('./real-games.json', import.meta.url)

const seedUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'ityctota@example.com',
    passwordHash: PASSWORD_HASH,
    nickname: 'ITYCTOTA',
    bio: 'Любит RPG, стратегии и короткие вечерние сессии.',
    walletBalanceCents: 750000,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'mira@example.com',
    passwordHash: PASSWORD_HASH,
    nickname: 'Mira',
    bio: 'Исследует новые сезоны и собирает карты событий.',
    walletBalanceCents: 420000,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'oleg@example.com',
    passwordHash: PASSWORD_HASH,
    nickname: 'Oleg',
    bio: 'Играет в симуляторы и тактические стратегии.',
    walletBalanceCents: 280000,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'nika@example.com',
    passwordHash: PASSWORD_HASH,
    nickname: 'Nika',
    bio: 'Пишет отзывы и участвует в турнирах.',
    walletBalanceCents: 180000,
  },
]

function normalizeName(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function bulkValues(rows: unknown[][]) {
  return rows
    .map((row, rowIndex) => {
      const placeholders = row.map((_, columnIndex) => `$${rowIndex * row.length + columnIndex + 1}`)
      return `(${placeholders.join(', ')})`
    })
    .join(', ')
}

async function bulkInsert(
  client: QueryClient,
  table: string,
  columns: string[],
  rows: unknown[][],
) {
  if (rows.length === 0) {
    return
  }

  const values = rows.flat()
  await client.query(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${bulkValues(rows)}`,
    values,
  )
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

async function main() {
  const raw = await readFile(GAMES_PATH, 'utf8')
  const games = (JSON.parse(raw) as GameSeed[]).map((game) => {
    const genres = unique(
      (Array.isArray(game.genres) ? game.genres : []).map((value: string) => genreLabelFor(value)),
    )
    const description = String(game.description ?? '')

    return {
      ...game,
      genres: genres.length > 0 ? genres : ['Другое'],
      tags: tagsFor({ genre: game.genres }, { description, extract: description }),
    }
  })

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      TRUNCATE TABLE
        friend_requests,
        friendships,
        group_likes,
        group_comments,
        group_posts,
        group_members,
        groups,
        user_posts,
        game_activity,
        reviews,
        library_items,
        purchases,
        game_tags,
        game_genres,
        tags,
        genres,
        games,
        users
      RESTART IDENTITY CASCADE
    `)

    await bulkInsert(
      client,
      'users',
      ['id', 'email', 'password_hash', 'nickname', 'bio', 'wallet_balance_cents'],
      seedUsers.map((user) => [
        user.id,
        user.email,
        user.passwordHash,
        user.nickname,
        user.bio,
        user.walletBalanceCents,
      ]),
    )

    const genreNames = unique(games.flatMap((game) => game.genres.map((genre: string) => cleanText(genre))))
    const tagNames = unique(games.flatMap((game) => game.tags.map((tag: string) => cleanText(tag))))

    const genreIdByName = new Map<string, string>()
    const tagIdByName = new Map<string, string>()
    const gameIdBySlug = new Map<string, string>()

    await bulkInsert(
      client,
      'genres',
      ['id', 'name'],
      genreNames.map((name) => {
        const id = randomUUID()
        genreIdByName.set(name, id)
        return [id, name]
      }),
    )

    await bulkInsert(
      client,
      'tags',
      ['id', 'name'],
      tagNames.map((name) => {
        const id = randomUUID()
        tagIdByName.set(name, id)
        return [id, name]
      }),
    )

    await bulkInsert(
      client,
      'games',
      [
        'id',
        'slug',
        'title',
        'description',
        'price_cents',
        'rating',
        'cover_url',
        'cover_tone',
        'cover_tone_two',
      ],
      games.map((game) => {
        const id = randomUUID()
        gameIdBySlug.set(game.slug, id)
        return [
          id,
          game.slug,
          normalizeName(game.title),
          cleanText(game.description),
          game.priceCents,
          game.rating,
          game.coverUrl,
          game.coverTone,
          game.coverToneTwo,
        ]
      }),
    )

    const gameGenreRows: unknown[][] = []
    const gameTagRows: unknown[][] = []

    for (const game of games) {
      const gameId = gameIdBySlug.get(game.slug)

      if (!gameId) {
        throw new Error(`Missing id for game ${game.slug}`)
      }

      for (const genre of game.genres.map((value: string) => cleanText(value))) {
        const genreId = genreIdByName.get(genre)

        if (genreId) {
          gameGenreRows.push([gameId, genreId])
        }
      }

      for (const tag of game.tags.map((value: string) => cleanText(value))) {
        const tagId = tagIdByName.get(tag)

        if (tagId) {
          gameTagRows.push([gameId, tagId])
        }
      }
    }

    await bulkInsert(client, 'game_genres', ['game_id', 'genre_id'], gameGenreRows)
    await bulkInsert(client, 'game_tags', ['game_id', 'tag_id'], gameTagRows)

    const demoGameIds = games.slice(0, 3).map((game) => {
      const id = gameIdBySlug.get(game.slug)

      if (!id) {
        throw new Error(`Missing demo game id for ${game.slug}`)
      }

      return id
    })

    await bulkInsert(
      client,
      'purchases',
      ['user_id', 'game_id', 'amount_cents'],
      [
        ['11111111-1111-1111-1111-111111111111', demoGameIds[0], games[0].priceCents],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[1], games[1].priceCents],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[2], games[2].priceCents],
      ],
    )

    await bulkInsert(
      client,
      'library_items',
      ['user_id', 'game_id'],
      [
        ['11111111-1111-1111-1111-111111111111', demoGameIds[0]],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[1]],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[2]],
      ],
    )

    await bulkInsert(
      client,
      'reviews',
      ['user_id', 'game_id', 'rating', 'text'],
      [
        [
          '44444444-4444-4444-4444-444444444444',
          demoGameIds[0],
          5,
          'Сильная атмосфера и понятный темп без лишнего гринда.',
        ],
        [
          '33333333-3333-3333-3333-333333333333',
          demoGameIds[0],
          4,
          'Лучше всего играть вечером: миссии короткие, но цепляют.',
        ],
      ],
    )

    await bulkInsert(
      client,
      'game_activity',
      ['user_id', 'game_id', 'activity_date', 'minutes'],
      [
        ['11111111-1111-1111-1111-111111111111', demoGameIds[0], '2026-05-27', 95],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[1], '2026-05-26', 42],
        ['11111111-1111-1111-1111-111111111111', demoGameIds[2], '2026-05-24', 70],
      ],
    )

    await bulkInsert(
      client,
      'groups',
      ['id', 'slug', 'title', 'description', 'creator_id', 'cover_tone', 'cover_tone_two'],
      [
        [
          '20000000-0000-0000-0000-000000000001',
          'playstation-rpgs',
          'PlayStation RPGs',
          'Сообщество для обсуждения сюжетных ролевых игр, сборок и редких находок каталога.',
          '22222222-2222-2222-2222-222222222222',
          '#8B5CF6',
          '#38BDF8',
        ],
        [
          '20000000-0000-0000-0000-000000000002',
          'strategy-club',
          'Strategy Club',
          'Группа для тактических партий, турниров и коротких вечерних обсуждений.',
          '44444444-4444-4444-4444-444444444444',
          '#FB7185',
          '#F59E0B',
        ],
      ],
    )

    await bulkInsert(
      client,
      'group_members',
      ['group_id', 'user_id', 'role'],
      [
        ['20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'member'],
        ['20000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'admin'],
        ['20000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'admin'],
      ],
    )

    await bulkInsert(
      client,
      'group_posts',
      ['id', 'group_id', 'author_id', 'title', 'text', 'created_at'],
      [
        [
          '30000000-0000-0000-0000-000000000001',
          '20000000-0000-0000-0000-000000000001',
          '22222222-2222-2222-2222-222222222222',
          `${games[0].title}: сезонная карта`,
          'Обновила маршрут и добавила отметки редких наград для обсуждения.',
          '2026-05-28T09:20:00.000Z',
        ],
        [
          '30000000-0000-0000-0000-000000000002',
          '20000000-0000-0000-0000-000000000002',
          '44444444-4444-4444-4444-444444444444',
          `${games[1].title}: сетка на выходные`,
          'Открыла регистрацию на короткий турнир и первые матчи начнутся вечером.',
          '2026-05-28T10:05:00.000Z',
        ],
      ],
    )

    await bulkInsert(
      client,
      'group_comments',
      ['id', 'post_id', 'author_id', 'text', 'created_at'],
      [
        [
          '31000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001',
          '11111111-1111-1111-1111-111111111111',
          'Отметки наград помогли быстрее закрыть вторую цепочку.',
          '2026-05-28T11:00:00.000Z',
        ],
        [
          '31000000-0000-0000-0000-000000000002',
          '30000000-0000-0000-0000-000000000002',
          '33333333-3333-3333-3333-333333333333',
          'Можно добавить резервный слот для участников, которые опоздают.',
          '2026-05-28T11:15:00.000Z',
        ],
      ],
    )

    await bulkInsert(
      client,
      'group_likes',
      ['post_id', 'user_id', 'created_at'],
      [
        ['30000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '2026-05-28T11:05:00.000Z'],
        ['30000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '2026-05-28T11:07:00.000Z'],
      ],
    )

    await bulkInsert(
      client,
      'user_posts',
      ['id', 'user_id', 'text', 'created_at'],
      [
        [
          '40000000-0000-0000-0000-000000000001',
          '11111111-1111-1111-1111-111111111111',
          `Сегодня добрал пару коротких сессий в ${games[0].title} и уже вижу, куда пойдёт следующий апдейт.`,
          '2026-05-28T08:40:00.000Z',
        ],
        [
          '40000000-0000-0000-0000-000000000002',
          '11111111-1111-1111-1111-111111111111',
          'Спокойный вечер под тактику без лишнего шума. Как раз тот темп, который мне нужен.',
          '2026-05-28T09:15:00.000Z',
        ],
        [
          '40000000-0000-0000-0000-000000000003',
          '11111111-1111-1111-1111-111111111111',
          'Собрал заметки по нескольким играм из каталога и оставил их в ленте, чтобы не потерять идеи.',
          '2026-05-28T10:00:00.000Z',
        ],
      ],
    )

    await bulkInsert(
      client,
      'friendships',
      ['user_id', 'friend_id', 'created_at'],
      [
        ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-05-28T07:00:00.000Z'],
        ['22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-05-28T07:00:00.000Z'],
      ],
    )

    await client.query('COMMIT')
    console.log(`Seeded ${games.length} real games and demo social data`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

await main()
