'use client';
import { useState, useEffect } from 'react';
import ScoringForm from './ScoringForm';

export default function EncoreTeacherView({ teacherId }) {
  const [activeGrade, setActiveGrade] = useState('6');
  const [activeDay, setActiveDay] = useState('A'); // A or B
  const [allStudents, setAllStudents] = useState([]);
  
  // State for all 6 rosters
  const [rosters, setRosters] = useState({
    '6th A': [], '6th B': [],
    '7th A': [], '7th B': [],
    '8th A': [], '8th B': []
  });
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    fetchStudents(activeGrade);
  }, [activeGrade]);

  useEffect(() => {
    fetchRosters();
  }, [teacherId]);

  const fetchStudents = async (grade) => {
    const res = await fetch(`/api/students?grade=${grade}`);
    const data = await res.json();
    setAllStudents(data);
  };

  const fetchRosters = async () => {
    const res = await fetch(`/api/rosters?teacherId=${teacherId}`);
    const data = await res.json();
    
    const newRosters = { ...rosters };
    data.forEach(r => {
      if (newRosters[r.name] !== undefined) {
        newRosters[r.name] = r.students.map(s => s.id);
      }
    });
    setRosters(newRosters);
    setLoading(false);
  };

  const getActiveRosterName = () => `${activeGrade}th ${activeDay}`;

  const toggleStudent = (studentId) => {
    const rName = getActiveRosterName();
    const currentList = rosters[rName];
    if (currentList.includes(studentId)) {
      setRosters({ ...rosters, [rName]: currentList.filter(id => id !== studentId) });
    } else {
      setRosters({ ...rosters, [rName]: [...currentList, studentId] });
    }
  };

  const saveRoster = async () => {
    const rName = getActiveRosterName();
    await fetch('/api/rosters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId,
        name: rName,
        type: 'ENCORE',
        studentIds: rosters[rName]
      })
    });
    alert(`${rName} roster saved!`);
  };

  if (loading) return <div>Loading Encore Portal...</div>;

  const currentRosterIds = rosters[getActiveRosterName()] || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Encore Class Setup</h3>
        
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-secondary)' }}>Grade:</label>
            <select 
              value={activeGrade} 
              onChange={(e) => setActiveGrade(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', background: 'transparent', color: 'var(--text-primary)' }}
            >
              <option style={{ color: 'black' }} value="6">6th Grade</option>
              <option style={{ color: 'black' }} value="7">7th Grade</option>
              <option style={{ color: 'black' }} value="8">8th Grade</option>
            </select>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <label style={{ color: 'var(--text-secondary)' }}>Day:</label>
             <button 
                onClick={() => setActiveDay('A')}
                className="btn" 
                style={{ padding: '0.25rem 1rem', background: activeDay === 'A' ? 'var(--kms-purple)' : 'transparent', color: 'var(--text-primary)' }}
             >A Day</button>
             <button 
                onClick={() => setActiveDay('B')}
                className="btn" 
                style={{ padding: '0.25rem 1rem', background: activeDay === 'B' ? 'var(--kms-teal)' : 'transparent', color: 'var(--text-primary)' }}
             >B Day</button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>All {activeGrade}th Grade Students</h4>
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
              const check = currentRosterIds.includes(student.id);
              return (
                <div 
                  key={student.id} 
                  onClick={() => toggleStudent(student.id)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: check ? 'rgba(92, 45, 145, 0.4)' : 'var(--bg-secondary)',
                    border: `1px solid ${check ? 'var(--kms-purple)' : 'transparent'}`,
                    color: 'var(--text-primary)',
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
          <h4 style={{ marginBottom: '1rem', color: 'var(--kms-purple-light)' }}>{getActiveRosterName()} Selected ({currentRosterIds.length})</h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {allStudents.filter(s => currentRosterIds.includes(s.id)).map(student => (
              <div key={student.id} style={{ padding: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                {student.lastName}, {student.firstName}
              </div>
            ))}
            {currentRosterIds.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No students selected.</p>}
          </div>
          <button className="btn btn-primary" onClick={saveRoster} style={{ width: '100%' }}>Finalize {getActiveRosterName()}</button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <ScoringForm rosterIds={currentRosterIds} allStudents={allStudents} rosterName={getActiveRosterName()} />
      </div>
    </div>
  );
}
