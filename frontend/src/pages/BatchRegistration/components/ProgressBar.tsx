import styles from "@/pages/BatchRegistration/styles/ProgressBar.module.scss";
import type { StepItem } from "@/validation/schemaform";

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

  const progressPercent =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

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
      <div className={styles.steps}>
        <div className={styles.lineBackground} />
        <div className={styles.lineProgress} />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div
              key={step.key} // ✅ FIXED
              className={`${styles.stepWrapper} ${
                isFuture ? styles.disabled : ""
              }`}
              onClick={() => !isFuture && goToStep(stepNumber)}
            >
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