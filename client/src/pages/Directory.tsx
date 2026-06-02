import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProviderCard from '../components/ProviderCard';
import BookingModal from '../components/BookingModal';
import DiscoveryDrawer from '../components/DiscoveryDrawer';


import Footer from '../components/Footer';

const Directory: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [filters, setFilters] = useState({ isOnline: true, isOffline: true });

  const providers = [
    { id: 'jenkins-id-123', name: 'Dr. Sarah Jenkins', title: 'Clinical Psychologist', rating: 4.9, specialties: ['Anxiety', 'Depression'], price: 120, isOnline: true, isOffline: true, avatar: '/sarah_jenkins.png' },
    { id: 'wong-id-456', name: 'Marcus Wong', title: 'Counselor', rating: 4.7, specialties: ['Career', 'Stress'], price: 80, isOnline: true, isOffline: false, avatar: '/marcus_wong.png' },
    { id: 'rodriguez-id-789', name: 'Elena Rodriguez', title: 'Family Therapist', rating: 4.8, specialties: ['Parenting', 'Family'], price: 100, isOnline: false, isOffline: true, avatar: '/elena_rodriguez.png' },
  ];

  const filteredProviders = providers.filter(p => {
    if (filters.isOnline && p.isOnline) return true;
    if (filters.isOffline && p.isOffline) return true;
    return false;
  });

  const handleFilterMatch = (isOnline: boolean, isOffline: boolean) => {
    setFilters({ isOnline, isOffline });
  };

  return (
    <div className="directory-page">
      <Navbar />
      <div className="container directory-content">
        <aside className="filters">
          <h3>Smart Discovery</h3>
          <p style={{color: 'var(--text-light)', marginBottom: '1.5rem'}}>
            Not sure who to talk to? Use our matching tool.
          </p>
          <button 
            className="btn-match" 
            onClick={() => setDrawerOpen(true)}
          >
            Find My Match
          </button>
        </aside>
        
        <main className="results">
          <div className="results-header">
            <h2>Available Providers</h2>
            <span>{filteredProviders.length} results found</span>
          </div>
          <div className="provider-grid">
            {filteredProviders.map(p => (
              <div key={p.id} onClick={() => setSelectedProvider(p)} style={{ cursor: 'pointer' }}>
                <ProviderCard {...p} />
              </div>
            ))}
          </div>
        </main>
      </div>

      <DiscoveryDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onFilterMatch={handleFilterMatch}
      />

      {selectedProvider && (
        <BookingModal 
          providerId={selectedProvider.id}
          providerName={selectedProvider.name} 
          onClose={() => setSelectedProvider(null)} 
        />
      )}

      <Footer />
    </div>
  );
};

export default Directory;
