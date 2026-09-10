import type { ButtonHTMLAttributes } from "react";
import { useMemo } from "react";
import styles from "./Chip.module.css";

export type ChipFigmaType = "Chip" | "Tab" | "Dropdown" | "Action";
export type ChipFigmaState = "Default" | "Hovered" | "Disabled" | "Pressed";

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  chipType?: ChipFigmaType;
  /** Figma state; drives static look (Playground) or use `undefined` + CSS `:hover` in product. */
  presentation?: ChipFigmaState;
  isSelected?: boolean;
  hasResetIcon?: boolean;
  hasLeftAccessory?: boolean;
  hasRightAccessory?: boolean;
  /** Dropdown chevron direction when `chipType="Dropdown"`. */
  isDropdownOpen?: boolean;
  nativeType?: "button" | "submit" | "reset";
  /** Fires when the reset (cross) control is activated; does not fire the main `onClick`. */
  onReset?: () => void;
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden width={12} height={12}>
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden width={12} height={12}>
      <path d="M3 7.5 6 4.5 9 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 10 10" aria-hidden width={10} height={10}>
      <path d="M2 2 8 8M8 2 2 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const typeClass: Record<ChipFigmaType, string> = {
  Chip: styles.typeChip,
  Tab: styles.typeTab,
  Dropdown: styles.typeDropdown,
  Action: styles.typeAction,
};

export function Chip({
  chipType = "Chip",
  presentation = "Default",
  isSelected = false,
  hasResetIcon = false,
  hasLeftAccessory = false,
  hasRightAccessory = false,
  isDropdownOpen = false,
  nativeType = "button",
  className,
  children = "Text S",
  disabled,
  onReset,
  ...rest
}: ChipProps) {
  const locked = presentation === "Default" ? undefined : presentation;
  const isDisabled = Boolean(disabled) || presentation === "Disabled";
  const showReset = hasResetIcon && isSelected && (chipType === "Dropdown" || chipType === "Action");

  const rootClass = useMemo(() => {
    const parts = [
      styles.root,
      typeClass[chipType],
      isSelected ? styles.selected : "",
      isDisabled ? styles.disabled : "",
    ];
    if (className) parts.push(className);
    return parts.filter(Boolean).join(" ");
  }, [chipType, className, isDisabled, isSelected]);

  return (
    <button
      type={nativeType}
      className={rootClass}
      disabled={isDisabled}
      data-locked={locked}
      data-open={chipType === "Dropdown" && isDropdownOpen ? "true" : undefined}
      data-clickable={rest.onClick ? "true" : undefined}
      {...rest}
    >
      {hasLeftAccessory && (
        <span className={styles.left} aria-hidden>
          <span className={styles.avatar} />
        </span>
      )}
      {chipType === "Dropdown" && !isSelected && (
        <span className={styles.row}>
          <span>{children}</span>
          {isDropdownOpen || presentation === "Pressed" ? (
            <ChevronUp className={styles.iconSm} />
          ) : (
            <ChevronDown className={styles.iconSm} />
          )}
        </span>
      )}
      {!(chipType === "Dropdown" && !isSelected) && <span>{children}</span>}
      {showReset && (
        <span
          className={styles.reset}
          role="presentation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReset?.();
          }}
        >
          <Cross className={styles.resetIcon} />
        </span>
      )}
      {chipType === "Tab" && hasRightAccessory && !isSelected && (
        <span className={styles.right} aria-hidden>
          <span className={styles.counter}>0</span>
        </span>
      )}
    </button>
  );
}
