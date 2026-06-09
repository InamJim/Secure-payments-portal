import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

const SecurityMonitor = () => {
    const { user } = useAuth();

    const [auditLogs, setAuditLogs] = useState([]);
    const [failedLogins, setFailedLogins] = useState([]);
    const [rateLimitEvents, setRateLimitEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    

    const token = localStorage.getItem('token');

    const api = React.useMemo(() => {
        return axios.create({
            baseURL: 'http://localhost:5000/api/admin/security',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }, [token]);

    const fetchSecurityData = useCallback(async () => {
        try {
            setLoading(true);

            const [auditRes, failedRes, rateRes] = await Promise.all([
                api.get('/audit-logs'),
                api.get('/failed-logins'),
                api.get('/rate-limit-events')
            ]);

            setAuditLogs(auditRes.data);
            setFailedLogins(failedRes.data);
            setRateLimitEvents(rateRes.data);

        } catch (err) {
            setError('Failed to load security monitoring data.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchSecurityData();
    }, [fetchSecurityData]);

    if (user?.role !== 'admin') {
        return (
            <div className="container mt-5 text-center text-danger">
                Access Denied
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <h3 className="text-white mb-4">Security Monitoring Dashboard</h3>

            {loading && <p className="text-info">Loading security logs...</p>}
            {error && <p className="text-danger">{error}</p>}

            {/* AUDIT LOGS */}
            <div className="card mb-4 bg-dark text-white">
                <div className="card-header">Audit Logs</div>
                <div className="card-body table-responsive">
                    <table className="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Account</th>
                                <th>Details</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, idx) => (
                                <tr key={idx}>
                                    <td>{log.eventType}</td>
                                    <td>{log.accountNumber || '-'}</td>
                                    <td>{log.details}</td>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAILED LOGINS */}
            <div className="card mb-4 bg-dark text-white">
                <div className="card-header">Failed Login Attempts</div>
                <div className="card-body">
                    {failedLogins.length === 0 ? (
                        <p className="text-muted">No failed login data yet.</p>
                    ) : (
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>Account</th>
                                    <th>Attempts</th>
                                    <th>Last Attempt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedLogins.map((f, idx) => (
                                    <tr key={idx}>
                                        <td>{f.accountNumber}</td>
                                        <td>{f.count}</td>
                                        <td>{new Date(f.lastAttempt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* RATE LIMIT EVENTS */}
            <div className="card bg-dark text-white">
                <div className="card-header">Rate Limit Events</div>
                <div className="card-body">
                    {rateLimitEvents.length === 0 ? (
                        <p className="text-muted">No rate limit events detected.</p>
                    ) : (
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>IP Address</th>
                                    <th>Endpoint</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rateLimitEvents.map((r, idx) => (
                                    <tr key={idx}>
                                        <td>{r.ipAddress}</td>
                                        <td>{r.endpoint}</td>
                                        <td>{new Date(r.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SecurityMonitor;