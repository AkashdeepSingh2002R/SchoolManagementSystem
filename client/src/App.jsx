import NavBar from './components/NavBar';
import Footer from './components/Footer';
import './App.css'
import Homepage from './components/Homepage';
import { BrowserRouter, Routes,Route, Navigate } from 'react-router-dom';
import About from './components/About';
import ContactUs from './components/ContactUs';
import Login from './components/Login';
import StaffInfo from './components/StaffInfo';
import AdminDashboard from './components/AdminDashboard';
import { AdminTabProvider } from './components/AdminTabProvider';
import StaffData from './components/StaffData';
import ClassData from './components/classData';
import Announcement from './components/announcement';
import Students from "./components/Students"
import StudentInfo from './components/StudentInfo';
import ClassInfo from './components/ClassInfo';
import AdminSearch from './components/AdminSearch';

function App() {

  return (
    <div className='appContainer'>
     
     <BrowserRouter>
     <NavBar/>
     <Routes>
      <Route path='/' element={<Homepage/>}></Route>
    < Route path='/about' element={<About />}></Route>
     < Route path='/contact' element={<ContactUs />}></Route>
     < Route path='/login' element={<Login />}></Route>
     <Route path="/staff/:id" element={<StaffInfo />} />
     <Route path="/student/:id" element={<StudentInfo />} />
     <Route path="/class/:id" element={<ClassInfo />} />

     <Route path="/admin" element={<AdminTabProvider><AdminDashboard /></AdminTabProvider>} >
                     <Route path='home' element={<AdminSearch/>} />
     
     <Route  path="students" element={<Students />} />
  <Route path="staff" element={<StaffData />} />
  <Route path="classes" element={<ClassData />} />
  <Route path="announcement" element={<Announcement />} />
  </Route>
{/* <Route path="/teacher" element={<TeacherDashboard />} />
<Route path="/student" element={<StudentDashboard />} /> */}

     </Routes>
     <Footer/>
  </BrowserRouter>
    </div>
  )
}

export default App
