import { useState } from 'react';
import styles from './AdminSearch.module.css';
import classes from '../data/classes';
import staff from "../data/staff";
import students from '../data/students';

function AdminSearch() {
  const [search, setSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [classResults, setClassResults] = useState([]);
  const [staffResults, setStaffResults] = useState([]);

  function handleSearch() {
    const query = search.toLowerCase().trim();

    const matchedStudents = students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.rollNo.toLowerCase().includes(query) ||
        s.class.toLowerCase().includes(query)
    );

    const matchedClasses = classes.filter(
      (c) =>
        c.className.toLowerCase().includes(query) ||
        c.classTeacher.toLowerCase().includes(query)
    );

    const matchedStaff = staff.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.position.toLowerCase().includes(query) ||
        t.department.toLowerCase().includes(query)
    );

    setStudentResults(matchedStudents);
    setClassResults(matchedClasses);
    setStaffResults(matchedStaff);
  }

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <input
          type="text"
          name="search"
          placeholder="Search students, classes, or teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className={styles.results}>
        <h2>Results:</h2>

        <h3>Students</h3>
        <ul>
          {studentResults.map((student, index) => (
            <li key={`s-${index}`}>
              <h4>{student.name}</h4>
              <p>Roll No: {student.rollNo}</p>
              <p>Class: {student.class}</p>
            </li>
          ))}
        </ul>

        <h3>Classes</h3>
        <ul>
          {classResults.map((cls, index) => (
            <li key={`c-${index}`}>
              <h4>{cls.className}</h4>
              <p>Class Teacher: {cls.classTeacher}</p>
              <p>Total Students: {cls.totalStudents}</p>
            </li>
          ))}
        </ul>

        <h3>Teachers</h3>
        <ul>
          {staffResults.map((teacher, index) => (
            <li key={`t-${index}`}>
              <h4>{teacher.name}</h4>
              <p>Position: {teacher.position}</p>
              <p>Department: {teacher.department}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminSearch;
