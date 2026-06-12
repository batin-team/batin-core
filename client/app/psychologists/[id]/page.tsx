import PsychologistDetailClient from "./PsychologistDetailClient";

export function generateStaticParams() {
  return [{ id: "dummy" }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <PsychologistDetailClient id={params.id} />;
}
