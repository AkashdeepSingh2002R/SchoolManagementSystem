import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSelection } from '../context/selection.jsx';
import ClassPanel from './panels/ClassPanel.jsx';
import StudentPanel from './panels/StudentPanel.jsx';
import TeacherPanel from './panels/TeacherPanel.jsx';

export default function Dashboard(){
  const [stats, setStats] = useState(null);
  const { selectedClassId, selectedStudentId, selectedTeacherId,
          setSelectedClassId, setSelectedStudentId, setSelectedTeacherId } = useSelection();

  useEffect(()=>{
    let ok = true;
    api.get('/stats').then(({data})=>{ if(ok) setStats(data); }).catch(()=>setStats(null));
    return ()=>{ ok = false; };
  },[]);

  const resetDashboard = ()=>{
    setSelectedClassId(''); setSelectedStudentId(''); setSelectedTeacherId('');
  };

  const hasSelection = !!(selectedClassId || selectedStudentId || selectedTeacherId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold">Welcome, Admin</div>
        {hasSelection && (
          <button onClick={resetDashboard} className="ml-auto px-3 py-1 rounded border text-sm dark:border-gray-800">
            ← Back to Dashboard
          </button>
        )}
      </div>

      {selectedClassId && <ClassPanel classId={selectedClassId} />}
      {!selectedClassId && selectedStudentId && <StudentPanel studentId={selectedStudentId} />}
      {!selectedClassId && !selectedStudentId && selectedTeacherId && <TeacherPanel teacherId={selectedTeacherId} />}

      {!hasSelection && (
        <div className="grid md:grid-cols-3 gap-3">
          <Card title="Total Students" value={stats?.students ?? '—'} />
          <Card title="Total Teachers" value={stats?.teachers ?? '—'} />
          <Card title="Classes" value={stats?.classes ?? '—'} />
          <Tile title="Recent Activity"><Empty /></Tile>
          <Tile title="Upcoming"><Empty /></Tile>
          <Tile title="Messages"><Empty /></Tile>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }){
  return <div className="rounded-2xl border dark:border-gray-900 p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>;
}
function Tile({ title, children }){
  return <div className="rounded-2xl border dark:border-gray-900 p-4">
    <div className="text-sm text-gray-500 mb-2">{title}</div>
    {children}
  </div>;
}
function Empty(){ return <div className="text-gray-500">Nothing yet.</div>; }
