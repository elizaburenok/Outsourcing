import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef, useMemo } from "react";
import styles from "./HeaderButton.module.css";

export type HeaderButtonVisualVariant = "Primary" | "Secondary" | "Danger" | "Chrome";
export type HeaderButtonPreviewState = "default" | "hover" | "disabled" | "loading";

export type HeaderButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  visualVariant?: HeaderButtonVisualVariant;
  nativeType?: "button" | "submit" | "reset";
  loading?: boolean;
  hasIcon?: boolean;
  hasText?: boolean;
  icon?: ReactNode;
  preview?: HeaderButtonPreviewState;
};

const variantClass: Record<HeaderButtonVisualVariant, string> = {
  Primary: styles.primary,
  Secondary: styles.secondary,
  Danger: styles.danger,
  Chrome: styles.chrome,
};

export const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  function HeaderButton(
    {
      visualVariant = "Primary",
      nativeType = "button",
      loading = false,
      hasIcon = true,
      hasText = true,
      icon,
      preview,
      className,
      children = "Text",
      disabled,
      ...rest
    },
    ref,
  ) {
    const showLoading = Boolean(loading) || preview === "loading";
    const mergedDisabled =
      Boolean(disabled) ||
      Boolean(loading) ||
      preview === "disabled" ||
      preview === "loading";

    const rootClass = useMemo(() => {
      const parts = [styles.root, variantClass[visualVariant]];
      if (className) parts.push(className);
      return parts.join(" ");
    }, [className, visualVariant]);

    const defaultIcon = hasIcon ? (
      <span className={styles.iconSlot} aria-hidden>
        <span className={styles.iconStroke} />
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        type={nativeType}
        className={rootClass}
        disabled={mergedDisabled}
        data-loading={showLoading ? "true" : undefined}
        data-preview={preview && preview !== "default" ? preview : undefined}
        data-icon-only={hasIcon && !hasText ? "true" : undefined}
        {...rest}
      >
        <span className={`${styles.inner} ${showLoading ? styles.innerNoGap : ""}`}>
          {showLoading && <span className={styles.spinner} aria-hidden />}
          {!showLoading && hasIcon && (icon ?? defaultIcon)}
          {!showLoading && hasText && <span>{children}</span>}
        </span>
      </button>
    );
  },
);
