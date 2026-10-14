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
  address: 'Rruga Merqezi, Podujevë, Kosovë',
  addressEn: 'Rruga Merqezi, Podujevë, Kosovo',
  /** Add real mosque photos to public/photos, then set paths such as '/photos/ballina.jpg'. */
  heroPhotoUrl: null as string | null,
  aboutPhotoUrl: null as string | null,
  /** Replace with the exact, mosque-confirmed map pin before public launch. */
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Xhamia+e+Madhe+Podujeve+Rruga+Merqezi',
  /** Add only the official, mosque-confirmed donation URL. */
  donationUrl: null as string | null,
  bikCalendarUrl: 'https://bislame.net/takvimi/',
  /** Optional mosque-approved overrides; BIK daily times load automatically through /api/prayer-times. */
  prayerTimes: [] as DailyPrayerTimes[],
}
