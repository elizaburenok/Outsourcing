import styles from "./CellRightAccessory.module.css";

export type CellRightAccessoryKind =
  | "AvatarM"
  | "AvatarS"
  | "Icon30"
  | "Icon24"
  | "Icon18"
  | "Spinner34AvatarS"
  | "Spinner24"
  | "Checkbox"
  | "Radio"
  | "Switcher"
  | "Disclosure"
  | "TextLDisclosure"
  | "TextSDisclosure"
  | "CounterDisclosure"
  | "Counter"
  | "NotificationIndicator"
  | "TextL"
  | "TextM"
  | "TextS"
  | "TextMTextXs"
  | "TableTextMTextM"
  | "TableTextSTextS"
  | "Icon24Icon24"
  | "TextMIcon30"
  | "TextMIcon24"
  | "TextMIcon18"
  | "Stepper";

export type CellRightAccessoryProps = {
  kind: CellRightAccessoryKind;
  className?: string;
  /** Checkbox / switcher / radio */
  checked?: boolean;
  /** Counter / stepper value */
  value?: number;
  disabled?: boolean;
  ariaLabel?: string;
  onCheckedChange?: (next: boolean) => void;
  onStep?: (delta: number) => void;
};

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden width={18} height={18}>
      <path
        d="M6.75 4.5 11.25 9l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleIcon({ sizeClass }: { sizeClass: string }) {
  return <span className={sizeClass} aria-hidden />;
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width={24} height={24}>
      <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width={24} height={24}>
      <path
        d="M12 6v12M6 12h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden width={12} height={12}>
      <path
        d="M2 6l3 3 5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CellRightAccessory({
  kind,
  className,
  checked = false,
  value = 0,
  disabled = false,
  ariaLabel,
  onCheckedChange,
  onStep,
}: CellRightAccessoryProps) {
  const root = [styles.root, className].filter(Boolean).join(" ");

  switch (kind) {
    case "Disclosure":
      return (
        <div className={root}>
          <ChevronRight className={styles.disclosure} />
        </div>
      );
    case "Checkbox":
      return (
        <div className={root}>
          <button
            type="button"
            className={checked ? styles.checkboxChecked : styles.checkbox}
            role="checkbox"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onCheckedChange?.(!checked)}
          >
            {checked ? <CheckIcon className={styles.disclosure} /> : null}
          </button>
        </div>
      );
    case "Radio":
      return (
        <div className={root}>
          <button
            type="button"
            className={styles.radio}
            role="radio"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onCheckedChange?.(!checked)}
          >
            {checked ? <span className={styles.radioDot} /> : null}
          </button>
        </div>
      );
    case "Switcher":
      return (
        <div className={root}>
          <button
            type="button"
            className={checked ? styles.switchTrack : styles.switchTrackOff}
            aria-pressed={checked}
            onClick={() => onCheckedChange?.(!checked)}
          >
            <span className={checked ? styles.switchKnob : styles.switchKnobOff} />
          </button>
        </div>
      );
    case "Icon30":
      return (
        <div className={root}>
          <CircleIcon sizeClass={styles.icon30} />
        </div>
      );
    case "Icon24":
      return (
        <div className={root}>
          <CircleIcon sizeClass={styles.icon24} />
        </div>
      );
    case "Icon18":
      return (
        <div className={root}>
          <CircleIcon sizeClass={styles.icon18} />
        </div>
      );
    case "Spinner24":
      return (
        <div className={root}>
          <span className={styles.spinner24} aria-hidden />
        </div>
      );
    case "Spinner34AvatarS":
      return (
        <div className={root}>
          <span className={styles.spinner34} aria-hidden />
        </div>
      );
    case "AvatarM":
      return (
        <div className={root}>
          <div className={styles.avatarM}>
            <div className={styles.avatarMInner}>L</div>
          </div>
        </div>
      );
    case "AvatarS":
      return (
        <div className={root}>
          <div className={styles.avatarS}>
            <div className={styles.avatarSInner}>S</div>
          </div>
        </div>
      );
    case "TextL":
      return (
        <div className={root}>
          <span className={styles.textL}>Text L</span>
        </div>
      );
    case "TextM":
      return (
        <div className={root}>
          <span className={styles.textM}>Text M</span>
        </div>
      );
    case "TextS":
      return (
        <div className={root}>
          <span className={styles.textS}>Text S</span>
        </div>
      );
    case "TextMTextXs":
      return (
        <div className={root}>
          <div className={styles.tableStack}>
            <span className={styles.textM}>Text M</span>
            <span className={styles.textXs}>Text XS</span>
          </div>
        </div>
      );
    case "TableTextMTextM":
      return (
        <div className={root}>
          <div className={styles.tableStack}>
            <span className={styles.tableMuted}>Text M</span>
            <span className={styles.tableStrong}>Text M</span>
          </div>
        </div>
      );
    case "TableTextSTextS":
      return (
        <div className={root}>
          <div className={styles.tableStack}>
            <span className={styles.tableMuted}>Text S</span>
            <span className={styles.textS}>Text S</span>
          </div>
        </div>
      );
    case "TextLDisclosure":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.textL}>Text L</span>
            <ChevronRight className={styles.disclosure} />
          </div>
        </div>
      );
    case "TextSDisclosure":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.textS}>Text S</span>
            <ChevronRight className={styles.disclosure} />
          </div>
        </div>
      );
    case "CounterDisclosure":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.counter}>{String(value).padStart(2, "0")}</span>
            <ChevronRight className={styles.disclosure} />
          </div>
        </div>
      );
    case "Counter":
      return (
        <div className={root}>
          <span className={styles.counter}>{String(value).padStart(2, "0")}</span>
        </div>
      );
    case "NotificationIndicator":
      return (
        <div className={root}>
          <div className={styles.notify}>
            <span className={styles.notifyDot} />
          </div>
        </div>
      );
    case "Icon24Icon24":
      return (
        <div className={root}>
          <div className={styles.row}>
            <CircleIcon sizeClass={styles.icon24} />
            <CircleIcon sizeClass={styles.icon24} />
          </div>
        </div>
      );
    case "TextMIcon30":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.textM}>Text M</span>
            <CircleIcon sizeClass={styles.icon30} />
          </div>
        </div>
      );
    case "TextMIcon24":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.textM}>Text M</span>
            <CircleIcon sizeClass={styles.icon24} />
          </div>
        </div>
      );
    case "TextMIcon18":
      return (
        <div className={root}>
          <div className={styles.row}>
            <span className={styles.textM}>Text M</span>
            <CircleIcon sizeClass={styles.icon18} />
          </div>
        </div>
      );
    case "Stepper": {
      const v = value;
      const decClass = disabled ? styles.stepperBtnDisabled : styles.stepperBtn;
      const incClass = disabled ? styles.stepperBtnDisabled : styles.stepperBtn;
      return (
        <div className={root}>
          <div className={styles.stepper}>
            <button
              type="button"
              className={decClass}
              disabled={disabled}
              aria-label="Decrease"
              onClick={() => onStep?.(-1)}
            >
              <MinusIcon className={styles.stepperIcon} />
            </button>
            <span className={styles.stepperValue}>{String(v).padStart(2, "0")}</span>
            <button
              type="button"
              className={incClass}
              disabled={disabled}
              aria-label="Increase"
              onClick={() => onStep?.(1)}
            >
              <PlusIcon className={styles.stepperIcon} />
            </button>
          </div>
        </div>
      );
    }
  }
}
