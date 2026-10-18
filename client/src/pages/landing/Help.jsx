import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    faqs: [
      {
        q: 'How do I create an Avelia account?',
        a: 'Navigate to the Register page, choose your desired role (Farmer, Buyer, or Agricultural Expert), and submit your full name, email, and phone number. Enter the 6-digit email OTP to verify your identity, set your password, and access your personalized portal.',
      },
      {
        q: 'Which role should I choose?',
        a: '• Farmer: For agricultural growers, cultivators, and landholders seeking direct market sales, weather alerts, and crop disease advice.\n• Buyer: For commercial buyers, retail grocers, institutional caterers, and food processors sourcing harvest lots.\n• Agricultural Expert: For agronomists, soil scientists, and university specialists providing certified guidance.',
      },
      {
        q: 'Is registration free for farmers and buyers?',
        a: 'Yes, account creation and marketplace discovery are completely free for all verified producers and agricultural buyers.',
      },
    ],
  },
  {
    id: 'otp-login',
    icon: '🔐',
    title: 'OTP & Authentication',
    faqs: [
      {
        q: 'What should I do if I do not receive my OTP email?',
        a: '1. Check your email spam/junk folders.\n2. Verify you entered the correct email address.\n3. Wait 30 seconds and click "Resend OTP".\nNote that OTP codes remain valid for 5 minutes for security.',
      },
      {
        q: 'What is my Avelia Login ID?',
        a: 'Upon successful registration, Avelia generates a permanent unique login identifier (e.g., AV-F-00001 for Farmer, AV-B-00001 for Buyer). You can use either your registered email or Login ID to sign in.',
      },
      {
        q: 'How does password recovery work?',
        a: 'You can update your account password from your Portal Settings. If locked out, submit a support request with your registered email and phone number.',
      },
    ],
  },
  {
    id: 'experts',
    icon: '🔬',
    title: 'Agricultural Experts & Verification',
    faqs: [
      {
        q: 'How are Agricultural Expert credentials verified?',
        a: 'Every Expert applicant must upload proof of formal qualifications (B.Sc./M.Sc. Agriculture, Ph.D.) or state council accreditation. The Avelia administrative team reviews all certificates before granting advisory access.',
      },
      {
        q: 'Why does my account show "Pending Verification"?',
        a: 'To safeguard farmers from incorrect agricultural advice, Expert accounts require manual administrative approval. Once approved (typically within 24–48 hours), you will receive an email confirmation granting full access.',
      },
      {
        q: 'What file formats are accepted for qualification certificates?',
        a: 'We accept PDF, PNG, JPG, and JPEG documents up to 5MB per file.',
      },
    ],
  },
  {
    id: 'trade',
    icon: '🛒',
    title: 'Marketplace & Orders',
    faqs: [
      {
        q: 'How do direct price negotiations work between buyers and farmers?',
        a: 'Buyers can place direct counter-offers on available crop lots. The farmer can review the buyer details, accept the negotiated price, or submit an adjusted counter-offer in real-time.',
      },
      {
        q: 'How is crop delivery tracked?',
        a: 'Both parties can view visual stage-by-stage order timelines from "Order Placed", "Harvest Packed", "In Transit", to "Delivered at Destination".',
      },
    ],
  },
];

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState({});
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', role: 'farmer', subject: '', message: '' });

  const currentCategory = HELP_CATEGORIES.find((c) => c.id === activeCategory) || HELP_CATEGORIES[0];

  const toggleFaq = (key) => {
    setOpenFaq((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: 'linear-gradient(175deg, #0E3326 0%, #174C38 60%, #21664B 100%)',
          color: '#fff',
          padding: '5rem 0 4.5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'var(--color-accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Help & Knowledge Base
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              margin: '0.5rem 0 1.25rem',
              color: '#fff',
            }}
          >
            Avelia Support & Help Center
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            Find answers to common questions about roles, OTP verification, expert credentials, and
            marketplace trading.
          </p>
        </div>
      </section>

      {/* Main Help Body */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '2.5rem',
              alignItems: 'start',
              marginBottom: '4.5rem',
            }}
            className="help-layout"
          >
            {/* Sidebar Categories */}
            <div
              style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: 90,
              }}
              className="help-sidebar"
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--color-border)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Help Topics
              </div>
              {HELP_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1rem 1.25rem',
                      background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                      borderLeft: `4px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                      color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'var(--transition)',
                      borderBottom: '1px solid var(--color-border-light)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Main FAQ Answers */}
            <div>
              <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{currentCategory.icon}</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {currentCategory.title}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentCategory.faqs.map((faq, idx) => {
                  const isOpen = openFaq[`${currentCategory.id}-${idx}`];
                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        background: isOpen ? 'var(--color-primary-subtle)' : 'var(--color-white)',
                        transition: 'var(--transition)',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      <button
                        onClick={() => toggleFaq(`${currentCategory.id}-${idx}`)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: isOpen ? 'var(--color-primary)' : 'var(--color-text)',
                        }}
                      >
                        <span>{faq.q}</span>
                        <span
                          style={{
                            fontSize: '1.2rem',
                            transition: 'transform 0.2s',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          }}
                        >
                          ▾
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: '0 1.5rem 1.25rem',
                            borderTop: '1px solid var(--color-border-light)',
                            fontSize: '0.92rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Support Ticket Form */}
          <div
            className="card"
            style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-2xl)',
              padding: '3rem 2.5rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="text-center" style={{ marginBottom: '2.5rem' }}>
              <span className="section-badge lime">Direct Support</span>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Still Have Questions or Facing Technical Issues?
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
                Submit a support query directly to our bilingual technical team and we will respond
                within 24 hours.
              </p>
            </div>

            {ticketSubmitted ? (
              <div
                className="alert alert-success text-center"
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{ fontSize: '2.5rem' }}>✅</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Support Request Received</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Thank you for reaching out. Ticket #AV-{Math.floor(100000 + Math.random() * 900000)} has
                  been created. Our team will contact you shortly at <strong>{ticketForm.email}</strong>.
                </p>
                <button
                  onClick={() => setTicketSubmitted(false)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  Submit Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-split">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rajan Kumar"
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. rajan@example.com"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-split">
                  <div className="form-group">
                    <label className="form-label">Your Role</label>
                    <select
                      className="form-select"
                      value={ticketForm.role}
                      onChange={(e) => setTicketForm({ ...ticketForm, role: e.target.value })}
                    >
                      <option value="farmer">Farmer</option>
                      <option value="buyer">Buyer</option>
                      <option value="expert">Agricultural Expert</option>
                      <option value="other">General Inquirer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Verification status query"
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Message</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe your question or issue in detail..."
                    required
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ fontWeight: 800 }}>
                  Send Support Ticket 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .help-layout { grid-template-columns: 1fr !important; }
          .help-sidebar { position: static !important; display: flex; overflow-x: auto; }
          .help-sidebar button { flex-shrink: 0; }
          .form-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default Help;
