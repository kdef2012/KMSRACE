'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  const [teacherName, setTeacherName] = useState('');
  const [teacherRole, setTeacherRole] = useState('CORE_TEACHER');
  const [teacherRoom, setTeacherRoom] = useState('');
  const [teacherGrade, setTeacherGrade] = useState('6');
  
  const [studentFirst, setStudentFirst] = useState('');
  const [studentLast, setStudentLast] = useState('');
  const [studentGrade, setStudentGrade] = useState('6');
  
  const [studentSearch, setStudentSearch] = useState('');
  const [adminStudentGradeTab, setAdminStudentGradeTab] = useState(6);
  
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherRoom, setEditTeacherRoom] = useState('');
  const [editTeacherGrade, setEditTeacherGrade] = useState('');

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('kms_user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
    
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const tRes = await fetch('/api/teachers');
    const tData = await tRes.json();
    setTeachers(tData);

    const sRes = await fetch('/api/students');
    const sData = await sRes.json();
    setStudents(sData);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!teacherName || !teacherRoom) return alert("Please fill out name and room.");
    const pin = teacherRoom.replace(/\D/g, '').padStart(4, '0') || '1234';
    
    await fetch('/api/teachers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: teacherName, 
        role: teacherRole, 
        roomNumber: teacherRoom, 
        pin,
        gradeLevel: teacherRole === 'CORE_TEACHER' ? teacherGrade : null
      })
    });
    alert(`Created ${teacherName} with PIN: ${pin}`);
    setTeacherName('');
    setTeacherRoom('');
    fetchData();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentFirst || !studentLast) return alert("Please fill out name.");
    
    await fetch('/api/students/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: studentFirst, lastName: studentLast, gradeLevel: studentGrade })
    });
    alert(`Created student ${studentFirst} ${studentLast}`);
    setStudentFirst('');
    setStudentLast('');
    fetchData();
  };

  const handleUpdateRole = async (teacherId, newRole) => {
    let gradeLevel = undefined;
    if (newRole === 'CORE_TEACHER') {
      const grade = window.prompt("Enter the Grade Level (6, 7, or 8) for this Core Teacher:");
      if (!grade || !['6','7','8'].includes(grade.trim())) {
        alert("Invalid grade. Role update cancelled.");
        // We fetch data to reset the select dropdown in the UI back to what it was
        fetchData();
        return;
      }
      gradeLevel = parseInt(grade.trim(), 10);
    }

    // Optimistically update the UI instantly
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        return { ...t, role: newRole, gradeLevel: gradeLevel !== undefined ? gradeLevel : t.gradeLevel };
      }
      return t;
    }));

    const res = await fetch(`/api/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole, gradeLevel })
    });
    
    if (!res.ok) {
      alert("Failed to update role in database.");
      fetchData(); // revert
      return;
    }
  };

  const handleEditTeacher = (t) => {
    setEditingTeacherId(t.id);
    setEditTeacherName(t.name);
    setEditTeacherRoom(t.roomNumber || '');
    setEditTeacherGrade(t.gradeLevel ? String(t.gradeLevel) : '6');
  };

  const handleSaveTeacherEdit = async (teacherId) => {
    if (!editTeacherName || !editTeacherRoom) return alert("Name and Room are required.");
    
    // Find the teacher we are editing to check their role
    const teacherBeingEdited = teachers.find(t => t.id === teacherId);
    let payload = { name: editTeacherName, roomNumber: editTeacherRoom };
    if (teacherBeingEdited?.role === 'CORE_TEACHER') {
      payload.gradeLevel = parseInt(editTeacherGrade, 10);
    }

    const res = await fetch(`/api/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updated = await res.json();
      setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, name: updated.name, roomNumber: updated.roomNumber, pin: updated.pin, gradeLevel: updated.gradeLevel } : t));
      setEditingTeacherId(null);
    } else {
      alert("Failed to update teacher");
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher? All their rosters will also be deleted.")) return;
    const res = await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
    if (res.ok) {
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
    } else {
      alert("Failed to delete teacher");
    }
  };

  const handleWipeRaceData = async () => {
    if (!window.confirm("WARNING: Are you sure you want to completely wipe all race scores and daily logs? This cannot be undone and will reset the race to 0 points for everyone.")) return;
    const res = await fetch(`/api/logs/wipe`, { method: 'DELETE' });
    if (res.ok) {
      alert("All race data has been wiped clean! Ready for live launch.");
    } else {
      alert("Failed to wipe data");
    }
  };

  if (!user) return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--kms-purple-light)' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage competition settings and users</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/race')} className="btn btn-secondary">View Race</button>
          <button 
            onClick={() => { localStorage.removeItem('kms_user'); router.push('/'); }} 
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('DASHBOARD')} className={`btn ${activeTab === 'DASHBOARD' ? 'btn-primary' : ''}`} style={activeTab !== 'DASHBOARD' ? { background: 'transparent', color: 'var(--text-primary)' } : {}}>Dashboard</button>
        <button onClick={() => setActiveTab('TEACHERS')} className={`btn ${activeTab === 'TEACHERS' ? 'btn-primary' : ''}`} style={activeTab !== 'TEACHERS' ? { background: 'transparent', color: 'var(--text-primary)' } : {}}>Teachers ({teachers.length})</button>
        <button onClick={() => setActiveTab('STUDENTS')} className={`btn ${activeTab === 'STUDENTS' ? 'btn-primary' : ''}`} style={activeTab !== 'STUDENTS' ? { background: 'transparent', color: 'var(--text-primary)' } : {}}>Students ({students.length})</button>
      </div>

      {activeTab === 'DASHBOARD' && (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--kms-teal-light)' }}>Competition Goal</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Set whether the race ends on a specific date, or when a grade hits a points threshold.</p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Goal Type</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                  <option style={{ color: 'black' }} value="TIME">Time-based (Specific Date)</option>
                  <option style={{ color: 'black' }} value="POINTS">Points-based (Threshold)</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Value</label>
                <input type="text" placeholder="e.g. 2026-10-31 or 10000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>

              <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save Goal Settings</button>
            </form>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--star-red)' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Use this to reset the entire race and wipe all daily logs back to 0.</p>
            
            <button 
              onClick={handleWipeRaceData}
              className="btn" 
              style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.2)', color: '#ff6b6b', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              Wipe All Race Data
            </button>
          </div>
        </main>
      )}

      {activeTab === 'TEACHERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--kms-purple-light)' }}>Manage Teachers</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              {teachers.map(t => (
                <div key={t.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  
                  {editingTeacherId === t.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, marginRight: '1rem' }}>
                      <input 
                        type="text" 
                        value={editTeacherName} 
                        onChange={e => setEditTeacherName(e.target.value)} 
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          value={editTeacherRoom} 
                          onChange={e => setEditTeacherRoom(e.target.value)} 
                          placeholder="Room Number"
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', flexGrow: 1 }}
                        />
                        {t.role === 'CORE_TEACHER' && (
                          <select 
                            value={editTeacherGrade}
                            onChange={e => setEditTeacherGrade(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                          >
                            <option value="6" style={{ color: 'black' }}>6th Grade</option>
                            <option value="7" style={{ color: 'black' }}>7th Grade</option>
                            <option value="8" style={{ color: 'black' }}>8th Grade</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {t.name} <span style={{ color: 'var(--kms-teal-light)', fontSize: '0.9rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>({t.role.replace('_', ' ')})</span>
                      </div>
                      <div style={{ color: 'var(--star-yellow)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Room {t.roomNumber} | PIN: {t.pin} {t.role === 'CORE_TEACHER' && t.gradeLevel ? `| Grade ${t.gradeLevel}` : ''}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {editingTeacherId === t.id ? (
                      <>
                        <button onClick={() => handleSaveTeacherEdit(t.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                        <button onClick={() => setEditingTeacherId(null)} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button onClick={() => handleEditTeacher(t)} className="btn" style={{ padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>Edit</button>
                          <button onClick={() => handleDeleteTeacher(t.id)} className="btn" style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', fontSize: '0.8rem' }}>Delete</button>
                          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Change Role:</span>
                          <select 
                            value={t.role}
                            onChange={(e) => handleUpdateRole(t.id, e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                          >
                            <option value="CORE_TEACHER">Core Teacher</option>
                            <option value="ENCORE_TEACHER">Encore Teacher</option>
                            <option value="ML_TEACHER">ML Teacher</option>
                            <option value="EC_TEACHER">EC Teacher</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--kms-purple-light)' }}>Add New Teacher</h3>
            <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Teacher Name</label>
                <input value={teacherName} onChange={e => setTeacherName(e.target.value)} type="text" placeholder="e.g. Ms. Smith" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Role</label>
                <select value={teacherRole} onChange={e => setTeacherRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                  <option style={{ color: 'black' }} value="CORE_TEACHER">Core Teacher</option>
                  <option style={{ color: 'black' }} value="ENCORE_TEACHER">Encore Teacher</option>
                  <option style={{ color: 'black' }} value="EC_TEACHER">EC Teacher</option>
                  <option style={{ color: 'black' }} value="ADMIN">Admin</option>
                </select>
              </div>
              
              {teacherRole === 'CORE_TEACHER' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grade Level (Core Only)</label>
                  <select value={teacherGrade} onChange={e => setTeacherGrade(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                    <option style={{ color: 'black' }} value="6">6th Grade</option>
                    <option style={{ color: 'black' }} value="7">7th Grade</option>
                    <option style={{ color: 'black' }} value="8">8th Grade</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Room Number</label>
                <input value={teacherRoom} onChange={e => setTeacherRoom(e.target.value)} type="text" placeholder="e.g. 218 (PIN becomes 0218)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>Create Teacher</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--kms-teal-light)', margin: 0 }}>All Students</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[6, 7, 8].map(g => {
                  const count = students.filter(s => s.gradeLevel === g).length;
                  return (
                    <button 
                      key={g}
                      onClick={() => setAdminStudentGradeTab(g)}
                      className="btn"
                      style={{ 
                        padding: '0.25rem 1rem', 
                        background: adminStudentGradeTab === g ? 'var(--kms-purple)' : 'var(--bg-secondary)', 
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {g}th Grade ({count})
                    </button>
                  );
                })}
              </div>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '250px' }}
              />
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {(() => {
                const gradeStudents = students.filter(s => 
                  s.gradeLevel === adminStudentGradeTab && 
                  `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase())
                );
                
                if (gradeStudents.length === 0) {
                  return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No students found in {adminStudentGradeTab}th grade.</div>;
                }

                return (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      {gradeStudents.map(s => (
                        <div key={s.id} style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.lastName}, {s.firstName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--kms-teal-light)' }}>Add New Student</h3>
            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>First Name</label>
                <input value={studentFirst} onChange={e => setStudentFirst(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Last Name</label>
                <input value={studentLast} onChange={e => setStudentLast(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Grade</label>
                <select value={studentGrade} onChange={e => setStudentGrade(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                  <option style={{ color: 'black' }} value="6">6th Grade</option>
                  <option style={{ color: 'black' }} value="7">7th Grade</option>
                  <option style={{ color: 'black' }} value="8">8th Grade</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Student</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
