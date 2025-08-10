import { useParams } from 'react-router-dom';
import classes from '../data/classes';
import styles from './ClassInfo.module.css';

function ClassInfo() {
  const { id } = useParams();
  const classItem = classes.find((cls) => String(cls.id) === id);

  if (!classItem) return <p className={styles.notFound}>Class not found</p>;

  return (
    <div className={styles.classInfo}>
      <h1>{classItem.className}</h1>
      <div className={styles.detailBox}>
        <p><strong>Class Teacher:</strong> {classItem.classTeacher}</p>
        <p><strong>Total Students:</strong> {classItem.totalStudents}</p>
        <p><strong>Room No:</strong> {classItem.roomNo}</p>
        <p><strong>Subjects:</strong> {classItem.subjects.join(', ')}</p>
        <p><strong>Timings:</strong> {classItem.timings}</p>
      </div>
    </div>
  );
}

export default ClassInfo;
