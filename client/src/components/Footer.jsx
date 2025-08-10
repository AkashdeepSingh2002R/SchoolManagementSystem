import styles from "./Footer.module.css"
function Footer (){
    const date = new Date();
    const year =  date.getFullYear();
    return (
        <div className={styles.footer}>
            All @Copyrights are reserved {year}
        </div>
    )
}
export default Footer;