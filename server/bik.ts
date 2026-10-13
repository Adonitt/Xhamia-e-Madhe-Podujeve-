import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { DailyPrayerTimes } from '../src/config'

export const BIK_YEAR = 2026
export const BIK_PDF_URL = 'https://dituriaislame.com/wp-content/uploads/2026/01/takvimi2026vaktet.pdf'

export type BikHoliday = { date: string; nameSq: string; nameEn: string }
export type BikDayResponse = { schedule: DailyPrayerTimes; holidays: BikHoliday[]; sourceUrl: string }

async function loadPdf() {
  const response = await fetch(BIK_PDF_URL, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error(`BIK PDF returned ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length < 10000 || bytes.length > 5_000_000) throw new Error('Unexpected BIK PDF size')
  return getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise
}

let pdfPromise: ReturnType<typeof loadPdf> | null = null
const documentForYear = () => {
  if (!pdfPromise) pdfPromise = loadPdf().catch((error) => { pdfPromise = null; throw error })
  return pdfPromise
}

const clock = (minutes: number): string => {
  const value = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

const minutes = (time: string): number => {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time)
  if (!match) throw new Error(`Invalid BIK time: ${time}`)
  return Number(match[1]) * 60 + Number(match[2])
}

function parseDate(date: string) {
  const match = /^(2026)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(date)
  if (!match) throw new Error('Date must be within 2026')
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
  if (new Date(Date.UTC(year, month - 1, day)).getUTCMonth() !== month - 1) throw new Error('Invalid calendar date')
  return { year, month, day }
}

export async function getBikDay(date: string): Promise<DailyPrayerTimes> {
  const { month, day } = parseDate(date)
  const pdf = await documentForYear()
  const page = await pdf.getPage(9 + (month - 1) * 2)
  const { items } = await page.getTextContent()
  const textItems = items.filter((item) => 'str' in item)
  const dayItem = textItems.find((item) => item.str.trim() === String(day) && item.transform[4] < 45 && item.transform[5] > 25 && item.transform[5] < 340)
  if (!dayItem) throw new Error(`BIK row missing for ${date}`)
  const rowText = textItems
    .filter((item) => Math.abs(item.transform[5] - dayItem.transform[5]) < 0.4)
    .sort((a, b) => a.transform[4] - b.transform[4])
    .map((item) => item.str)
    .join(' ')
  const times = [...rowText.matchAll(/\b\d{1,2}[:.]\d{2}\b/g)].map((match) => minutes(match[0].replace('.', ':')))
  if (times.length !== 8 || times[1] - times[0] !== 20) throw new Error(`BIK row could not be validated for ${date}`)

  const [baseImsak, , baseSunrise, baseDhuhr, baseAsr, baseMaghrib, baseIsha] = times
  const imsak = baseImsak
  const sunrise = baseSunrise

  // Use the Takvim's printed times unchanged. The mosque's requested Sabah
  // rule is 30 minutes after Imsak; its adhan is 30 minutes before sunrise.
  return {
    date,
    begins: {
      fajr: clock(imsak + 30),
      dhuhr: clock(baseDhuhr),
      asr: clock(baseAsr),
      maghrib: clock(baseMaghrib),
      isha: clock(baseIsha),
    },
    sunrise: clock(sunrise),
    imsak: clock(imsak),
    fajrAdhan: clock(sunrise - 30),
    congregation: {},
    verifiedBy: 'Takvimi 2026 i BIK-ut',
    source: 'bik',
  }
}

const holidayEnglish: Record<string, string> = {
  '2026-01-15': 'Night of Miraj',
  '2026-02-02': 'Night of Bara’at',
  '2026-02-19': 'First day of Ramadan',
  '2026-03-07': 'Day of Badr',
  '2026-03-16': 'Night of Qadr',
  '2026-03-19': 'Eid al-Fitr Eve',
  '2026-03-20': 'Eid al-Fitr',
  '2026-05-26': 'Eid al-Adha Eve',
  '2026-05-27': 'Eid al-Adha',
  '2026-06-16': 'Hijri New Year 1448',
  '2026-06-25': 'Day of Ashura',
  '2026-08-24': 'Mawlid Night',
  '2026-12-10': 'Night of Raghaib',
}

export async function getBikHolidays(): Promise<BikHoliday[]> {
  const pdf = await documentForYear()
  const page = await pdf.getPage(7)
  const { items } = await page.getTextContent()
  const holidays: BikHoliday[] = []
  for (const item of items) {
    if (!('str' in item)) continue
    const match = /^-\s*(.+?)\s*\.{3,}\s*(\d{2})\.(\d{2})\.(2026)\s*-/.exec(item.str.trim())
    if (!match) continue
    const date = `${match[4]}-${match[3]}-${match[2]}`
    const nameSq = match[1].trim()
    holidays.push({ date, nameSq, nameEn: holidayEnglish[date] ?? nameSq })
  }
  if (holidays.length !== 13) throw new Error('BIK holiday list could not be validated')
  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getBikDate(date: string): Promise<BikDayResponse> {
  const [schedule, holidays] = await Promise.all([getBikDay(date), getBikHolidays()])
  return { schedule, holidays, sourceUrl: BIK_PDF_URL }
}
