import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, Clock, DollarSign, MapPin, User, 
  Star, Shield, Send, CheckCircle2, Edit3, X, Plus, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';


interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  meetLink: string;
  status: string;
  notes?: string;
  recommendation?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  bankName: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
}

const ProviderDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'schedule' | 'wallet' | 'profile'>('sessions');

  // Availability Schedule State
  type DaySlot = { id: string; start: string; end: string };
  type WeekSchedule = Record<string, { enabled: boolean; slots: DaySlot[] }>;
  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const defaultSchedule: WeekSchedule = Object.fromEntries(
    DAYS.map(d => [d, { enabled: ['Senin','Selasa','Rabu','Kamis','Jumat'].includes(d), slots: [{ id: `${d}-1`, start: '09:00', end: '12:00' }] }])
  );
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(() => {
    const saved = localStorage.getItem('h2h_provider_schedule');
    return saved ? JSON.parse(saved) : defaultSchedule;
  });

  // Consultation Planner States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [followUpRec, setFollowUpRec] = useState('');

  // Wallet & Payout States (IDR)
  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
  const [walletBalance, setWalletBalance] = useState(4500000);
  const [pendingBalance] = useState(1200000);
  const [totalWithdrawn, setTotalWithdrawn] = useState(12000000);
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  // Profile States
  const [bio, setBio] = useState('Clinical Psychologist with 8 years of experience, specializing in cognitive behavioral therapy, anxiety treatments, and workplace stress.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load state and mocked/local storage data
  useEffect(() => {
    // 1. Load User Session
    const savedUser = localStorage.getItem('h2h_user');
    if (!savedUser) {
      // For demo, if not logged in we let them stay but default user
    }

    // 2. Load Appointments
    const initialAppts: Appointment[] = [
      {
        id: 'appt-101',
        clientName: 'Jane Smith',
        clientEmail: 'jane.smith@example.com',
        startTime: new Date(Date.now() + 2 * 3600 * 1000).toLocaleString(),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'CONFIRMED',
        notes: '',
        recommendation: ''
      },
      {
        id: 'appt-102',
        clientName: 'Robert Johnson',
        clientEmail: 'robert.j@example.com',
        startTime: new Date(Date.now() + 24 * 3600 * 1000).toLocaleString(),
        meetLink: 'https://meet.google.com/xyz-pdqr-wst',
        status: 'CONFIRMED',
        notes: '',
        recommendation: ''
      },
      {
        id: 'appt-103',
        clientName: 'Alice Cooper',
        clientEmail: 'alice.c@example.com',
        startTime: new Date(Date.now() - 48 * 3600 * 1000).toLocaleString(),
        meetLink: 'https://meet.google.com/mno-uvwx-yzl',
        status: 'COMPLETED',
        notes: 'Client showed signs of work burnout. Discussed time blocking techniques.',
        recommendation: 'Burnout Recovery Program'
      }
    ];
    
    const storedAppts = localStorage.getItem('h2h_provider_appts');
    if (storedAppts) {
      setAppointments(JSON.parse(storedAppts));
    } else {
      setAppointments(initialAppts);
      localStorage.setItem('h2h_provider_appts', JSON.stringify(initialAppts));
    }

    // 3. Load Locations
    const initialLocs: Location[] = [
      { id: 'loc-1', name: 'Downtown Wellness Clinic', address: 'Suite 404, 12 Broad St, Jakarta' },
      { id: 'loc-2', name: 'Kuningan Mental Health Center', address: 'Level 12, Tower B, Kuningan Place' }
    ];
    setLocations(initialLocs);

    // 4. Load Reviews
    const initialReviews: Review[] = [
      {
        id: 'rev-1',
        clientName: 'Anonymous Client',
        rating: 5,
        comment: 'Very helpful session. Dr. Jenkins listened patiently and gave actionable steps to control my panic attacks.',
        date: '2026-05-28'
      },
      {
        id: 'rev-2',
        clientName: 'Mark D.',
        rating: 4,
        comment: 'Highly professional. Great cognitive exercises, although scheduling took some time.',
        date: '2026-05-25'
      }
    ];
    setReviews(initialReviews);

    // 5. Load Bank Details
    const savedBank = localStorage.getItem('h2h_provider_bank');
    if (savedBank) {
      setBankAccount(JSON.parse(savedBank));
    }

    // 6. Load Payout History
    const initialPayouts: PayoutRequest[] = [
      {
        id: 'pay-01',
        amount: 8000000,
        bankName: 'Bank Mandiri',
        status: 'APPROVED',
        createdAt: '2026-05-15'
      },
      {
        id: 'pay-02',
        amount: 4000000,
        bankName: 'Bank Mandiri',
        status: 'APPROVED',
        createdAt: '2026-05-01'
      }
    ];
    const storedPayouts = localStorage.getItem('h2h_provider_payouts');
    if (storedPayouts) {
      setPayouts(JSON.parse(storedPayouts));
    } else {
      setPayouts(initialPayouts);
      localStorage.setItem('h2h_provider_payouts', JSON.stringify(initialPayouts));
    }
  }, []);

  // Save Session Note Handler
  const handleOpenNoteModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setSessionNotes(appt.notes || '');
    setFollowUpRec(appt.recommendation || '');
  };

  const handleSaveNotes = () => {
    if (!selectedAppt) return;
    const updated = appointments.map(appt => {
      if (appt.id === selectedAppt.id) {
        return {
          ...appt,
          notes: sessionNotes,
          recommendation: followUpRec,
          status: 'COMPLETED' // Mark completed when note is filed
        };
      }
      return appt;
    });
    setAppointments(updated);
    localStorage.setItem('h2h_provider_appts', JSON.stringify(updated));
    setSelectedAppt(null);
    alert('Clinical Session Notes saved securely.');
  };

  // Save Bank Account
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('h2h_provider_bank', JSON.stringify(bankAccount));
    alert('Bank account registered successfully.');
  };

  // Payout/Withdrawal Request
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (amountNum > walletBalance) {
      alert('Requested amount exceeds current wallet balance.');
      return;
    }
    if (!bankAccount.bankName || !bankAccount.accountNumber) {
      alert('Please register and link your bank account first.');
      return;
    }

    const newPayout: PayoutRequest = {
      id: `pay-${Math.random().toString(36).substr(2, 5)}`,
      amount: amountNum,
      bankName: bankAccount.bankName,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedPayouts = [newPayout, ...payouts];
    setPayouts(updatedPayouts);
    localStorage.setItem('h2h_provider_payouts', JSON.stringify(updatedPayouts));
    
    // Deduct from balance
    setWalletBalance(prev => prev - amountNum);
    setTotalWithdrawn(prev => prev + amountNum);
    setWithdrawAmount('');
    alert('Payout withdrawal request submitted successfully for approval.');
  };

  // Add Clinic Location
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName || !newLocAddress) {
      alert('Location name and address are required.');
      return;
    }
    const newLoc: Location = {
      id: `loc-${Date.now()}`,
      name: newLocName,
      address: newLocAddress
    };
    setLocations([...locations, newLoc]);
    setNewLocName('');
    setNewLocAddress('');
    alert('New clinic location added successfully.');
  };

  // Save bio edit
  const handleSaveBio = () => {
    setIsEditingBio(false);
    alert('Biography updated successfully.');
  };

  return (
    <div className="provider-dashboard-page">
      <Navbar />

      <main className="container provider-main">
        {/* Profile Card Header */}
        <section className="provider-profile-hero">
          <div className="hero-glass-card">
            <div className="hero-content">
              <div className="provider-avatar-box">
                <img 
                  src="/sarah_jenkins.png" 
                  alt="Dr. Sarah Jenkins" 
                  className="provider-avatar-img"
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
                  }}
                />
              </div>
              <div className="hero-details">
                <div className="role-badge">VERIFIED PSYCHOLOGIST</div>
                <h2>Dr. Sarah Jenkins</h2>
                <p className="specialties-row">Specialties: Anxiety, Depression, Corporate Stress, CBT</p>
                <div className="rating-row">
                  <Star size={18} fill="#FBBF24" color="#FBBF24" />
                  <span className="rating-avg">4.8</span>
                  <span className="reviews-count">({reviews.length} Patient Reviews)</span>
                </div>
              </div>
            </div>

            {/* Sub-tab navigation */}
            <div className="provider-tabs">
              <button 
                className={`provider-tab-btn ${activeSubTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('sessions')}
              >
                <Calendar size={16} /> Konsultasi
              </button>
              <button 
                className={`provider-tab-btn ${activeSubTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('schedule')}
              >
                <Clock size={16} /> Jadwal Saya
              </button>
              <button 
                className={`provider-tab-btn ${activeSubTab === 'wallet' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('wallet')}
              >
                <DollarSign size={16} /> Dompet
              </button>
              <button 
                className={`provider-tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('profile')}
              >
                <User size={16} /> Profil
              </button>
            </div>
          </div>
        </section>

        {/* Tab Contents */}
        <div className="provider-tab-content">
          
          {/* === SCHEDULE TAB === */}
          {activeSubTab === 'schedule' && (
            <div className="schedule-container">
              <div className="section-header-box">
                <h3>Jadwal Ketersediaan Saya</h3>
                <p>Atur hari dan jam kerja Anda. Klien hanya dapat memesan di slot yang Anda aktifkan.</p>
              </div>

              <div className="schedule-week-grid">
                {DAYS.map(day => {
                  const dayData = weekSchedule[day];
                  return (
                    <div key={day} className={`schedule-day-card ${dayData.enabled ? 'enabled' : 'disabled'}`}>
                      <div className="schedule-day-header">
                        <div className="day-label-row">
                          <span className="day-name">{day}</span>
                          {dayData.enabled
                            ? <span className="day-status-pill on">Aktif</span>
                            : <span className="day-status-pill off">Libur</span>}
                        </div>
                        <button
                          type="button"
                          className="toggle-day-btn"
                          onClick={() => {
                            const updated = { ...weekSchedule, [day]: { ...dayData, enabled: !dayData.enabled } };
                            setWeekSchedule(updated);
                            localStorage.setItem('h2h_provider_schedule', JSON.stringify(updated));
                          }}
                          aria-label={`Toggle ${day}`}
                        >
                          {dayData.enabled
                            ? <ToggleRight size={28} style={{ color: 'var(--primary)' }} />
                            : <ToggleLeft size={28} style={{ color: 'var(--text-light)' }} />}
                        </button>
                      </div>

                      {dayData.enabled && (
                        <div className="slots-list">
                          {dayData.slots.map((slot, idx) => (
                            <div key={slot.id} className="slot-row">
                              <input
                                type="time"
                                value={slot.start}
                                className="slot-time-input"
                                onChange={e => {
                                  const newSlots = dayData.slots.map((s, i) => i === idx ? { ...s, start: e.target.value } : s);
                                  const updated = { ...weekSchedule, [day]: { ...dayData, slots: newSlots } };
                                  setWeekSchedule(updated);
                                  localStorage.setItem('h2h_provider_schedule', JSON.stringify(updated));
                                }}
                              />
                              <span className="slot-dash">–</span>
                              <input
                                type="time"
                                value={slot.end}
                                className="slot-time-input"
                                onChange={e => {
                                  const newSlots = dayData.slots.map((s, i) => i === idx ? { ...s, end: e.target.value } : s);
                                  const updated = { ...weekSchedule, [day]: { ...dayData, slots: newSlots } };
                                  setWeekSchedule(updated);
                                  localStorage.setItem('h2h_provider_schedule', JSON.stringify(updated));
                                }}
                              />
                              <button
                                type="button"
                                className="btn-remove-slot"
                                onClick={() => {
                                  const newSlots = dayData.slots.filter((_, i) => i !== idx);
                                  const updated = { ...weekSchedule, [day]: { ...dayData, slots: newSlots } };
                                  setWeekSchedule(updated);
                                  localStorage.setItem('h2h_provider_schedule', JSON.stringify(updated));
                                }}
                                disabled={dayData.slots.length <= 1}
                                aria-label="Remove slot"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="btn-add-slot"
                            onClick={() => {
                              const newSlot: DaySlot = { id: `${day}-${Date.now()}`, start: '13:00', end: '17:00' };
                              const updated = { ...weekSchedule, [day]: { ...dayData, slots: [...dayData.slots, newSlot] } };
                              setWeekSchedule(updated);
                              localStorage.setItem('h2h_provider_schedule', JSON.stringify(updated));
                            }}
                          >
                            <Plus size={13} /> Tambah Slot
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="schedule-save-bar">
                <button
                  className="btn-primary"
                  onClick={() => {
                    localStorage.setItem('h2h_provider_schedule', JSON.stringify(weekSchedule));
                    alert('Jadwal ketersediaan berhasil disimpan!');
                  }}
                >
                  Simpan Jadwal
                </button>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Jadwal tersimpan secara lokal dan akan disinkronkan saat fitur backend aktif.</p>
              </div>
            </div>
          )}

          {/* Consultation Planner */}
          {activeSubTab === 'sessions' && (
            <div className="sessions-container">
              <div className="section-header-box">
                <h3>Consultation Planner</h3>
                <p>Manage patient consult locks, review histories, and write confidential clinical notes.</p>
              </div>

              <div className="appointments-list">
                {appointments.map((appt) => (
                  <div key={appt.id} className={`appointment-card ${appt.status.toLowerCase()}`}>
                    <div className="card-top">
                      <div className="patient-info">
                        <h4>{appt.clientName}</h4>
                        <div className="email-sub">{appt.clientEmail}</div>
                      </div>
                      <span className={`status-badge ${appt.status.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="card-middle">
                      <div className="time-info">
                        <Clock size={16} />
                        <span>{appt.startTime}</span>
                      </div>
                      {appt.status === 'CONFIRMED' && (
                        <a href={appt.meetLink} target="_blank" rel="noopener noreferrer" className="btn-meet-link">
                          Join Google Meet
                        </a>
                      )}
                    </div>

                    <div className="card-bottom">
                      {appt.status === 'CONFIRMED' ? (
                        <button 
                          className="btn-primary write-notes-btn"
                          onClick={() => handleOpenNoteModal(appt)}
                        >
                          <Edit3 size={14} /> Write Session Notes
                        </button>
                      ) : appt.status === 'COMPLETED' ? (
                        <div className="notes-saved-preview">
                          <CheckCircle2 size={16} className="checked-icon" />
                          <div className="notes-summary">
                            <strong>Clinical Notes Filed:</strong>
                            <p>{appt.notes}</p>
                            {appt.recommendation && (
                              <div className="rec-preview">
                                Suggested Package: <span>{appt.recommendation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet & Payouts */}
          {activeSubTab === 'wallet' && (
            <div className="wallet-grid">
              
              {/* Earnings Metrics */}
              <div className="wallet-metrics-panel">
                <div className="wallet-card current">
                  <h4>Saldo Tersedia</h4>
                  <div className="val">{formatRp(walletBalance)}</div>
                  <p>Pendapatan siap dicairkan.</p>
                </div>
                <div className="wallet-card pending">
                  <h4>Menunggu Konfirmasi</h4>
                  <div className="val">{formatRp(pendingBalance)}</div>
                  <p>Menunggu validasi penyelesaian sesi.</p>
                </div>
                <div className="wallet-card total">
                  <h4>Total Pencairan</h4>
                  <div className="val">{formatRp(totalWithdrawn)}</div>
                  <p>Total yang sudah dicairkan.</p>
                </div>
              </div>

              {/* Bank Account Registration */}
              <div className="wallet-section-row">
                <div className="wallet-card-box bank-box">
                  <h3>Link Bank Account</h3>
                  <p className="card-subtitle">Verify your bank account for secure direct deposit payouts.</p>
                  
                  <form onSubmit={handleSaveBank} className="bank-form">
                    <div className="form-group">
                      <label htmlFor="bank-name">Bank Institution</label>
                      <select 
                        id="bank-name"
                        value={bankAccount.bankName}
                        onChange={e => setBankAccount({...bankAccount, bankName: e.target.value})}
                        required
                      >
                        <option value="">Select Bank</option>
                        <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                        <option value="Bank Mandiri">Bank Mandiri</option>
                        <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                        <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="account-num">Account Number</label>
                      <input 
                        type="text" 
                        id="account-num"
                        value={bankAccount.accountNumber}
                        onChange={e => setBankAccount({...bankAccount, accountNumber: e.target.value})}
                        placeholder="1234567890"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="account-holder">Account Holder Name</label>
                      <input 
                        type="text" 
                        id="account-holder"
                        value={bankAccount.accountHolder}
                        onChange={e => setBankAccount({...bankAccount, accountHolder: e.target.value})}
                        placeholder="Dr. Sarah Jenkins"
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary">Register Bank Account</button>
                  </form>
                </div>

                {/* Payout Withdrawal Request */}
                <div className="wallet-card-box payout-box">
                  <h3>Withdraw Payout</h3>
                  <p className="card-subtitle">Request manual settlement release from your available balance.</p>
                  
                  <form onSubmit={handleRequestPayout} className="payout-form">
                    <div className="form-group">
                      <label htmlFor="withdraw-amt">Jumlah Pencairan (Rp)</label>
                      <input 
                        type="number" 
                        id="withdraw-amt" 
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="cth. 1000000"
                        max={walletBalance}
                        required
                      />
                      <span className="balance-hint">Maks: {formatRp(walletBalance)}</span>
                    </div>

                    <button type="submit" className="btn-primary btn-withdraw" disabled={walletBalance === 0}>
                      Ajukan Pencairan
                    </button>
                  </form>

                  {/* Payout Logs Table */}
                  <div className="payouts-history-list">
                    <h4>Payout History</h4>
                    <table className="payouts-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map(p => (
                          <tr key={p.id}>
                            <td>{p.createdAt}</td>
                            <td><strong>{formatRp(p.amount)}</strong></td>
                            <td>
                              <span className={`badge-payout ${p.status.toLowerCase()}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Professional Profile */}
          {activeSubTab === 'profile' && (
            <div className="profile-grid">
              
              {/* Profile Details Edit */}
              <div className="profile-card-box bio-edit-box">
                <div className="box-header-row">
                  <h3>Biography</h3>
                  {!isEditingBio ? (
                    <button className="btn-edit-text" onClick={() => setIsEditingBio(true)}>Edit</button>
                  ) : (
                    <button className="btn-save-text" onClick={handleSaveBio}>Save</button>
                  )}
                </div>
                
                {isEditingBio ? (
                  <textarea 
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="bio-textarea"
                    rows={6}
                  />
                ) : (
                  <p className="bio-display-text">{bio}</p>
                )}
              </div>

              {/* Clinic Locations Management */}
              <div className="profile-card-box locations-box">
                <h3>Clinic Locations</h3>
                <p className="card-subtitle">Manage physical consulting suites for offline calendar slots.</p>
                
                <div className="locations-list">
                  {locations.map(loc => (
                    <div key={loc.id} className="location-item">
                      <MapPin className="pin-icon" size={18} />
                      <div className="loc-details">
                        <strong>{loc.name}</strong>
                        <p>{loc.address}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddLocation} className="add-location-form">
                  <h4>Add Clinic Location</h4>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Clinic Name (e.g. Kuningan Suite)"
                      value={newLocName}
                      onChange={e => setNewLocName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Full Address"
                      value={newLocAddress}
                      onChange={e => setNewLocAddress(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">Add Location</button>
                </form>
              </div>

              {/* Reviews Feed */}
              <div className="profile-card-box reviews-box">
                <h3>Patient Feedback</h3>
                <p className="card-subtitle">Reviews submitted after completed consultations.</p>
                
                <div className="reviews-feed">
                  {reviews.map(rev => (
                    <div key={rev.id} className="review-feed-item">
                      <div className="review-item-header">
                        <strong>{rev.clientName}</strong>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <div className="review-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < rev.rating ? "#FBBF24" : "none"} 
                            color={i < rev.rating ? "#FBBF24" : "#E2E8F0"} 
                          />
                        ))}
                      </div>
                      <p className="review-text">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Session Notes Drawer Modal */}
      {selectedAppt && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content notes-drawer-modal" style={{ maxWidth: '600px' }}>
            <button className="close-btn" onClick={() => setSelectedAppt(null)}><X size={24} /></button>
            <h3>Secure Clinical Intake & Session Notes</h3>
            <p className="notes-meta-info">Patient: <strong>{selectedAppt.clientName}</strong> | Session: <strong>{selectedAppt.id}</strong></p>
            
            <div className="clinical-security-alert">
              <Shield size={20} className="shield-icon" />
              <div>
                <strong>PII Sanitized Environment</strong>
                <p>Clinical logs are stored with industry-grade encryption. Organizations never receive session note text payloads.</p>
              </div>
            </div>

            <div className="form-group notes-group">
              <label htmlFor="notes-textarea">Clinical Progress Notes (Confidential)</label>
              <textarea 
                id="notes-textarea"
                rows={8}
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                placeholder="Write progress details, clinical impressions, safety plan, etc..."
                required
              />
            </div>

            <div className="form-group recommendation-group">
              <label htmlFor="rec-select">Follow-up Recommendation Program</label>
              <select 
                id="rec-select"
                value={followUpRec}
                onChange={e => setFollowUpRec(e.target.value)}
              >
                <option value="">None (Single Session)</option>
                <option value="Anxiety Support Package (3-Session Bundle)">Anxiety Support Package (3-Session Bundle)</option>
                <option value="Depression Support Package (5-Session Bundle)">Depression Support Package (5-Session Bundle)</option>
                <option value="Stress & Work Burnout Program">Stress & Work Burnout Program</option>
                <option value="Family Issues Counseling Package">Family Issues Counseling Package</option>
              </select>
            </div>

            <div className="drawer-actions">
              <button className="btn-secondary" onClick={() => setSelectedAppt(null)}>Discard</button>
              <button className="btn-primary" onClick={handleSaveNotes}>
                <Send size={16} /> File Confidential Notes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProviderDashboard;
