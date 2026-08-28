import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

export default function TsinghuaDetailPage() {
  const techRef = useRef(null)
  useRevealOnScroll()

  useEffect(() => {
    const el = techRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e) return
        const on = e.isIntersecting && e.intersectionRatio > 0.15
        document.body.classList.toggle('cursor-dark-surface', on)
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] }
    )

    io.observe(el)
    return () => {
      io.disconnect()
      document.body.classList.remove('cursor-dark-surface')
    }
  }, [])

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-d"
      aria-label="Tsinghua University"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about">
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
            Working from 30 days of time-series records — monitoring sites, vehicle kilometers
            traveled, vehicle type, spatial location — I built a pipeline that forecasts emissions
            24 hours ahead, and a spatial-statistics layer that tells the difference between a noisy
            neighbor and a genuine hot spot.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">30 days</span>
              <span className="detail-stat-label">Of history behind every forecast</span>
            </div>
            <div>
              <span className="detail-stat-num">24</span>
              <span className="detail-stat-label">Hourly steps, forecast recursively</span>
            </div>
            <div>
              <span className="detail-stat-num">RF &gt; ARIMA</span>
              <span className="detail-stat-label">Chosen for external features, not just lags</span>
            </div>
            <div>
              <span className="detail-stat-num">Moran&apos;s I + Gi*</span>
              <span className="detail-stat-label">Confirm, then pinpoint, hot spots</span>
            </div>
          </div>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="tsinghua-context-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="tsinghua-context-heading"
              className="about-headline project-detail-section-title"
            >
              One dataset, three questions
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The same 30-day dataset supported three different questions, each doing different work
              for the group: characterizing what already happened, forecasting what happens next,
              and localizing exactly where it&apos;s concentrated. They call for different tools,
              and treating them as one problem would have blurred all three.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="tsinghua-forecast-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2
              id="tsinghua-forecast-heading"
              className="about-headline project-detail-section-title"
            >
              Forecasting 24 hours out
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The forecast extrapolates the next 24 hours from patterns in the previous 30 days —
              vehicle-type patterns, time-of-day regularities, and detected change points feed in as
              features. Rather than one model predicting all 24 hours directly, the forecast is
              recursive: predict one hour ahead, feed that prediction back in as an input, and
              repeat 24 times to cover the full day.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1180 200"
                role="img"
                aria-label="Thirty days of history become lagged and seasonal features, split strictly by time, then trained into a Random Forest model, which forecasts recursively one hour at a time, 24 times, into a full 24-hour forecast."
              >
                <defs>
                  <marker
                    id="ts-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6.5"
                    markerHeight="6.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill="currentColor"></path>
                  </marker>
                </defs>
                <rect
                  x="20"
                  y="70"
                  width="160"
                  height="60"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="100" y="105" textAnchor="middle" fontSize="12">
                  30 days history
                </text>
                <line
                  x1="180"
                  y1="100"
                  x2="215"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ts-arrow)"
                ></line>
                <rect
                  x="217"
                  y="60"
                  width="200"
                  height="80"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="317" y="92" textAnchor="middle" fontSize="12" fontWeight="600">
                  Lag + seasonal
                </text>
                <text x="317" y="109" textAnchor="middle" fontSize="12" fontWeight="600">
                  features
                </text>
                <line
                  x1="417"
                  y1="100"
                  x2="452"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ts-arrow)"
                ></line>
                <rect
                  x="454"
                  y="60"
                  width="210"
                  height="80"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="559" y="92" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  Time-based split
                </text>
                <text x="559" y="109" textAnchor="middle" fontSize="10" opacity="0.7">
                  train early days /
                </text>
                <text x="559" y="122" textAnchor="middle" fontSize="10" opacity="0.7">
                  hold out last day
                </text>
                <line
                  x1="664"
                  y1="100"
                  x2="699"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ts-arrow)"
                ></line>
                <rect
                  x="701"
                  y="70"
                  width="150"
                  height="60"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="776" y="105" textAnchor="middle" fontSize="12" fontWeight="600">
                  Random Forest
                </text>
                <line
                  x1="851"
                  y1="100"
                  x2="886"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ts-arrow)"
                ></line>
                <rect
                  x="888"
                  y="55"
                  width="270"
                  height="90"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1023" y="82" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  Recursive 1h-ahead
                </text>
                <text x="1023" y="99" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  rollout, ×24
                </text>
                <text x="1023" y="118" textAnchor="middle" fontSize="10" opacity="0.7">
                  → 24-hour forecast
                </text>
              </svg>
            </div>
            <figcaption>
              Thirty days of history become lagged and seasonal features, split strictly by time so
              no training sample sees information from its own evaluation window, then folded one
              hour at a time into a 24-step recursive forecast.
            </figcaption>
          </figure>

          <h3 className="detail-subheading">Guarding against leakage</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The training set can never see anything that wouldn&apos;t actually be available at
              prediction time — an easy mistake to make with time-series data specifically. The fix
              was a time-based split: sliced strictly by date, training on the earlier stretch of
              days and holding out the final day for evaluation, so no training sample and its test
              window ever share information from the future relative to that point.
            </p>
          </div>

          <h3 className="detail-subheading">Choosing Random Forest over ARIMA</h3>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">ARIMA</span>
              <span className="desc">Linear autoregression — sees only its own lagged history</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Random Forest</span>
              <span className="desc">
                Non-linear ensemble — also ingests vehicle type and time-of-day as real features
              </span>
            </div>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              ARIMA is a linear autoregressive model that only sees its own lagged history. Random
              Forest doesn&apos;t carry that linearity assumption, and more importantly, it can
              actually take in external features — vehicle type, time-of-day — alongside the lag
              terms, which is signal ARIMA has no way to use at all. Everything was scored on MAE,
              mean absolute error, because it reads directly as &quot;how far off, on average, in
              the same units as the measurement&quot; rather than needing translation.
            </p>
          </div>

          <h3 className="detail-subheading">Where emission is actually concentrated</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Moran&apos;s I tests whether nearby regions have similar values — confirming that
              spatial clustering exists at all, globally. Getis-Ord Gi* goes further and identifies
              exactly which specific locations form the hot-spot clusters, not just that clustering
              is present somewhere. Run over the spatial dataset in GeoPandas, this prioritized
              which regions were worth flagging as candidates for the group&apos;s regulatory
              follow-up.
            </p>
          </div>

          <div className="detail-callout">
            <strong>What actually mattered.</strong> Three things stood out past the specific
            models: representative data plus a well-designed method beats a fancier model on bad
            data; anomalies need an explicit, checked threshold instead of an eyeballed one; and the
            point of getting this right wasn&apos;t a one-off script — it became a pipeline the rest
            of the group could actually reuse.
          </div>
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="tsinghua-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="tsinghua-technical-heading"
              className="about-headline project-detail-section-title project-detail-section-title--on-dark"
            >
              Technical
            </h2>
          </div>
          <div className="project-tech-grid" aria-label="Technical stack">
            {[
              'Random Forest',
              'ARIMA',
              'time-based cross-validation',
              'recursive forecasting',
              'GeoPandas',
              "Moran's I",
              'Getis-Ord Gi*',
              'MAE',
              'feature engineering',
            ].map((label) => (
              <span key={label} className="project-tech-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
