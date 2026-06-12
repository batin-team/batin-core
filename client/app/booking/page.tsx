import { Suspense } from "react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { BookingFlow } from "./BookingFlow";

export default function BookingPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section">
        <Suspense fallback={<section className="panel"><p>Memuat booking flow...</p></section>}>
          <BookingFlow />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
