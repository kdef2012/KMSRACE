'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole || !pin) {
      setError('Please select a role and enter your PIN.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, pin })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('kms_user', JSON.stringify(data));
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/teacher');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login.');
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--kms-teal-light)' }}>KMS Owls</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Expectations of Excellence</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--star-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Role</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
            >
              <option value="" style={{ color: 'black' }}>Select Role...</option>
              <option value="CORE_TEACHER" style={{ color: 'black' }}>Core Teacher</option>
              <option value="ENCORE_TEACHER" style={{ color: 'black' }}>Encore Teacher</option>
              <option value="ML_TEACHER" style={{ color: 'black' }}>ML Teacher (Spanish)</option>
              <option value="EC_TEACHER" style={{ color: 'black' }}>EC Teacher</option>
              <option value="ADMIN" style={{ color: 'black' }}>Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>4-Digit PIN</label>
            <input 
              type="password" 
              maxLength="4"
              placeholder="e.g. 0218"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
