function cleanText(value: string) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

const GENRE_LABELS: Record<string, string> = {
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

export function genreLabelFor(value: string) {
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
    return lower.includes('vr') ? 'ВР-шутер' : 'Шутер'
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

export function tagsFor(
  game: { genre?: string[] | string },
  summary: { description?: string; extract?: string },
) {
  const source = cleanText(
    `${Array.isArray(game.genre) ? game.genre.join(' ') : ''} ${summary?.description ?? ''} ${summary?.extract ?? ''}`,
  ).toLowerCase()
  const tags: string[] = []

  const pushTag = (value: string) => {
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
