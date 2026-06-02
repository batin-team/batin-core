import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, CheckCircle, FileText, Briefcase } from 'lucide-react';
import { providerService } from '../services/api';
import { useNavigate } from 'react-router-dom';


const ProviderOnboard: React.FC = () => {
  const navigate = useNavigate();
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'PARTNER'>('MEMBER');
  const [professionalType, setProfessionalType] = useState<'PSYCHOLOGIST' | 'COUNSELOR' | 'THERAPIST' | 'CONSULTANT'>('PSYCHOLOGIST');
  const [hourlyRate, setHourlyRate] = useState(100);
  const [specialties, setSpecialties] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        membershipType,
        professionalType,
        hourlyRate: Number(hourlyRate),
        specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: qualifications.split(',').map(q => q.trim()).filter(Boolean),
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        bio
      };
      await providerService.onboard(payload);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to submit onboarding form. Please register/login first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="provider-onboard-page">
      <Navbar />

      <main className="container onboard-main">
        <header className="onboard-header">
          <button className="btn-back" onClick={() => navigate('/directory')}>
            <ArrowLeft size={18} /> Back to Directory
          </button>
          <h1>Become a Verified Provider</h1>
          <p className="onboard-subtitle">Join our trusted digital ecosystem connecting organizations and individuals with professional practitioners.</p>
        </header>

        {isSuccess ? (
          <div className="onboard-success-box">
            <CheckCircle size={64} style={{ color: '#10B981', marginBottom: '1rem' }} />
            <h2>Application Submitted!</h2>
            <p className="success-description">
              Your credentials are now <strong>PENDING verification</strong>. Our operations team will audit your degrees, credentials, and practice permit.
            </p>
            <div className="success-notes">
              <strong>Onboarding Policy Note:</strong>
              <p>Applications that do not meet professional credentials will be rejected with admin notes. You will be notified via email.</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/directory')}>View Directory</button>
          </div>
        ) : (
          <div className="onboard-card">
            <div className="onboard-info-sidebar">
              <div className="info-section">
                <Briefcase size={24} className="info-icon" />
                <div>
                  <h4>Internal vs Partner practice</h4>
                  <p><strong>Member Providers</strong> operate under the platform branding (70/30 split). <strong>Partner Providers</strong> set their own practice rules and pricing (15% commission).</p>
                </div>
              </div>
              <div className="info-section">
                <FileText size={24} className="info-icon" />
                <div>
                  <h4>Credentials verification</h4>
                  <p>You must prepare copies of your Professional License, Practice Permit, and Degree Certificate for admin auditing post-submission.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="onboard-form">
              <h3>Practice Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="membership-type">Membership Category</label>
                  <select 
                    id="membership-type"
                    value={membershipType} 
                    onChange={e => setMembershipType(e.target.value as any)}
                  >
                    <option value="MEMBER">Member Provider (Platform Brand, 70% share)</option>
                    <option value="PARTNER">Partner Provider (Own Practice, 15% fee)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="professional-type">Professional Focus</label>
                  <select 
                    id="professional-type"
                    value={professionalType} 
                    onChange={e => setProfessionalType(e.target.value as any)}
                  >
                    <option value="PSYCHOLOGIST">Psychologist</option>
                    <option value="COUNSELOR">Counselor</option>
                    <option value="THERAPIST">Therapist</option>
                    <option value="CONSULTANT">Mental Health Consultant</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hourly-rate">Hourly Rate ($)</label>
                  <input 
                    type="number" 
                    id="hourly-rate"
                    value={hourlyRate}
                    min={30}
                    max={500}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="languages">Languages (Comma separated)</label>
                  <input 
                    type="text" 
                    id="languages"
                    value={languages}
                    onChange={e => setLanguages(e.target.value)}
                    placeholder="English, Spanish, Mandarin"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialties">Clinical Specialties (Comma separated)</label>
                <input 
                  type="text" 
                  id="specialties"
                  value={specialties}
                  onChange={e => setSpecialties(e.target.value)}
                  placeholder="Anxiety, Depression, Trauma recovery, Grief counseling"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualifications">Degrees / Qualifications (Comma separated)</label>
                <input 
                  type="text" 
                  id="qualifications"
                  value={qualifications}
                  onChange={e => setQualifications(e.target.value)}
                  placeholder="M.Sc. Clinical Psychology, Certified Family Therapist"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Professional Biography</label>
                <textarea 
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell clients about your clinical background, therapy approach, and practice philosophy..."
                  rows={5}
                  required
                />
              </div>

              {errorMsg && <p className="onboard-error-msg">{errorMsg}</p>}

              <button type="submit" className="btn-primary btn-submit-onboard" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProviderOnboard;
