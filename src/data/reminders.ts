/**
 * Hadith and ayat about prayer, shown as gentle reminders. Translations are
 * paraphrased from common English renderings; `source` gives the reference.
 */
export type ReminderTag =
  | 'importance'
  | 'forgiveness'
  | 'qada'
  | 'on_time'
  | 'consistency'
  | 'hardship'
  | 'fajr'
  | 'asr'
  | 'isha'
  | 'jamaah'
  | 'sunnah'
  | 'night'
  | 'general'

export interface Reminder {
  id: string
  text: string
  source: string
  kind: 'hadith' | 'quran'
  tags: ReminderTag[]
}

export const REMINDERS: Reminder[] = [
  // Importance of prayer
  {
    id: 'first-accounted',
    kind: 'hadith',
    text: 'The first of a servant’s deeds to be called to account on the Day of Resurrection is his prayer. If it is sound, he has succeeded and prospered; if it is lacking, he has failed and lost.',
    source: 'Jami’ at-Tirmidhi 413',
    tags: ['importance'],
  },
  {
    id: 'river',
    kind: 'hadith',
    text: 'If there were a river at your door and you bathed in it five times a day, would any dirt remain on you? That is the example of the five prayers: through them Allah wipes away sins.',
    source: 'Sahih al-Bukhari 528, Sahih Muslim 667',
    tags: ['importance', 'forgiveness', 'general'],
  },
  {
    id: 'guard-prayers',
    kind: 'quran',
    text: 'Guard strictly the prayers, and the middle prayer, and stand before Allah in devotion.',
    source: 'Qur’an 2:238',
    tags: ['importance', 'asr'],
  },
  {
    id: 'prayer-restrains',
    kind: 'quran',
    text: 'Establish the prayer. Indeed, prayer restrains from shameful deeds and wrongdoing, and the remembrance of Allah is greater.',
    source: 'Qur’an 29:45',
    tags: ['importance', 'general'],
  },
  {
    id: 'remembrance',
    kind: 'quran',
    text: 'Establish the prayer for My remembrance.',
    source: 'Qur’an 20:14',
    tags: ['importance', 'general'],
  },
  {
    id: 'covenant',
    kind: 'hadith',
    text: 'Between a person and disbelief and shirk is abandoning the prayer.',
    source: 'Sahih Muslim 82',
    tags: ['importance'],
  },
  {
    id: 'patience-prayer',
    kind: 'quran',
    text: 'Seek help through patience and prayer. It is indeed hard, except for the humble.',
    source: 'Qur’an 2:45',
    tags: ['general', 'hardship'],
  },

  // Mercy and forgiveness
  {
    id: 'do-not-despair',
    kind: 'quran',
    text: 'Say: O My servants who have wronged themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. He is the Forgiving, the Merciful.',
    source: 'Qur’an 39:53',
    tags: ['forgiveness'],
  },
  {
    id: 'clouds-of-sky',
    kind: 'hadith',
    text: 'Allah says: O son of Adam, as long as you call upon Me and hope in Me, I will forgive you whatever you have done, and I do not mind. O son of Adam, even if your sins reached the clouds of the sky and you then asked My forgiveness, I would forgive you.',
    source: 'Jami’ at-Tirmidhi 3540 (hadith qudsi)',
    tags: ['forgiveness'],
  },
  {
    id: 'best-sinners',
    kind: 'hadith',
    text: 'Every son of Adam errs, and the best of those who err are those who repent.',
    source: 'Jami’ at-Tirmidhi 2499, Sunan Ibn Majah 4251',
    tags: ['forgiveness'],
  },
  {
    id: 'hand-outstretched',
    kind: 'hadith',
    text: 'Allah stretches out His hand at night so that the one who sinned by day may repent, and He stretches out His hand by day so that the one who sinned by night may repent, until the sun rises from the west.',
    source: 'Sahih Muslim 2759',
    tags: ['forgiveness', 'night'],
  },
  {
    id: 'good-erases-bad',
    kind: 'quran',
    text: 'Establish prayer at the two ends of the day and in the early hours of the night. Indeed, good deeds wipe away bad deeds.',
    source: 'Qur’an 11:114',
    tags: ['forgiveness', 'general'],
  },

  // Making up missed prayers
  {
    id: 'forgot-or-slept',
    kind: 'hadith',
    text: 'Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it.',
    source: 'Sahih Muslim 684',
    tags: ['qada', 'forgiveness'],
  },
  {
    id: 'pray-when-remember',
    kind: 'hadith',
    text: 'Whoever forgets a prayer should pray it when he remembers it; there is no expiation for it other than that.',
    source: 'Sahih al-Bukhari 597',
    tags: ['qada'],
  },

  // On time
  {
    id: 'most-beloved',
    kind: 'hadith',
    text: 'I asked the Prophet ﷺ which deed is most beloved to Allah. He said: “Prayer at its proper time.”',
    source: 'Sahih al-Bukhari 527, Sahih Muslim 85',
    tags: ['on_time', 'importance'],
  },
  {
    id: 'timed-prescription',
    kind: 'quran',
    text: 'Indeed, prayer has been decreed upon the believers at fixed times.',
    source: 'Qur’an 4:103',
    tags: ['on_time'],
  },

  // Consistency and encouragement
  {
    id: 'consistent-deeds',
    kind: 'hadith',
    text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    source: 'Sahih al-Bukhari 6464, Sahih Muslim 783',
    tags: ['consistency'],
  },
  {
    id: 'closest-in-sujud',
    kind: 'hadith',
    text: 'The closest a servant is to his Lord is while he is in prostration, so increase your supplication then.',
    source: 'Sahih Muslim 482',
    tags: ['consistency', 'general'],
  },
  {
    id: 'steps-to-masjid',
    kind: 'hadith',
    text: 'Whoever purifies himself at home and then walks to one of the houses of Allah to perform an obligatory prayer, one step wipes away a sin and the other raises him a degree.',
    source: 'Sahih Muslim 666',
    tags: ['jamaah', 'consistency'],
  },

  // Hardship: illness, travel
  {
    id: 'reward-continues',
    kind: 'hadith',
    text: 'When a servant falls ill or travels, the same reward is written for him as he used to earn when he was healthy and at home.',
    source: 'Sahih al-Bukhari 2996',
    tags: ['hardship'],
  },
  {
    id: 'pray-as-able',
    kind: 'hadith',
    text: 'Pray standing. If you cannot, then sitting. If you cannot, then lying on your side.',
    source: 'Sahih al-Bukhari 1117',
    tags: ['hardship'],
  },
  {
    id: 'no-burden',
    kind: 'quran',
    text: 'Allah does not burden a soul beyond what it can bear.',
    source: 'Qur’an 2:286',
    tags: ['hardship', 'forgiveness'],
  },

  // Specific prayers
  {
    id: 'two-cool-prayers',
    kind: 'hadith',
    text: 'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.',
    source: 'Sahih al-Bukhari 574, Sahih Muslim 635',
    tags: ['fajr', 'asr'],
  },
  {
    id: 'missed-asr',
    kind: 'hadith',
    text: 'Whoever misses the Asr prayer, it is as though he has lost his family and his wealth.',
    source: 'Sahih al-Bukhari 552, Sahih Muslim 626',
    tags: ['asr', 'importance'],
  },
  {
    id: 'isha-fajr-jamaah',
    kind: 'hadith',
    text: 'Whoever prays Isha in congregation, it is as if he prayed half the night. Whoever prays Fajr in congregation, it is as if he prayed the whole night.',
    source: 'Sahih Muslim 656',
    tags: ['isha', 'fajr', 'jamaah'],
  },
  {
    id: 'twenty-seven',
    kind: 'hadith',
    text: 'Prayer in congregation is twenty-seven degrees better than prayer offered alone.',
    source: 'Sahih al-Bukhari 645, Sahih Muslim 650',
    tags: ['jamaah'],
  },

  // Sunnah and night prayers
  {
    id: 'twelve-rakahs',
    kind: 'hadith',
    text: 'Whoever prays twelve rak’ahs in a day and night, a house will be built for him in Paradise.',
    source: 'Sahih Muslim 728',
    tags: ['sunnah'],
  },
  {
    id: 'fajr-sunnah',
    kind: 'hadith',
    text: 'The two rak’ahs before Fajr are better than this world and everything in it.',
    source: 'Sahih Muslim 725',
    tags: ['sunnah', 'fajr'],
  },
  {
    id: 'last-third',
    kind: 'hadith',
    text: 'Our Lord descends every night to the lowest heaven when the last third of the night remains, and says: Who is calling upon Me, that I may answer him? Who is asking of Me, that I may give him? Who is seeking My forgiveness, that I may forgive him?',
    source: 'Sahih al-Bukhari 1145, Sahih Muslim 758',
    tags: ['night', 'forgiveness'],
  },
  {
    id: 'witr-last',
    kind: 'hadith',
    text: 'Make Witr the last of your prayers at night.',
    source: 'Sahih al-Bukhari 998, Sahih Muslim 751',
    tags: ['night', 'sunnah'],
  },
]

export function remindersFor(tag: ReminderTag): Reminder[] {
  return REMINDERS.filter((r) => r.tags.includes(tag))
}
