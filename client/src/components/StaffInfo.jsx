import { useParams } from 'react-router-dom';
import staffData from '../data/staff';
import styles from './StaffInfo.module.css';
import BackButton from './BackButton';

function StaffInfo() {
  const { id } = useParams();
  const staffId = parseInt(id);
  const staff = staffData.find((s) => s.id === staffId);

  if (!staff) {
    return <h2 className={styles.notFound}>Staff member not found.</h2>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.initials}>{staff.name.charAt(0)}</div>
          <div>
            <h2>{staff.name}</h2>
            <p className={styles.position}>{staff.position}</p>
          </div>
        </div>
        <div className={styles.details}>
          <p><strong>Email:</strong> {staff.email}</p>
          <p><strong>Phone:</strong> {staff.phone}</p>
          <p><strong>Department:</strong> {staff.department}</p>
          <p><strong>Joined:</strong> {staff.joined}</p>
        </div>
         <BackButton />
      </div>
     
    </div>
  );
}

export default StaffInfo;
