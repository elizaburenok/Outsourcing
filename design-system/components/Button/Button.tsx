import {
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useMemo,
} from "react";
import styles from "./Button.module.css";

export type ButtonVisualVariant = "Primary" | "Secondary" | "Transparent" | "White";

/** Static presentation for Playground matrices (Figma states). */
export type ButtonPreviewState = "default" | "hover" | "disabled" | "loading";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  visualVariant?: ButtonVisualVariant;
  nativeType?: "button" | "submit" | "reset";
  loading?: boolean;
  /** When set, simulates Figma variant matrix in Playground (not for production UX). */
  preview?: ButtonPreviewState;
};

const variantClass: Record<ButtonVisualVariant, string> = {
  Primary: styles.primary,
  Secondary: styles.secondary,
  Transparent: styles.transparent,
  White: styles.white,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    visualVariant = "Primary",
    nativeType = "button",
    loading = false,
    preview,
    className,
    children = "Действие",
    disabled,
    ...rest
  },
  ref,
) {
  const showLoading = Boolean(loading) || preview === "loading";
  const showLabel = !showLoading;

  const rootClass = useMemo(() => {
    const parts = [styles.root, variantClass[visualVariant]];
    if (className) parts.push(className);
    return parts.join(" ");
  }, [className, visualVariant]);

  const mergedDisabled =
    Boolean(disabled) ||
    Boolean(loading) ||
    preview === "disabled" ||
    preview === "loading";

  return (
    <button
      ref={ref}
      type={nativeType}
      className={rootClass}
      disabled={mergedDisabled}
      data-loading={showLoading ? "true" : undefined}
      data-preview={preview && preview !== "default" ? preview : undefined}
      {...rest}
    >
      {showLabel && <span className={styles.label}>{children as ReactNode}</span>}
      {showLoading && (
        <span className={styles.loadingOverlay} aria-hidden>
          <span className={styles.spinner} />
        </span>
      )}
    </button>
  );
});
