import { Container } from "../Container/Container";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <span>© 2026 The Block. A buyer marketplace concept for the OPENLANE challenge.</span>
        <div className={styles.links}>
          <a href="#" onClick={(event) => event.preventDefault()}>
            About
          </a>
          <a href="#" onClick={(event) => event.preventDefault()}>
            Support
          </a>
          <a href="#" onClick={(event) => event.preventDefault()}>
            Terms
          </a>
          <a href="#" onClick={(event) => event.preventDefault()}>
            Privacy
          </a>
        </div>
      </Container>
    </footer>
  );
}
