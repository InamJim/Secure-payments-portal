import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const features = [
  { icon: 'bi-shield-lock-fill', title: 'Bank-Grade Security', desc: 'JWT authentication, bcrypt password hashing, and role-based access control protect every transaction.', color: '#3b82f6' },
  { icon: 'bi-globe2', title: 'Global SWIFT Transfers', desc: 'Send international payments to any bank worldwide using SWIFT/BIC codes with real-time status tracking.', color: '#0ea5e9' },
  { icon: 'bi-person-check-fill', title: 'Dual Verification', desc: 'Every payment is reviewed and verified by our compliance team before being submitted to the SWIFT network.', color: '#10b981' },
  { icon: 'bi-lightning-charge-fill', title: 'Instant Processing', desc: 'Payments are queued immediately and processed within minutes of employee verification.', color: '#f59e0b' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="container py-5 text-center">
        <div className="py-5">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', fontSize: '0.8rem', color: '#60a5fa' }}>
            <i className="bi bi-shield-check-fill"></i>
            <span>PCI-DSS Compliant · End-to-End Encrypted</span>
          </div>
          <h1 className="display-4 fw-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}>
            Secure International<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Payments Portal
            </span>
          </h1>
          <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: 520, lineHeight: 1.7 }}>
            Send international payments with confidence. Every transfer is protected with military-grade encryption and verified by our compliance team.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-lg fw-semibold px-5 py-3"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(37,99,235,0.4)' }}>
                  <i className="bi bi-person-plus me-2"></i>Open Account
                </Link>
                <Link to="/login" className="btn btn-lg fw-semibold px-5 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                </Link>
              </>
            ) : (
              <Link to={user.role === 'Admin' ? '/admin' : '/payment'} className="btn btn-lg fw-semibold px-5 py-3"
                style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(37,99,235,0.4)' }}>
                <i className="bi bi-arrow-right-circle me-2"></i>
                {user.role === 'Admin' ? 'Go to Admin Portal' : 'Make a Payment'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container pb-5">
        <div className="row g-4">
          {features.map((f, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="card border-0 h-100 p-4"
                style={{ background: 'rgba(15,35,71,0.7)', borderRadius: 16, border: '1px solid rgba(100,180,255,0.08)', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${f.color}44`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(100,180,255,0.08)'; }}>
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{ width: 48, height: 48, background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                  <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: '1.3rem' }}></i>
                </div>
                <h6 className="text-white fw-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>{f.title}</h6>
                <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security badges */}
      <div className="container pb-5">
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {[
            { icon: 'bi-lock-fill', label: 'TLS 1.3 Encrypted' },
            { icon: 'bi-fingerprint', label: 'BCrypt Password Hashing' },
            { icon: 'bi-key-fill', label: 'JWT Auth Tokens' },
            { icon: 'bi-shield-exclamation', label: 'XSS Protected' },
            { icon: 'bi-fire', label: 'Rate Limited' },
          ].map((b, i) => (
            <div key={i} className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{ background: 'rgba(15,35,71,0.7)', border: '1px solid rgba(100,180,255,0.1)', color: '#94a3b8', fontSize: '0.8rem' }}>
              <i className={`bi ${b.icon} text-info`}></i>{b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
