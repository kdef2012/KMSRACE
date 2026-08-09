'use client';
import { useState } from 'react';

export default function ScoringForm({ rosterIds, allStudents, rosterName }) {
  // state structure: { studentId: { workHabits: true, behavior: false, ... } }
  const [scores, setScores] = useState({});

  const toggleScore = (studentId, category) => {
    setScores(prev => {
      const studentScores = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: {
          ...studentScores,
          [category]: !studentScores[category]
        }
      };
    });
  };

  const studentsInRoster = allStudents.filter(s => rosterIds.includes(s.id));

  const saveScores = async () => {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores })
    });
    alert('Scores saved for today!');
  };

  if (studentsInRoster.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No students in this roster yet. Build your roster first!</div>;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--kms-teal)' }}>Score: {rosterName}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '0.5rem' }}>Student</th>
              <th style={{ padding: '0.5rem', color: 'var(--star-blue)' }}>Work Habits (5⭐)</th>
              <th style={{ padding: '0.5rem', color: 'var(--star-red)' }}>Behavior (1⭐)</th>
              <th style={{ padding: '0.5rem', color: 'var(--star-gold)' }}>Attendance (2⭐)</th>
              <th style={{ padding: '0.5rem', color: 'var(--star-green)' }}>Punctuality (1⭐)</th>
              <th style={{ padding: '0.5rem', color: 'var(--star-silver)' }}>Dress Code (1⭐)</th>
            </tr>
          </thead>
          <tbody>
            {studentsInRoster.map(student => {
              const studentScores = scores[student.id] || {};
              return (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{student.lastName}, {student.firstName}</td>
                  {['workHabits', 'behavior', 'attendance', 'punctuality', 'dressCode'].map(cat => (
                    <td key={cat} style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={!!studentScores[cat]}
                        onChange={() => toggleScore(student.id, cat)}
                        style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="btn btn-primary" onClick={saveScores} style={{ marginTop: '1.5rem' }}>
        Submit Daily Scores
      </button>
    </div>
  );
}
