'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function RaceView() {
  const [raceData, setRaceData] = useState([]);
  const [goalType, setGoalType] = useState('POINTS');
  const [goalValue, setGoalValue] = useState('1000');
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Animation state
  const [loaded, setLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    setIsMounted(true);
    
    const userData = localStorage.getItem('kms_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchRace = async () => {
      const res = await fetch('/api/race');
      const data = await res.json();
      setRaceData(data.results || []);
      setGoalType(data.goalType || 'POINTS');
      setGoalValue(data.goalValue || '1000');
      
      // Trigger sweep animation shortly after data arrives
      setTimeout(() => setLoaded(true), 100);
    };

    fetchRace();
    const interval = setInterval(fetchRace, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPositionIcon = (index) => {
    if (index === 0) return <span className="animate-bounce-star">🌟 1st</span>;
    if (index === 1) return '🥈 2nd';
    return '🥉 3rd';
  };

  const getGradeLogos = (grade) => {
    if (grade === 6) return ["/logos/unc_real.jpg", "/logos/ncstate_real.png"];
    if (grade === 7) return ["/logos/wakeforest_real.png", "/logos/duke_real.png"];
    if (grade === 8) return ["/logos/ncat_real.png", "/logos/wssu_real.jpg"];
    return [null, null];
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem 2rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* 5 Seconds of Confetti on load! (Only render on client to prevent hydration mismatch) */}
      {isMounted && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={400} 
          colors={['#5c2d91', '#7b42b9', '#008080', '#20b2aa', '#fbbf24']}
          gravity={0.15}
        />
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', zIndex: 10 }}>
        <div>
          <h1 className="font-graffiti glow-text" style={{ color: 'var(--kms-teal-light)', fontSize: '3rem', margin: 0 }}>The Great Owl Race</h1>
          <p className="font-bubble" style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '1px' }}>Expectations of Excellence Competition</p>
        </div>
        <button 
          onClick={() => {
            if (!user) router.push('/');
            else if (user.role === 'ADMIN') router.push('/admin');
            else router.push('/teacher');
          }} 
          className="btn font-bubble" 
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
        >
          {user ? 'Back to Dashboard' : 'Back to Login'}
        </button>
      </header>

      {/* Prize Banner Placeholder */}
      <div className="glass-card font-bubble glow-text-purple" style={{ zIndex: 10, textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(92, 45, 145, 0.1)', border: '2px solid var(--kms-purple-light)', padding: '1rem' }}>
        <h2 style={{ color: 'var(--kms-purple-dark)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>🏆 Current Prizes 🏆</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          <div><span style={{ color: 'var(--star-gold)' }}>1st Place:</span> <span style={{ color: 'var(--kms-teal-dark)' }}>Great Wolf Lodge, Charlotte Hornets Game, & Classic Fair!</span></div>
          <div><span style={{ color: 'var(--star-silver)' }}>2nd Place:</span> <span style={{ color: 'var(--kms-teal-dark)' }}>The Classic Fair!</span></div>
        </div>
      </div>

      <main style={{ zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {raceData.map((grade, index) => {
          const logos = getGradeLogos(grade.grade);
          return (
          <div key={grade.grade} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.5rem' }}>
            
            <div style={{ minWidth: '100px', textAlign: 'center' }}>
              <h2 className={`font-bubble ${grade.grade === 7 ? 'glow-text' : 'glow-text-purple'}`} style={{ fontSize: '2.2rem', margin: 0, color: grade.grade === 7 ? 'var(--kms-teal-light)' : 'var(--kms-purple-light)' }}>{grade.grade}th</h2>
              <div className="font-bubble" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{getPositionIcon(index)}</div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="font-bubble" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', marginRight: '1.5rem' }}>Avg: {grade.avgPoints} pts</span>
                  {grade.starScholar && <span style={{ color: 'var(--star-gold)' }}>⭐ Star Scholar: {grade.starScholar}</span>}
                </div>
                {goalType === 'POINTS' && <span style={{ fontWeight: 'bold' }}>{grade.percentage}%</span>}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {logos[0] && <img src={logos[0]} alt="Logo 1" style={{ height: '40px', objectFit: 'contain' }} />}
                
                <div 
                  style={{ flex: 1, height: '30px', background: 'rgba(0,0,0,0.1)', borderRadius: '15px', overflow: 'hidden', border: '1px solid var(--glass-border)', cursor: 'help' }}
                  title={goalType === 'TIME' ? `Race ends on: ${goalValue}` : `Points needed: ${Math.max(0, parseInt(goalValue) - parseFloat(grade.avgPoints)).toFixed(1)}`}
                >
                  <div 
                    className="animate-pulse-bar"
                    style={{ 
                      width: loaded ? `${grade.percentage}%` : '0%', 
                      height: '100%', 
                      background: grade.grade === 7 
                        ? 'linear-gradient(90deg, var(--kms-teal-dark), var(--kms-teal-light))' 
                        : 'linear-gradient(90deg, var(--kms-purple-dark), var(--kms-purple-light))',
                      transition: 'width 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      borderRadius: '15px'
                    }}
                  ></div>
                </div>

                {logos[1] && <img src={logos[1]} alt="Logo 2" style={{ height: '40px', objectFit: 'contain' }} />}
              </div>
            </div>

          </div>
        )})}

        <div className="font-bubble glow-text" style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--kms-teal-light)', fontSize: '1.2rem' }}>
          {goalType === 'TIME' ? `Competition Ends On: ${goalValue}` : `Target Goal: ${goalValue} points per student average`}
        </div>
      </main>
    </div>
  );
}
