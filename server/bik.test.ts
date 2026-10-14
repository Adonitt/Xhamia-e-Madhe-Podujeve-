import { expect, it } from 'vitest'
import { getBikDate, getBikDay } from './bik'

it('reads the BIK day without a city minute adjustment', async () => {
  const result = await getBikDate('2026-10-13')
  expect(result.schedule).toMatchObject({
    begins: { fajr: '05:38', dhuhr: '12:26', asr: '15:36', maghrib: '18:06', isha: '19:36' },
    imsak: '05:08', fajrAdhan: '06:08', sunrise: '06:38',
  })
  expect(Object.keys(result).sort()).toEqual(['schedule', 'sourceUrl'])
})

it('reads every day of 2026, including the daylight saving change', async () => {
  for (let date = new Date('2026-01-01T12:00:00Z'); date.getUTCFullYear() === 2026; date.setUTCDate(date.getUTCDate() + 1)) {
    const key = date.toISOString().slice(0, 10)
    const schedule = await getBikDay(key)
    expect(schedule.date).toBe(key)
    expect(schedule.begins.fajr).toMatch(/^\d\d:\d\d$/)
  }
  expect((await getBikDay('2026-10-25')).begins.dhuhr).toBe('11:24')
})
