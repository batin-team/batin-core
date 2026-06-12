import Link from "next/link";
import { CalendarDays, Star, Video } from "lucide-react";
import type { Psychologist } from "@mindbridge/shared";

export function PsychologistCard({ psychologist }: { psychologist: Psychologist }) {
  return (
    <article className="psych-card">
      <div className="psych-head">
        <div className="avatar">
          <img src={psychologist.avatarUrl} alt={psychologist.name} />
        </div>
        <div>
          <h3 style={{ fontSize: 20 }}>{psychologist.name}</h3>
          <p>{psychologist.title}</p>
        </div>
      </div>
      <div className="chips">
        {psychologist.specializations.map((item) => (
          <span className="chip" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="muted-box" style={{ display: "grid", gap: 8 }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          <Star size={15} fill="#F4A261" color="#F4A261" /> {psychologist.rating} / 5
        </p>
        <p>
          <Video size={15} /> {psychologist.serviceMode}
        </p>
        <p>
          <CalendarDays size={15} /> Slot terdekat: {psychologist.nextSlot}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link className="button button-primary" href={`/psychologists/${psychologist.id}`}>
          Lihat Profil
        </Link>
        <Link className="button button-secondary" href={`/booking?psychologist=${psychologist.id}`}>
          Booking
        </Link>
      </div>
    </article>
  );
}
