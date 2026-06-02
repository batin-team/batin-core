import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  BarChart2, ShieldAlert, Users, TrendingUp, ArrowLeft, 
  Check, X, FileText, Ticket, CreditCard, Shield, Activity 
} from 'lucide-react';
import { analyticsService, providerService, supportService } from '../services/api';
import { useNavigate } from 'react-router-dom';


interface Stats {
  totalRevenue: number;
  sessionCount: number;
  activeUsers: number;
  retention: {
    returningUsers: number;
    newUsers: number;
  };
}

interface AuditLog {
  id: string;
  action: string;
  entityId: string | null;
  createdAt: string;
  metadata: any;
  user: {
    fullName: string | null;
    role: string;
  } | null;
}

interface PendingProvider {
  id: string;
  userId: string;
  membershipType: 'MEMBER' | 'PARTNER';
  professionalType: 'PSYCHOLOGIST' | 'COUNSELOR' | 'THERAPIST' | 'CONSULTANT';
  status: string;
  specialties: string[];
  hourlyRate: number;
  bio?: string;
  user: {
    fullName: string;
    email: string;
  };
  documents: Array<{
    id: string;
    type: string;
    status: string;
    s3Key: string;
  }>;
}

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'payments' | 'support' | 'audits'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal for credential document preview
  const [previewDoc, setPreviewDoc] = useState<{ type: string; url: string } | null>(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, logsRes, providersRes, ticketsRes] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getAuditLogs(),
        providerService.getPendingProviders(),
        supportService.getTickets()
      ]);
      setStats(statsRes.data);
      setAuditLogs(logsRes.data);
      setPendingProviders(providersRes.data);
      setSupportTickets(ticketsRes.data);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to fetch admin dashboard data. Make sure you have Administrator privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleVerifyProvider = async (providerId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await providerService.verifyProvider(providerId, status);
      // Refresh provider list
      const updated = await providerService.getPendingProviders();
      setPendingProviders(updated.data);
      alert(`Provider status successfully updated to ${status}.`);
    } catch (err: any) {
      alert(`Failed to update provider status: ${err?.message}`);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await supportService.updateTicketStatus(ticketId, status);
      // Refresh tickets
      const updated = await supportService.getTickets();
      setSupportTickets(updated.data);
      alert(`Ticket status updated to ${status}.`);
    } catch (err: any) {
      alert(`Failed to update ticket: ${err?.message}`);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <Navbar />

      <main className="container admin-main">
        <header className="admin-header">
          <button className="btn-back-dashboard" onClick={() => navigate('/directory')}>
            <ArrowLeft size={18} /> Back to Directory
          </button>
          <h1>Marketplace Control & Analytics</h1>
          <p className="admin-subtitle">Secure portal monitoring revenue splits, psychologist credentials audits, support tickets, and immutable PII-redacted audit logs.</p>
        </header>

        {/* Tab Navigation Menu */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart2 size={16} /> Overview
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            <Shield size={16} /> Provider Verification ({pendingProviders.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={16} /> Payment Monitoring
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <Ticket size={16} /> Support Tickets ({supportTickets.filter(t => t.status !== 'RESOLVED').length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'audits' ? 'active' : ''}`}
            onClick={() => setActiveTab('audits')}
          >
            <Activity size={16} /> System Audit Logs
          </button>
        </div>

        {isLoading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading administrative dashboard data...</p>
          </div>
        ) : errorMsg ? (
          <div className="admin-error-box">
            <ShieldAlert size={48} className="error-icon" />
            <h3>Access Restricted</h3>
            <p>{errorMsg}</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        ) : (
          <div className="admin-tab-content">
            
            {/* Overview Analytics Tab */}
            {activeTab === 'overview' && (
              <div className="admin-grid">
                <div className="stats-cards-grid">
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <TrendingUp className="stat-icon" size={24} />
                      <h3>Monthly Revenue Volume</h3>
                    </div>
                    <div className="stat-val">Rp {stats?.totalRevenue.toLocaleString('id-ID')}</div>
                    <p className="stat-description">Total marketplace volume processed this month.</p>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <BarChart2 className="stat-icon" size={24} />
                      <h3>Completed Sessions</h3>
                    </div>
                    <div className="stat-val">{stats?.sessionCount}</div>
                    <p className="stat-description">Completed consultations this month.</p>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <Users className="stat-icon" size={24} />
                      <h3>Active Users</h3>
                    </div>
                    <div className="stat-val">{stats?.activeUsers}</div>
                    <p className="stat-description">Registered and verified community members.</p>
                  </div>
                </div>

                <div className="dashboard-section-box retention-box">
                  <h3>Client Retention Profile</h3>
                  <p className="section-subtitle">Core customer loyalty metric indicating user return rates.</p>
                  <div className="retention-meters">
                    <div className="retention-meter-row">
                      <div className="meter-label">
                        <span>Returning Clients (2+ completed sessions)</span>
                        <strong>{stats?.retention.returningUsers}</strong>
                      </div>
                      <div className="meter-bar">
                        <div 
                          className="meter-fill returning" 
                          style={{ width: `${(stats?.retention.returningUsers || 0) / ((stats?.retention.returningUsers || 0) + (stats?.retention.newUsers || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="retention-meter-row">
                      <div className="meter-label">
                        <span>New Clients (1 completed session)</span>
                        <strong>{stats?.retention.newUsers}</strong>
                      </div>
                      <div className="meter-bar">
                        <div 
                          className="meter-fill new" 
                          style={{ width: `${(stats?.retention.newUsers || 0) / ((stats?.retention.returningUsers || 0) + (stats?.retention.newUsers || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Verification Tab */}
            {activeTab === 'providers' && (
              <div className="dashboard-section-box">
                <h3>Psychologist Verification Audits</h3>
                <p className="section-subtitle">Review onboarding credentials, academic transcripts, and clinical practice permits.</p>
                {pendingProviders.length === 0 ? (
                  <p className="empty-message">No pending provider verifications at this time.</p>
                ) : (
                  <div className="audit-table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Professional Type</th>
                          <th>Membership</th>
                          <th>Hourly Rate</th>
                          <th>Submitted Credentials</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingProviders.map((prov) => (
                          <tr key={prov.id}>
                            <td>
                              <strong>{prov.user.fullName}</strong>
                              <div className="email-sub">{prov.user.email}</div>
                              <p className="bio-snippet" style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.4rem', maxWidth: '300px' }}>
                                {prov.bio}
                              </p>
                            </td>
                            <td><span className="badge-role">{prov.professionalType}</span></td>
                            <td>{prov.membershipType}</td>
                            <td><strong>${prov.hourlyRate}/hr</strong></td>
                            <td>
                              <div className="docs-list">
                                {prov.documents && prov.documents.length > 0 ? (
                                  prov.documents.map((doc) => (
                                    <button 
                                      key={doc.id} 
                                      className="btn-view-doc"
                                      onClick={() => setPreviewDoc({ type: doc.type, url: doc.s3Key })}
                                    >
                                      <FileText size={14} /> {doc.type}
                                    </button>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                    No documents (Auto-verified Mock)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button 
                                  className="btn-approve"
                                  onClick={() => handleVerifyProvider(prov.id, 'APPROVED')}
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button 
                                  className="btn-reject"
                                  onClick={() => handleVerifyProvider(prov.id, 'REJECTED')}
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Payment Monitoring Tab */}
            {activeTab === 'payments' && (
              <div className="dashboard-section-box">
                <h3>Ledger Entries & Splits</h3>
                <p className="section-subtitle">Real-time ledger verifying 15% standard commission commission splits and 30% corporate packages.</p>
                
                <div className="split-explainer-cards">
                  <div className="explainer-card">
                    <h4>Standard Split (15%)</h4>
                    <p>Standard client sessions deduct a 15% commission platform fee, routing 85% directly to the Psychologist's wallet balance.</p>
                  </div>
                  <div className="explainer-card">
                    <h4>Corporate Partner Split (30%)</h4>
                    <p>Sessions booked via B2B Corporate Wellness employee keys incur a 30% platform split, funding the corporate safety network and analytics.</p>
                  </div>
                </div>

                <div className="audit-table-wrapper" style={{ marginTop: '2rem' }}>
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Client Reference</th>
                        <th>Psychologist</th>
                        <th>Total Charged</th>
                        <th>Ledger Platform Share</th>
                        <th>Ledger Provider Share</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>tx-mock-001</code></td>
                        <td>Jane Doe (Standard)</td>
                        <td>Dr. Sarah Jenkins</td>
                        <td>$120.00</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: '700' }}>$18.00 (15%)</span></td>
                        <td><span style={{ color: '#10B981', fontWeight: '700' }}>$102.00 (85%)</span></td>
                        <td><span className="badge-status-completed">SUCCESS</span></td>
                      </tr>
                      <tr>
                        <td><code>tx-mock-002</code></td>
                        <td>John Smith (Standard)</td>
                        <td>Marcus Wong</td>
                        <td>$80.00</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: '700' }}>$12.00 (15%)</span></td>
                        <td><span style={{ color: '#10B981', fontWeight: '700' }}>$68.00 (85%)</span></td>
                        <td><span className="badge-status-completed">SUCCESS</span></td>
                      </tr>
                      <tr>
                        <td><code>tx-mock-003</code></td>
                        <td>ACME Corp Employee (B2B)</td>
                        <td>Dr. Elena Rodriguez</td>
                        <td>$150.00</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: '700' }}>$45.00 (30%)</span></td>
                        <td><span style={{ color: '#10B981', fontWeight: '700' }}>$105.00 (70%)</span></td>
                        <td><span className="badge-status-completed">SUCCESS</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'support' && (
              <div className="dashboard-section-box">
                <h3>Active Support Tickets</h3>
                <p className="section-subtitle">Respond to client booking bugs, rescheduling requests, or receipt/invoice queries.</p>
                {supportTickets.length === 0 ? (
                  <p className="empty-message">No support tickets found.</p>
                ) : (
                  <div className="audit-table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Ticket Info</th>
                          <th>Subject</th>
                          <th>Description Message</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>
                              <strong>{ticket.user?.fullName || 'Anonymous User'}</strong>
                              <div className="email-sub">{ticket.user?.email || 'N/A'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                                {new Date(ticket.createdAt).toLocaleString()}
                              </div>
                            </td>
                            <td><strong>{ticket.subject}</strong></td>
                            <td><p className="ticket-msg-cell">{ticket.message}</p></td>
                            <td>
                              <span className={`badge-ticket-status ${ticket.status.toLowerCase()}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && (
                                  <button 
                                    className="btn-ticket-action"
                                    onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                                  >
                                    Acknowledge
                                  </button>
                                )}
                                {ticket.status !== 'RESOLVED' && (
                                  <button 
                                    className="btn-ticket-resolve"
                                    onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                                  >
                                    Resolve
                                  </button>
                                )}
                                {ticket.status === 'RESOLVED' && (
                                  <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: '700' }}>
                                    Closed
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* System Audit Logs Tab */}
            {activeTab === 'audits' && (
              <div className="dashboard-section-box audit-logs-box">
                <div className="audit-logs-header">
                  <h3>Immutable System Audit Logs</h3>
                  <span className="badge-immutable">IMMUTABLE</span>
                </div>
                <p className="section-subtitle">Real-time log of security events. Sensitive PII attributes (passwords, emails, phone numbers, addresses) are scrubbed at the query level before layout presentation.</p>
                
                <div className="audit-table-wrapper">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Action / Endpoint</th>
                        <th>Performed By</th>
                        <th>Entity Ref</th>
                        <th>Redacted Metadata Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="timestamp">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="action"><code>{log.action}</code></td>
                          <td className="user">{log.user?.fullName || 'Anonymous'} <span className="user-role">{log.user?.role || 'GUEST'}</span></td>
                          <td className="entity">{log.entityId || 'N/A'}</td>
                          <td className="metadata">
                            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Credential Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content doc-preview-modal" style={{ maxWidth: '600px' }}>
            <button className="close-btn" onClick={() => setPreviewDoc(null)}><X size={24} /></button>
            <h3>Credentials Document Preview</h3>
            <p className="doc-preview-meta">Type: <strong>{previewDoc.type}</strong></p>
            <div className="doc-preview-frame">
              <div className="mock-pdf-viewer">
                <FileText size={48} className="pdf-icon" />
                <h4>{previewDoc.url}</h4>
                <p>Immutable Credentials Verification Object</p>
                <div className="verified-stamp">VERIFIED FILE CHECK</div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setPreviewDoc(null)} style={{ marginTop: '1.5rem', width: '100%' }}>Close Preview</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
