import { Footer } from "../../../components/Footer";
import { NavBar } from "../../../components/NavBar";
import { ConfirmationView } from "./ConfirmationView";

export default function ConfirmationPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <ConfirmationView />
      </main>
      <Footer />
    </div>
  );
}
