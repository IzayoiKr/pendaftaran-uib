import styles from "./AnimatedIcons.module.scss";

/*
 Original SVG animation concept by iAmEcko via CodePen.
 Source: https://codepen.io/iAmEcko/pen/oQQXzr
 Licensed under MIT (c) CodePen community authors.
*/
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
    );
}

/*
 Original SVG animation concept by iAmEcko via CodePen.
 Source: https://codepen.io/iAmEcko/pen/oQQXzr
 Licensed under MIT (c) CodePen community authors.
*/
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
    );
}

/*
    Preloader Animation provided by SVGBackgrounds.com
    Source: https://www.svgbackgrounds.com/elements/animated-svg-preloaders/
    License: Free with Attribution
*/
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

/*
    Preloader Animation provided by SVGBackgrounds.com
    Source: https://www.svgbackgrounds.com/elements/animated-svg-preloaders/
    License: Free with Attribution
*/
export function TubeSpinnerIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className={styles.tubeSpinner}
        >
            <defs>
                <radialGradient
                    id="a3"
                    cx=".66"
                    fx=".66"
                    cy=".3125"
                    fy=".3125"
                    gradientTransform="scale(1.5)"
                >
                    <stop offset="0" stopColor="#002347" />
                    <stop offset=".3" stopColor="#002347" stopOpacity=".9" />
                    <stop offset=".6" stopColor="#002347" stopOpacity=".6" />
                    <stop offset=".8" stopColor="#002347" stopOpacity=".3" />
                    <stop offset="1" stopColor="#002347" stopOpacity="0" />
                </radialGradient>
            </defs>

            <circle
                style={{ transformOrigin: "center" }}
                fill="none"
                opacity=".2"
                stroke="#002347"
                strokeWidth="15"
                strokeLinecap="round"
                cx="100"
                cy="100"
                r="70"
            />

            <circle
                style={{ transformOrigin: "center" }}
                fill="none"
                stroke="url(#a3)"
                strokeWidth="15"
                strokeLinecap="round"
                strokeDasharray="200 1000"
                strokeDashoffset="0"
                cx="100"
                cy="100"
                r="70"
            >
                <animateTransform
                    type="rotate"
                    attributeName="transform"
                    calcMode="spline"
                    dur="1.1"
                    values="360;0"
                    keyTimes="0;1"
                    keySplines="0 0 1 1"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    );
}
