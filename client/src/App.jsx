import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/auth.jsx';
import AppLayout from './pages/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CalendarPage from './pages/Calendar.jsx';
import Announcements from './pages/Announcements.jsx';
import MeetingRoom from './pages/MeetingRoom.jsx';
import Newsletter from './pages/Newsletter.jsx';
import Messages from './pages/Messages.jsx';
import Login from './pages/Login.jsx';
import PublicHome from './pages/PublicHome.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Academics from './pages/Academics.jsx';
import Admissions from './pages/Admissions.jsx';
import News from './pages/News.jsx';
import Events from './pages/Events.jsx';

function PrivateRoute({ children }){
  const { user } = useAuth();
  if(!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App(){
  return (
    <Routes>
      <Route index element={<PublicHome/>} />
      <Route path="/" element={<PublicHome/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/about" element={<About/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/academics" element={<Academics/>} />
      <Route path="/admissions" element={<Admissions/>} />
      <Route path="/news" element={<News/>} />
      <Route path="/events" element={<Events/>} />
      <Route path="/app" element={<PrivateRoute><AppLayout/></PrivateRoute>}>
        <Route index element={<Dashboard/>} />
        <Route path="calendar" element={<CalendarPage/>} />
        <Route path="announcements" element={<Announcements/>} />
        <Route path="meetings" element={<MeetingRoom/>} />
        <Route path="newsletter" element={<Newsletter/>} />
        <Route path="messages" element={<Messages/>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
