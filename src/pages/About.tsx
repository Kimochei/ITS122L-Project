import styles from '../pagestyles/AboutPage.module.css';
import aboutUsImage from '../assets/aboutUs.png'; // Assuming aboutUs.png is in src/assets

const About = () => {
  return (
    <div className={styles.aboutPageContainer}>
      <div className={styles.aboutContent}>
        <img src={aboutUsImage} alt="About Us" className={styles.aboutImage} />
      </div>
    </div>
  );
};

export default About;