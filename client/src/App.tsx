import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Directory from './pages/Directory';
import AdminDashboard from './pages/AdminDashboard';
import ProviderOnboard from './pages/ProviderOnboard';
import ProviderDashboard from './pages/ProviderDashboard';
import CorporatePortal from './pages/CorporatePortal';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/onboard-provider" element={<ProviderOnboard />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/corporate/portal" element={<CorporatePortal />} />
      </Routes>
    </Router>
  );
}

export default App;
