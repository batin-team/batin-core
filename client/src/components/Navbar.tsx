import React, { useState, useEffect } from 'react';
import { MapPin, X, LogOut, LayoutDashboard, Shield, Menu, Calendar } from 'lucide-react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import MySessionsModal from './MySessionsModal';


interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  
  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const role = 'CLIENT';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sessions Modal State
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('h2h_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('h2h_user');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authTab === 'login') {
        const res = await authService.login({ email, password });
        const loggedUser = res.data.user;
        // Mock full name for display if not returned
        loggedUser.fullName = email.split('@')[0];
        localStorage.setItem('h2h_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthOpen(false);
        // Clear forms
        setEmail('');
        setPassword('');
      } else {
        await authService.register({ email, password, role, fullName });
        setSuccessMsg(lang === 'en' ? 'Registration successful! Please log in.' : 'Pendaftaran berhasil! Silakan masuk.');
        setAuthTab('login');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || t('authFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path.startsWith('#')) return;
    navigate(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          {/* Logo brand */}
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
            <MapPin className="icon" size={28} strokeWidth={2.5} color="var(--primary)" />
            <span style={{ fontWeight: 800 }}>{t('brandName')}</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-desktop-row" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-links" style={{ display: 'flex', listStyle: 'none', alignItems: 'center', gap: '1.8rem' }}>
              <li><button className="nav-link-btn" onClick={() => handleNavClick('/directory')}>{t('navLayanan')}</button></li>
              <li><button className="nav-link-btn" onClick={() => handleNavClick('/directory')}>{t('navPsikolog')}</button></li>
              <li><button className="nav-link-btn" onClick={() => handleNavClick('#')}>{t('navArtikel')}</button></li>
              <li><button className="nav-link-btn" onClick={() => handleNavClick('#')}>{t('navTentangKami')}</button></li>
            </ul>

            <div className="nav-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {user ? (
                <React.Fragment>
                  <span className="user-greeting" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {t('greetUser')}<strong>{user.fullName || user.email.split('@')[0]}</strong>
                  </span>
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <button className="btn-dashboard-nav" onClick={() => handleNavClick('/admin')}>
                      <LayoutDashboard size={16} /> {t('adminPanel')}
                    </button>
                  )}
                  {(user.role === 'PROVIDER' || user.role === 'PSYCHOLOGIST') && (
                    <button className="btn-dashboard-nav" onClick={() => handleNavClick('/provider/dashboard')}>
                      <LayoutDashboard size={16} /> {t('psychologistPanel')}
                    </button>
                  )}
                  {(user.role === 'CORPORATE' || user.role === 'PARTNER') && (
                    <button className="btn-dashboard-nav" onClick={() => handleNavClick('/corporate/portal')}>
                      <LayoutDashboard size={16} /> {t('corporatePortal')}
                    </button>
                  )}
                  {user.role === 'CLIENT' && (
                    <button className="btn-dashboard-nav" onClick={() => setIsSessionsOpen(true)}>
                      <Calendar size={16} /> {lang === 'en' ? 'My Sessions' : 'Sesi Saya'}
                    </button>
                  )}
                  <button className="btn-logout-nav" onClick={handleLogout} aria-label={t('logout')}>
                    <LogOut size={18} />
                  </button>
                </React.Fragment>
              ) : (
                <button className="btn-login-text" onClick={() => { setIsAuthOpen(true); setAuthTab('login'); }} style={{ background: 'transparent', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer', border: 'none', fontSize: '0.95rem' }}>
                  {t('login')}
                </button>
              )}

              {/* Main solid Blue CTA button */}
              <button className="btn-primary-blue" onClick={() => handleNavClick('/directory')} style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', border: 'none', fontSize: '0.95rem' }}>
                {t('navMulaiKonseling')}
              </button>

              {/* Language Selector Pill */}
              <div className="lang-selector-pill">
                <button 
                  className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLang('en')}
                >
                  EN
                </button>
                <button 
                  className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
                  onClick={() => setLang('id')}
                >
                  ID
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Actions (Hamburger Menu & Lang Switcher) */}
          <div className="nav-mobile-actions">
            <div className="lang-selector-pill mobile-lang">
              <button 
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <button 
                className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
                onClick={() => setLang('id')}
              >
                ID
              </button>
            </div>
            <button 
              className="btn-hamburger" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Glassmorphic Navigation Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer animate-slide-down">
          <ul className="mobile-nav-links">
            <li>
              <button className="mobile-nav-btn" onClick={() => handleNavClick('/directory')}>
                {t('navLayanan')}
              </button>
            </li>
            <li>
              <button className="mobile-nav-btn" onClick={() => handleNavClick('/directory')}>
                {t('navPsikolog')}
              </button>
            </li>
            <li>
              <button className="mobile-nav-btn" onClick={() => handleNavClick('#')}>
                {t('navArtikel')}
              </button>
            </li>
            <li>
              <button className="mobile-nav-btn" onClick={() => handleNavClick('#')}>
                {t('navTentangKami')}
              </button>
            </li>
            {user ? (
              <React.Fragment>
                <li className="mobile-user-greeting">
                  {t('greetUser')}<strong>{user.fullName || user.email.split('@')[0]}</strong>
                </li>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <li>
                    <button className="mobile-btn-dashboard" onClick={() => handleNavClick('/admin')}>
                      <LayoutDashboard size={16} /> {t('adminPanel')}
                    </button>
                  </li>
                )}
                {(user.role === 'PROVIDER' || user.role === 'PSYCHOLOGIST') && (
                  <li>
                    <button className="mobile-btn-dashboard" onClick={() => handleNavClick('/provider/dashboard')}>
                      <LayoutDashboard size={16} /> {t('psychologistPanel')}
                    </button>
                  </li>
                )}
                {(user.role === 'CORPORATE' || user.role === 'PARTNER') && (
                  <li>
                    <button className="mobile-btn-dashboard" onClick={() => handleNavClick('/corporate/portal')}>
                      <LayoutDashboard size={16} /> {t('corporatePortal')}
                    </button>
                  </li>
                )}
                {user.role === 'CLIENT' && (
                  <li>
                    <button className="mobile-btn-dashboard" onClick={() => { setIsMobileMenuOpen(false); setIsSessionsOpen(true); }}>
                      <Calendar size={16} /> {lang === 'en' ? 'My Sessions' : 'Sesi Saya'}
                    </button>
                  </li>
                )}
                <li>
                  <button className="mobile-btn-logout" onClick={handleLogout}>
                    <LogOut size={16} /> {t('logout')}
                  </button>
                </li>
              </React.Fragment>
            ) : (
              <li>
                <button className="mobile-btn-login" onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); setAuthTab('login'); }}>
                  {t('login')}
                </button>
              </li>
            )}
            <li style={{ marginTop: '1rem' }}>
              <button className="btn-primary-blue" onClick={() => { setIsMobileMenuOpen(false); handleNavClick('/directory'); }} style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: '700', width: '100%', border: 'none' }}>
                {t('navMulaiKonseling')}
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Authentication Modal Dialog */}
      {isAuthOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="modal-content auth-modal">
            <button className="close-btn" onClick={() => setIsAuthOpen(false)} aria-label="Close authentication modal"><X size={24} /></button>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                {t('login')}
              </button>
              <button 
                className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                {lang === 'en' ? 'Register' : 'Daftar'}
              </button>
            </div>

            <h2 id="auth-modal-title" className="sr-only">
              {authTab === 'login' ? t('login') : 'Register'}
            </h2>

            {successMsg && <p className="auth-success-msg">{successMsg}</p>}
            {errorMsg && <p className="auth-error-msg">{errorMsg}</p>}

            <form onSubmit={handleAuthSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              {authTab === 'register' && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="auth-fullname" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Full Name' : 'Nama Lengkap'}</label>
                  <input 
                    type="text" 
                    id="auth-fullname" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="John Doe" 
                    required 
                    style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              )}

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="auth-email" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Email Address' : 'Alamat Email'}</label>
                <input 
                  type="email" 
                  id="auth-email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                  style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="auth-password" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Password</label>
                <input 
                  type="password" 
                  id="auth-password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)' }}
                />
              </div>

              {authTab === 'login' && (
                <div className="admin-demo-tip" style={{ display: 'flex', gap: '0.5rem', background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius)', color: 'var(--primary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <Shield size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Developer Demo Mode:</strong>
                    <p>Register as Client, or log in with system seed credentials to explore Admin/Provider/Corporate portals.</p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}>
                {isSubmitting ? (lang === 'en' ? 'Processing...' : 'Memproses...') : authTab === 'login' ? t('login') : (lang === 'en' ? 'Create Account' : 'Daftar Akun')}
              </button>
            </form>
          </div>
        </div>
      )}
      <MySessionsModal isOpen={isSessionsOpen} onClose={() => setIsSessionsOpen(false)} />
    </>
  );
};

export default Navbar;
