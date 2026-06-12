import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { PaymentFlow } from "./PaymentFlow";

export default function PaymentPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <PaymentFlow />
      </main>
      <Footer />
    </div>
  );
}
