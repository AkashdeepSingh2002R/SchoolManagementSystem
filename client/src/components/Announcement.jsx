import { useAdminTab } from "./AdminTabProvider"
import styles from "./AdminDashboard.module.css"
function Announcement(){
    const {newsData,handleSubmit,handleAnnouncement} = useAdminTab();
    return(
        <>
            <h2>Announcements</h2>
            <form className={styles.announcementForm} onSubmit={handleSubmit}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Title"
                onChange={handleAnnouncement}
              />
              <label htmlFor="description">description</label>
              <textarea
                name="description"
                placeholder="description"
                onChange={handleAnnouncement}
              />
              <select name="author" onChange={handleAnnouncement}>
  <option value="admin">Admin</option>
  <option value="principal">Principal</option>
  <option value="ParliamentMember">Parliament Member</option>
</select>
              <button type="submit">Submit</button>
            </form>

            {newsData.map((item) => (
              <div key={item.id} className={styles.card}>
                <h3>{item.title}</h3>
                <p>Date: {item.date}</p>
                <p>{item.description}</p>
              </div>
            ))}
          </>
    )
}
export default Announcement;