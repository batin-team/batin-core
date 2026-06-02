import React, { useState } from 'react';
import { 
  X, Calendar as CalendarIcon, Clock, CheckCircle, 
  AlertCircle, CreditCard, Landmark, QrCode, 
  FileText, Download, ShieldCheck 
} from 'lucide-react';
import { useStateMachine } from '../hooks/useStateMachine';
import { BookingState } from '../types';
import { bookingService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { jsPDF } from 'jspdf';

const bookingTransitions: Record<BookingState, Partial<Record<string, BookingState>>> = {
  [BookingState.IDLE]: {
    LOCK: BookingState.LOCKED,
    RESET: BookingState.IDLE
  },
  [BookingState.LOCKED]: {
    ACQUIRED: BookingState.PAYING,
    FAIL: BookingState.ERROR,
    RESET: BookingState.IDLE
  },
  [BookingState.PAYING]: {
    PAY: BookingState.MORPHING,
    FAIL: BookingState.ERROR,
    RESET: BookingState.IDLE
  },
  [BookingState.MORPHING]: {
    COMPLETE: BookingState.SUCCESS,
    RESET: BookingState.IDLE
  },
  [BookingState.SUCCESS]: {
    RESET: BookingState.IDLE
  },
  [BookingState.ERROR]: {
    RETRY: BookingState.IDLE,
    RESET: BookingState.IDLE
  }
};

interface BookingModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ providerId, providerName, onClose }) => {
  const { lang, t } = useLanguage();
  const [state, send] = useStateMachine(bookingTransitions, BookingState.IDLE);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [lockId, setLockId] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  // Checkout payment states
  const [paymentMethod, setPaymentMethod] = useState<'CC' | 'VA' | 'QRIS'>('CC');
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [ccName, setCcName] = useState('');
  const [vaBank, setVaBank] = useState<'BCA' | 'MANDIRI' | 'BNI'>('BCA');

  // Financial totals (IDR)
  const sessionFee = 500000;
  const platformFee = 25000;
  const totalAmount = sessionFee + platformFee;
  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const handleNext = async () => {
    if (!selectedDate || !selectedTime) return;
    send('LOCK');
    try {
      const dateTimeStr = `${selectedDate}T${selectedTime}:00`;
      const res = await bookingService.createLock({
        providerId,
        startTime: new Date(dateTimeStr).toISOString()
      });
      setLockId(res.data.id);
      send('ACQUIRED');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || (lang === 'en' ? 'Failed to secure appointment slot.' : 'Gagal mengamankan jadwal sesi.'));
      send('FAIL');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockId) return;
    send('PAY');
    try {
      const res = await bookingService.confirmBooking({ lockId });
      setMeetLink(res.data.meetLink || '');
      setAppointmentId(res.data.id || '');
      setTimeout(() => send('COMPLETE'), 1000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || (lang === 'en' ? 'Payment failed. Please try again.' : 'Pembayaran gagal. Silakan coba lagi.'));
      send('FAIL');
    }
  };

  const downloadReceiptPdf = () => {
    const isEn = lang === 'en';
    const invoiceId = appointmentId || `INV-${Date.now().toString(36).toUpperCase()}`;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Header bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, W, 40, 'F');

    // Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HatikeHati', margin, 26);

    // Invoice label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(isEn ? 'RECEIPT / INVOICE' : 'KUITANSI / FAKTUR', W - margin, 18, { align: 'right' });
    doc.text(`${isEn ? 'Reference' : 'No. Referensi'}: ${invoiceId}`, W - margin, 25, { align: 'right' });
    doc.text(`${isEn ? 'Date' : 'Tanggal'}: ${new Date().toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - margin, 32, { align: 'right' });

    y = 55;

    // Section: Parties
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(isEn ? 'CLIENT' : 'KLIEN', margin, y);
    doc.text(isEn ? 'CLINICIAN / THERAPIST' : 'TERAPIS / PSIKOLOG', W / 2, y);

    y += 5;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(isEn ? 'Verified Platform Member' : 'Anggota Platform Terverifikasi', margin, y);
    doc.text(providerName, W / 2, y);

    y += 14;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);

    y += 10;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, W - margin * 2, 9, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(isEn ? 'DESCRIPTION' : 'DESKRIPSI', margin + 4, y + 6);
    doc.text(isEn ? 'DATE & TIME' : 'TANGGAL & WAKTU', W * 0.55, y + 6);
    doc.text(isEn ? 'AMOUNT' : 'JUMLAH', W - margin - 4, y + 6, { align: 'right' });

    y += 9;

    // Table rows
    const rows = [
      {
        desc: isEn ? '1h Mental Health Consultation Session' : 'Sesi Konsultasi Kesehatan Mental 1 Jam',
        time: `${selectedDate} ${selectedTime}`,
        amount: `Rp ${sessionFee.toLocaleString('id-ID')}`
      },
      {
        desc: isEn ? 'Platform & Secure Transaction Fee' : 'Biaya Platform & Transaksi Aman',
        time: '-',
        amount: `Rp ${platformFee.toLocaleString('id-ID')}`
      }
    ];

    rows.forEach((row, i) => {
      const rowY = y + i * 12;
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 250, 255);
      }
      doc.rect(margin, rowY, W - margin * 2, 12, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, rowY + 12, W - margin, rowY + 12);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(row.desc, margin + 4, rowY + 8);
      doc.text(row.time, W * 0.55, rowY + 8);
      doc.text(row.amount, W - margin - 4, rowY + 8, { align: 'right' });
    });

    y += rows.length * 12 + 6;

    // Totals
    const totalsX = W * 0.55;

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(isEn ? 'Subtotal' : 'Subtotal', totalsX, y + 6);
    doc.text(`Rp ${sessionFee.toLocaleString('id-ID')}`, W - margin - 4, y + 6, { align: 'right' });

    y += 8;
    doc.text(isEn ? 'Platform Fee' : 'Biaya Platform', totalsX, y + 6);
    doc.text(`Rp ${platformFee.toLocaleString('id-ID')}`, W - margin - 4, y + 6, { align: 'right' });

    y += 10;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.8);
    doc.line(totalsX, y, W - margin, y);

    y += 8;
    doc.setFillColor(99, 102, 241);
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(isEn ? 'Total Paid' : 'Total Dibayar', totalsX, y + 6);
    doc.text(`Rp ${totalAmount.toLocaleString('id-ID')}`, W - margin - 4, y + 6, { align: 'right' });

    y += 22;

    // Payment Method badge
    doc.setFillColor(224, 231, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, 60, 10, 3, 3, 'FD');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${isEn ? 'Payment via' : 'Pembayaran via'}: ${paymentMethod}`, margin + 3, y + 7);

    y += 20;

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W - margin, y);

    y += 8;
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const footer1 = isEn
      ? 'This receipt was generated automatically upon successful payment validation via Midtrans/Xendit.'
      : 'Kuitansi ini dibuat otomatis setelah validasi pembayaran berhasil melalui Midtrans/Xendit.';
    const footer2 = 'HatikeHati · support@hatikehati.com · www.hatikehati.com';
    doc.text(footer1, W / 2, y, { align: 'center' });
    doc.text(footer2, W / 2, y + 6, { align: 'center' });

    doc.save(`HatikeHati_Invoice_${invoiceId}.pdf`);
  };

  const getVaNumber = () => {
    switch (vaBank) {
      case 'BCA': return '88012 8734 8921 4452';
      case 'MANDIRI': return '70012 3421 9887 5219';
      case 'BNI': return '8274 0812 5590 1284';
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div className={`modal-content booking-modal-content ${state === BookingState.PAYING ? 'modal-checkout-wide' : ''}`}>
        <button className="close-btn" onClick={onClose} aria-label={lang === 'en' ? 'Close' : 'Tutup'}><X size={20} /></button>

        {/* STEP 1: Select Date & Time */}
        {state === BookingState.IDLE && (
          <div className="booking-step">
            <h2 id="booking-modal-title" className="booking-title">
              {t('bookSessionWith')} <span style={{ color: 'var(--primary)' }}>{providerName}</span>
            </h2>

            <div className="form-group">
              <label htmlFor="booking-date"><CalendarIcon size={15} style={{ marginRight: '0.4rem' }} />{t('selectDate')}</label>
              <input
                id="booking-date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label><Clock size={15} style={{ marginRight: '0.4rem' }} />{t('availableTimes')}</label>
              <div className="time-grid">
                {[
                  { val: '09:00', label: '09:00 AM' },
                  { val: '10:00', label: '10:00 AM' },
                  { val: '13:00', label: '01:00 PM' },
                  { val: '15:00', label: '03:00 PM' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`time-btn ${selectedTime === val ? 'active' : ''}`}
                    onClick={() => setSelectedTime(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-next"
              disabled={!selectedDate || !selectedTime}
              onClick={handleNext}
            >
              {lang === 'en' ? 'Next →' : 'Lanjut →'}
            </button>
          </div>
        )}

        {/* STEP: Locking */}
        {state === BookingState.LOCKED && (
          <div className="booking-step loading-step">
            <div className="spinner" />
            <p>{lang === 'en' ? 'Securing your slot...' : 'Mengamankan jadwal Anda...'}</p>
          </div>
        )}

        {/* STEP 2: Payment */}
        {state === BookingState.PAYING && (
          <div className="booking-step paying-step">
            <h2 id="booking-modal-title">{t('checkoutDrawer')}</h2>
            <p className="checkout-subtitle">{t('secureGatewaySubtitle')}</p>

            <div className="checkout-split-layout">
              {/* Order Summary */}
              <div className="order-summary-panel">
                <h3>{t('orderSummary')}</h3>
                <div className="summary-item">
                  <span>{t('consultationHour')}</span>
                  <strong>{formatRp(sessionFee)}</strong>
                </div>
                <div className="summary-item">
                  <span>{t('securePlatformFee')}</span>
                  <strong>{formatRp(platformFee)}</strong>
                </div>
                <div className="summary-total-divider" />
                <div className="summary-item grand-total">
                  <span>{t('totalBill')}</span>
                  <strong>{formatRp(totalAmount)}</strong>
                </div>
                <div className="security-assurance">
                  <ShieldCheck size={16} />
                  <span>{t('sslSecured')}</span>
                </div>
              </div>

              {/* Payment Gateway */}
              <div className="payment-gateway-panel">
                <div className="gateway-tabs">
                  <button type="button" className={`gateway-tab-btn ${paymentMethod === 'CC' ? 'active' : ''}`} onClick={() => setPaymentMethod('CC')}>
                    <CreditCard size={13} /> {t('creditCardTab')}
                  </button>
                  <button type="button" className={`gateway-tab-btn ${paymentMethod === 'VA' ? 'active' : ''}`} onClick={() => setPaymentMethod('VA')}>
                    <Landmark size={13} /> {t('virtualAccountTab')}
                  </button>
                  <button type="button" className={`gateway-tab-btn ${paymentMethod === 'QRIS' ? 'active' : ''}`} onClick={() => setPaymentMethod('QRIS')}>
                    <QrCode size={13} /> {t('qrisCodeTab')}
                  </button>
                </div>

                <form onSubmit={handlePay} className="gateway-form-container">
                  {paymentMethod === 'CC' && (
                    <div className="cc-form-layout">
                      <div className="form-group">
                        <label htmlFor="cc-name">{t('cardNameLabel')}</label>
                        <input type="text" id="cc-name" placeholder="Nama Lengkap" value={ccName} onChange={e => setCcName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cc-number">{t('cardNumberLabel')}</label>
                        <input type="text" id="cc-number" placeholder="4111 2222 3333 4444" maxLength={19} value={ccNumber} onChange={e => setCcNumber(e.target.value)} required />
                      </div>
                      <div className="form-row-half">
                        <div className="form-group">
                          <label htmlFor="cc-expiry">{t('cardExpiryLabel')}</label>
                          <input type="text" id="cc-expiry" placeholder="MM/YY" maxLength={5} value={ccExpiry} onChange={e => setCcExpiry(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cc-cvv">{t('cardCvvLabel')}</label>
                          <input type="password" id="cc-cvv" placeholder="•••" maxLength={3} value={ccCvv} onChange={e => setCcCvv(e.target.value)} required />
                        </div>
                      </div>
                      <button type="submit" className="btn-pay" style={{ width: '100%' }}>
                        {t('ccPaySimulate')} {formatRp(totalAmount)}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'VA' && (
                    <div className="va-layout">
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>{t('selectBankLabel')}</label>
                      <div className="va-banks-selector">
                        {(['BCA', 'MANDIRI', 'BNI'] as const).map(bank => (
                          <button key={bank} type="button" className={`bank-pill ${vaBank === bank ? 'active' : ''}`} onClick={() => setVaBank(bank)}>
                            {bank === 'BCA' ? 'Bank BCA' : bank === 'MANDIRI' ? 'Mandiri' : 'Bank BNI'}
                          </button>
                        ))}
                      </div>
                      <div className="va-instructions-box">
                        <p>{t('transferInstructions')}</p>
                        <div className="va-number-display">
                          <code>{getVaNumber()}</code>
                          <button type="button" className="btn-copy-va" onClick={() => { navigator.clipboard.writeText(getVaNumber().replace(/\s/g, '')); }}>
                            {t('copyBtn')}
                          </button>
                        </div>
                        <ul className="va-steps">
                          <li>{t('vaStep1')}</li>
                          <li>{t('vaStep2')}</li>
                          <li>{t('vaStep3').replace('{{amount}}', formatRp(totalAmount))}</li>
                        </ul>
                      </div>
                      <button type="submit" className="btn-pay" style={{ width: '100%', marginTop: '1rem' }}>{t('vaCompletedSimulate')}</button>
                    </div>
                  )}

                  {paymentMethod === 'QRIS' && (
                    <div className="qris-layout">
                      <div className="qris-qr-frame">
                        <div className="mock-qris-container">
                          <QrCode size={110} className="qris-qr-graphics" />
                          <div className="qris-banner">QRIS VERIFIED</div>
                        </div>
                        <div className="qris-instructions">
                          <p>{t('qrisScanDesc')}</p>
                          <div className="qris-expire-clock">
                            <Clock size={13} /> {lang === 'en' ? 'Expires in' : 'Kedaluwarsa dalam'} 14:59
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn-pay" style={{ width: '100%', marginTop: '1rem' }}>{t('scanSuccessSimulate')}</button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {state === BookingState.MORPHING && (
          <div className="booking-step morphing" role="status">
            <div className="morph-circle" />
            <p>{t('processingTx')}</p>
          </div>
        )}

        {/* SUCCESS */}
        {state === BookingState.SUCCESS && (
          <div className="booking-step success" role="status">
            <CheckCircle size={56} className="success-icon" />
            <h2>{t('bookingConfirmed')}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>{t('bookingSuccessSub')}</p>

            {meetLink && (
              <div className="meet-link-card">
                <strong>{t('meetInvitationDetails')}</strong>
                <a href={meetLink} target="_blank" rel="noopener noreferrer" className="meet-url">{meetLink}</a>
              </div>
            )}

            <div className="receipt-download-box">
              <div className="receipt-text-group">
                <FileText size={18} className="receipt-icon" />
                <div>
                  <strong>{t('receiptGeneratedTitle')}</strong>
                  <p>{t('receiptGeneratedDesc')}</p>
                </div>
              </div>
              <button type="button" className="btn-download-invoice-click" onClick={downloadReceiptPdf}>
                <Download size={13} /> {t('downloadPdfInvoice')}
              </button>
            </div>

            <p className="review-note-hint">
              {lang === 'en'
                ? '💬 After your session is completed, you can leave a review from "My Sessions".'
                : '💬 Setelah sesi selesai, Anda dapat memberikan ulasan melalui "Sesi Saya".'}
            </p>

            <button className="btn-done" onClick={onClose} style={{ width: '100%', marginTop: '1rem' }}>{t('doneBtn')}</button>
          </div>
        )}

        {/* ERROR */}
        {state === BookingState.ERROR && (
          <div className="booking-step error" role="status">
            <AlertCircle size={56} className="error-icon" />
            <h2>{lang === 'en' ? 'Booking Error' : 'Kesalahan Pemesanan'}</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{errorMessage}</p>
            <button className="btn-retry" onClick={() => send('RETRY')}>{lang === 'en' ? 'Try Again' : 'Coba Lagi'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
