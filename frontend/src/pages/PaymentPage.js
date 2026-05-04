import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/api';
import { useAuth } from '../services/AuthContext';

const CURRENCIES = ['USD','EUR','GBP','JPY','ZAR','AUD','CAD','CHF','CNY','INR','BRL','SGD'];

const AMOUNT_RE  = /^\d{1,15}(\.\d{1,2})?$/;
const SWIFT_RE   = /^[A-Z0-9]{8}([A-Z0-9]{3})?$/;
const ACCOUNT_RE = /^\d{8,12}$/;

const statusBadge = (status) => {
  const map = {
    PENDING:  { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.4)',  color: '#fbbf24', icon: 'bi-clock-history' },
    VERIFIED: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', color: '#4ade80', icon: 'bi-check-circle-fill' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171', icon: 'bi-x-circle-fill' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 6, fontSize: '0.75rem' }}>
      <i className={`bi ${s.icon}`} style={{ fontSize: '0.7rem' }}></i>{status}
    </span>
  );
};

const PaymentPage = () => {
  const { user } = useAuth();

  const [form, setForm]         = useState({ amount: '', currency: 'USD', swiftCode: '', RecipientAccount: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingPay, setLoadingPay] = useState(false);

  const fetchMyPayments = async () => {
    setLoadingPay(true);
    try {
      const res = await paymentService.getMyPayments();
      setPayments(res.data);
    } catch { /* silent */ }
    finally { setLoadingPay(false); }
  };

  useEffect(() => { fetchMyPayments(); }, []);

  const validate = () => {
    const e = {};
    if (!form.amount || !AMOUNT_RE.test(form.amount) || parseFloat(form.amount) <= 0)
      e.amount = 'Enter a valid positive amount (up to 2 decimal places).';
    if (!form.currency)
      e.currency = 'Select a currency.';
    if (!SWIFT_RE.test(form.swiftCode.trim().toUpperCase()))
      e.swiftCode = 'SWIFT code must be 8 or 11 uppercase alphanumeric characters.';
    if (!ACCOUNT_RE.test(form.RecipientAccount.trim()))
      e.RecipientAccount = 'Recipient account must be 8–12 digits.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'swiftCode' ? value.toUpperCase() : value }));
    setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);
    try {
      await paymentService.createPayment({
        amount:    parseFloat(form.amount),
        currency:  form.currency,
        swiftCode: form.swiftCode.trim().toUpperCase(),
        RecipientAccount:  form.RecipientAccount.trim(),
      });
      setAlert({ type: 'success', message: 'Payment submitted successfully! Your payment is pending employee verification.' });
      setForm({ amount: '', currency: 'USD', swiftCode: '', RecipientAccount: '' });
      fetchMyPayments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment submission failed.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 py-4"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2347 50%, #0a1628 100%)' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Welcome banner */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3"
          style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.15)' }}>
          <div className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', flexShrink: 0 }}>
            <i className="bi bi-person-fill text-white fs-5"></i>
          </div>
          <div>
            <h6 className="text-white mb-0 fw-semibold" style={{ fontFamily: 'Space Grotesk' }}>Welcome, {user?.fullName}</h6>
            <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>Account: {user?.accountNumber}</p>
          </div>
          <div className="ms-auto">
            <span className="badge px-3 py-2" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: 8 }}>
              <i className="bi bi-shield-check me-1"></i>Secure Session
            </span>
          </div>
        </div>

        <div className="row g-4">
          {/* Payment Form */}
          <div className="col-lg-5">
            <div className="card border-0 h-100"
              style={{ background: 'rgba(15,35,71,0.85)', borderRadius: 16, border: '1px solid rgba(100,180,255,0.1)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-2"
                    style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
                    <i className="bi bi-send-fill text-white" style={{ fontSize: '0.9rem' }}></i>
                  </div>
                  <div>
                    <h5 className="text-white mb-0 fw-bold" style={{ fontFamily: 'Space Grotesk' }}>New Payment</h5>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>International SWIFT transfer</p>
                  </div>
                </div>

                {alert && (
                  <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-start gap-2`}>
                    <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} mt-1`}></i>
                    <span style={{ fontSize: '0.85rem' }}>{alert.message}</span>
                    <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Amount and Currency */}
                  <div className="mb-3">
                    <label className="form-label text-light fw-medium small">Amount &amp; Currency</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                        <i className="bi bi-currency-exchange"></i>
                      </span>
                      <input type="number" name="amount" step="0.01" min="0.01"
                        className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                        placeholder="0.00"
                        value={form.amount} onChange={handleChange}
                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }} />
                      <select name="currency"
                        className={`form-select ${errors.currency ? 'is-invalid' : ''}`}
                        value={form.currency} onChange={handleChange}
                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0', maxWidth: 90 }}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                    </div>
                  </div>

                  {/* SWIFT Code */}
                  <div className="mb-3">
                    <label className="form-label text-light fw-medium small">SWIFT / BIC Code</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                        <i className="bi bi-globe"></i>
                      </span>
                      <input type="text" name="swiftCode"
                        className={`form-control ${errors.swiftCode ? 'is-invalid' : ''}`}
                        placeholder="e.g. NEDSZAJJXXX"
                        value={form.swiftCode} onChange={handleChange} maxLength={11}
                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0', fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                      {errors.swiftCode && <div className="invalid-feedback">{errors.swiftCode}</div>}
                    </div>
                    <div className="form-text text-secondary" style={{ fontSize: '0.7rem' }}>8 or 11 uppercase alphanumeric characters</div>
                  </div>

                  {/* Recipient Account */}
                  <div className="mb-4">
                    <label className="form-label text-light fw-medium small">Recipient Account Number</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa' }}>
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input type="text" name="RecipientAccount"
                        className={`form-control ${errors.receiver ? 'is-invalid' : ''}`}
                        placeholder="Recipient's account number"
                        value={form.RecipientAccount} onChange={handleChange} maxLength={12}
                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(100,180,255,0.2)', color: '#e2e8f0' }} />
                      {errors.receiver && <div className="invalid-feedback">{errors.receiver}</div>}
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn w-100 fw-semibold py-2"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Processing…</>
                    ) : (
                      <><i className="bi bi-send-fill me-2"></i>Pay Now</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="col-lg-7">
            <div className="card border-0 h-100"
              style={{ background: 'rgba(15,35,71,0.85)', borderRadius: 16, border: '1px solid rgba(100,180,255,0.1)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center rounded-2"
                      style={{ width: 36, height: 36, background: 'rgba(37,99,235,0.2)' }}>
                      <i className="bi bi-clock-history text-info" style={{ fontSize: '0.9rem' }}></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-0 fw-bold" style={{ fontFamily: 'Space Grotesk' }}>My Payments</h5>
                      <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={fetchMyPayments} disabled={loadingPay}
                    style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(100,180,255,0.2)', color: '#60a5fa', borderRadius: 8 }}>
                    <i className={`bi bi-arrow-clockwise ${loadingPay ? 'spin' : ''}`}></i>
                  </button>
                </div>

                {loadingPay ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-info"></span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-secondary" style={{ fontSize: '2.5rem' }}></i>
                    <p className="text-secondary mt-3">No payments yet. Submit your first payment!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3" style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {payments.map(p => (
                      <div key={p.id} className="p-3 rounded-3"
                        style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(100,180,255,0.08)' }}>
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div>
                            <span className="text-white fw-bold" style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
                              {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}
                            </span>
                            <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-globe me-1"></i>{p.swiftCode}
                              <span className="mx-2">→</span>
                              <i className="bi bi-person-badge me-1"></i>{p.receiver}
                            </div>
                          </div>
                          {statusBadge(p.status)}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(p.createdAt).toLocaleString()}
                          {p.verifiedAt && (
                            <span className="ms-2 text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Verified {new Date(p.verifiedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PaymentPage;
