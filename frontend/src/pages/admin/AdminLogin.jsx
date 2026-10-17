import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminLogin() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('logging-in');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) { setStatus('error'); setError('Invalid access link.'); return; }
    api.post('/auth/login', { code })
      .then(res => {
        localStorage.setItem('bes_admin_token', res.data.token);
        setStatus('success');
        setTimeout(() => navigate('/admin'), 800);
      })
      .catch(err => {
        setStatus('error');
        setError(err.response?.data?.error || 'Access denied. Invalid code.');
      });
  }, [code, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--red-dark) 0%, var(--red-primary) 100%)', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
         <img src="/uploads/logo.png" alt="BES Logo placeholder" style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 20px' }} onError={e => e.target.style.display='none'} />
         <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>BES Admin Panel</h1>
         <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 32 }}>Bacao Elementary School</p>

        {status === 'logging-in' && (
          <div>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--gray-600)' }}>Verifying access...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="alert alert-success" style={{ textAlign: 'center' }}>
            ✅ Access granted! Redirecting to dashboard...
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="alert alert-error">{error}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 16 }}>
              Please contact your school IT administrator for the correct admin access link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
