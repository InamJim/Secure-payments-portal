import React, { useEffect, useState, useCallback } from 'react';
import { paymentService } from '../services/api';
import { useAuth } from '../services/AuthContext';

const PaymentApproval = () => {
    const { user } = useAuth();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actioning, setActioning] = useState(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await paymentService.getAllPayments();
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const approve = async (id) => {
        setActioning(id);
        try {
            await paymentService.verifyPayment(id);
            fetchPayments();
        } finally {
            setActioning(null);
        }
    };

    if (!user || user.role !== 'Admin') {
        return <div className="text-white text-center mt-5">Access Denied</div>;
    }

    return (
        <div className="container text-white py-4">

            <h2 className="mb-4">Payment Approval Queue</h2>

            {loading ? (
                <p>Loading payments...</p>
            ) : (
                <table className="table table-dark table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {payments
                            .filter(p => p.status === 'PENDING')
                            .map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.customerName}</td>
                                    <td>{p.amount}</td>
                                    <td>{p.currency}</td>
                                    <td>{p.status}</td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm"
                                            disabled={actioning === p.id}
                                            onClick={() => approve(p.id)}
                                        >
                                            {actioning === p.id ? 'Processing...' : 'Approve'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}

        </div>
    );
};

export default PaymentApproval;// JavaScript source code
