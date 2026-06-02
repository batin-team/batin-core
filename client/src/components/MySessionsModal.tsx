import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Star, MessageSquare, AlertCircle, CheckCircle, Video } from 'lucide-react';
import { bookingService, reviewService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface MySessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  provider: {
    id: string;
    user: {
      fullName: string;
    };
  };
  reviews?: Array<{ id: string }>;
}

const MySessionsModal: React.FC<MySessionsModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Review submission state
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await bookingService.getMyBookings();
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === 'en' ? 'Failed to fetch your sessions.' : 'Gagal memuat sesi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
      setSubmitSuccess(false);
      setReviewAppt(null);
    }
  }, [isOpen]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAppt) return;
    setIsSubmittingReview(true);
    setErrorMsg('');
    try {
      await reviewService.submitReview({
        appointmentId: reviewAppt.id,
        rating,
        comment,
        isAnonymous
      });
      setSubmitSuccess(true);
      setComment('');
      setRating(5);
      setIsAnonymous(false);
      
      // Refresh the appointments list to show the review status update
      setTimeout(() => {
        fetchBookings();
        setReviewAppt(null);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || (lang === 'en' ? 'Failed to submit review.' : 'Gagal mengirim ulasan.'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sessions-modal-title" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '640px', width: '90%', padding: '2.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
        <button className="close-btn" onClick={onClose} aria-label={t('closeBtn')}><X size={24} /></button>
        
        {reviewAppt ? (
          <div className="review-step-modal">
            <h2 id="sessions-modal-title" style={{ color: 'var(--text-dark)', fontWeight: '800', marginBottom: '0.5rem' }}>
              {lang === 'en' ? 'Review Your Session' : 'Berikan Ulasan Sesi'}
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {lang === 'en' 
                ? `How was your session with ${reviewAppt.provider.user.fullName}?`
                : `Bagaimana sesi konsultasi Anda dengan ${reviewAppt.provider.user.fullName}?`}
            </p>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={60} style={{ color: '#10B981', marginBottom: '1rem' }} />
                <h3>{lang === 'en' ? 'Thank You!' : 'Terima Kasih!'}</h3>
                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  {lang === 'en' ? 'Your review has been submitted successfully.' : 'Ulasan Anda telah berhasil dikirim.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>
                    {lang === 'en' ? 'Rating' : 'Penilaian'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        style={{ background: 'transparent', padding: 0 }}
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star size={28} fill={star <= rating ? '#FFD700' : 'transparent'} color="#FFD700" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label htmlFor="review-comment" style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    {lang === 'en' ? 'Feedback Comment (Optional)' : 'Komentar Ulasan (Opsional)'}
                  </label>
                  <textarea 
                    id="review-comment"
                    placeholder={lang === 'en' ? 'Write your feedback here...' : 'Tulis ulasan Anda di sini...'}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius)', resize: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Anonymous Option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
                  <input 
                    type="checkbox" 
                    id="anonym-checkbox" 
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="anonym-checkbox" style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer' }}>
                    {lang === 'en' ? 'Submit review anonymously' : 'Kirim ulasan secara anonim'}
                  </label>
                </div>

                {errorMsg && <p style={{ color: '#EF4444', fontSize: '0.85rem' }}>{errorMsg}</p>}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setReviewAppt(null)}
                    style={{ flex: 1, padding: '0.8rem' }}
                  >
                    {t('backBtn')}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmittingReview}
                    style={{ flex: 1, padding: '0.8rem' }}
                  >
                    {isSubmittingReview ? (lang === 'en' ? 'Submitting...' : 'Mengirim...') : (lang === 'en' ? 'Submit Review' : 'Kirim Ulasan')}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            <h2 id="sessions-modal-title" style={{ color: 'var(--text-dark)', fontWeight: '800', marginBottom: '1.5rem' }}>
              {lang === 'en' ? 'My Consultations' : 'Sesi Konsultasi Saya'}
            </h2>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="skeleton-pulse" style={{ height: '40px', width: '100%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className="skeleton-pulse" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>{lang === 'en' ? 'Loading consultations...' : 'Memuat sesi konsultasi...'}</p>
              </div>
            ) : errorMsg ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#EF4444' }}>
                <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
                <p>{errorMsg}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-light)' }}>
                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>{lang === 'en' ? 'No consultations booked yet.' : 'Belum ada sesi konsultasi yang dipesan.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {appointments.map((appt) => {
                  const isCompleted = appt.status === 'COMPLETED';
                  const apptDate = new Date(appt.startTime);
                  
                  return (
                    <div 
                      key={appt.id} 
                      style={{ 
                        background: 'var(--white)', 
                        padding: '1.5rem', 
                        borderRadius: 'var(--radius)', 
                        border: '1px solid var(--primary-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '4px',
                            background: isCompleted ? '#ecfdf5' : '#e0e7ff',
                            color: isCompleted ? '#10b981' : '#6366f1',
                            width: 'fit-content'
                          }}
                        >
                          {appt.status}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                          {appt.provider.user.fullName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                          <Clock size={14} />
                          <span>
                            {apptDate.toLocaleDateString()} at {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        {!isCompleted && appt.meetLink && (
                          <a 
                            href={appt.meetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                          >
                            <Video size={16} /> Meet Link
                          </a>
                        )}

                        {isCompleted && (
                          <React.Fragment>
                            {/* Check if already reviewed */}
                            {appt.reviews && appt.reviews.length > 0 ? (
                              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <CheckCircle size={16} /> {lang === 'en' ? 'Reviewed' : 'Telah Diulas'}
                              </span>
                            ) : (
                              <button 
                                className="btn-primary"
                                onClick={() => {
                                  setReviewAppt(appt);
                                  setRating(5);
                                  setComment('');
                                }}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--primary)', color: 'white' }}
                              >
                                <MessageSquare size={16} style={{ marginRight: '0.4rem' }} />
                                {lang === 'en' ? 'Review' : 'Berikan Ulasan'}
                              </button>
                            )}
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessionsModal;
