import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

/**
 * Tsinghua, as a short continuous note.
 *
 * This page used to be a full write-up: a four-figure stat strip, five sections
 * in their own tinted bands, a pipeline diagram, a two-card ARIMA/Random Forest
 * comparison and a closing grid of technology chips. It is a summary and two
 * topics now — the 24-hour forecast with its model comparison, and the spatial
 * analysis — on one flat background, in the same `.tech-note-page` column that
 * /projects/almabot and /experience/bloom-mcp already read in.
 *
 * Nothing here is new. The leakage note, the recursive forecast, the MAE
 * comparison and both spatial statistics were all on the page already; what
 * went is the section-by-section framing around them and the closing paragraph
 * that restated the rest. The before and after are in the PR for review.
 *
 * `← About` returns to this role's own entry in the Selected Experience list
 * rather than the top of /about, so you land back where you left.
 */
export default function TsinghuaDetailPage() {
  useRevealOnScroll()

  return (
    <main
      className="page page--secondary project-detail-page tech-note-page"
      aria-label="Tsinghua University"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about#experience-tsinghua">
          ← About
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">Tsinghua University</h1>
          <p className="experience-detail-subtitle">
            Research Assistant, Vehicle Emission Research Group · Spatiotemporal Modeling and
            Forecasting · Jul 2024 – Jan 2025
          </p>
          <p className="about-body project-detail-prose">
            From 30 days of vehicle-emission time-series data — monitoring-site measurements,
            vehicle kilometers traveled, vehicle type and location — I built a pipeline that
            forecasts emissions a day ahead and examines where they concentrate.
          </p>
        </div>
      </header>

      <section className="project-detail-motivation reveal" aria-labelledby="tsinghua-forecast">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="tsinghua-forecast" className="about-headline project-detail-section-title">
              Forecasting 24 hours out
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I turned the previous 30 days of observations into lagged, seasonal and contextual
              features — vehicle type, time-of-day patterns, detected change points — and forecast
              recursively, each predicted hour feeding the input for the next until a full 24 hours
              is covered. The data is split by time rather than at random, so nothing in the
              training set comes from after the period being predicted. I benchmarked a Random
              Forest against an ARIMA baseline on out-of-sample MAE. Random Forest suited this
              dataset better because the forecast depended on more than the emission series itself:
              it could use vehicle type and time of day alongside the lagged values, where the
              baseline worked from the historical series alone.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-approach reveal" aria-labelledby="tsinghua-spatial">
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2 id="tsinghua-spatial" className="about-headline project-detail-section-title">
              Where emissions concentrate
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Forecasting answers when emissions rise; the group also needed to know where. I used
              Moran&apos;s I to test for global spatial autocorrelation — whether nearby locations
              hold similar values more often than chance — and Getis-Ord Gi* to pick out local
              clusters of unusually high or low values. Both were run with GeoPandas, so the hot
              spots the group took forward were identified statistically rather than read off a map.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
