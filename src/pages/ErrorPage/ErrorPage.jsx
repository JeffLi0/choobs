import { Link } from "react-router-dom";

import styles from "./ErrorPage.module.css";

function ErrorPage() {
  return (
    <div className={styles.errorPage}>
      <h2>404 Page Not Found</h2>
      <Link to="/" className={styles.link}>
        <p>Return Home</p>
      </Link>
    </div>
  );
}

export default ErrorPage;
