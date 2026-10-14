export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export type DailyPrayerTimes = {
  /** YYYY-MM-DD in Kosovo local time. */
  date: string
  begins: Record<PrayerKey, string>
  sunrise: string
  imsak?: string
  fajrAdhan?: string
  verifiedBy: string
  source?: 'bik'
}

export const mosqueConfig = {
  name: 'Xhamia e Madhe',
  city: 'Podujevë',
  address: 'W53X+VJJ, Rruga Ali Ajeti, Podujevë 11000, Kosovë',
  addressEn: 'W53X+VJJ, Rruga Ali Ajeti, Podujevë 11000, Kosovo',
  /** Add real mosque photos to public/photos, then set paths such as '/photos/ballina.jpg'. */
  heroPhotoUrl: null as string | null,
  aboutPhotoUrl: null as string | null,
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=W53X%2BVJJ%2C%20Rruga%20Ali%20Ajeti%2C%20Podujev%C3%AB%2011000%2C%20Kosovo',
  mapEmbedUrl: 'https://www.google.com/maps?q=W53X%2BVJJ%2C%20Rruga%20Ali%20Ajeti%2C%20Podujev%C3%AB%2011000%2C%20Kosovo&output=embed',
  /** Add only the official, mosque-confirmed donation URL. */
  donationUrl: null as string | null,
  bikCalendarUrl: 'https://bislame.net/takvimi/',
  /** Optional mosque-approved overrides; BIK daily times load automatically through /api/prayer-times. */
  prayerTimes: [] as DailyPrayerTimes[],
}
