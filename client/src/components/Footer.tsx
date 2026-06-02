import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>{t('brandName')}</h3>
          <p>
            {lang === 'en' 
              ? 'Connecting you to the support you deserve.' 
              : 'Menghubungkan Anda ke dukungan yang layak Anda dapatkan.'}
          </p>
        </div>
        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><a href="/directory">{t('findProvider')}</a></li>
            <li><a href="/onboard-provider">{t('joinProvider')}</a></li>
            <li><a href="#">{lang === 'en' ? 'Resources' : 'Sumber Daya'}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>{lang === 'en' ? 'Company' : 'Perusahaan'}</h4>
          <ul>
            <li><a href="#">{lang === 'en' ? 'About Us' : 'Tentang Kami'}</a></li>
            <li><a href="#">{lang === 'en' ? 'Contact' : 'Kontak'}</a></li>
            <li><a href="#">{lang === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <div className="crisis-banner">
            <strong>{lang === 'en' ? 'Emergency?' : 'Darurat?'}</strong>
            <p>
              {lang === 'en' 
                ? 'If you are in immediate danger, please contact local emergency services or a crisis hotline.' 
                : 'Jika Anda dalam bahaya segera, silakan hubungi layanan darurat setempat atau hotline krisis.'}
            </p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 {t('brandName')}. {lang === 'en' ? 'All rights reserved.' : 'Hak cipta dilindungi undang-undang.'}</p>
      </div>
    </footer>
  );
};

export default Footer;
