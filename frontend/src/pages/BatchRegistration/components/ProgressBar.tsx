import type { StepItem } from "@/validation/schemaform";

type Props = {
  currentStep: number;
  steps: StepItem[];
  goToStep: (n: number) => void;
  isSubmitting?: boolean;
};

export default function ProgressBar({
  currentStep,
  steps,
  goToStep,
  isSubmitting = false,
}: Props) {
  const totalSteps = steps.length;

  const progressPercent =
    totalSteps > 1
      ? ((currentStep - 1) /
          (totalSteps - 1)) *
        100
      : 0;

  const adjustedProgress = `calc(${progressPercent}% * (1 - (2 / ${totalSteps})))`;

  return (
    <div
      className="pb-wrapper"
      style={
        {
          "--step-count": totalSteps,
          "--progress":
            adjustedProgress,
        } as React.CSSProperties
      }
    >
      <div className="pb-steps">
        <div className="pb-line-background" />
        <div className="pb-line-progress" />

        {steps.map((step, index) => {
          const stepNumber =
            index + 1;

          const isActive =
            stepNumber === currentStep;

          const isDone =
            stepNumber < currentStep;

          const isFuture =
            stepNumber > currentStep;

          const isDisabled =
            isFuture ||
            isSubmitting;

          return (
            <div
              key={step.key}
              className={[
                "pb-step-wrapper",
                isDisabled
                  ? "pb-disabled"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (isDisabled) return;

                goToStep(stepNumber);
              }}
              aria-disabled={
                isDisabled
              }
            >
              <div
                className={[
                  "pb-circle",
                  isActive
                    ? "pb-active"
                    : "",
                  isDone
                    ? "pb-done"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isDone ? (
                  <span className="pb-checkmark">
                    ✓
                  </span>
                ) : (
                  stepNumber
                )}
              </div>

              <div className="pb-label">
                <div className="pb-label-main">
                  {step.label}
                </div>

                <div className="pb-label-sub">
                  ({step.sub})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}