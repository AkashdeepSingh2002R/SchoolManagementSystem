import styles from "./AdminSidebar.module.css";
import { Link } from "react-router-dom";

function AdminSidebar() {
  const tabs = ["home","students", "staff", "classes", "announcement", "calender",];

  return (
    <div className={styles.sidebar}>
      {tabs.map((tab) => (
        <Link
          key={tab}
          to={`/admin/${tab}`}
          className={
            styles.active
          }
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Link>
      ))}
    </div>
  );
}

export default AdminSidebar;
