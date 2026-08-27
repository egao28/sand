import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CustomCursor from './components/CustomCursor.jsx'
import NavBar from './components/NavBar.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import ExperienceDetailPage from './pages/ExperienceDetailPage.jsx'
import BloomMcpDetailPage from './pages/BloomMcpDetailPage.jsx'
import ResumePage from './pages/ResumePage.jsx'
import { siteContent } from './data/siteContent.js'

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <NavBar items={siteContent.nav.items} />

      <div className="page-root">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/experience/bloom-mcp" element={<BloomMcpDetailPage />} />
          <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/contact" element={<Navigate to="/#contact" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
