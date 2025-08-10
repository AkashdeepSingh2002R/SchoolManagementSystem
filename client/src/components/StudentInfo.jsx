import { useParams } from 'react-router-dom';
import students from '../data/students';
import styles from './StudentInfo.module.css';
import BackButton from './BackButton';

function StudentInfo() {
  const { id } = useParams();
  const student = students.find((s) => String(s.id) === id);

  if (!student) return <p className={styles.notFound}>Student not found</p>;

  return (
    <div className={styles.studentInfo}>
      <h1>{student.name}</h1>
      <div className={styles.detailBox}>
        <p><strong>Roll No:</strong> {student.rollNo}</p>
        <p><strong>Class:</strong> {student.class}</p>
        <p><strong>Date of Birth:</strong> {student.dob}</p>
        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Phone:</strong> {student.phone}</p>
        <p><strong>Address:</strong> {student.address}</p>
        <BackButton />
      </div>
    </div>
  );
}

export default StudentInfo;
