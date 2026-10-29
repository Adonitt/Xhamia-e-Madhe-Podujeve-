import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pagePath, type Locale } from '../../content'
import { type DailyPrayerTimes } from '../../config'
import { formatCountdown, kosovoDateKey, nextPrayer } from '../../prayer'
import { heroPhotos } from '../../gallery'
import type { Copy } from '../../types'
import { formattedToday } from '../../utils/date'
import { ArchitectureArt, ArrowIcon } from '../shared/Icons'

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

export function Hero({ locale, t, now, schedules, status }: { locale: Locale; t: Copy; now: Date; schedules: DailyPrayerTimes[]; status: 'loading' | 'ready' | 'error' }) {
  const [activePhoto, setActivePhoto] = useState(0)
  useEffect(() => {
    if (heroPhotos.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => setActivePhoto((current) => (current + 1) % heroPhotos.length), 7000)
    return () => window.clearInterval(interval)
  }, [])
  return <section className="hero">
    <div className="hero-background" aria-hidden="true">
      {heroPhotos.map((photo, index) => <img key={photo.src} className={index === activePhoto ? 'hero-background-photo is-active' : 'hero-background-photo'} src={photo.src} alt="" />)}
    </div>
    <div className="hero-pattern" aria-hidden="true" />
    <div className="container hero-grid">
      <div className="hero-copy">
        <span className="eyebrow eyebrow-bronze"><span className="small-diamond" />{t.heroEyebrow}</span>
        <h1>{t.heroTitle}<span>{t.heroCity}</span></h1>
        <p className="hero-lead">{t.heroText}</p>
        <div className="hero-actions">
          <Link className="button button-bronze" to={pagePath(locale, 'orari')}>{t.viewTimes}<ArrowIcon /></Link>
          <Link className="button button-outline" to={`${pagePath(locale, 'rreth')}#gallery`}>{t.nav.gallery}<ArrowIcon /></Link>
        </div>
        <div className="hero-status"><span className="status-dot" />{t.heroCaption}</div>
      </div>
      <div className="hero-visual"><ArchitectureArt /><PrayerCard locale={locale} t={t} now={now} schedules={schedules} status={status} /></div>
    </div>
    <div className="hero-bottom"><div className="container"><span>{t.city}</span><span>{formattedToday(now, locale)}</span></div></div>
  </section>
}
