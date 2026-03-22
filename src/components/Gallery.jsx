import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryImages } from '../data/data.js';

const Lightbox = ({ image, currentIndex, total, onClose, onNext, onPrev }) => {
  // Lock body scroll when lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext, onPrev, onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(6px)', padding: '16px' }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close lightbox"
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 10000,
          background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(212,175,55,0.5)',
          borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#FFD700', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,30,30,0.9)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Prev button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous image"
        style={{
          position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10000,
          background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '50%', width: '48px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#FFD700',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Image */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src={image}
          alt={`Gallery ${currentIndex + 1}`}
          style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
        />
      </motion.div>

      {/* Next button */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next image"
        style={{
          position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10000,
          background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '50%', width: '48px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#FFD700',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Counter */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
          background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,175,55,0.3)', borderRadius: '999px',
          padding: '6px 20px', color: '#FFD700', fontWeight: 600, fontSize: '0.9rem',
        }}
      >
        {currentIndex + 1} / {total}
      </div>
    </motion.div>,
    document.body
  );
};

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const navigateImage = (direction) => {
    setSelectedIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % galleryImages.length
        : (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  return (
    <section id="gallery" className="min-h-screen py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gold mb-4">Gallery</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-text/80 text-lg max-w-2xl mx-auto">
            Relive the moments from Torque 2025 — A celebration of innovation and engineering excellence
          </p>
        </motion.div>

        {/* Horizontal Scrolling Gallery */}
        <div className="gallery-container">
          <div className="gallery-track">
            {galleryImages.map((image, index) => (
              <motion.figure
                key={index}
                className="gallery-item"
                onClick={() => openLightbox(index)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={image}
                  alt={`Torque Gallery ${index + 1}`}
                  className="gallery-image"
                  loading="lazy"
                />
                <figcaption className="gallery-caption">Torque 2K25</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-text/60 text-sm mt-8"
        >
          Click any image to view fullscreen · Arrow keys to navigate · Esc to close
        </motion.p>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            key={selectedIndex}
            image={galleryImages[selectedIndex]}
            currentIndex={selectedIndex}
            total={galleryImages.length}
            onClose={closeLightbox}
            onNext={() => navigateImage('next')}
            onPrev={() => navigateImage('prev')}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
