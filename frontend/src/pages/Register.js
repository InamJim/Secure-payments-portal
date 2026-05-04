import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const FULL_NAME_RE  = /^[A-Za-z\s]{2,100}$/;
const ID_RE         = /^\d{13}$/;
const ACCOUNT_RE    = /^\d{8,12}$/;
const PASSWORD_RE   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_])[A-Za-z\d@$!%*#?&\-_]{8,128}$/;

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', idNumber: '', accountNumber: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!FULL_NAME_RE.test(form.fullName.trim()))
      e.fullName = 'Full name must contain letters and spaces only (2–100 characters).';
    if (!ID_RE.test(form.idNumber.trim()))
      e.idNumber = 'ID number must be exactly 13 digits.';
    if (!ACCOUNT_RE.test(form.accountNumber.trim()))
      e.accountNumber = 'Account number must be 8–12 digits.';
    if (!PASSWORD_RE.test(form.password))
      e.password = 'Password: 8+ characters with uppercase, lowercase, digit, and special character.';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);
    try {
      await authService.register({
        fullName:      form.fullName.trim(),
        idNumber:      form.idNumber.trim(),
        accountNumber: form.accountNumber.trim(),
        password:      form.password,
      });
      setAlert({ type: 'success', message: 'Registration successful! Redirecting to login…' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)' }}>

      <div className="container" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
            <i className="bi bi-person-plus-fill text-white fs-3"></i>
          </div>
          <h2 className="fw-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Open an Account
          </h2>
          <p className="text-secondary">Register to access international payments</p>
        </div>

        {/* Card */}
        <div className="card border-0 shadow-lg"
          style={{ background: 'rgba(15,35,71,0.85)', border: '1px solid rgba(100,180,255,0.1) !important', backdropFilter: 'blur(10px)', borderRadius: 16 }}>
          <div className="card-body p-4">
            {alert && (
              <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2`} role="alert">
                <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                <span>{alert.message}</span>
                <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label text-light fw-medium small">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                    <i className="bi bi-person"></i>
                  </span>
                  <input type="text" name="fullName" className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="John Smith"
                    value={form.fullName} onChange={handleChange}
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                    autoComplete="name" />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
              </div>

              {/* ID Number */}
              <div className="mb-3">
                <label className="form-label text-light fw-medium small">ID Number</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                    <i className="bi bi-credit-card"></i>
                  </span>
                  <input type="text" name="idNumber" className={`form-control ${errors.idNumber ? 'is-invalid' : ''}`}
                    placeholder="13-digit ID number"
                    value={form.idNumber} onChange={handleChange} maxLength={13}
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                    autoComplete="off" />
                  {errors.idNumber && <div className="invalid-feedback">{errors.idNumber}</div>}
                </div>
              </div>

              {/* Account Number */}
              <div className="mb-3">
                <label className="form-label text-light fw-medium small">Account Number</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                    <i className="bi bi-bank"></i>
                  </span>
                  <input type="text" name="accountNumber" className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                    placeholder="8–12 digit account number"
                    value={form.accountNumber} onChange={handleChange} maxLength={12}
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                    autoComplete="off" />
                  {errors.accountNumber && <div className="invalid-feedback">{errors.accountNumber}</div>}
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label text-light fw-medium small">Password</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                    <i className="bi bi-lock"></i>
                  </span>
                  <input type={showPwd ? 'text' : 'password'} name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Minimum 8 characters"
                    value={form.password} onChange={handleChange}
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                    autoComplete="new-password" />
                  <button type="button" className="input-group-text border-0" onClick={() => setShowPwd(s => !s)}
                    style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa', cursor: 'pointer' }}>
                    <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label text-light fw-medium small">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input type={showPwd ? 'text' : 'password'} name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={handleChange}
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                    autoComplete="new-password" />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn w-100 fw-semibold py-2"
                style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 10, fontSize: '1rem', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account…</>
                ) : (
                  <><i className="bi bi-shield-check me-2"></i>Create Secure Account</>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-4 text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-info text-decoration-none fw-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
