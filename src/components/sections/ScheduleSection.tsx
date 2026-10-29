import { Link } from 'react-router-dom'
import { pagePath, type Locale } from '../../content'
import { mosqueConfig, type DailyPrayerTimes } from '../../config'
import { isFridayDate, kosovoDateKey, nextPrayer, type PrayerEventKey } from '../../prayer'
import { fridayDateOnOrAfter, fridayPrayerTimeFromDhuhr } from '../../friday'
import type { BikFriday } from '../../../server/bik'
import type { Copy } from '../../types'
import { formattedToday } from '../../utils/date'
import { ArrowIcon } from '../shared/Icons'
import { SectionHeading } from '../shared/SectionHeading'

const prayerRows: Array<PrayerEventKey | 'imsak' | 'sunrise'> = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

function PrayerTable({ locale, t, now, date, schedules, status }: { locale: Locale; t: Copy; now: Date; date: string; schedules: DailyPrayerTimes[]; status: 'loading' | 'ready' | 'error' }) {
  const schedule = schedules.find((item) => item.date === date)
  const next = date === kosovoDateKey(now) ? nextPrayer(now, schedules) : null
  const fridayTime = schedule && isFridayDate(date) ? fridayPrayerTimeFromDhuhr(schedule.begins.dhuhr) : null
  const rows = fridayTime ? [...prayerRows.slice(0, 4), 'jumuah' as const, ...prayerRows.slice(4)] : prayerRows
  return <div className="schedule-wrap">
    <div className="schedule-date">{formattedToday(new Date(`${date}T12:00:00Z`), locale)}</div>
    <div className="table-scroll"><table className="schedule-table"><caption className="sr-only">{t.scheduleHeading}</caption><thead><tr><th scope="col">{locale === 'sq' ? 'Vakti' : 'Time'}</th><th scope="col">{t.starts}</th></tr></thead><tbody>
      {rows.map((key) => {
        const active = next?.date === schedule?.date && next?.key === key
        const begins = key === 'imsak' ? schedule?.imsak : key === 'sunrise' ? schedule?.sunrise : key === 'jumuah' ? fridayTime : schedule?.begins[key]
        return <tr className={active ? 'next-row' : ''} key={key}><th scope="row">{key === 'imsak' ? t.imsak : key === 'jumuah' ? t.fridayTitle : t.prayerNames[key]}{active && <span className="row-next-dot" aria-label={t.nextPrayer} />}</th><td>{begins ?? '—'}{key === 'fajr' && schedule?.fajrAdhan && <small className="row-adhan">{t.adhan} {schedule.fajrAdhan}</small>}</td></tr>
      })}
    </tbody></table></div>
    <p className="source-note">{schedule ? (schedule.source === 'bik' ? t.bikSourceNote : `${t.verified}: ${schedule.verifiedBy}`) : status === 'loading' ? t.scheduleLoading : t.sourceNote}</p>
    {schedule?.imsak && <p className="fajr-note">{t.fajrRule}</p>}
  </div>
}

function FridayCard({ locale, t, date, friday, status }: { locale: Locale; t: Copy; date: string; friday: BikFriday | null; status: 'loading' | 'ready' | 'error' }) {
  const shownFriday = friday?.date === fridayDateOnOrAfter(date) ? friday : null
  return <div className="friday-card">
    <div className="friday-top"><span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.fridayEyebrow}</span><span className="friday-star" aria-hidden="true">✧</span></div>
    <h3>{t.fridayTitle}</h3>
    {shownFriday ? <>
      <time className="friday-date" dateTime={shownFriday.date}>{formattedToday(new Date(`${shownFriday.date}T12:00:00Z`), locale)}</time>
      <div className="friday-single-time"><span>{t.fridayTimeLabel}</span><strong>{shownFriday.prayerTime}</strong></div>
      <p>{t.fridayFixedNote}</p>
    </> : <p className="friday-unavailable">{status === 'loading' ? t.scheduleLoading : t.fridayUnavailable}</p>}
  </div>
}

export function ScheduleSection({ locale, t, now, date, onDateChange, schedules, friday, status, sourceUrl, full = false }: { locale: Locale; t: Copy; now: Date; date: string; onDateChange: (value: string) => void; schedules: DailyPrayerTimes[]; friday: BikFriday | null; status: 'loading' | 'ready' | 'error'; sourceUrl?: string; full?: boolean }) {
  const shiftDate = (days: number) => {
    const next = new Date(`${date}T12:00:00Z`)
    next.setUTCDate(next.getUTCDate() + days)
    const key = next.toISOString().slice(0, 10)
    if (key >= '2026-01-01' && key <= '2026-12-31') onDateChange(key)
  }
  const chooseDate = (value: string) => {
    if (value >= '2026-01-01' && value <= '2026-12-31') onDateChange(value)
  }
  return <section className={full ? 'section section-schedule section-page' : 'section section-schedule'} id="schedule">
    <div className="container">
      <SectionHeading eyebrow={full ? t.scheduleYearEyebrow : t.today} title={full ? t.scheduleYearHeading : t.scheduleHeading} intro={full ? t.scheduleYearIntro : t.scheduleIntro} action={!full && <Link className="text-link" to={pagePath(locale, 'orari')}>{t.fullSchedule}<ArrowIcon /></Link>} />
      {full && <div className="date-selector"><div><label htmlFor="prayer-date">{t.datePickerLabel}</label><span>{t.yearRange}</span></div><div className="date-controls"><button type="button" aria-label={locale === 'sq' ? 'Dita e mëparshme' : 'Previous day'} disabled={date <= '2026-01-01'} onClick={() => shiftDate(-1)}>‹</button><input id="prayer-date" type="date" min="2026-01-01" max="2026-12-31" value={date} onInput={(event) => chooseDate(event.currentTarget.value)} onChange={(event) => chooseDate(event.currentTarget.value)} /><button type="button" aria-label={locale === 'sq' ? 'Dita e ardhshme' : 'Next day'} disabled={date >= '2026-12-31'} onClick={() => shiftDate(1)}>›</button><button type="button" className="today-control" onClick={() => onDateChange(kosovoDateKey(now))}>{t.todayButton}</button></div></div>}
      <div className="schedule-grid"><PrayerTable locale={locale} t={t} now={now} date={date} schedules={schedules} status={status} /><FridayCard locale={locale} t={t} date={date} friday={friday} status={status} /></div>
      <a className="source-link" href={sourceUrl ?? mosqueConfig.bikCalendarUrl} target="_blank" rel="noopener noreferrer">{t.sourceBik}<ArrowIcon diagonal /></a>
    </div>
  </section>
}
