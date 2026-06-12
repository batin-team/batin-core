import { Footer } from "../../../components/Footer";
import { NavBar } from "../../../components/NavBar";
import { ClientSessions } from "./ClientSessions";

export default function ClientDashboardPage() {
  return (
    <div className="page-shell">
      <NavBar active="sessions" />
      <main className="container section">
        <ClientSessions />
      </main>
      <Footer />
    </div>
  );
}
