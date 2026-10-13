import { afterEach, describe, expect, it } from 'vitest'
import { mosqueConfig, type DailyPrayerTimes } from './config'
import { formatCountdown, isFriday, kosovoDateKey, nextPrayer, todaySchedule } from './prayer'

const day = (date: string): DailyPrayerTimes => ({
  date,
  begins: { fajr: '05:00', dhuhr: '12:30', asr: '15:30', maghrib: '18:00', isha: '19:30' },
  sunrise: '06:30',
  congregation: { fajr: '05:20', dhuhr: '12:45', asr: '15:45', maghrib: '18:05', isha: '19:45' },
  verifiedBy: 'Test',
})

afterEach(() => mosqueConfig.prayerTimes.splice(0))

describe('Kosovo prayer dates', () => {
  it('uses the Kosovo calendar day and Friday at local midnight', () => {
    expect(kosovoDateKey(new Date('2026-10-15T22:30:00Z'))).toBe('2026-10-16')
    expect(isFriday(new Date('2026-10-15T22:30:00Z'))).toBe(true)
  })

  it('shows an honest pending state when no verified day exists', () => {
    expect(todaySchedule(new Date('2026-10-13T12:00:00Z'))).toBeUndefined()
    expect(nextPrayer(new Date('2026-10-13T12:00:00Z'))).toBeNull()
  })

  it('finds tomorrow’s Fajr after the final prayer today', () => {
    mosqueConfig.prayerTimes.push(day('2026-10-13'), day('2026-10-14'))
    const next = nextPrayer(new Date('2026-10-13T21:30:00Z'))
    expect(next?.date).toBe('2026-10-14')
    expect(next?.key).toBe('fajr')
    expect(next?.remainingSeconds).toBe(5.5 * 3600)
    expect(formatCountdown(next!.remainingSeconds)).toBe('05:30:00')
  })

  it('accounts for Kosovo daylight saving time', () => {
    mosqueConfig.prayerTimes.push(day('2026-03-29'))
    const next = nextPrayer(new Date('2026-03-29T01:30:00Z'))
    expect(next?.key).toBe('fajr')
    expect(next?.remainingSeconds).toBe(90 * 60)
  })
})
