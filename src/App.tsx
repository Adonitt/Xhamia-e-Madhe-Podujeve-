import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, useLocation } from 'react-router-dom'
import { copy, pagePath, resolveRoute, type Locale, type PageKey } from './content'
import { mosqueConfig, type DailyPrayerTimes } from './config'
import { events, notices } from './data'
import { formatCountdown, isFridayDate, kosovoDateKey, nextPrayer, type PrayerEventKey } from './prayer'
import { fridayDateOnOrAfter, fridayPrayerTimeFromDhuhr } from './friday'
import { useBikData } from './useBikData'
import type { BikFriday } from '../server/bik'

type Copy = typeof copy.sq
const navPages: PageKey[] = ['orari', 'aktivitetet', 'njoftimet', 'rreth', 'vizita']

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 16 16 4M6 4h10v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )
}

function ArchMark({ large = false }: { large?: boolean }) {
  return <svg className={large ? 'arch-mark arch-mark-large' : 'arch-mark'} aria-hidden="true" viewBox="0 0 72 80" fill="none">
    <path d="M7 73V32C7 18 18 7 36 2c18 5 29 16 29 30v41" stroke="currentColor" strokeWidth="2.5" />
    <path d="M15 73V34c0-10 7-18 21-23 14 5 21 13 21 23v39" stroke="currentColor" strokeWidth="1.5" />
    <path d="M27 73V40c0-6 3-11 9-14 6 3 9 8 9 14v33" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 73h58" stroke="currentColor" strokeWidth="2.5" />
  </svg>
}

function ArchitectureArt() {
  return <div className="architecture-art" aria-hidden="true">
    <div className="architecture-disc" />
    <div className="architecture-lines">
      <span /><span /><span /><span /><span />
    </div>
    <svg viewBox="0 0 640 460" className="architecture-svg" fill="none" preserveAspectRatio="xMidYMax meet">
      <path d="M20 460V245C20 150 76 80 158 48c82 32 138 102 138 197v215" />
      <path d="M72 460V249c0-64 30-112 86-144 56 32 86 80 86 144v211" />
      <path d="M124 460V264c0-28 12-51 34-67 22 16 34 39 34 67v196" />
      <path d="M293 460V194C293 91 359 18 461 0c102 18 168 91 168 194v266" />
      <path d="M345 460V199c0-72 42-122 116-147 74 25 116 75 116 147v261" />
      <path d="M397 460V218c0-36 24-67 64-82 40 15 64 46 64 82v242" />
      <path d="M0 459h640" />
      <path d="M461 0V-34" />
    </svg>
  </div>
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])
  return now
}

function formattedToday(now: Date, locale: Locale) {
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Belgrade', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(now)
  }
  const raw = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Belgrade', weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric',
  }).formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes) => raw.find((item) => item.type === type)?.value ?? ''
  const weekdays: Record<string, string> = {
    Sunday: 'E diel', Monday: 'E hënë', Tuesday: 'E martë', Wednesday: 'E mërkurë',
    Thursday: 'E enjte', Friday: 'E premte', Saturday: 'E shtunë',
  }
  const months = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor']
  return `${weekdays[part('weekday')]}, ${part('day')} ${months[Number(part('month')) - 1]} ${part('year')}`
}

function Header({ locale, page, t }: { locale: Locale; page: PageKey; t: Copy }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname, location.search])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  const other: Locale = locale === 'sq' ? 'en' : 'sq'
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to={pagePath(locale, 'home')} aria-label={`${mosqueConfig.name} — ${t.nav.home}`}>
          <ArchMark />
          <span className="brand-text"><strong>{locale === 'sq' ? 'Xhamia e Madhe' : 'The Grand Mosque'}</strong><small>{t.brandTag}</small></span>
        </Link>
        <nav id="main-navigation" className={open ? 'main-nav main-nav-open' : 'main-nav'} aria-label={locale === 'sq' ? 'Navigimi kryesor' : 'Main navigation'}>
          {navPages.map((key) => <Link key={key} className={page === key ? 'nav-link active' : 'nav-link'} to={pagePath(locale, key)} aria-current={page === key ? 'page' : undefined}>{t.nav[key]}</Link>)}
          <Link className="nav-donate mobile-only" to={pagePath(locale, 'kontribuo')}>{t.nav.kontribuo}</Link>
        </nav>
        <div className="header-actions">
          <Link className="lang-switch" to={pagePath(other, page)} lang={other} aria-label={locale === 'sq' ? 'Switch to English' : 'Kalo në shqip'}>{other.toUpperCase()}</Link>
          <Link className="button button-bronze header-donate" to={pagePath(locale, 'kontribuo')}>{t.nav.kontribuo} <ArrowIcon diagonal /></Link>
          <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? t.closeMenu : t.menu} onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  </>
}

function PrayerCard({ locale, t, now, schedules, status }: { locale: Locale; t: Copy; now: Date; schedules: DailyPrayerTimes[]; status: 'loading' | 'ready' | 'error' }) {
  const next = nextPrayer(now, schedules)
  const fajrAdhan = next?.key === 'fajr' ? schedules.find((item) => item.date === next.date)?.fajrAdhan : undefined
  const hasToday = schedules.some((item) => item.date === kosovoDateKey(now))
  const missingTitle = status === 'loading' ? t.scheduleLoading : hasToday ? t.dayComplete : t.schedulePending
  const missingText = hasToday ? t.dayCompleteText : t.schedulePendingText
  return <div className="prayer-card">
    <div className="prayer-card-top"><span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.nextPrayer}</span><span className="card-orbit" aria-hidden="true">✦</span></div>
    {next ? <>
      <h2 className="prayer-card-title">{next.key === 'jumuah' ? t.fridayTitle : t.prayerNames[next.key]}</h2>
      <div className="prayer-card-times"><div><small>{next.key === 'jumuah' ? t.fridayTimeLabel : t.starts}</small><strong>{next.begins}</strong></div>{fajrAdhan && <div><small>{t.adhan}</small><strong>{fajrAdhan}</strong></div>}</div>
      <div className="countdown"><span>{t.remaining}</span><strong aria-live="off">{formatCountdown(next.remainingSeconds)}</strong></div>
    </> : <>
      <h2 className="prayer-card-title pending-title">{missingTitle}</h2>
      <p className="prayer-pending-text">{status === 'loading' ? '' : missingText}</p>
      <Link className="text-link light-link" to={pagePath(locale, 'orari')}>{t.viewTimes}<ArrowIcon /></Link>
    </>}
  </div>
}

function Hero({ locale, t, now, schedules, status }: { locale: Locale; t: Copy; now: Date; schedules: DailyPrayerTimes[]; status: 'loading' | 'ready' | 'error' }) {
  return <section className="hero">
    <div className="hero-pattern" aria-hidden="true" />
    <div className="container hero-grid">
      <div className="hero-copy">
        <span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.heroEyebrow}</span>
        <h1>{t.heroTitle}<span>{t.heroCity}</span></h1>
        <p className="hero-lead">{t.heroText}</p>
        <div className="hero-actions">
          <Link className="button button-bronze" to={pagePath(locale, 'orari')}>{t.viewTimes}<ArrowIcon /></Link>
          <Link className="button button-outline" to={pagePath(locale, 'vizita')}>{t.findUs}<ArrowIcon diagonal /></Link>
        </div>
        <div className="hero-status"><span className="status-dot" />{t.heroCaption}</div>
      </div>
      <div className="hero-visual">{mosqueConfig.heroPhotoUrl ? <img className="hero-photo" src={mosqueConfig.heroPhotoUrl} alt={locale === 'sq' ? 'Pamje e Xhamisë së Madhe në Podujevë' : 'The Grand Mosque in Podujevë'} /> : <ArchitectureArt />}<PrayerCard locale={locale} t={t} now={now} schedules={schedules} status={status} /></div>
    </div>
    <div className="hero-bottom"><div className="container"><span>{t.city}</span><span>{formattedToday(now, locale)}</span></div></div>
  </section>
}

function SectionHeading({ eyebrow, title, intro, action }: { eyebrow: string; title: string; intro?: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span className="eyebrow"><span className="small-diamond" />{eyebrow}</span><h2>{title}</h2>{intro && <p>{intro}</p>}</div>{action}</div>
}

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

function ScheduleSection({ locale, t, now, date, onDateChange, schedules, friday, status, sourceUrl, full = false }: { locale: Locale; t: Copy; now: Date; date: string; onDateChange: (value: string) => void; schedules: DailyPrayerTimes[]; friday: BikFriday | null; status: 'loading' | 'ready' | 'error'; sourceUrl?: string; full?: boolean }) {
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

function ProgrammeGrid({ locale, t, full = false }: { locale: Locale; t: Copy; full?: boolean }) {
  const upcoming = events.filter((item) => item.date >= kosovoDateKey(new Date())).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return <section className={full ? 'section section-programmes section-page' : 'section section-programmes'}>
    <div className="container">
      <SectionHeading eyebrow={t.programmesEyebrow} title={t.programmesTitle} intro={t.programmesIntro} action={!full && <Link className="text-link" to={pagePath(locale, 'aktivitetet')}>{t.programmeMore}<ArrowIcon /></Link>} />
      <div className="programme-grid">{t.programmeItems.map((item) => <article className="programme-card" key={item.no}><div className="programme-number">{item.no}</div><div className="programme-icon" aria-hidden="true"><ArchMark /></div><h3>{item.title}</h3><p>{item.text}</p>{full && <span className="programme-timing">{t.programmeTiming}</span>}</article>)}</div>
      {(full || upcoming.length > 0) && <div className="upcoming-block"><h3>{t.upcomingTitle}</h3>{upcoming.length ? <div className="event-grid">{upcoming.slice(0, full ? undefined : 3).map((item) => <article className="event-card" key={item.id}><span className="event-date">{formattedToday(new Date(`${item.date}T12:00:00Z`), locale)} · {item.time}</span><h4>{item.title[locale]}</h4><p>{item.description[locale]}</p><div><strong>{t.eventContact}:</strong> {item.contact}</div></article>)}</div> : <p className="upcoming-empty">{t.upcomingEmpty}</p>}</div>}
    </div>
  </section>
}

function NoticesSection({ locale, t, full = false }: { locale: Locale; t: Copy; full?: boolean }) {
  const published = [...notices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, full ? undefined : 3)
  return <section className={full ? 'section section-notices section-page' : 'section section-notices'}><div className="container notices-grid">
    <SectionHeading eyebrow={t.noticeEyebrow} title={t.noticeTitle} intro={t.noticeText} />
    {published.length ? <div className="notice-list">{published.map((item) => <article className="notice-item" key={item.id}><time dateTime={item.date}>{formattedToday(new Date(`${item.date}T12:00:00Z`), locale)}</time><h3>{item.title[locale]}</h3><p>{item.body[locale]}</p></article>)}{!full && <Link className="text-link" to={pagePath(locale, 'njoftimet')}>{t.nav.njoftimet}<ArrowIcon /></Link>}</div> : <div className="notice-empty"><span className="notice-empty-icon" aria-hidden="true">✦</span><p>{t.noticeEmpty}</p>{!full && <Link className="text-link" to={pagePath(locale, 'njoftimet')}>{t.nav.njoftimet}<ArrowIcon /></Link>}</div>}
  </div></section>
}

function AboutSection({ locale, t, full = false }: { locale: Locale; t: Copy; full?: boolean }) {
  return <section className={full ? 'section section-about section-page' : 'section section-about'}><div className="container about-grid">
    <div className={mosqueConfig.aboutPhotoUrl ? 'about-art about-art-photographed' : 'about-art'} aria-label={mosqueConfig.aboutPhotoUrl ? (locale === 'sq' ? 'Pamje e Xhamisë së Madhe në Podujevë' : 'The Grand Mosque in Podujevë') : (locale === 'sq' ? 'Ilustrim dekorativ i harqeve arkitekturore' : 'Decorative illustration of architectural arches')} role="img">{mosqueConfig.aboutPhotoUrl ? <img className="about-photo" src={mosqueConfig.aboutPhotoUrl} alt="" /> : <><div className="about-art-disc" /><ArchMark large /></>}<span className="art-caption">XHAMIA E MADHE<br />PODUJEVË</span></div>
    <div className="about-copy"><span className="eyebrow"><span className="small-diamond" />{t.aboutEyebrow}</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><blockquote>{t.aboutQuote}</blockquote>{!full && <Link className="button button-dark" to={pagePath(locale, 'rreth')}>{t.aboutMore}<ArrowIcon /></Link>}</div>
  </div></section>
}

function DonationSection({ locale, t, full = false }: { locale: Locale; t: Copy; full?: boolean }) {
  return <section className={full ? 'section section-donation section-page' : 'section section-donation'}><div className="container donation-box">
    <div><span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.donateEyebrow}</span><h2>{t.donateTitle}</h2><p>{t.donateText}</p></div>
    {mosqueConfig.donationUrl ? <a className="button button-bronze" href={mosqueConfig.donationUrl} target="_blank" rel="noopener noreferrer">{t.donateActive}<ArrowIcon diagonal /></a> : <span className="button button-muted" aria-disabled="true">{t.donateButton}</span>}
    {!full && <Link className="donation-detail-link" to={pagePath(locale, 'kontribuo')} aria-label={t.nav.kontribuo}><ArrowIcon /></Link>}
  </div></section>
}

function VisitSection({ locale, t, full = false }: { locale: Locale; t: Copy; full?: boolean }) {
  return <section className={full ? 'section section-visit section-page' : 'section section-visit'}><div className="container visit-grid">
    <div className="visit-copy"><span className="eyebrow"><span className="small-diamond" />{t.visitEyebrow}</span><h2>{t.visitTitle}</h2><p>{t.visitText}</p><div className="visit-detail"><span>{t.addressLabel}</span><strong>{locale === 'sq' ? mosqueConfig.address : mosqueConfig.addressEn}</strong></div><div className="visit-detail"><span>{t.accessLabel}</span><strong>{t.accessText}</strong></div><a className="button button-dark" href={mosqueConfig.mapUrl} target="_blank" rel="noopener noreferrer">{t.mapButton}<ArrowIcon diagonal /></a><small className="map-note">{t.mapNote}</small></div>
    <div className="map-art" aria-hidden="true"><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-road road-four" /><div className="map-pin"><ArchMark /></div><span>PODUJEVË</span></div>
  </div></section>
}

function PageBanner({ t, page }: { t: Copy; page: PageKey }) {
  return <section className="page-banner"><div className="page-banner-pattern" aria-hidden="true" /><div className="container"><span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.city}</span><h1>{t.pageTitles[page]}</h1><p>{t.pageDescriptions[page]}</p></div></section>
}

function Footer({ locale, t }: { locale: Locale; t: Copy }) {
  return <footer className="site-footer"><div className="container footer-grid">
    <div className="footer-brand"><Link className="brand" to={pagePath(locale, 'home')}><ArchMark /><span className="brand-text"><strong>{locale === 'sq' ? 'Xhamia e Madhe' : 'The Grand Mosque'}</strong><small>{t.brandTag}</small></span></Link><p>{t.footerText}</p></div>
    <div><h2>{t.footerExplore}</h2><ul>{(['orari', 'aktivitetet', 'njoftimet', 'rreth'] as PageKey[]).map((key) => <li key={key}><Link to={pagePath(locale, key)}>{t.nav[key]}</Link></li>)}</ul></div>
    <div><h2>{t.footerInfo}</h2><ul><li><Link to={pagePath(locale, 'vizita')}>{t.nav.vizita}</Link></li><li><Link to={pagePath(locale, 'kontribuo')}>{t.nav.kontribuo}</Link></li><li><a href={mosqueConfig.bikCalendarUrl} target="_blank" rel="noopener noreferrer">{t.sourceBik}</a></li></ul></div>
    <div className="footer-address"><span>{t.addressLabel}</span><p>{locale === 'sq' ? mosqueConfig.address : mosqueConfig.addressEn}</p></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {mosqueConfig.name}. {t.copyright}</span><span>Podujevë · Kosovë</span></div></footer>
}

function SiteApp({ locale, page }: { locale: Locale; page: PageKey }) {
  const location = useLocation()
  const t = copy[locale]
  const now = useClock()
  const todayKey = kosovoDateKey(now)
  const [selectedDate, setSelectedDate] = useState(todayKey)
  useEffect(() => setSelectedDate(todayKey), [page, todayKey])
  const requestedDate = page === 'orari' ? selectedDate : todayKey
  const { data: bikData, status: bikStatus } = useBikData(requestedDate)
  const schedules = bikData ? [...mosqueConfig.prayerTimes, bikData.schedule] : mosqueConfig.prayerTimes

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = `${t.pageTitles[page]} · ${locale === 'sq' ? 'Xhamia e Madhe' : 'The Grand Mosque'} · Podujevë`
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.pageDescriptions[page])
    document.querySelectorAll('link[data-i18n]').forEach((node) => node.remove())
    for (const language of ['sq', 'en'] as Locale[]) {
      const alternate = document.createElement('link')
      alternate.rel = 'alternate'
      alternate.hreflang = language
      alternate.href = `${window.location.origin}${pagePath(language, page)}`
      alternate.dataset.i18n = 'true'
      document.head.appendChild(alternate)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [locale, page, location.pathname, location.search, t])

  return <>
    <Header locale={locale} page={page} t={t} />
    <main id="main">
      {page === 'home' ? <><Hero locale={locale} t={t} now={now} schedules={schedules} status={bikStatus} /><ScheduleSection locale={locale} t={t} now={now} date={todayKey} onDateChange={setSelectedDate} schedules={schedules} friday={bikData?.friday ?? null} status={bikStatus} sourceUrl={bikData?.sourceUrl} /><ProgrammeGrid locale={locale} t={t} /><NoticesSection locale={locale} t={t} /><AboutSection locale={locale} t={t} /><DonationSection locale={locale} t={t} /><VisitSection locale={locale} t={t} /></> : <>
        <PageBanner t={t} page={page} />
        {page === 'orari' && <ScheduleSection locale={locale} t={t} now={now} date={selectedDate} onDateChange={setSelectedDate} schedules={schedules} friday={bikData?.friday ?? null} status={bikStatus} sourceUrl={bikData?.sourceUrl} full />}
        {page === 'aktivitetet' && <ProgrammeGrid locale={locale} t={t} full />}
        {page === 'njoftimet' && <NoticesSection locale={locale} t={t} full />}
        {page === 'rreth' && <AboutSection locale={locale} t={t} full />}
        {page === 'vizita' && <VisitSection locale={locale} t={t} full />}
        {page === 'kontribuo' && <DonationSection locale={locale} t={t} full />}
      </>}
    </main>
    <Footer locale={locale} t={t} />
    <div className="mobile-quick"><Link to={pagePath(locale, 'orari')}>{t.nav.orari}</Link><Link to={pagePath(locale, 'vizita')}>{t.nav.vizita}</Link><Link to={pagePath(locale, 'kontribuo')}>{t.nav.kontribuo}</Link></div>
  </>
}

export default function App() {
  return <BrowserRouter><RoutesWrapper /></BrowserRouter>
}

function RoutesWrapper() {
  const location = useLocation()
  const route = resolveRoute(location.pathname, location.search)
  if (route.redirect) return <Navigate to={route.redirect} replace />
  return <SiteApp locale={route.locale} page={route.page} />
}
