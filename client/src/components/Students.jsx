 import students from "../data/students"
 import styles from "./AdminDashboard.module.css"
 import { Link } from "react-router-dom"
 function Students(){
    return(
        <>
        <h2>Students</h2>
            {students.map((student) => (
              <div key={student.id} className={styles.card}>
                <Link to={`/student/${student.id}`}>{student.name}</Link>
                <p>Roll No: {student.rollNo}</p>
                <p>Class: {student.class}</p>
              </div>
            ))}
            </>
    )}
    export default Students;