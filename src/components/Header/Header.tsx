import { Container } from "../Container/Container";
import { Button } from "../Button/Button";
import styles from "./Header.module.css";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

// Nav links and the Sign In / Register buttons are placeholders — no routing or auth per
// the challenge scope (README explicitly says auth isn't required). preventDefault keeps
// the "#" href from changing the URL when clicked.
export function Header({ search, onSearchChange }: Props) {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <div className={styles.wordmark}>
          THE BLOCK <span className={styles.chip}>BUYER</span>
        </div>
        <nav className={styles.nav}>
          <a href="#" onClick={(event) => event.preventDefault()}>
            Inventory
          </a>
          <a href="#" onClick={(event) => event.preventDefault()}>
            Watchlist
          </a>
          <a href="#" onClick={(event) => event.preventDefault()}>
            How Bidding Works
          </a>
        </nav>
        <div className={styles.search}>
          <span aria-hidden="true">🔍</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search make, model, VIN, lot #"
            aria-label="Search inventory"
          />
        </div>
        <div className={styles.actions}>
          <Button variant="cta">Sign In</Button>
          <Button variant="primary">Register to Bid</Button>
        </div>
      </Container>
    </header>
  );
}
