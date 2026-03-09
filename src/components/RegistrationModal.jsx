import { useState } from 'react';
import { motion } from 'framer-motion';
import { festInfo } from '../data/data.js';

const RegistrationModal = ({ item, onClose }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    rollNo: '',
    branch: '',
    year: '',
    college: '',
    transactionId: '',
    paymentMethod: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

  const price = type ? item.prices[type] : 0;
  const isFree = price === 0;

  // Validation function
  const validate = () => {
    const newErrors = {};

    // Shared validation
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!/^.+@.+\..+/.test(form.email)) newErrors.email = 'Valid email required';

    // Type-specific validation
    if (type === 'internal') {
      if (!form.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
      if (form.branch === '' || form.branch === 'Select Branch') {
        newErrors.branch = 'Please select a branch';
      }
      if (form.year === '' || form.year === 'Select Year') {
        newErrors.year = 'Please select a year';
      }
    }

    if (type === 'external') {
      if (!form.college.trim()) newErrors.college = 'College name is required';
      if (step === 3 && !form.transactionId.trim()) {
        newErrors.transactionId = 'Transaction ID is required';
      }
    }

    if (type === 'onsite') {
      if (!form.paymentMethod) newErrors.paymentMethod = 'Select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    const payload = {
      itemName: item.name,
      category: item.category || (item.id ? 'EVENT' : 'WORKSHOP'),
      registrationType: type.toUpperCase(),
      amountDue: price,
      name: form.name,
      phone: form.phone,
      email: form.email,
      college: form.college || (type === 'internal' ? 'UCEK' : '-'),
      rollNo: form.rollNo || '-',
      yearBranch:
        form.year && form.branch ? `${form.year} — ${form.branch}` : '-',
      transactionId: form.transactionId || '-',
      paymentMethod:
        type === 'internal' ? 'WAIVED' : type === 'external' ? 'UPI' : form.paymentMethod,
      paymentStatus:
        type === 'internal'
          ? 'WAIVED'
          : type === 'external'
          ? 'PENDING VERIFICATION'
          : 'PENDING — COLLECT AT VENUE'
    };

    if (!festInfo.appsScriptUrl) {
      await new Promise((r) => setTimeout(r, 1500));
      setResult({
        registrationId:
          'TRQ26-' +
          (item.category === 'WORKSHOP' ? 'WRK' : 'EVT') +
          '-' +
          Math.random().toString(36).substr(2, 9).toUpperCase()
      });
      setStep(4);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(festInfo.appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.result === 'success') {
        setResult(data);
        setStep(4);
      } else {
        setSubmitError('Submission failed. Please try again.');
      }
    } catch {
      setSubmitError(
        'Network error. Check your connection and retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard handler
  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(festInfo.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy UPI ID');
    }
  };

  const handleCopyRegId = async () => {
    try {
      await navigator.clipboard.writeText(result.registrationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy Registration ID');
    }
  };

  // Input change handler
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Reusable input component
  const FormInput = ({ label, field, type = 'text', placeholder, required = false }) => (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          color: '#f0ede6',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '8px'
        }}
      >
        {label} {required && <span style={{ color: '#d4af37' }}>*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: '#111111',
          border: `1px solid ${errors[field] ? '#ff6b6b' : 'rgba(212,175,55,0.2)'}`,
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#f0ede6',
          fontFamily: 'Poppins',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          if (!errors[field]) {
            e.target.style.borderColor = '#d4af37';
            e.target.style.boxShadow = 'rgba(212,175,55,0.08) 0 0 0 3px';
          }
        }}
        onBlur={(e) => {
          if (!errors[field]) {
            e.target.style.borderColor = 'rgba(212,175,55,0.2)';
            e.target.style.boxShadow = 'none';
          }
        }}
      />
      {errors[field] && (
        <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  // Reusable select component
  const FormSelect = ({ label, field, options, required = false }) => (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          color: '#f0ede6',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '8px'
        }}
      >
        {label} {required && <span style={{ color: '#d4af37' }}>*</span>}
      </label>
      <select
        value={form[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        style={{
          width: '100%',
          background: '#111111',
          border: `1px solid ${errors[field] ? '#ff6b6b' : 'rgba(212,175,55,0.2)'}`,
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#f0ede6',
          fontFamily: 'Poppins',
          fontSize: '0.9rem',
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4af37' d='M1 3.5l5 5 5-5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '40px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          if (!errors[field]) {
            e.target.style.borderColor = '#d4af37';
            e.target.style.boxShadow = 'rgba(212,175,55,0.08) 0 0 0 3px';
          }
        }}
        onBlur={(e) => {
          if (!errors[field]) {
            e.target.style.borderColor = 'rgba(212,175,55,0.2)';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: '#1a1a1a' }}>
            {opt}
          </option>
        ))}
      </select>
      {errors[field] && (
        <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  // Step indicator dots
  const StepDots = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px'
      }}
    >
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          style={{
            height: '8px',
            borderRadius: '4px',
            background: s <= step ? '#d4af37' : 'rgba(212,175,55,0.2)',
            transition: 'all 0.3s ease',
            width: s === step ? '24px' : '8px'
          }}
        />
      ))}
    </div>
  );

  // Item badge
  const ItemBadge = () => (
    <div
      style={{
        display: 'inline-block',
        margin: '0 auto 20px',
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
  );

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#1a1a1a',
            borderRadius: '20px',
            boxShadow: '8px 8px 16px #080808, -8px -8px 16px #2a2a2a',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {step !== 4 && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gold hover:text-yellow-400 transition-colors text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          )}

          {/* Step 1: Registration Type */}
          {step === 1 && (
            <>
              {step < 4 && <StepDots />}
              <div style={{ textAlign: 'center' }}>
                <ItemBadge />
              </div>
              <h2
                style={{
                  color: '#f0ede6',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}
              >
                Who are you?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Internal Card */}
                <div
                  onClick={() => {
                    setType('internal');
                    setStep(2);
                  }}
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                    e.currentTarget.style.background = '#161616';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)';
                    e.currentTarget.style.background = '#111111';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      UCEK Student
                    </div>
                    <div
                      style={{
                        color: 'rgba(240,237,230,0.6)',
                        fontSize: '0.78rem'
                      }}
                    >
                      UCEK — Kakinada
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(76,175,80,0.15)',
                      border: '1px solid rgba(76,175,80,0.3)',
                      borderRadius: '20px',
                      padding: '3px 10px',
                      color: '#4caf50',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    FREE
                  </div>
                </div>

                {/* External Card */}
                <div
                  onClick={() => {
                    setType('external');
                    setStep(2);
                  }}
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                    e.currentTarget.style.background = '#161616';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)';
                    e.currentTarget.style.background = '#111111';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>🌐</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      Outside College
                    </div>
                    <div
                      style={{
                        color: 'rgba(240,237,230,0.6)',
                        fontSize: '0.78rem'
                      }}
                    >
                      Online registration + UPI payment
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '20px',
                      padding: '3px 10px',
                      color: '#d4af37',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    ₹{item.prices.external}
                  </div>
                </div>

                {/* Onsite Card */}
                <div
                  onClick={() => {
                    setType('onsite');
                    setStep(2);
                  }}
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                    e.currentTarget.style.background = '#161616';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)';
                    e.currentTarget.style.background = '#111111';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>🚶</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      On-Site Walk-in
                    </div>
                    <div
                      style={{
                        color: 'rgba(240,237,230,0.6)',
                        fontSize: '0.78rem'
                      }}
                    >
                      Register and pay at the venue
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '20px',
                      padding: '3px 10px',
                      color: '#d4af37',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    ₹{item.prices.onsite}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <>
              {step < 4 && <StepDots />}
              <div style={{ textAlign: 'center' }}>
                <ItemBadge />
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setErrors({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d4af37',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  fontWeight: '500'
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  color: '#f0ede6',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '24px'
                }}
              >
                Your Details
              </h2>

              {/* Shared fields */}
              <FormInput
                label="Full Name"
                field="name"
                placeholder="Your full name"
                required
              />
              <FormInput
                label="Phone Number"
                field="phone"
                type="tel"
                placeholder="10-digit mobile number"
                required
              />
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    color: '#f0ede6',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                >
                  Email Address <span style={{ color: '#d4af37' }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="We'll send your confirmation here"
                  style={{
                    width: '100%',
                    background: '#111111',
                    border: `1px solid ${errors.email ? '#ff6b6b' : 'rgba(212,175,55,0.2)'}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#f0ede6',
                    fontFamily: 'Poppins',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#d4af37';
                      e.target.style.boxShadow = 'rgba(212,175,55,0.08) 0 0 0 3px';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'rgba(212,175,55,0.2)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {errors.email && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>
                    {errors.email}
                  </p>
                )}
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(240,237,230,0.5)',
                    marginTop: '6px'
                  }}
                >
                  📧 A confirmation email will be sent to this address
                </p>
              </div>

              {/* Type-specific fields */}
              {type === 'internal' && (
                <>
                  <FormInput
                    label="Roll Number"
                    field="rollNo"
                    placeholder="22N81A0XXX"
                    required
                  />
                  <FormSelect
                    label="Branch"
                    field="branch"
                    options={[
                      'Select Branch',
                      'ME',
                      'CE',
                      'EEE',
                      'ECE',
                      'CSE',
                      'IT',
                      'Other'
                    ]}
                    required
                  />
                  <FormSelect
                    label="Year"
                    field="year"
                    options={['Select Year', 'I', 'II', 'III', 'IV']}
                    required
                  />
                </>
              )}

              {type === 'external' && (
                <FormInput
                  label="College Name"
                  field="college"
                  placeholder="Your college name"
                  required
                />
              )}

              {type === 'onsite' && (
                <>
                  <FormInput
                    label="College"
                    field="college"
                    placeholder="Leave blank if from UCEK"
                    required={false}
                  />
                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        color: '#f0ede6',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '12px'
                      }}
                    >
                      Payment Method at Venue <span style={{ color: '#d4af37' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleInputChange('paymentMethod', 'CASH')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          border:
                            form.paymentMethod === 'CASH'
                              ? 'none'
                              : '1px solid rgba(212,175,55,0.2)',
                          background:
                            form.paymentMethod === 'CASH'
                              ? '#d4af37'
                              : '#111',
                          color:
                            form.paymentMethod === 'CASH'
                              ? '#0d0d0d'
                              : '#d4af37',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem'
                        }}
                      >
                        💵 Cash
                      </button>
                      <button
                        onClick={() => handleInputChange('paymentMethod', 'UPI')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          border:
                            form.paymentMethod === 'UPI'
                              ? 'none'
                              : '1px solid rgba(212,175,55,0.2)',
                          background:
                            form.paymentMethod === 'UPI'
                              ? '#d4af37'
                              : '#111',
                          color:
                            form.paymentMethod === 'UPI'
                              ? '#0d0d0d'
                              : '#d4af37',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem'
                        }}
                      >
                        📱 UPI
                      </button>
                    </div>
                    {errors.paymentMethod && (
                      <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>
                </>
              )}

              {submitError && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {submitError}
                </p>
              )}

              <button
                onClick={() => {
                  if (type === 'external') {
                    if (validate()) setStep(3);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? 'rgba(212,175,55,0.5)' : '#d4af37',
                  color: loading ? '#999' : '#0d0d0d',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <span>⏳ Submitting...</span>
                ) : type === 'external' ? (
                  'Next — Payment →'
                ) : (
                  'Submit Registration'
                )}
              </button>
            </>
          )}

          {/* Step 3: Payment (external only) */}
          {step === 3 && (
            <>
              {step < 4 && <StepDots />}
              <div style={{ textAlign: 'center' }}>
                <ItemBadge />
              </div>
              <button
                onClick={() => {
                  setStep(2);
                  setErrors({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d4af37',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  fontWeight: '500'
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  color: '#f0ede6',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '24px'
                }}
              >
                Complete Payment
              </h2>

              {/* Payment box */}
              <div
                style={{
                  border: '1.5px solid rgba(212,175,55,0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  background: 'rgba(212,175,55,0.03)',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    color: 'rgba(240,237,230,0.6)',
                    fontSize: '0.75rem',
                    marginBottom: '8px'
                  }}
                >
                  Amount to Pay
                </p>
                <p
                  style={{
                    color: '#d4af37',
                    fontSize: '3rem',
                    fontWeight: '800',
                    margin: '0 0 16px 0'
                  }}
                >
                  ₹{item.prices.external}
                </p>

                <div
                  style={{
                    borderTop: '1px solid rgba(212,175,55,0.1)',
                    borderBottom: '1px solid rgba(212,175,55,0.1)',
                    margin: '16px 0',
                    padding: '16px 0'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#111',
                      borderRadius: '10px',
                      padding: '10px 14px'
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: 'rgba(240,237,230,0.6)',
                          fontSize: '0.75rem',
                          margin: '0 0 4px 0'
                        }}
                      >
                        UPI ID
                      </p>
                      <p
                        style={{
                          color: '#d4af37',
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          margin: 0,
                          fontSize: '0.95rem'
                        }}
                      >
                        {festInfo.upiId}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyUPI}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d4af37',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      }}
                      title="Copy UPI ID"
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    color: 'rgba(240,237,230,0.6)',
                    fontSize: '0.82rem',
                    marginTop: '12px',
                    lineHeight: '1.4'
                  }}
                >
                  Pay via GPay, PhonePe, or any UPI app.
                  <br />
                  Then enter the Transaction ID below.
                </p>
              </div>

              {/* Transaction ID */}
              <FormInput
                label="Transaction ID (UTR Number)"
                field="transactionId"
                placeholder="12-digit UTR number from your UPI app"
                required
              />

              {submitError && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? 'rgba(212,175,55,0.5)' : '#d4af37',
                  color: loading ? '#999' : '#0d0d0d',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '⏳ Submitting...' : 'Confirm Registration'}
              </button>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '3px solid #d4af37',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#d4af37'
                }}
              >
                ✓
              </motion.div>

              <h2
                style={{
                  color: '#d4af37',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}
              >
                You're Registered!
              </h2>

              {/* Registration ID */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p
                  style={{
                    color: 'rgba(240,237,230,0.6)',
                    fontSize: '0.75rem',
                    marginBottom: '8px'
                  }}
                >
                  Your Registration ID
                </p>
                <div
                  onClick={handleCopyRegId}
                  style={{
                    fontFamily: 'monospace',
                    color: '#d4af37',
                    fontSize: '1.15rem',
                    background: '#111',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    display: 'inline-block',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d4af37';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(212,175,55,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="Click to copy"
                >
                  {result?.registrationId}
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alamItems: 'center',
                  background: '#111',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px'
                }}
              >
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    color:
                      type === 'internal' || price === 0
                        ? '#4caf50'
                        : '#d4af37',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}
                >
                  {type === 'internal' || price === 0 ? 'FREE' : `₹${price}`}
                </span>
              </div>

              {/* What happens next */}
              <div
                style={{
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                  color: '#f0ede6',
                  lineHeight: '1.6'
                }}
              >
                {type === 'internal' && (
                  <>
                    ✅ You're all set! Bring your college ID on the event day.
                  </>
                )}
                {type === 'external' && (
                  <>
                    ⏳ Payment verification pending.
                    <br />A coordinator will confirm via your registered phone number.
                    <br />
                    <br />
                    Keep your Transaction ID: <span style={{ fontWeight: 'bold' }}>
                      {form.transactionId}
                    </span>
                  </>
                )}
                {type === 'onsite' && (
                  <>
                    📍 Visit the registration desk on the event day.
                    <br />
                    Pay ₹{price} via {form.paymentMethod} at the venue.
                    <br />
                    Show this Registration ID at the desk.
                  </>
                )}
              </div>

              {/* Confirmation email */}
              <p
                style={{
                  color: 'rgba(240,237,230,0.6)',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}
              >
                📧 A confirmation email has been sent to <strong>{form.email}</strong>
              </p>

              <button
                onClick={onClose}
                className="neu-button w-full"
                style={{ padding: '14px' }}
              >
                Done
              </button>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default RegistrationModal;
