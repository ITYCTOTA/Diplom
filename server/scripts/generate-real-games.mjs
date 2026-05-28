import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const SOURCE_URL = 'https://api.sampleapis.com/playstation/games'
const OUTPUT_PATH = new URL('../src/db/real-games.json', import.meta.url)
const LOCAL_SOURCE_PATH = new URL('../src/db/playstation-source.json', import.meta.url)
const TARGET_COUNT = 64
const SOURCE_ARG =
  typeof process !== 'undefined' && Array.isArray(process.argv) ? process.argv[2] : undefined

function normalizeTitle(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return normalizeTitle(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function hashInt(value) {
  return Number.parseInt(createHash('sha256').update(value).digest('hex').slice(0, 8), 16)
}

function hslToHex(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const chroma = (1 - Math.abs(2 * light - 1)) * sat
  const section = h / 60
  const x = chroma * (1 - Math.abs((section % 2) - 1))

  let r = 0
  let g = 0
  let b = 0

  if (section >= 0 && section < 1) {
    r = chroma
    g = x
  } else if (section < 2) {
    r = x
    g = chroma
  } else if (section < 3) {
    g = chroma
    b = x
  } else if (section < 4) {
    g = x
    b = chroma
  } else if (section < 5) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }

  const match = light - chroma / 2
  const clamp = (channel) => Math.max(0, Math.min(255, channel))
  const toHex = (channel) =>
    clamp(Math.round((channel + match) * 255))
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function paletteFor(value) {
  const hash = hashInt(value)
  const hue = hash % 360
  const hueTwo = (hue + 28 + (Math.floor(hash / 256) % 110)) % 360

  return [hslToHex(hue, 76, 56), hslToHex(hueTwo, 82, 48)]
}

function priceFor(value, index) {
  const hash = hashInt(`${value}:${index}`)
  const base = 69000 + (hash % 180000)
  return Math.round(base / 1000) * 1000
}

function ratingFor(value) {
  const hash = hashInt(`rating:${value}`)
  return Number((4.0 + (hash % 10) / 10).toFixed(1))
}

const GENRE_LABELS = {
  'Life simulation': 'Симулятор жизни',
  Other: 'Другое',
  Platform: 'Платформер',
  'Platform-adventure': 'Платформер-приключение',
  'Puzzle platformer': 'Пазл-платформер',
  Sports: 'Спорт',
  'Survival horror': 'Хоррор на выживание',
  'action platform': 'Экшен-платформер',
  'action role-playing': 'Экшен-РПГ',
  'action role-playing stealth': 'Стелс-РПГ',
  'action role-playing survival horror': 'РПГ-хоррор',
  'action-adventure': 'Экшен-приключение',
  'action-adventure open-world': 'Экшен-приключение, открытый мир',
  'action-adventure stealth': 'Экшен-приключение, стелс',
  'action-adventure survival': 'Экшен-приключение, выживание',
  'action-strategy role-playing': 'Тактическая РПГ',
  adventure: 'Приключение',
  'city-building': 'Градостроение',
  'comedy point-and-click adventure': 'Комедийное точка-и-клик приключение',
  'cyberpunk first-person shooter': 'Киберпанк-шутер',
  'discontinued 2014 online-only racing': 'Онлайн-гонки',
  'episodic alt-history noir': 'Эпизодическое нуар-приключение',
  fighting: 'Файтинг',
  'first-person shooter': 'Шутер от первого лица',
  'free-to-play online first-person shooter': 'Бесплатный онлайн-шутер',
  'hack and slash': 'Слэшер',
  'interactive drama and survival horror': 'Интерактивная драма',
  'online asymmetric multiplayer survival horror': 'Ассиметричный онлайн-хоррор',
  'online multiplayer action role-playing': 'Онлайн РПГ',
  'online multiplayer vehicular combat': 'Онлайн-автобой',
  platform: 'Платформер',
  'point-and-click survival horror': 'Точка-и-клик хоррор',
  'puzzle-platform horror': 'Пазл-хоррор',
  'puzzle-platforming': 'Пазл-платформер',
  'roguelike-metroidvania': 'Рогалик-метроидвания',
  'role-playing': 'РПГ',
  'sandbox action role-playing': 'Песочница-РПГ',
  'series of physics-based simulation-puzzle video games developed by clockstone and published by headup games. while themes and elements change across the series, each':
    'Физическая головоломка',
  'side-scrolling action role-playing': 'Сайд-скролл РПГ',
  survival: 'Выживание',
  'survival horror': 'Хоррор на выживание',
  tennis: 'Теннис',
  'vertical-scrolling shooter arcade': 'Вертикальный аркадный шутер',
  'virtual reality (vr) survival horror': 'ВР-хоррор на выживание',
}

export function genreLabelFor(value) {
  const normalized = cleanText(value)

  if (!normalized) {
    return 'Другое'
  }

  if (GENRE_LABELS[normalized]) {
    return GENRE_LABELS[normalized]
  }

  const lower = normalized.toLowerCase()

  if (lower.includes('role-playing')) {
    return lower.includes('action') ? 'Экшен-РПГ' : 'РПГ'
  }

  if (lower.includes('adventure')) {
    return lower.includes('action') ? 'Экшен-приключение' : 'Приключение'
  }

  if (lower.includes('platform')) {
    return lower.includes('puzzle') ? 'Пазл-платформер' : 'Платформер'
  }

  if (lower.includes('horror')) {
    return lower.includes('survival') ? 'Хоррор на выживание' : 'Хоррор'
  }

  if (lower.includes('strategy') || lower.includes('tactics')) {
    return 'Тактика'
  }

  if (lower.includes('shooter')) {
    return lower.includes('vr') ? 'VR-шутер' : 'Шутер'
  }

  if (lower.includes('simulation')) {
    return 'Симулятор'
  }

  if (lower.includes('sports')) {
    return 'Спорт'
  }

  if (lower.includes('racing')) {
    return 'Гонки'
  }

  if (lower.includes('fighting')) {
    return 'Файтинг'
  }

  if (lower.includes('roguelike')) {
    return 'Рогалик'
  }

  if (lower.includes('metroidvania')) {
    return 'Метроидвания'
  }

  if (lower.includes('stealth')) {
    return 'Стелс'
  }

  if (lower.includes('arcade')) {
    return 'Аркада'
  }

  if (lower.includes('cyberpunk')) {
    return 'Киберпанк'
  }

  if (lower.includes('vr') || lower.includes('virtual reality')) {
    return 'ВР'
  }

  if (lower.includes('open-world')) {
    return 'Открытый мир'
  }

  if (lower.includes('sandbox')) {
    return 'Песочница'
  }

  if (lower.includes('survival')) {
    return 'Выживание'
  }

  if (lower.includes('city-building')) {
    return 'Градостроение'
  }

  return normalized
}

function releaseYear(releaseDates) {
  const entries = Object.values(releaseDates ?? {})
  for (const entry of entries) {
    const match = String(entry).match(/(19|20)\d{2}/)
    if (match) {
      return match[0]
    }
  }

  return null
}

export function tagsFor(game, summary) {
  const source = cleanText(
    `${Array.isArray(game.genre) ? game.genre.join(' ') : ''} ${summary?.description ?? ''} ${summary?.extract ?? ''}`,
  ).toLowerCase()
  const tags = []

  const pushTag = (value) => {
    if (!tags.includes(value)) {
      tags.push(value)
    }
  }

  if (/co[- ]?op|cooperative|кооп/.test(source)) {
    pushTag('Кооп')
  }

  if (/online|multiplayer|сетев|интернет/.test(source)) {
    pushTag('Онлайн')
  }

  if (/pvp|ranked|competitive|сорев/.test(source)) {
    pushTag('ПвП')
  }

  if (/story|adventure|drama|episodic|noir|сюжет/.test(source)) {
    pushTag('Сюжет')
  }

  if (/horror|страш|psychological/.test(source)) {
    pushTag('Хоррор')
  }

  if (/survival|выжив/.test(source)) {
    pushTag('Выживание')
  }

  if (/open-world|sandbox|открыт/.test(source)) {
    pushTag('Открытый мир')
  }

  if (/stealth|скрыт/.test(source)) {
    pushTag('Стелс')
  }

  if (/rpg|role-playing/.test(source)) {
    pushTag('РПГ')
  }

  if (/platform|платформ/.test(source)) {
    pushTag('Платформер')
  }

  if (/puzzle|головолом/.test(source)) {
    pushTag('Головоломка')
  }

  if (/strategy|tactics|turn-based|тактик|пошаг/.test(source)) {
    pushTag('Тактика')
  }

  if (/shooter|fps|шутер/.test(source)) {
    pushTag('Шутер')
  }

  if (/racing|гонк|vehicular combat/.test(source)) {
    pushTag('Гонки')
  }

  if (/sports|tennis|спорт/.test(source)) {
    pushTag('Спорт')
  }

  if (/fighting|fight|файт/.test(source)) {
    pushTag('Файтинг')
  }

  if (/simulation|симул|city-building|life simulation/.test(source)) {
    pushTag('Симулятор')
  }

  if (/roguelike|rogue/.test(source)) {
    pushTag('Рогалик')
  }

  if (/metroidvania|метроид/.test(source)) {
    pushTag('Метроидвания')
  }

  if (/arcade|аркад/.test(source)) {
    pushTag('Аркада')
  }

  if (/cyberpunk/.test(source)) {
    pushTag('Киберпанк')
  }

  if (/vr|virtual reality/.test(source)) {
    pushTag('ВР')
  }

  if (/indie|инди/.test(source)) {
    pushTag('Инди')
  }

  if (/relax|calm|спокой/.test(source)) {
    pushTag('Спокойно')
  }

  if (/hack and slash|слэшер/.test(source)) {
    pushTag('Слэшер')
  }

  if (/point-and-click/.test(source)) {
    pushTag('Точка-и-клик')
  }

  if (/comedy|комед/.test(source)) {
    pushTag('Комедия')
  }

  if (/exploration|исслед/.test(source)) {
    pushTag('Исследование')
  }

  if (/management|менедж/.test(source)) {
    pushTag('Менеджмент')
  }

  if (/craft|крафт/.test(source)) {
    pushTag('Крафт')
  }

  return tags.slice(0, 3)
}

export function genresFor(game, summary) {
  const values = Array.isArray(game.genre) ? game.genre : []
  const sourceGenres = values
    .map((entry) => cleanText(entry))
    .filter(Boolean)

  if (sourceGenres.length > 0) {
    return sourceGenres.map(genreLabelFor).slice(0, 3)
  }

  const text = cleanText(`${summary?.description ?? ''} ${summary?.extract ?? ''}`).toLowerCase()
  const match = text.match(
    /(?:is|was) a(?:n)?(?:\s+\d{4})?\s+(.+?)\s+(?:video\s+game|game)\b/i,
  )

  if (match?.[1]) {
    return [cleanText(match[1])]
  }

  return ['Другое']
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveWikipediaSummary(title) {
  const search = await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${title} video game`)}&srlimit=3&format=json&origin=*`,
  )

  const results = search?.query?.search ?? []

  for (const item of results) {
    const summary = await fetchWithTimeout(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`,
    )

    if (isLikelyGameSummary(summary, title)) {
      return summary
    }
  }

  for (const candidate of [`${title} (video game)`, title]) {
    const summary = await fetchWithTimeout(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`,
    )

    if (isLikelyGameSummary(summary, title)) {
      return summary
    }
  }

  return null
}

function isLikelyGameSummary(summary, expectedTitle) {
  if (!summary || typeof summary !== 'object') {
    return false
  }

  const candidate = summary
  const text = cleanText(`${candidate.description ?? ''} ${candidate.extract ?? ''}`).toLowerCase()
  const coverUrl = candidate.thumbnail?.source ?? candidate.originalimage?.source ?? ''

  return (
    titleMatches(candidate.title ?? '', expectedTitle) &&
    Boolean(candidate.extract) &&
    Boolean(coverUrl) &&
    isLikelyCoverUrl(coverUrl) &&
    /\b(game|video game|games)\b/i.test(text) &&
    !/\b(artificial intelligence|computer science|software|film|novel|album|song|species)\b/i.test(text)
  )
}

function isLikelyCoverUrl(url) {
  return /wikipedia\/en\//i.test(url) || /(cover|box|art|artwork|keyart|logo)\.(jpg|jpeg|png|webp)$/i.test(url)
}

function titleMatches(actualTitle, expectedTitle) {
  const actual = slugify(actualTitle)
  const expected = slugify(expectedTitle)

  if (!actual || !expected) {
    return false
  }

  return actual === expected || actual.includes(expected) || expected.includes(actual)
}

async function main() {
  let source = null

  if (SOURCE_ARG) {
    const sourceUrl = /^https?:\/\//i.test(SOURCE_ARG) ? SOURCE_ARG : null

    if (sourceUrl) {
      source = await fetchJson(sourceUrl)
    } else {
      const raw = await readFile(SOURCE_ARG, 'utf8')
      source = JSON.parse(raw.replace(/^\uFEFF/, ''))
    }
  } else if (existsSync(LOCAL_SOURCE_PATH)) {
    const raw = await readFile(LOCAL_SOURCE_PATH, 'utf8')
    source = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } else {
    source = await fetchJson(SOURCE_URL)
  }

  if (!Array.isArray(source)) {
    throw new Error('Failed to load sample game catalog')
  }

  const output = []

  for (const entry of source) {
    if (output.length >= TARGET_COUNT) {
      break
    }

    const title = normalizeTitle(entry.name)

    if (!title) {
      continue
    }

    const summary = await resolveWikipediaSummary(title)

    if (!summary) {
      continue
    }

    const coverUrl = summary.thumbnail?.source ?? summary.originalimage?.source ?? null

    if (!coverUrl) {
      continue
    }

    output.push({
      slug: slugify(title),
      title,
      description: cleanText(summary.extract ?? summary.description ?? title),
      priceCents: priceFor(title, output.length),
      rating: ratingFor(title),
      coverTone: paletteFor(title)[0],
      coverToneTwo: paletteFor(title)[1],
      coverUrl,
      genres: genresFor(entry, summary),
      tags: tagsFor(entry, summary),
    })
  }

  if (output.length < TARGET_COUNT) {
    throw new Error(`Only generated ${output.length} games, need at least ${TARGET_COUNT}`)
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${output.length} games to ${OUTPUT_PATH.pathname}`)
}

const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  await main()
}
