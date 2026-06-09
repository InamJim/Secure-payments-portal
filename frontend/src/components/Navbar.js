import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)', borderBottom: '1px solid rgba(100,180,255,0.15)' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <div className="brand-icon d-flex align-items-center justify-content-center rounded" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }}>
                        <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: '1rem' }}></i>
                    </div>
                    <span className="fw-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                        Secure<span style={{ color: '#38bdf8' }}>Pay</span>
                    </span>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center gap-2">
                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-light opacity-75" to="/login">Sign In</Link>
                                </li>
                                {/* <li className="nav-item">
                  <Link className="btn btn-sm px-3 py-2 fw-semibold" to="/register"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 8 }}>
                    Register
                  </Link>
                </li> */}
                            </>
                        ) : (
                            <>
                                {user?.role === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-info" to="/security-monitor">
                                            Security Monitor
                                        </Link>
                                    </li>
                                )}
                                {user?.role === 'admin' && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-info" to="/admin">
                                            Admin Panel
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item d-flex align-items-center gap-2 me-2">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                        style={{ width: 32, height: 32, background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)' }}>
                                        <i className="bi bi-person-fill text-info" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <span className="text-white fw-semibold" style={{ fontSize: '0.85rem', lineHeight: 1.2 }}>{user.fullName}</span>
                                        <span className="text-info" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{user.role}</span>
                                    </div>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-sm px-3 py-2 fw-semibold" onClick={handleLogout}
                                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8 }}>
                                        <i className="bi bi-box-arrow-right me-1"></i>Sign Out
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
