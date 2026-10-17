import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState('checking'); // checking | ok | fail

  useEffect(() => {
    const token = localStorage.getItem('bes_admin_token');
    if (!token) { setStatus('fail'); return; }
    api.get('/auth/verify')
      .then(r => setStatus(r.data.valid ? 'ok' : 'fail'))
      .catch(() => setStatus('fail'));
  }, []);

  if (status === 'checking') return (
    <div className="loading-spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );
  if (status === 'fail') return <Navigate to="/admin/login/BES-ADMIN-CHANGE-ME" replace />;
  return children;
}
