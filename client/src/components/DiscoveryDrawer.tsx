import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, PhoneCall } from 'lucide-react';

import { useStateMachine } from '../hooks/useStateMachine';
import { useSanitizedState } from '../hooks/useSanitizedState';
import { AssessmentState } from '../types';
import { assessmentService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const intakeTransitions: Record<AssessmentState, Partial<Record<string, AssessmentState>>> = {
  [AssessmentState.IDLE]: {
    OPEN: AssessmentState.INTRO
  },
  [AssessmentState.INTRO]: {
    START: AssessmentState.IN_PROGRESS,
    RESET: AssessmentState.INTRO
  },
  [AssessmentState.IN_PROGRESS]: {
    SUBMIT: AssessmentState.SUBMITTING,
    RESET: AssessmentState.INTRO
  },
  [AssessmentState.SUBMITTING]: {
    SUCCESS: AssessmentState.COMPLETED,
    FAIL: AssessmentState.ERROR,
    RESET: AssessmentState.INTRO
  },
  [AssessmentState.COMPLETED]: {
    RESET: AssessmentState.INTRO
  },
  [AssessmentState.ERROR]: {
    RETRY: AssessmentState.IN_PROGRESS,
    RESET: AssessmentState.INTRO
  }
};

interface DiscoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterMatch?: (isOnline: boolean, isOffline: boolean) => void;
}

const DiscoveryDrawer: React.FC<DiscoveryDrawerProps> = ({ isOpen, onClose, onFilterMatch }) => {
  const { lang, t } = useLanguage();
  const [state, send] = useStateMachine(intakeTransitions, AssessmentState.INTRO);
  const [responses, setResponses, wipeResponses] = useSanitizedState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [crisisResources, setCrisisResources] = useState<any[]>([]);

  // Dynamically translate questions based on selected language
  const QUESTIONS = lang === 'id' ? [
    {
      id: 'q1',
      text: 'Selama 2 minggu terakhir, seberapa sering Anda merasa gugup, cemas, atau gelisah?',
      options: [
        { label: 'Tidak sama sekali', score: 0 },
        { label: 'Beberapa hari', score: 1 },
        { label: 'Lebih dari separuh hari', score: 2 },
        { label: 'Hampir setiap hari', score: 3 }
      ]
    },
    {
      id: 'q2',
      text: 'Selama 2 minggu terakhir, seberapa sering Anda terganggu oleh perasaan murung, depresi, atau putus asa?',
      options: [
        { label: 'Tidak sama sekali', score: 0 },
        { label: 'Beberapa hari', score: 1 },
        { label: 'Lebih dari separuh hari', score: 2 },
        { label: 'Hampir setiap hari', score: 3 }
      ]
    },
    {
      id: 'q3',
      text: 'Selama 2 minggu terakhir, seberapa sering Anda merasa kewalahan, burnout, atau tidak sanggup mengatasi masalah?',
      options: [
        { label: 'Tidak sama sekali', score: 0 },
        { label: 'Beberapa hari', score: 1 },
        { label: 'Lebih dari separuh hari', score: 2 },
        { label: 'Hampir setiap hari', score: 3 }
      ]
    },
    {
      id: 'q4',
      text: 'Apakah Anda mengalami pikiran untuk menyakiti diri sendiri atau merasa lebih baik mati saja?',
      options: [
        { label: 'Tidak sama sekali', score: 0 },
        { label: 'Beberapa hari', score: 1 },
        { label: 'Lebih dari separuh hari', score: 2 },
        { label: 'Hampir setiap hari', score: 3 }
      ]
    },
    {
      id: 'q5',
      text: 'Konsultasi apa yang Anda cari? Online atau offline tatap muka?',
      options: [
        { label: 'Online Saja', score: 0 },
        { label: 'Klinik Offline Tatap Muka', score: 1 },
        { label: 'Keduanya / Mana Saja', score: 0 }
      ]
    }
  ] : [
    {
      id: 'q1',
      text: 'Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?',
      options: [
        { label: 'Not at all', score: 0 },
        { label: 'Several days', score: 1 },
        { label: 'More than half the days', score: 2 },
        { label: 'Nearly every day', score: 3 }
      ]
    },
    {
      id: 'q2',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      options: [
        { label: 'Not at all', score: 0 },
        { label: 'Several days', score: 1 },
        { label: 'More than half the days', score: 2 },
        { label: 'Nearly every day', score: 3 }
      ]
    },
    {
      id: 'q3',
      text: 'Over the last 2 weeks, how often have you felt overwhelmed, burnt out, or unable to cope?',
      options: [
        { label: 'Not at all', score: 0 },
        { label: 'Several days', score: 1 },
        { label: 'More than half the days', score: 2 },
        { label: 'Nearly every day', score: 3 }
      ]
    },
    {
      id: 'q4',
      text: 'Have you experienced thoughts of hurting yourself or that you would be better off dead?',
      options: [
        { label: 'Not at all', score: 0 },
        { label: 'Several days', score: 1 },
        { label: 'More than half the days', score: 2 },
        { label: 'Nearly every day', score: 3 }
      ]
    },
    {
      id: 'q5',
      text: 'Are you looking for online or offline support?',
      options: [
        { label: 'Online Only', score: 0 },
        { label: 'Offline Clinic', score: 1 },
        { label: 'Both / Either', score: 0 }
      ]
    }
  ];

  // Safety Hardening: Wipe PII and reset states on close or unmount
  useEffect(() => {
    if (!isOpen) {
      wipeResponses();
      setSelectedCategory('');
      setCurrentQuestionIndex(0);
      setIsHighRisk(false);
      setCrisisResources([]);
      setErrorMessage('');
      send('RESET');
    }
  }, [isOpen, wipeResponses, send]);

  const handleOptionSelect = async (score: number) => {
    const qId = QUESTIONS[currentQuestionIndex].id;
    const newResponses = { ...responses, [qId]: score };
    setResponses(newResponses);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit assessment on the final question
      send('SUBMIT');
      try {
        const payload = {
          category: selectedCategory || 'General Mental Health',
          responses: newResponses
        };
        const res = await assessmentService.submit(payload);
        
        setIsHighRisk(res.data.isHighRisk);

        if (res.data.isHighRisk) {
          // Fetch crisis resources
          try {
            const resourcesRes = await assessmentService.getResources();
            setCrisisResources(resourcesRes.data);
          } catch (rErr) {
            console.error('Failed to load local crisis resources', rErr);
          }
        } else {
          // Trigger filtration back to the directory based on offline/online preference (q5)
          const onlinePreference = newResponses['q5'];
          if (onFilterMatch) {
            if (onlinePreference === 0) {
              onFilterMatch(true, false); // Online only
            } else if (onlinePreference === 1) {
              onFilterMatch(false, true); // Offline only
            } else {
              onFilterMatch(true, true);  // Both
            }
          }
        }

        send('SUCCESS');
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || t('submissionFailed'));
        send('FAIL');
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setSelectedCategory('');
    }
  };

  const categories = lang === 'id' ? [
    'Dukungan Kecemasan',
    'Dukungan Depresi',
    'Kelelahan Mental (Burnout)',
    'Masalah Hubungan & Keluarga',
    'Kendala Karir & Akademik',
    'Pemulihan Trauma & Duka Cita',
    'Dukungan Parenting'
  ] : [
    'Anxiety Support',
    'Depression Support',
    'Stress & Burnout',
    'Relationship & Family Issues',
    'Career & Academic Concerns',
    'Grief & Trauma Recovery',
    'Parenting Support'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="discovery-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
          >
            <button className="btn-close" onClick={onClose} aria-label={t('closeBtn')}><X size={24} /></button>
            
            <div className="drawer-content">
              {state === AssessmentState.INTRO && (
                <div className="state-view">
                  <h2>{t('smartMatching')}</h2>
                  <p>{t('beginAssessmentSub')}</p>
                  <button className="btn-primary" onClick={() => send('START')}>{t('beginAssessment')}</button>
                  <div className="safety-disclaimer">
                    <strong>{t('safetyDisclaimerTitle')}</strong>
                    <p>{t('safetyDisclaimerDesc')}</p>
                  </div>
                </div>
              )}

              {state === AssessmentState.IN_PROGRESS && (
                <div className="state-view">
                  {selectedCategory === '' ? (
                    <React.Fragment>
                      <h3>{lang === 'id' ? 'Pilih area perhatian utama Anda' : 'Select your primary area of concern'}</h3>
                      <p className="concern-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                        {lang === 'id' ? 'Ini membantu kami mencarikan psikolog spesialis yang sesuai.' : 'This helps route you to psychologists specialized in your area.'}
                      </p>
                      <div className="options-grid categories-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                        {categories.map((cat) => (
                          <button 
                            key={cat}
                            className="btn-option category-select-btn"
                            onClick={() => setSelectedCategory(cat)}
                            style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <p className="step-indicator">{t('questionLabel')} {currentQuestionIndex + 1} of {QUESTIONS.length} ({selectedCategory})</p>
                      <h3>{QUESTIONS[currentQuestionIndex].text}</h3>
                      <div className="options-grid">
                        {QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
                          <button 
                            key={idx} 
                            className="btn-option" 
                            onClick={() => handleOptionSelect(opt.score)}
                          >
                             {opt.label}
                          </button>
                        ))}
                      </div>
                      <button className="btn-back" onClick={handleBack} style={{ marginTop: '1.2rem' }}>{t('backBtn')}</button>
                    </React.Fragment>
                  )}
                </div>
              )}

              {state === AssessmentState.SUBMITTING && (
                <div className="state-view analyzing">
                  <div className="skeleton-pulse"></div>
                  <p>{t('submittingAssessment')}</p>
                </div>
              )}

              {state === AssessmentState.COMPLETED && (
                <div className="state-view results">
                  {isHighRisk ? (
                    <div className="crisis-container">
                      <div className="crisis-header">
                        <AlertTriangle className="crisis-icon" size={32} />
                        <h2>{t('crisisTitle')}</h2>
                      </div>
                      <p className="crisis-alert-text">{t('crisisDesc')}</p>
                      
                      <div className="crisis-resources">
                        <div className="resource-card primary-resource">
                          <PhoneCall size={20} />
                          <div>
                            <strong>988 Suicide & Crisis Lifeline</strong>
                            <p>Call or text 988 (Available 24/7, free and confidential)</p>
                          </div>
                        </div>
                        <div className="resource-card">
                          <div>
                            <strong>Crisis Text Line</strong>
                            <p>Text HOME to 741741 to connect with a crisis counselor 24/7</p>
                          </div>
                        </div>
                        
                        {crisisResources.length > 0 && (
                          <div className="local-resources">
                            <h4>{lang === 'en' ? 'Recommended Resources:' : 'Rekomendasi Layanan Krisis:'}</h4>
                            {crisisResources.map((res: any) => (
                              <div key={res.id} className="local-resource-item">
                                <strong>{res.name}</strong>
                                <p>{res.contactInfo} {res.location && `| Location: ${res.location}`}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="crisis-disclaimer">
                        {t('crisisFootnote')}
                      </div>
                      <button className="btn-primary" onClick={onClose} style={{ marginTop: '1.5rem' }}>{t('closeBtn')}</button>
                    </div>
                  ) : (
                    <React.Fragment>
                      <h2>{t('matchesFoundTitle')}</h2>
                      <p>{t('matchesFoundDesc')}</p>
                      <button className="btn-primary" onClick={onClose}>{t('viewProvidersCTA')}</button>
                    </React.Fragment>
                  )}
                </div>
              )}

              {state === AssessmentState.ERROR && (
                <div className="state-view error-state">
                  <h2>{lang === 'en' ? 'Submission Failed' : 'Pengiriman Asesmen Gagal'}</h2>
                  <p>{errorMessage}</p>
                  <button className="btn-primary" onClick={() => send('RETRY')}>{lang === 'en' ? 'Retry Assessment' : 'Ulangi Asesmen'}</button>
                  <button className="btn-secondary" onClick={() => send('RESET')} style={{ marginTop: '0.5rem' }}>{lang === 'en' ? 'Start Over' : 'Mulai dari Awal'}</button>
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default DiscoveryDrawer;
