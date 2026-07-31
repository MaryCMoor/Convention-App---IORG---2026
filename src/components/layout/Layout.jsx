import { Outlet } from 'react-router-dom'
import Header from './Header'
import './Layout.css'

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content" role="main">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-logo">
            <span>🦁</span>
            <span>103rd Grand Assembly</span>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#schedule" className="footer-link">Schedule</a>
            <a href="#meals" className="footer-link">Meals</a>
            <a href="#maps" className="footer-link">Maps</a>
            <a href="#directory" className="footer-link">Directory</a>
            <a href="#documents" className="footer-link">Documents</a>
            <a href="#contact" className="footer-link">Contact</a>
          </nav>
          <p className="footer-copyright">
            &copy; 2026 International Order of Rainbow for Girls — The Greatest Showman Convention
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout