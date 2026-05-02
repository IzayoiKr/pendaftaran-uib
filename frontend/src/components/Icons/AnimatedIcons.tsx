import styles from './AnimatedIcons.module.scss';

export function CheckmarkIcon() {
    return (
        <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 130.2 130.2"
            className={styles.checkmark}
        >
            <circle
                className={`${styles.path} ${styles.circle}`}
                fill="none"
                stroke="#73AF55"
                strokeWidth="6"
                strokeMiterlimit="10"
                cx="65.1"
                cy="65.1"
                r="62.1"
            />
            <polyline
                className={`${styles.path} ${styles.check}`}
                fill="none"
                stroke="#73AF55"
                strokeWidth="6"
                strokeLinecap="round"
                strokeMiterlimit="10"
                points="100.2,40.2 51.5,88.8 29.8,67.5 "
            />
        </svg>
    )
}

export function CrossmarkIcon() {
    return (
        <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 130.2 130.2"
            className={styles.cross}
        >
            <circle
                className={`${styles.path} ${styles.circle}`}
                fill="none"
                stroke="#D06079"
                strokeWidth="6"
                strokeMiterlimit="10"
                cx="65.1"
                cy="65.1"
                r="62.1"
            />
            <line
                className={`${styles.path} ${styles.line}`}
                fill="none"
                stroke="#D06079"
                strokeWidth="6"
                strokeLinecap="round"
                strokeMiterlimit="10"
                x1="34.4"
                y1="37.9"
                x2="95.8"
                y2="92.3"
            />
            <line
                className={`${styles.path} ${styles.line}`}
                fill="none"
                stroke="#D06079"
                strokeWidth="6"
                strokeLinecap="round"
                strokeMiterlimit="10"
                x1="95.8"
                y1="38"
                x2="34.4"
                y2="92.2"
            />
        </svg>
    )
}

export function BouncingBallsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className={styles.bouncingBalls}
        >
            <circle
                fill="#002347"
                stroke="#002347"
                strokeWidth="6"
                r="15"
                cx="40"
                cy="65"
            >
                <animate
                    attributeName="cy"
                    calcMode="spline"
                    dur="2"
                    values="65;135;65;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="-.4"
                />
            </circle>

            <circle
                fill="#002347"
                stroke="#002347"
                strokeWidth="6"
                r="15"
                cx="100"
                cy="65"
            >
                <animate
                    attributeName="cy"
                    calcMode="spline"
                    dur="2"
                    values="65;135;65;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="-.2"
                />
            </circle>

            <circle
                fill="#002347"
                stroke="#002347"
                strokeWidth="6"
                r="15"
                cx="160"
                cy="65"
            >
                <animate
                    attributeName="cy"
                    calcMode="spline"
                    dur="2"
                    values="65;135;65;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="0"
                />
            </circle>
        </svg>
    );
}
