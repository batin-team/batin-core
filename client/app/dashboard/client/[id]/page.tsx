import { Footer } from "../../../../components/Footer";
import { NavBar } from "../../../../components/NavBar";
import { ClientSessionDetail } from "./ClientSessionDetail";

export function generateStaticParams() {
  return [{ id: "dummy" }];
}

export default function ClientSessionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="page-shell">
      <NavBar active="sessions" />
      <main className="container section">
        <ClientSessionDetail id={params.id} />
      </main>
      <Footer />
    </div>
  );
}
