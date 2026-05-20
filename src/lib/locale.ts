import type { CEFRLevel, Interest, SessionFormat } from "@/types";


export const COMMON = {
  next: "Далее",
  back: "Назад",
  cancel: "Отмена",
  yes: "Да",
  no: "Нет",
  openMenu: "Открыть меню",
  serverError: "Ошибка сервера. Попробуйте ещё раз.",
  retry: "Попробовать снова",
  errorTitle: "Что-то пошло не так",
} as const;


export const SIDEBAR = {
  languages: "Языки",
  format: "Формат",
  progress: "Прогресс",
  weakItems: "Слабые места",
  addLanguage: "+ Добавить язык",
  deleteTitle: "Удалить язык",
  deleteConfirm: (language: string) => `Удалить ${language}?`,
  statsWords: "слов",
  statsReview: "повторить",
  statsDays: "дней подряд",
  statsSessions: "сессий",
} as const;


export const CHAT = {
  inputPlaceholder: "Ответ или вопрос...",
  noLanguage: "Выберите язык в боковой панели",
  reviewEmpty: "Сегодня слов для повторения нет — отличный результат! Переключитесь на другой формат: Новая лексика, Грамматика или Разговорная практика.",
} as const;


export const AI_COMMANDS = {
  startLesson: "Начни урок: в ОДНОМ сообщении — короткое приветствие (1–2 слова) и сразу первое задание. Не жди ответа на приветствие.",
  continueLesson: "Продолжи урок — сразу дай следующее задание, без вступлений.",
  switchFormat: "Мы переключились на новый формат урока. Без лишних вступлений — сразу дай первое задание в новом формате.",
  startPlacement: "Начни тест.",
} as const;


export const GREETING = {
  morning: "Доброе утро",
  afternoon: "Добрый день",
  evening: "Добрый вечер",
  startPrompt: "Начнём заниматься",
  streak: (n: number) => `${n} дней подряд 🔥`,
  chooseFormat: "Выберите формат урока",
  statsWords: "слов в базе",
  statsReview: "повторить",
  statsSessions: "сессий",
  duePrefix: (n: number) =>
    `📚 Сегодня ${n} слов ждут повторения — рекомендую начать с `,
  dueHighlight: "Повторения",
} as const;


export const ONBOARDING = {
  languageTitle: "Какой язык учим?",
  languageSubtitle: "Введите название языка на русском",
  languagePlaceholder: "Например: немецкий, японский, испанский...",
  languageError: "Такого языка не существует",
  levelTitle: "Ваш уровень",
  levelSubtitle: "Выберите уровень или пройдите тест",
  levelUnknown: "Не знаю свой уровень — пройти тест",
  placementTitle: "Тест на определение уровня",
  placementSubtitle: (language: string) => `${language} · 6–10 вопросов`,
  placementPlaceholder: "Ваш ответ...",
  resultTitle: "Результат теста",
  resultConfidence: (pct: number) => `Уверенность: ${pct}%`,
  resultRetry: "Пройти тест ещё раз",
  resultAccept: "Согласен →",
  interestsTitle: "Что важнее всего?",
  interestsSubtitle: "Выберите одно или несколько направлений",
  startLearning: "Начать учиться",
} as const;


export const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: "Начинающий",
  A2: "Элементарный",
  B1: "Средний",
  B2: "Выше среднего",
  C1: "Продвинутый",
  C2: "В совершенстве",
};

export const INTEREST_LABELS: Record<Interest, string> = {
  everyday: "Повседневные ситуации",
  professional: "Профессиональная лексика",
  grammar: "Грамматика",
  travel: "Путешествия",
  culture: "Культура и литература",
  business: "Бизнес",
  technology: "Технологии",
};

export const SESSION_FORMAT_LABELS: Record<SessionFormat, string> = {
  review: "Повторение",
  vocabulary: "Новая лексика",
  grammar: "Грамматика",
  reading: "Чтение",
  writing: "Письмо",
  speaking: "Разговорная практика",
};
