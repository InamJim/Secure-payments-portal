import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../services/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ accountNumber: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showPwd, setShowPwd] = useState(false);

    const validate = () => {
        const e = {};
        if (!/^\d{8,12}$/.test(form.accountNumber.trim()))
            e.accountNumber = 'Account number must be 8–12 digits.';
        if (!form.password)
            e.password = 'Password is required.';
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
            const res = await authService.login({
                accountNumber: form.accountNumber.trim(),
                password: form.password,
            });
            const { token, role, fullName, accountNumber } = res.data;

            const normalizedRole = role?.toLowerCase();

            login({
                role: String(role).trim().toLowerCase(),
                fullName: fullName,
                accountNumber: accountNumber
            }, token);

            if (normalizedRole === 'admin') {
                navigate('/admin', { replace: true });
                return;
            }

            navigate('/payment', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
            setAlert({ type: 'danger', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
            style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)' }}>

            <div className="container" style={{ maxWidth: 420 }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                        <i className="bi bi-shield-lock-fill text-white fs-3"></i>
                    </div>
                    <h2 className="fw-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Secure Sign In
                    </h2>
                    <p className="text-secondary">International Payments Portal</p>
                </div>

                {/* Card */}
                <div className="card border-0 shadow-lg"
                    style={{ background: 'rgba(15,35,71,0.85)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(100,180,255,0.1)' }}>
                    <div className="card-body p-4">
                        {alert && (
                            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2`} role="alert">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                <span>{alert.message}</span>
                                <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Account Number */}
                            <div className="mb-3">
                                <label className="form-label text-light fw-medium small">Account Number</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                                        <i className="bi bi-bank"></i>
                                    </span>
                                    <input type="text" name="accountNumber" className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                                        placeholder="Enter your account number"
                                        value={form.accountNumber} onChange={handleChange}
                                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                                        autoComplete="username" />
                                    {errors.accountNumber && <div className="invalid-feedback">{errors.accountNumber}</div>}
                                </div>
                            </div>

                            {/* Password Section*/}
                            <div className="mb-4">
                                <label className="form-label text-light fw-medium small">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                                        <i className="bi bi-lock"></i>
                                    </span>
                                    <input type={showPwd ? 'text' : 'password'} name="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        placeholder="Enter your password"
                                        value={form.password} onChange={handleChange}
                                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }}
                                        autoComplete="current-password" />
                                    <button type="button" className="input-group-text" onClick={() => setShowPwd(s => !s)}
                                        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa', cursor: 'pointer' }}>
                                        <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="btn w-100 fw-semibold py-2"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 10, fontSize: '1rem', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Authenticating…</>
                                ) : (
                                    <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In Securely</>
                                )}
                            </button>
                        </form>


                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default Login;
