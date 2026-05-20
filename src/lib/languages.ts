const KNOWN_LANGUAGES = new Set([
  // Slavic
  "русский", "украинский", "белорусский", "польский", "чешский",
  "словацкий", "словенский", "сербский", "хорватский", "боснийский",
  "черногорский", "македонский", "болгарский",

  // Germanic
  "немецкий", "английский", "нидерландский", "голландский", "фламандский",
  "шведский", "норвежский", "датский", "исландский", "фарерский",
  "африкаанс", "люксембургский", "идиш", "фризский",

  // Romance
  "французский", "испанский", "итальянский", "португальский", "румынский",
  "молдавский", "каталанский", "галисийский", "окситанский", "ретороманский",
  "сардинский",

  // Baltic
  "латышский", "литовский",

  // Celtic
  "ирландский", "валлийский", "бретонский", "корнский", "мэнский",

  // Hellenic
  "греческий",

  // Albanian / Basque
  "албанский", "баскский",

  // Semitic
  "арабский", "иврит", "мальтийский", "амхарский", "тигринья", "сирийский",

  // Iranian
  "персидский", "фарси", "дари", "пашто", "курдский", "таджикский", "осетинский",

  // Turkic
  "турецкий", "казахский", "узбекский", "азербайджанский", "туркменский",
  "уйгурский", "кыргызский", "татарский", "башкирский", "чувашский",
  "якутский", "хакасский", "тувинский", "гагаузский",

  // Caucasian
  "грузинский", "армянский", "чеченский", "аварский", "ингушский",
  "абхазский", "адыгейский", "кабардинский", "лезгинский",

  // Uralic
  "финский", "эстонский", "венгерский", "саамский", "марийский", "удмуртский",

  // Indo-Aryan
  "хинди", "урду", "бенгальский", "маратхи", "гуджарати", "пенджабский",
  "непальский", "сингальский", "ория", "ассамский", "кашмирский", "цыганский", "ромский",

  // Dravidian
  "тамильский", "телугу", "каннада", "малаялам",

  // Sino-Tibetan
  "китайский", "мандаринский", "кантонский", "тибетский", "бирманский",

  // Japonic / Koreanic
  "японский", "корейский",

  // Tai-Kadai
  "тайский", "лаосский",

  // Austroasiatic
  "вьетнамский", "кхмерский",

  // Austronesian
  "индонезийский", "малайский", "филиппинский", "тагальский", "яванский",
  "малагасийский", "маорийский", "самоанский", "гавайский", "фиджийский",

  // Niger-Congo
  "суахили", "йоруба", "игбо", "зулу", "коса", "шона", "сесото",
  "фула", "волоф", "лингала", "руанда", "кирунди", "луганда", "хауса", "эве",

  // Cushitic
  "сомалийский", "оромо",

  // Mongolic
  "монгольский", "бурятский", "калмыцкий",

  // Classical / constructed
  "латинский", "латынь", "санскрит", "старославянский", "коптский", "эсперанто",

  // English names
  "english", "german", "french", "spanish", "italian", "portuguese",
  "chinese", "japanese", "korean", "arabic", "turkish", "polish",
  "czech", "swedish", "norwegian", "danish", "finnish", "dutch",
  "greek", "hungarian", "romanian", "bulgarian", "serbian", "croatian",
  "ukrainian", "hebrew", "hindi", "bengali", "vietnamese", "thai",
  "indonesian", "malay", "swahili", "latin", "persian", "farsi",
  "urdu", "tamil", "russian", "catalan", "basque", "irish", "welsh",
  "albanian", "macedonian", "slovenian", "slovak", "georgian", "armenian",
  "mongolian", "kazakh", "uzbek", "azerbaijani", "kyrgyz", "tajik",
  "turkmen", "latvian", "lithuanian", "estonian", "icelandic", "maltese",
  "afrikaans", "zulu", "xhosa", "amharic", "somali", "yoruba", "igbo",
  "hausa", "malagasy", "maori", "esperanto", "sinhalese", "sinhala",
  "nepali", "punjabi", "gujarati", "marathi", "kannada", "malayalam",
  "telugu", "burmese", "khmer", "lao", "tagalog", "javanese",

  // Native / alternative names
  "deutsch", "español", "français", "italiano", "português", "中文", "日本語",
  "한국어", "العربية", "हिन्दी", "বাংলা", "ελληνικά", "svenska", "norsk",
  "dansk", "suomi", "magyar", "română", "polski", "čeština", "slovenčina",
]);

export const isValidLanguage = (input: string): boolean =>
  KNOWN_LANGUAGES.has(input.trim().toLowerCase());
