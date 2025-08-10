import styles from './ContactUs.module.css';

function ContactUs() {
  
  return (
    <div className={styles.contactContainer}>
      <div className={styles.section}>
        <h1>Contact Us</h1>
        <form>
          <p>Name</p>
          <input type="text" name="name" />

          <p>Address</p>
          <input type="text" name="address" />

          <p>Email</p>
          <input type="email" name="email" />

          <p>Contact Number</p>
          <input type="text" name="number" />

          <p>Query</p>
          <textarea name="message" rows="4" />

          <button type="submit">Submit</button>
        </form>
      </div>

      <div className={`${styles.section} ${styles.contactInfo}`}>
        <h2>Contact Information</h2>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>Email:</strong> info@punjabschoolofexcellence.in</p>
        <p><strong>Website:</strong> www.punjabschoolofexcellence.in</p>
        <p><strong>Address:</strong> 456 Excellence Avenue, Model Town, Ludhiana, Punjab 141002</p>
      </div>
    </div>
  );
}

export default ContactUs;
