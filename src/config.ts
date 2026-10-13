export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export type DailyPrayerTimes = {
  /** YYYY-MM-DD in Kosovo local time. Publish only times confirmed by the mosque. */
  date: string
  begins: Record<PrayerKey, string>
  sunrise: string
  congregation: Partial<Record<PrayerKey, string>>
  verifiedBy: string
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
  /** Add the confirmed Friday khutbah and congregation times. */
  friday: null as null | { khutbah: string; congregation: string },
  bikCalendarUrl: 'https://bislame.net/takvimi/',
  /** Add only verified daily records supplied/approved by the mosque. */
  prayerTimes: [] as DailyPrayerTimes[],
}
