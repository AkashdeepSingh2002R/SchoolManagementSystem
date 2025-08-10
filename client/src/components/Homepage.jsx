import styles from './Homepage.module.css';
import { Link } from 'react-router-dom';
function Homepage() {
  return (
    <div className={styles.homepage}>
      <div className={styles.backgroundImage}></div>

      <div className={styles.content}>
        <h1 className={styles.homeTitle}>Punjab School of Excellence</h1>
        <h3 className={styles.subTitle}>Welcome to our school</h3>
        <p className={styles.description}>
          Punjab School of Excellence is a premier co-educational institution located in the heart of Ludhiana. Established in 1998, the school has been a beacon of quality education, fostering academic brilliance, creativity, and holistic development in students from Kindergarten to Grade 12.
        </p>
        <div className={styles.btnGroup}>
          <Link to="/about" className={styles.button}>About Us</Link>
          <Link to="/contact" className={styles.button}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
