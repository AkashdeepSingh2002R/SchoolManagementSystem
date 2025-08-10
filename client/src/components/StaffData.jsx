 import staff from "../data/staff"
 import styles from "./AdminDashboard.module.css"
 import { Link } from "react-router-dom"
 function StaffData(){
    return(
       <>
            <h2>Staff</h2>
            {staff.map((staff) => (
              <div key={staff.id} className={styles.card}>
               <Link to={`/staff/${staff.id}?id={staff.id}`}><h3>{staff.name}</h3></Link> 
                <p>Position: {staff.position}</p>
                <p>Department: {staff.department}</p>
              </div>
            ))}
          </>
    )}
    export default StaffData;