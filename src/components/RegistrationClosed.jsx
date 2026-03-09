import { useState, useEffect } from 'react';
import { festInfo } from '../data/data.js';

const RegistrationClosed = ({ item, onClose }) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate countdown timer
  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date(festInfo.registrationOpenDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative"
          style={{
            background: '#1a1a1a',
            borderRadius: '20px',
            boxShadow: '8px 8px 16px #080808, -8px -8px 16px #2a2a2a',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            maxWidth: '420px',
            width: '90%',
            padding: '36px 32px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gold hover:text-yellow-400 transition-colors text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          {/* Lock Emoji */}
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
            🔒
          </div>

          {/* Heading */}
          <h2
            style={{
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '12px'
            }}
          >
            Registration Opens Soon
          </h2>

          {/* Item Badge */}
          <div
            style={{
              display: 'inline-block',
              margin: '12px auto',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '20px',
              padding: '4px 16px',
              color: '#d4af37',
              fontSize: '0.85rem'
            }}
          >
            {item.category || (item.id ? 'Event' : 'Workshop')} · {item.name}
          </div>

          {/* Opening Date */}
          <div style={{ margin: '20px auto 16px' }}>
            <p
              style={{
                color: 'rgba(240, 237, 230, 0.6)',
                fontSize: '0.9rem',
                marginBottom: '4px'
              }}
            >
              Registration opens on
            </p>
            <p
              style={{
                color: '#d4af37',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}
            >
              {formatDate(festInfo.registrationOpenDate)}
            </p>
          </div>

          {/* Countdown Timer */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              margin: '20px auto',
              flexWrap: 'wrap'
            }}
          >
            {/* Days */}
            <div
              style={{
                background: '#111',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                minWidth: '56px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  color: '#d4af37',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  margin: '0 0 4px 0'
                }}
              >
                {String(countdown.days).padStart(2, '0')}
              </p>
              <p
                style={{
                  color: 'rgba(240, 237, 230, 0.5)',
                  fontSize: '0.7rem',
                  margin: 0
                }}
              >
                Days
              </p>
            </div>

            {/* Hours */}
            <div
              style={{
                background: '#111',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                minWidth: '56px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  color: '#d4af37',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  margin: '0 0 4px 0'
                }}
              >
                {String(countdown.hours).padStart(2, '0')}
              </p>
              <p
                style={{
                  color: 'rgba(240, 237, 230, 0.5)',
                  fontSize: '0.7rem',
                  margin: 0
                }}
              >
                Hrs
              </p>
            </div>

            {/* Minutes */}
            <div
              style={{
                background: '#111',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                minWidth: '56px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  color: '#d4af37',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  margin: '0 0 4px 0'
                }}
              >
                {String(countdown.minutes).padStart(2, '0')}
              </p>
              <p
                style={{
                  color: 'rgba(240, 237, 230, 0.5)',
                  fontSize: '0.7rem',
                  margin: 0
                }}
              >
                Mins
              </p>
            </div>

            {/* Seconds */}
            <div
              style={{
                background: '#111',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                minWidth: '56px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  color: '#d4af37',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  margin: '0 0 4px 0'
                }}
              >
                {String(countdown.seconds).padStart(2, '0')}
              </p>
              <p
                style={{
                  color: 'rgba(240, 237, 230, 0.5)',
                  fontSize: '0.7rem',
                  margin: 0
                }}
              >
                Secs
              </p>
            </div>
          </div>

          {/* Muted Note */}
          <p
            style={{
              fontSize: '0.8rem',
              color: 'rgba(240, 237, 230, 0.5)',
              marginTop: '16px',
              marginBottom: '20px'
            }}
          >
            Follow us on Instagram for updates
          </p>

          {/* Instagram Button */}
          <a
            href={festInfo.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-button w-full text-center block"
            style={{ marginTop: '16px', padding: '12px' }}
          >
            Follow @torque_2k26 on Instagram
          </a>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="neu-button w-full text-center"
            style={{ marginTop: '12px', padding: '12px' }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

export default RegistrationClosed;
