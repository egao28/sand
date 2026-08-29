import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'
import TechChipGrid from '../components/TechChipGrid.jsx'

export default function TsinghuaDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-f"
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
            Using 30 days of vehicle-emission time-series data, including monitoring-site
            measurements, vehicle kilometers traveled, vehicle type, and spatial location, I built a
            pipeline for 24-hour emission forecasting and spatial analysis of emission hot spots.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">30 days</span>
              <span className="detail-stat-label">of history used for forecasting</span>
            </div>
            <div>
              <span className="detail-stat-num">24</span>
              <span className="detail-stat-label">hourly forecast steps</span>
            </div>
            <div>
              <span className="detail-stat-num">RF &gt; ARIMA</span>
              <span className="detail-stat-label">for incorporating external features</span>
            </div>
            <div>
              <span className="detail-stat-num">Moran&apos;s I + Gi*</span>
              <span className="detail-stat-label">for global clustering and local hot spots</span>
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
              The same dataset supported three separate tasks: describing historical emission
              patterns, forecasting emissions for the next 24 hours, and identifying where
              high-emission areas were spatially concentrated.
            </p>
            <p className="about-body project-detail-prose">
              I treated these as separate analysis problems rather than trying to solve all three
              with one model, since each required a different set of assumptions and methods.
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
              I transformed the previous 30 days of observations into lagged, seasonal, and
              contextual features, including vehicle type, time-of-day patterns, and detected change
              points.
            </p>
            <p className="about-body project-detail-prose">
              The forecast is recursive rather than producing all 24 hours at once. The model
              predicts the next hour, uses that prediction as part of the input for the following
              step, and repeats the process until it produces a full 24-hour forecast.
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
                  <DiagramArrowMarker id="ts-arrow" />
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
              Time-series data makes it easy to accidentally train on information that would not
              have been available at the moment of prediction.
            </p>
            <p className="about-body project-detail-prose">
              I therefore split the data strictly by time rather than randomly. Earlier observations
              were used for training and the final period was held out for evaluation, so
              information from the future could not leak into the training set.
            </p>
          </div>

          <h3 className="detail-subheading">Choosing Random Forest over ARIMA</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I compared an ARIMA baseline with a Random Forest model.
            </p>
          </div>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">ARIMA</span>
              <span className="desc">
                Autoregressive baseline based on the series&apos; historical values
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Random Forest</span>
              <span className="desc">
                Non-linear ensemble that can combine lagged values with additional predictors
              </span>
            </div>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Random Forest was a better fit for this dataset because the forecast depended on more
              than the emission series itself. It could incorporate variables such as vehicle type
              and time of day alongside lagged emission features, while the ARIMA baseline I tested
              relied on the historical series.
            </p>
            <p className="about-body project-detail-prose">
              I evaluated the forecasts using mean absolute error (MAE), which reports the average
              prediction error in the same units as the original measurement.
            </p>
          </div>

          <h3 className="detail-subheading">Finding where emissions are concentrated</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Forecasting answers when emissions may increase, but the group also needed to
              understand where elevated emissions were spatially concentrated.
            </p>
            <p className="about-body project-detail-prose">
              I used two spatial statistics for different parts of that question.
            </p>
            <p className="about-body project-detail-prose">
              Moran&apos;s I measures global spatial autocorrelation: whether nearby locations tend
              to have similar emission values more often than would be expected from a random
              spatial pattern.
            </p>
            <p className="about-body project-detail-prose">
              Getis-Ord Gi* identifies local clusters of unusually high or low values, making it
              possible to locate the specific areas contributing to that broader spatial pattern.
            </p>
            <p className="about-body project-detail-prose">
              I ran the spatial analysis with GeoPandas and used the resulting hot spots to identify
              regions that could be prioritized for further investigation by the research group.
            </p>
          </div>

          <h3 className="detail-subheading">From analysis to a reusable pipeline</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The final work combined feature engineering, forecasting, evaluation, and spatial
              statistics into a repeatable analysis pipeline rather than a collection of one-off
              notebooks.
            </p>
            <p className="about-body project-detail-prose">
              That also made several modeling decisions explicit: temporal splits were used to
              prevent leakage, forecast accuracy was evaluated with a fixed metric, and spatial hot
              spots were identified statistically rather than by visually inspecting a map.
            </p>
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
          <TechChipGrid
            chips={[
              'Random Forest',
              'ARIMA',
              'time-series forecasting',
              'recursive forecasting',
              'time-based train/test split',
              'feature engineering',
              'MAE',
              'GeoPandas',
              "Moran's I",
              'Getis-Ord Gi*',
            ]}
          />
        </div>
      </section>
    </main>
  )
}
