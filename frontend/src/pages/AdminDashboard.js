import React, { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/api';
import { useAuth } from '../services/AuthContext';

const statusBadge = (status) => {
    const map = {
        PENDING: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', color: '#fbbf24', icon: 'bi-clock-history', label: 'Pending' },
        VERIFIED: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', color: '#4ade80', icon: 'bi-check-circle-fill', label: 'Verified' },
        REJECTED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171', icon: 'bi-x-circle-fill', label: 'Rejected' },
    };
    const s = map[status] || map.PENDING;
    return (
        <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 6, fontSize: '0.75rem' }}>
            <i className={`bi ${s.icon}`} style={{ fontSize: '0.7rem' }}></i>{s.label}
        </span>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(null);
    const [alert, setAlert] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await paymentService.getAllPayments();
            setPayments(res.data);
        } catch (err) {
            setAlert({ type: 'danger', message: 'Failed to load payments.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleVerify = async (id) => {
        setVerifying(id);
        setAlert(null);
        try {
            await paymentService.verifyPayment(id);
            setAlert({ type: 'success', message: `Payment #${id} verified and submitted to SWIFT.` });
            fetchPayments();
        } catch (err) {
            const msg = err.response?.data?.message || 'Verification failed.';
            setAlert({ type: 'danger', message: msg });
        } finally {
            setVerifying(null);
        }
    };
    if (!user || user.role !== "admin") {
        return (
            <div className="text-center text-white mt-5">
                <h3>Access Denied</h3>
                <p>You do not have permission to view this page.</p>
            </div>
        )
    };

    const filtered = payments.filter(p => {
        const matchStatus = filter === 'ALL' || p.status === filter;
        const term = searchTerm.toLowerCase();
        const matchSearch = !term ||
            p.customerName?.toLowerCase().includes(term) ||
            p.accountNumber?.toLowerCase().includes(term) ||
            p.swiftCode?.toLowerCase().includes(term) ||
            p.receiver?.toLowerCase().includes(term) ||
            p.currency?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    const counts = {
        ALL: payments.length,
        PENDING: payments.filter(p => p.status === 'PENDING').length,
        VERIFIED: payments.filter(p => p.status === 'VERIFIED').length,
    };
    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        setVerifying(id);
        try {
            await paymentService.rejectPayment(id, {
                reason: reason
            });

            setAlert({ type: 'warning', message: `Payment #${id} rejected.` });
            fetchPayments();
        } catch (err) {
            setAlert({ type: 'danger', message: 'Rejection failed.' });
        } finally {
            setVerifying(null);
        }
    };

    return (
        <div className="min-vh-100 py-4"
            style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)' }}>
            <div className="container-fluid px-4" style={{ maxWidth: 1200 }}>

                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
                            <i className="bi bi-shield-fill-check text-white fs-5"></i>
                        </div>
                        <div>
                            <h4 className="text-white mb-0 fw-bold" style={{ fontFamily: 'Space Grotesk' }}>Employee Portal</h4>
                            <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>Payments verification dashboard · {user?.fullName}</p>
                        </div>
                    </div>
                    <button className="btn btn-sm fw-semibold" onClick={fetchPayments} disabled={loading}
                        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa', borderRadius: 8 }}>
                        <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>Refresh
                    </button>
                </div>

                {/* Stats cards */}
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Payments', count: counts.ALL, icon: 'bi-receipt', color: '#60a5fa', bg: 'rgba(37,99,235,0.12)' },
                        { label: 'Pending Review', count: counts.PENDING, icon: 'bi-clock-history', color: '#fbbf24', bg: 'rgba(234,179,8,0.12)' },
                        { label: 'Verified', count: counts.VERIFIED, icon: 'bi-check-circle-fill', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
                    ].map((s, i) => (
                        <div key={i} className="col-md-4">
                            <div className="card border-0 p-3"
                                style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 12 }}>
                                <div className="d-flex align-items-center gap-3">
                                    <i className={`bi ${s.icon}`} style={{ fontSize: '1.75rem', color: s.color }}></i>
                                    <div>
                                        <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>{s.label}</p>
                                        <h3 className="fw-bold mb-0" style={{ color: s.color, fontFamily: 'Space Grotesk' }}>{s.count}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters + Search */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div className="d-flex gap-2 flex-wrap">
                        {['ALL', 'PENDING', 'VERIFIED'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="btn btn-sm fw-semibold px-3"
                                style={{
                                    borderRadius: 8, fontSize: '0.8rem',
                                    background: filter === f ? 'linear-gradient(135deg, #2563eb, #0ea5e9)' : 'rgba(15,35,71,0.8)',
                                    border: filter === f ? 'none' : '1px solid rgba(100,180,255,0.2)',
                                    color: filter === f ? 'white' : '#94a3b8'
                                }}>
                                {f} {f === 'ALL' ? `(${counts.ALL})` : f === 'PENDING' ? `(${counts.PENDING})` : `(${counts.VERIFIED})`}
                            </button>
                        ))}
                    </div>
                    <div className="input-group" style={{ maxWidth: 280 }}>
                        <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                            <i className="bi bi-search"></i>
                        </span>
                        <input type="text" className="form-control" placeholder="Search payments…"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0', fontSize: '0.85rem' }} />
                    </div>
                </div>

                {/* Alert */}
                {alert && (
                    <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 mb-3`}>
                        <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                        <span>{alert.message}</span>
                        <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
                    </div>
                )}

                {/* Table */}
                <div className="card border-0"
                    style={{ background: 'rgba(15,35,71,0.85)', borderRadius: 16, border: '1px solid rgba(100,180,255,0.1)' }}>
                    {loading ? (
                        <div className="text-center py-5"><span className="spinner-border text-info"></span></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox text-secondary" style={{ fontSize: '2.5rem' }}></i>
                            <p className="text-secondary mt-3">No payments found for the current filter.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(100,180,255,0.1)' }}>
                                        {['ID', 'Customer', 'Account', 'Amount', 'Currency', 'SWIFT Code', 'Recipient', 'Submitted', 'Status', 'Action'].map(h => (
                                            <th key={h} className="text-secondary fw-semibold px-3 py-3" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p, idx) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(100,180,255,0.05)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-3 py-3">
                                                <span className="text-secondary fw-mono" style={{ fontSize: '0.8rem' }}>#{p.id}</span>
                                            </td>
                                            <td className="px-3">
                                                <span className="text-white fw-semibold" style={{ fontSize: '0.85rem' }}>{p.customerName}</span>
                                            </td>
                                            <td className="px-3">
                                                <code className="text-info" style={{ fontSize: '0.8rem', background: 'rgba(14,165,233,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                                                    {p.accountNumber}
                                                </code>
                                            </td>
                                            <td className="px-3">
                                                <span className="text-white fw-bold" style={{ fontFamily: 'Space Grotesk', fontSize: '0.9rem' }}>
                                                    {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-3">
                                                <span className="badge px-2" style={{ background: 'rgba(100,180,255,0.1)', color: '#93c5fd', fontSize: '0.75rem' }}>{p.currency}</span>
                                            </td>
                                            <td className="px-3">
                                                <code className="text-warning" style={{ fontSize: '0.8rem', background: 'rgba(234,179,8,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                                                    {p.swiftCode}
                                                </code>
                                            </td>
                                            <td className="px-3">
                                                <code className="text-secondary" style={{ fontSize: '0.8rem' }}>{p.receiver}</code>
                                            </td>
                                            <td className="px-3">
                                                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(p.createdAt).toLocaleDateString()}
                                                    <br />
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{new Date(p.createdAt).toLocaleTimeString()}</span>
                                                </span>
                                            </td>
                                            <td className="px-3">{statusBadge(p.status)}</td>
                                            <td className="px-3">
                                                {p.status === 'PENDING' ? (
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm fw-semibold"
                                                            onClick={() => handleVerify(p.id)}
                                                            disabled={verifying === p.id}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #059669, #10b981)',
                                                                color: 'white'
                                                            }}>
                                                            Verify
                                                        </button>

                                                        <button
                                                            className="btn btn-sm fw-semibold"
                                                            onClick={() => handleReject(p.id)}
                                                            disabled={verifying === p.id}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                                                color: 'white'
                                                            }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                        {p.verifiedAt ? `Verified ${new Date(p.verifiedAt).toLocaleDateString()}` : '—'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <p className="text-secondary text-center mt-3" style={{ fontSize: '0.75rem' }}>
                    Showing {filtered.length} of {payments.length} payments
                </p>
            </div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        code { font-family: 'Courier New', monospace; }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
