import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Building, Users, Mail, Download, FileText, 
  CheckCircle2, TrendingUp, AlertCircle, Trash2, Send 
} from 'lucide-react';


interface Employee {
  id: string;
  email: string;
  fullName?: string;
  joinedAt?: string;
  status: 'ACTIVE' | 'INVITED' | 'REVOKED';
  sessionsUsed: number;
}

interface CorporateInvoice {
  id: string;
  billingPeriod: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  dueDate: string;
}

const CorporatePortal: React.FC = () => {
  const [companyName] = useState('ACME Corp');
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'roster' | 'billing'>('metrics');

  // Employee Roster States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Billing Invoices States
  const [invoices, setInvoices] = useState<CorporateInvoice[]>([]);

  // Statistics
  const totalPackagesPurchased = 150;
  const sessionsCompleted = 84;
  const activeStaffEnrolled = 62;

  useEffect(() => {
    // Initial Employee Roster
    const initialRoster: Employee[] = [
      { id: 'emp-1', email: 'alice@acme.com', fullName: 'Alice Henderson', joinedAt: '2026-04-10', status: 'ACTIVE', sessionsUsed: 6 },
      { id: 'emp-2', email: 'bob@acme.com', fullName: 'Bob Carter', joinedAt: '2026-04-12', status: 'ACTIVE', sessionsUsed: 3 },
      { id: 'emp-3', email: 'carol@acme.com', joinedAt: undefined, status: 'INVITED', sessionsUsed: 0 },
      { id: 'emp-4', email: 'david@acme.com', fullName: 'David Spade', joinedAt: '2026-04-15', status: 'ACTIVE', sessionsUsed: 12 },
      { id: 'emp-5', email: 'eva@acme.com', joinedAt: '2026-04-01', status: 'REVOKED', sessionsUsed: 4 }
    ];
    
    const storedRoster = localStorage.getItem('h2h_corporate_roster');
    if (storedRoster) {
      setEmployees(JSON.parse(storedRoster));
    } else {
      setEmployees(initialRoster);
      localStorage.setItem('h2h_corporate_roster', JSON.stringify(initialRoster));
    }

    // Initial Corporate Invoices
    const initialInvoices: CorporateInvoice[] = [
      { id: 'inv-corporate-001', billingPeriod: 'May 2026', amount: 15000000, status: 'PAID', dueDate: '2026-05-31' },
      { id: 'inv-corporate-002', billingPeriod: 'April 2026', amount: 12000000, status: 'PAID', dueDate: '2026-04-30' },
      { id: 'inv-corporate-003', billingPeriod: 'June 2026 (Current)', amount: 18000000, status: 'PENDING', dueDate: '2026-06-30' }
    ];
    setInvoices(initialInvoices);
  }, []);

  // Send Roster Invitation
  const handleInviteEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    // Prevent duplicate emails
    if (employees.some(emp => emp.email.toLowerCase() === inviteEmail.toLowerCase())) {
      alert('This email has already been invited or registered.');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      email: inviteEmail.trim().toLowerCase(),
      status: 'INVITED',
      sessionsUsed: 0
    };

    const updatedRoster = [...employees, newEmp];
    setEmployees(updatedRoster);
    localStorage.setItem('h2h_corporate_roster', JSON.stringify(updatedRoster));
    setInviteEmail('');
    alert(`Corporate benefit invite sent successfully to ${inviteEmail}.`);
  };

  // Revoke employee benefit
  const handleRevokeBenefit = (empId: string) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, status: 'REVOKED' as const };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('h2h_corporate_roster', JSON.stringify(updated));
    alert('Employee benefit revoked successfully.');
  };

  // Reactivate employee benefit
  const handleReactivateBenefit = (empId: string) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, status: 'ACTIVE' as const, joinedAt: new Date().toISOString().split('T')[0] };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('h2h_corporate_roster', JSON.stringify(updated));
    alert('Employee benefit reactivated successfully.');
  };

  const handleDownloadInvoice = (inv: CorporateInvoice) => {
    // Generate simple print invoice layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Corporate Invoice - ${inv.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
            .company { font-size: 24px; font-weight: bold; color: #6366f1; }
            .title { font-size: 20px; text-align: right; }
            .details { margin-bottom: 40px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { background: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: left; }
            .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .total { font-size: 18px; text-align: right; font-weight: bold; }
            .footer { text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="company">Heart-to-Heart Wellness Portal</div>
                <div>B2B Enterprise Solutions</div>
              </div>
              <div class="title">
                <strong>INVOICE</strong><br>
                Invoice ID: ${inv.id}<br>
                Period: ${inv.billingPeriod}
              </div>
            </div>
            <div class="details">
              <strong>Billed To:</strong><br>
              ${companyName}<br>
              Corporate Benefits Division<br>
              Status: <strong>${inv.status}</strong>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Corporate Wellness Session Voucher Package (Standard Split)</td>
                  <td>1</td>
                  <td>Rp ${inv.amount.toLocaleString('id-ID')}</td>
                  <td>Rp ${inv.amount.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">Total Due: Rp ${inv.amount.toLocaleString('id-ID')}</div>
            <div class="footer">
              Thank you for partnering with Heart-to-Heart. For queries, contact B2B billing at support@h2h.com.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="corporate-portal-page">
      <Navbar />

      <main className="container corporate-main">
        {/* Portal Hero Card */}
        <section className="corporate-hero">
          <div className="hero-glass-card">
            <div className="hero-content">
              <div className="company-logo-box">
                <Building className="building-icon" size={40} />
              </div>
              <div className="hero-details">
                <div className="role-badge">ENTERPRISE PORTAL</div>
                <h2>{companyName} Wellness Workspace</h2>
                <p className="corporate-desc">Manage employee mental health benefits, invite staff members, and track utilization analytics securely.</p>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="corporate-tabs">
              <button 
                className={`corporate-tab-btn ${activeSubTab === 'metrics' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('metrics')}
              >
                <TrendingUp size={16} /> Wellness Metrics
              </button>
              <button 
                className={`corporate-tab-btn ${activeSubTab === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('roster')}
              >
                <Users size={16} /> Staff Roster ({employees.filter(e => e.status === 'ACTIVE').length})
              </button>
              <button 
                className={`corporate-tab-btn ${activeSubTab === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('billing')}
              >
                <FileText size={16} /> Billing & Invoices
              </button>
            </div>
          </div>
        </section>

        {/* Tab content area */}
        <div className="corporate-tab-content">
          
          {/* Wellness Metrics Tab */}
          {activeSubTab === 'metrics' && (
            <div className="metrics-tab-layout">
              <div className="section-header-box">
                <h3>Wellness Engagement Metrics</h3>
                <p>Track benefits enrollment ratios and aggregated employee consultation volumes. Private session contents are 100% confidential.</p>
              </div>

              {/* Metrics cards row */}
              <div className="metrics-cards-grid">
                <div className="metric-card">
                  <h4>Vouchers Purchased</h4>
                  <div className="metric-val">{totalPackagesPurchased}</div>
                  <p className="metric-desc">Wellness sessions allocated in current corporate plan.</p>
                </div>

                <div className="metric-card">
                  <h4>Sessions Completed</h4>
                  <div className="metric-val">{sessionsCompleted}</div>
                  <p className="metric-desc">Completed consultations by enrolled staff.</p>
                </div>

                <div className="metric-card">
                  <h4>Enrolled Employees</h4>
                  <div className="metric-val">{activeStaffEnrolled}</div>
                  <p className="metric-desc">Staff members with activated wellness keys.</p>
                </div>
              </div>

              {/* Package Utilization Graph & Privacy Statement */}
              <div className="metrics-detailed-row">
                <div className="utilization-box corporate-detail-card">
                  <h3>Benefit Utilization Ratio</h3>
                  <div className="utilization-visual">
                    <div className="progress-ring-container">
                      <div className="progress-percentage-label">
                        {Math.round((sessionsCompleted / totalPackagesPurchased) * 100)}%
                      </div>
                      <div className="progress-sub-text">Used</div>
                    </div>
                    <div className="progress-stats">
                      <div className="progress-stat-item">
                        <span className="dot completed"></span>
                        <span>Completed Sessions: <strong>{sessionsCompleted}</strong></span>
                      </div>
                      <div className="progress-stat-item">
                        <span className="dot remaining"></span>
                        <span>Remaining Sessions: <strong>{totalPackagesPurchased - sessionsCompleted}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="privacy-assurance-box corporate-detail-card">
                  <div className="privacy-header">
                    <AlertCircle size={24} className="alert-icon" />
                    <h3>Employee Privacy Guarantee</h3>
                  </div>
                  <p className="privacy-p">
                    Heart-to-Heart operates on a strict **Intake Privacy Standard**. As an employer or sponsor, you receive aggregated metrics (total bookings, headcount usage) to calculate ROI, but you will **never** have access to:
                  </p>
                  <ul className="privacy-list">
                    <li>Individual assessment responses or scoring profiles.</li>
                    <li>Clinical session progress notes compiled by psychologists.</li>
                    <li>The names of specific clinicians seen by individual staff members.</li>
                    <li>Booking times linked to individual staff identities.</li>
                  </ul>
                  <div className="shield-assurance">
                    <CheckCircle2 size={16} /> Fully Compliant Mental Health Privacy Shield
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Roster Tab */}
          {activeSubTab === 'roster' && (
            <div className="roster-tab-layout">
              <div className="section-header-box">
                <h3>Enrolled Staff Roster</h3>
                <p>Send B2B benefit activation emails, invite new hires, and manage roster permissions.</p>
              </div>

              {/* Roster Controls Row */}
              <div className="roster-actions-card">
                <h4>Invite Employee to Wellness Plan</h4>
                <form onSubmit={handleInviteEmployee} className="invite-form">
                  <div className="input-group">
                    <Mail size={18} className="mail-icon" />
                    <input 
                      type="email" 
                      placeholder="employee@yourcompany.com" 
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary btn-invite">
                    <Send size={16} /> Send Invitation
                  </button>
                </form>
              </div>

              {/* Roster Table */}
              <div className="roster-table-box">
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>Registered Name</th>
                      <th>Enrollment Date</th>
                      <th>Sessions Logged</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className={`roster-row ${emp.status.toLowerCase()}`}>
                        <td><strong>{emp.email}</strong></td>
                        <td>{emp.fullName || <span className="pending-txt">Pending signup...</span>}</td>
                        <td>{emp.joinedAt || 'N/A'}</td>
                        <td><strong>{emp.sessionsUsed} sessions</strong></td>
                        <td>
                          <span className={`badge-status ${emp.status.toLowerCase()}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          {emp.status === 'ACTIVE' || emp.status === 'INVITED' ? (
                            <button 
                              className="btn-revoke"
                              onClick={() => handleRevokeBenefit(emp.id)}
                            >
                              <Trash2 size={14} /> Revoke Benefit
                            </button>
                          ) : (
                            <button 
                              className="btn-reactivate"
                              onClick={() => handleReactivateBenefit(emp.id)}
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Billing & Invoices Tab */}
          {activeSubTab === 'billing' && (
            <div className="billing-tab-layout">
              <div className="section-header-box">
                <h3>Invoice History & Statements</h3>
                <p>Manage direct corporate billing statements and download tax-compliant PDF invoices.</p>
              </div>

              <div className="billing-grid-container">
                {invoices.map(inv => (
                  <div key={inv.id} className="billing-invoice-card">
                    <div className="invoice-header-row">
                      <FileText size={24} className="invoice-icon" />
                      <span className={`invoice-status-badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="invoice-body">
                      <h3>{inv.billingPeriod}</h3>
                      <div className="amount-txt">Rp {inv.amount.toLocaleString('id-ID')}</div>
                      <p className="due-date-txt">Due Date: {inv.dueDate}</p>
                    </div>

                    <div className="invoice-footer">
                      <button 
                        className="btn-download-invoice"
                        onClick={() => handleDownloadInvoice(inv)}
                      >
                        <Download size={14} /> Print Statement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CorporatePortal;
