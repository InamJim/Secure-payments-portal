import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { AuthProvider } from './services/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
/*import Register    from './pages/Register';*/
import PaymentPage from './pages/PaymentPage';
import AdminDashboard
    from './pages/AdminDashboard';
import SecurityMonitor from './pages/SecurityMonitor';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    {/* <Route path="/register" element={<Register />} /> */}

                    <Route path="/payment" element={
                        <ProtectedRoute requiredRole={["customer", "admin"]}>
                            <PaymentPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/security-monitor" element={
                        <ProtectedRoute requiredRole="admin">
                            <SecurityMonitor />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
