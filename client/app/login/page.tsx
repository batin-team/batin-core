import { Suspense } from "react";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="container section auth-layout">
        <Suspense fallback={<section className="panel auth-panel"><p>Memuat form login...</p></section>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
