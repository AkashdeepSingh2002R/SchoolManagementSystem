import AdminSidebar from "./AdminSidebar";
import styles from "./AdminDashboard.module.css";
import { Outlet } from "react-router-dom";

function AdminDashboard() {
  
  return (
   <div className={styles.dashboardContainer}>
      <AdminSidebar />

      <div className={styles.content}>
       <Outlet />
      </div>
    </div>
  

 );}

export default AdminDashboard;
