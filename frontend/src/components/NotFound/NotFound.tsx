import { Link } from "react-router-dom";
import styles from "./NotFound.module.scss";

export default function NotFound() {
    return (
        <div className={styles.container}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Go Back to Home</Link>
        </div>
    )
}
