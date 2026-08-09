'use client';
import { useState, useEffect } from 'react';
import ScoringForm from './ScoringForm';

export default function CoreTeacherView({ teacher }) {
  const [activePeriod, setActivePeriod] = useState('Period 1');
  const [allStudents, setAllStudents] = useState([]);
  const [rosters, setRosters] = useState({
    'Period 1': [],
    'Period 2': [],
    'Period 3': []
  });
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  // Use the teacher's assigned grade, fallback to 6 if not set for some reason
  const gradeLevel = teacher.gradeLevel || 6;

  useEffect(() => {
    fetchStudents(gradeLevel);
    fetchRosters();
  }, [gradeLevel, teacher.id]);

  const fetchStudents = async (grade) => {
    const res = await fetch(`/api/students?grade=${grade}`);
    const data = await res.json();
    setAllStudents(data);
  };

  const fetchRosters = async () => {
    const res = await fetch(`/api/rosters?teacherId=${teacher.id}`);
    const data = await res.json();
    
    // Map existing rosters
    const newRosters = { 'Period 1': [], 'Period 2': [], 'Period 3': [] };
    data.forEach(r => {
      if (newRosters[r.name] !== undefined) {
        newRosters[r.name] = r.students.map(s => s.id);
      }
    });
    setRosters(newRosters);
    setLoading(false);
  };

  const toggleStudent = (studentId) => {
    const currentList = rosters[activePeriod];
    if (currentList.includes(studentId)) {
      setRosters({ ...rosters, [activePeriod]: currentList.filter(id => id !== studentId) });
    } else {
      setRosters({ ...rosters, [activePeriod]: [...currentList, studentId] });
    }
  };

  const saveRoster = async () => {
    await fetch('/api/rosters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: teacher.id,
        name: activePeriod,
        type: 'CORE',
        studentIds: rosters[activePeriod]
      })
    });
    alert(`${activePeriod} roster saved!`);
  };

  if (loading) return <div>Loading Core Portal...</div>;

  const currentRosterIds = rosters[activePeriod] || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Class Roster Setup</h3>
        <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--kms-teal-light)' }}>
          {gradeLevel}th Grade Students
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {['Period 1', 'Period 2', 'Period 3'].map(period => {
          let btnStyle = { flex: 1, opacity: activePeriod === period ? 1 : 0.7 };
          if (period === 'Period 1') btnStyle.background = 'var(--kms-purple)';
          if (period === 'Period 2') btnStyle.background = 'var(--kms-teal)';
          if (period === 'Period 3') {
            btnStyle.background = 'white';
            btnStyle.color = 'black';
          }
          return (
            <button 
              key={period}
              onClick={() => setActivePeriod(period)}
              className="btn"
              style={btnStyle}
            >
              {period}
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>All {gradeLevel}th Grade Students ({allStudents.length})</h4>
            <input 
              type="text" 
              placeholder="Search students..." 
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '200px', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {allStudents.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase())).map(student => {
              let bg = 'var(--bg-secondary)';
              let border = 'transparent';
              let textColor = 'white';
              let check = false;

              if (rosters['Period 1']?.includes(student.id)) { bg = 'rgba(92, 45, 145, 0.4)'; border = 'var(--kms-purple)'; check = true; }
              else if (rosters['Period 2']?.includes(student.id)) { bg = 'rgba(0, 128, 128, 0.3)'; border = 'var(--kms-teal)'; check = true; }
              else if (rosters['Period 3']?.includes(student.id)) { bg = 'rgba(255, 255, 255, 0.8)'; border = 'white'; textColor = 'black'; check = true; }

              return (
                <div 
                  key={student.id} 
                  onClick={() => toggleStudent(student.id)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: check ? 'rgba(32, 178, 170, 0.2)' : 'var(--bg-primary)',
                    border: `2px solid ${check ? 'var(--kms-teal-light)' : 'transparent'}`,
                    color: 'var(--text-primary)',
                    fontWeight: check ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {student.lastName}, {student.firstName} {check && '✓'}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--kms-teal-light)' }}>{activePeriod} Selected ({currentRosterIds.length})</h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {allStudents.filter(s => currentRosterIds.includes(s.id)).map(student => (
              <div key={student.id} style={{ padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                {student.lastName}, {student.firstName}
              </div>
            ))}
            {currentRosterIds.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No students selected.</p>}
          </div>
          <button className="btn btn-primary" onClick={saveRoster} style={{ width: '100%' }}>Finalize {activePeriod}</button>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <ScoringForm rosterIds={currentRosterIds} allStudents={allStudents} rosterName={activePeriod} />
      </div>
    </div>
  );
}
