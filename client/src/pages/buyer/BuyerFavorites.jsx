import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const INITIAL_FAVORITES = [
  {
    id: 'prod-fav-1',
    name: 'Premium Sharbati Wheat (Grade A)',
    farmer: 'Rajan Kumar',
    location: 'Ludhiana, Punjab',
    price: 2600,
    unit: 'Quintal',
    availableQty: 180,
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    badge: 'Organic Certified',
  },
  {
    id: 'prod-fav-2',
    name: 'Aromatic Pusa Basmati Rice 1121',
    farmer: 'Gurpreet Singh',
    location: 'Karnal, Haryana',
    price: 4200,
    unit: 'Quintal',
    availableQty: 95,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    badge: 'Export Quality',
  },
  {
    id: 'prod-fav-3',
    name: 'Fresh Red Onions (Nashik Fresh Harvest)',
    farmer: 'Vikram Patil',
    location: 'Nashik, Maharashtra',
    price: 2400,
    unit: 'Quintal',
    availableQty: 320,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    badge: 'Direct Farm Harvest',
  },
];

const BuyerFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const handleRemove = (id) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
            ❤️ Saved Farm Products & Favorites
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Quick access to your bookmarked agricultural commodities and preferred farmer lots.
          </p>
        </div>
        <Link to="/buyer/marketplace" className="btn btn-primary" style={{ fontWeight: 700 }}>
          🛒 Browse Marketplace
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No saved products yet
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Explore the agricultural marketplace to save fresh harvest lots for rapid ordering.
          </p>
          <Link to="/buyer/marketplace" className="btn btn-primary">
            Explore Farm Listings →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {favorites.map((item) => (
            <div
              key={item.id}
              className="card-editorial"
              style={{
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  title="Remove from favorites"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--color-error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '1rem',
                  }}
                >
                  ✕
                </button>
                <span
                  className="badge badge-green"
                  style={{ position: 'absolute', top: 12, left: 12 }}
                >
                  {item.badge}
                </span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      📍 {item.location}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ⭐ {item.rating}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Farmer: <strong>{item.farmer}</strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--color-bg)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Price
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-primary-dark)' }}>
                        ₹{item.price.toLocaleString('en-IN')}{' '}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          / {item.unit}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      In Stock: <strong>{item.availableQty} {item.unit}s</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.85rem' }}>
                  <Link
                    to="/buyer/marketplace"
                    className="btn btn-primary btn-full btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    View & Order Now →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerFavorites;
