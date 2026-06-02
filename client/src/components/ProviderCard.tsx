import React from 'react';
import { Star, MapPin, Video } from 'lucide-react';


interface ProviderCardProps {
  name: string;
  title: string;
  rating: number;
  specialties: string[];
  price: number;
  isOnline: boolean;
  isOffline: boolean;
  avatar: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ name, title, rating, specialties, price, isOnline, isOffline, avatar }) => {
  return (
    <div className="provider-card">
      <div className="card-header">
        <img src={avatar} alt={name} className="provider-avatar" />
        <div className="provider-info">
          <h3>{name}</h3>
          <p className="title">{title}</p>
          <div className="rating">
            <Star size={16} fill="#FFD700" color="#FFD700" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="specialties">
        {specialties.map(s => <span key={s} className="tag">{s}</span>)}
      </div>
      
      <div className="card-footer">
        <div className="availability">
          {isOnline && <span className="type"><Video size={14} /> Online</span>}
          {isOffline && <span className="type"><MapPin size={14} /> Clinic</span>}
        </div>
        <div className="price">
          <span className="amount">${price}</span>
          <span className="unit">/ session</span>
        </div>
      </div>
      
      <button className="btn-book">Book Now</button>
    </div>
  );
};

export default ProviderCard;
