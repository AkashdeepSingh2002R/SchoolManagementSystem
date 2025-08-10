import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logoContainer}>
        <img src="/images/logo.png" alt="School Logo" className={styles.logoImage} />
      </div>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <ul className={`${styles.navMenu} ${menuOpen ? styles.open : ''}`}>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/about" className={styles.navLink}>About Us</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/contact" className={styles.navLink}>Contact Us</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/login" className={styles.navLink}>Login</Link>
        </li>
      </ul>
    </div>
  );
}

export default NavBar;
