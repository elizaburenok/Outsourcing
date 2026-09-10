import styles from "./CellLeftAccessory.module.css";

export type CellLeftAccessoryKind =
  | "Avatar"
  | "Icon30"
  | "Icon24"
  | "Icon18"
  | "CardPreview"
  | "AvatarCheckbox"
  | "AddButton";

export type CellLeftAccessoryProps = {
  kind: CellLeftAccessoryKind;
  className?: string;
  /** Shown inside Avatar placeholder (e.g. "LOGO"). */
  avatarLabel?: string;
};

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

export function CellLeftAccessory({ kind, className, avatarLabel = "LOGO" }: CellLeftAccessoryProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  switch (kind) {
    case "Avatar":
      return (
        <div className={rootClass}>
          <div className={styles.avatar}>
            <span className={styles.avatarLogo}>{avatarLabel}</span>
          </div>
        </div>
      );
    case "Icon30":
      return (
        <div className={rootClass}>
          <span className={styles.icon30} aria-hidden />
        </div>
      );
    case "Icon24":
      return (
        <div className={rootClass}>
          <span className={styles.icon24} aria-hidden />
        </div>
      );
    case "Icon18":
      return (
        <div className={rootClass}>
          <span className={styles.icon18} aria-hidden />
        </div>
      );
    case "CardPreview":
      return (
        <div className={rootClass}>
          <span className={styles.cardPreview} aria-hidden />
        </div>
      );
    case "AvatarCheckbox":
      return (
        <div className={rootClass}>
          <div className={styles.avatarCheckbox}>
            <span className={styles.checkboxInner} aria-hidden />
          </div>
        </div>
      );
    case "AddButton":
      return (
        <div className={rootClass}>
          <button type="button" className={styles.addButton} aria-label="Add">
            <PlusIcon className={styles.addIcon} />
          </button>
        </div>
      );
  }
}
