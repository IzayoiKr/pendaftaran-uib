import styles from "./ProgressBar.module.scss";

type StepItem = {
  label: string;
  sub: string;
};

type Props = {
  currentStep: number;
  steps: StepItem[];
  goToStep: (n: number) => void;
};

export default function ProgressBar({
  currentStep,
  steps,
  goToStep,
}: Props) {
  const totalSteps = steps.length;

  // 🔥 PROGRESS LOGIC (AKURAT UNTUK SEMUA JUMLAH STEP)
  const progressPercent =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  // 🔥 FIX OFFSET COMPENSATION
  const adjustedProgress = `calc(${progressPercent}% * (1 - (2 / ${totalSteps})))`;

  return (
    <div
      className={styles.wrapper}
      style={
        {
          "--step-count": totalSteps,
          "--progress": adjustedProgress,
        } as React.CSSProperties
      }
    >
      {/* STEPS */}
      <div className={styles.steps}>
        {/* BACKGROUND LINE (FULL GRAY) */}
        <div className={styles.lineBackground} />

        {/* PROGRESS LINE (GREEN) */}
        <div className={styles.lineProgress} />

        {/* STEP ITEMS */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div
              key={index}
              className={`${styles.stepWrapper} ${
                isFuture ? styles.disabled : ""
              }`}
              onClick={() => !isFuture && goToStep(stepNumber)}
            >
              {/* CIRCLE */}
              <div
                className={`
                  ${styles.circle}
                  ${isActive ? styles.active : ""}
                  ${isDone ? styles.done : ""}
                `}
              >
                {isDone ? (
                  <span className={styles.checkmark}>✓</span>
                ) : (
                  stepNumber
                )}
              </div>

              {/* LABEL */}
              <div className={styles.label}>
                <div className={styles.main}>{step.label}</div>
                <div className={styles.sub}>({step.sub})</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
