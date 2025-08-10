import styles from './About.module.css';
import staffData from '../data/staff';
import { Link } from 'react-router-dom';
function About() {
  const staff =  staffData.filter(staff=>staff.position === "Principal" || staff.position === "VicePrincipal" || staff.position === "AcademicCoordinator" || staff.position ==="Owner")
console.log(staff)
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.section}>
        <h1>About Us</h1>
        <p>
          Punjab School of Excellence is a premier co-educational institution dedicated to nurturing young minds through academic excellence, moral values, and holistic development. Established in 1998 in the heart of Ludhiana, our school has grown into a trusted name in education, offering a modern and inclusive learning environment for students from Kindergarten to Grade 12.
        </p>
        <p>
          At PSE, we believe that every child is unique and deserves a platform to discover their full potential. Our campus features smart classrooms, well-equipped science and computer labs, a vibrant library, and expansive sports facilities. Led by a team of dedicated educators, we strive to create a learning experience that balances knowledge with creativity, discipline with empathy, and tradition with innovation.
        </p>
        <p>
          With a strong foundation in the CBSE curriculum and a focus on life skills, we prepare students not just for exams, but for life. Join us in our mission to shape tomorrow’s leaders with values, vision, and excellence.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Key Staff</h2>
        <ul>
        {staff.map(staff=><li key={staff.id} ><strong>{staff.position}: </strong><Link to={`/staff/${staff.id}?id={staff.id}`}>{staff.name}</Link>
</li>)}
        </ul>
      </div>

      <div className={styles.section}>
        <h2>Curriculum</h2>
        <p>CBSE-affiliated (Grades KG to 12)</p>
        <p>Focus on English, Science, Math, Social Science, Punjabi, and Computer Science</p>
        <p>Co-curriculars: Music, Dance, Art, Robotics, and Yoga</p>
      </div>

      <div className={styles.section}>
        <h2>Facilities</h2>
        <p>Smart Classrooms</p>
        <p>Science & Computer Labs</p>
        <p>Digital Library</p>
        <p>Sports Ground (Cricket, Football, Badminton)</p>
        <p>CCTV Surveillance & RFID Attendance</p>
        <p>Cafeteria and First-Aid Room</p>
      </div>
    </div>
  );
}

export default About;
