 import classes from "../data/classes"
 import styles from "./AdminDashboard.module.css"
 import { Link } from "react-router-dom"
 function ClassData(){
    return(
        <>
            <h2>Classes</h2>
            {classes.map((cls) => (
              <div key={cls.id} className={styles.card}>
<Link to={`/class/${cls.id}`}>{cls.className}</Link>
                <p>Class Teacher: {cls.classTeacher}</p>
                <p>Total Students: {cls.totalStudents}</p>
                <p>Subjects: {cls.subjects.join(", ")}</p>
              </div>
            ))}
          </>
    )}
    export default ClassData;