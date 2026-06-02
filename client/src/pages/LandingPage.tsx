import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  Clipboard, Sparkles, Calendar, MessageSquare, 
  ArrowRight, Brain, Heart, Users, X, CheckCircle 
} from 'lucide-react';
import { corporateService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [corpName, setCorpName] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpCompany, setCorpCompany] = useState('');
  const [corpMessage, setCorpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await corporateService.submitInquiry({
        name: corpName,
        email: corpEmail,
        company: corpCompany,
        message: corpMessage
      });
      setSubmitSuccess(true);
      setCorpName('');
      setCorpEmail('');
      setCorpCompany('');
      setCorpMessage('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || (lang === 'en' ? 'Failed to submit inquiry.' : 'Gagal mengirimkan formulir.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      
      {/* Hero Section */}
      <header className="hero-section" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, var(--white) 100%)', padding: '5rem 0' }}>
        <div className="container hero-grid">
          <div className="hero-text-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 850, color: 'var(--text-dark)', lineHeight: '1.2', letterSpacing: '-1.5px' }}>
              {t('heroTitlePart1')}
              <span className="highlight" style={{ color: 'var(--primary)' }}>{t('heroTitleHighlight')}</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-light)', lineHeight: '1.7', maxWidth: '540px' }}>
              {t('heroSubtitle')}
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn-primary-blue" 
                onClick={() => navigate('/directory')} 
                style={{ background: 'var(--primary)', color: 'var(--white)', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s' }}
              >
                {t('heroBtnPrimary')}
              </button>
              <button 
                className="btn-secondary-outline" 
                onClick={() => navigate('/directory')}
                style={{ background: 'transparent', color: 'var(--text-light)', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: '700', border: '1px solid var(--primary-light)', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
              >
                {t('heroBtnSecondary')}
              </button>
            </div>
          </div>
          <div className="hero-image-frame" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.06)' }}>
            <img 
              src="/cozy_therapy_room.png" 
              alt="Cozy Consultation Room" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            {/* Soft decorative color strip at bottom of mockup image */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px' }}>
              Landing Page
            </div>
          </div>
        </div>
      </header>

      {/* Steps Section */}
      <section className="steps-section" style={{ padding: '6rem 0', background: 'var(--white)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1rem' }}>
            {t('stepsSectionTitle')}
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', maxWidth: '620px', margin: '0 auto 4rem', lineHeight: '1.6' }}>
            {t('stepsSectionSubtitle')}
          </p>

          <div className="steps-grid">
            <div className="step-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div className="step-icon-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Clipboard size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('step1Title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '240px' }}>
                {t('step1Desc')}
              </p>
            </div>

            <div className="step-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div className="step-icon-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('step2Title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '240px' }}>
                {t('step2Desc')}
              </p>
            </div>

            <div className="step-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div className="step-icon-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Calendar size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('step3Title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '240px' }}>
                {t('step3Desc')}
              </p>
            </div>

            <div className="step-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div className="step-icon-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <MessageSquare size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('step4Title')}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '240px' }}>
                {t('step4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" style={{ padding: '6rem 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div className="services-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1rem' }}>
                {t('servicesSectionTitle')}
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', maxWidth: '580px', lineHeight: '1.6' }}>
                {t('servicesSectionSubtitle')}
              </p>
            </div>
            <button 
              onClick={() => navigate('/directory')} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--primary)', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {t('servicesLink')} <ArrowRight size={18} />
            </button>
          </div>

          <div className="services-grid">
            <div className="service-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.02)', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', border: '1px solid var(--primary-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Brain size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('serviceStressTitle')}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: '1.7' }}>
                {t('serviceStressDesc')}
              </p>
            </div>

            <div className="service-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.02)', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', border: '1px solid var(--primary-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('serviceAnxietyTitle')}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: '1.7' }}>
                {t('serviceAnxietyDesc')}
              </p>
            </div>

            <div className="service-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.02)', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', border: '1px solid var(--primary-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('serviceRelationshipTitle')}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: '1.7' }}>
                {t('serviceRelationshipDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Wellness B2B modal trigger (kept to preserve full system function) */}
      <section className="corporate-trigger-section" style={{ background: 'var(--bg-warm)', padding: '0 0 6rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <button 
            className="btn-secondary-outline" 
            onClick={() => setIsInquiryOpen(true)}
            style={{ background: 'transparent', color: 'var(--text-light)', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '700', border: '1px dashed var(--primary-light)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {lang === 'en' ? 'Sponsor / Corporate Partner Portal Inquiry' : 'Layanan B2B Kerja Sama Korporasi'}
          </button>
        </div>
      </section>

      {isInquiryOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="corp-modal-title">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsInquiryOpen(false)} aria-label="Close inquiry modal"><X size={24} /></button>
            <h2 id="corp-modal-title">{lang === 'en' ? 'Corporate Inquiry' : 'Formulir Kerja Sama Korporasi'}</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {lang === 'en' 
                ? 'Submit this inquiry form and our corporate team will reach out shortly.'
                : 'Kirimkan data Anda dan tim B2B kami akan segera menghubungi Anda.'
              }
            </p>
            {submitSuccess ? (
              <div className="inquiry-success" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={64} style={{ color: '#10B981', marginBottom: '1rem' }} />
                <h3>{lang === 'en' ? 'Thank you!' : 'Terima Kasih!'}</h3>
                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  {lang === 'en'
                    ? 'We have received your corporate inquiry and will email you soon.'
                    : 'Kami telah menerima formulir Anda dan akan segera menghubungi Anda via email.'
                  }
                </p>
                <button className="btn-primary" onClick={() => { setIsInquiryOpen(false); setSubmitSuccess(false); }} style={{ marginTop: '1.5rem', width: '100%' }}>
                  {t('closeBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="inquiry-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="corp-name" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Full Name' : 'Nama Lengkap'}</label>
                  <input type="text" id="corp-name" value={corpName} onChange={e => setCorpName(e.target.value)} required placeholder={lang === 'en' ? 'Your name' : 'Nama lengkap Anda'} style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="corp-email" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Work Email' : 'Email Kantor'}</label>
                  <input type="email" id="corp-email" value={corpEmail} onChange={e => setCorpEmail(e.target.value)} required placeholder="you@company.com" style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="corp-company" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Company Name' : 'Nama Perusahaan'}</label>
                  <input type="text" id="corp-company" value={corpCompany} onChange={e => setCorpCompany(e.target.value)} required placeholder="Company Name" style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="corp-message" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'en' ? 'Message' : 'Pesan Kerja Sama'}</label>
                  <textarea id="corp-message" value={corpMessage} onChange={e => setCorpMessage(e.target.value)} required placeholder={lang === 'en' ? 'Tell us how we can help...' : 'Bagaimana kami dapat membantu perusahaan Anda?'} rows={4} style={{ padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', fontFamily: 'inherit', resize: 'none', fontSize: '0.95rem' }} />
                </div>
                {errorMsg && <p style={{ color: '#EF4444', fontSize: '0.85rem' }}>{errorMsg}</p>}
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '0.5rem', width: '100%' }}>
                  {isSubmitting ? (lang === 'en' ? 'Submitting...' : 'Mengirim...') : (lang === 'en' ? 'Submit Inquiry' : 'Kirim Formulir')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LandingPage;
