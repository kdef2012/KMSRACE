'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CoreTeacherView from '@/components/CoreTeacherView';
import EncoreTeacherView from '@/components/EncoreTeacherView';

export default function TeacherPortal() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('kms_user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'CORE_TEACHER' && parsedUser.role !== 'ENCORE_TEACHER' && parsedUser.role !== 'EC_TEACHER' && parsedUser.role !== 'ML_TEACHER') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  if (!user) return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--kms-teal-light)' }}>Welcome, {user.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Room: {user.roomNumber} | Role: {user.role.replace('_', ' ')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/race')} className="btn btn-secondary">View Race</button>
          <button 
            onClick={() => { localStorage.removeItem('kms_user'); router.push('/'); }} 
            className="btn" 
            style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)' }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="glass-panel" style={{ padding: '2rem', minHeight: '60vh' }}>
        {user.role === 'CORE_TEACHER' ? (
          <CoreTeacherView teacher={user} />
        ) : (
          <EncoreTeacherView teacherId={user.id} />
        )}
      </main>
    </div>
  );
}
