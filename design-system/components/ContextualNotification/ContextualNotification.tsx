import type { HTMLAttributes, ReactNode } from "react";
import { useMemo } from "react";
import styles from "./ContextualNotification.module.css";

export type NotificationTone = "brand" | "success" | "neutral";

export type ContextualNotificationProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  tone?: NotificationTone;
  icon?: ReactNode;
  title?: ReactNode;
  action?: { label: string; onClick: () => void };
  /** Однострочный компактный вариант («Входит в ваш тариф бухгалтерии»). */
  compact?: boolean;
  /** Убирает фоновую заливку и рамку — например, внутри дровера. */
  plain?: boolean;
};

const toneBackgroundClass: Record<NotificationTone, string> = {
  brand: styles.brand,
  success: styles.success,
  neutral: styles.neutral,
};

const toneIconClass: Record<NotificationTone, string> = {
  brand: styles.iconBrand,
  success: styles.iconSuccess,
  neutral: styles.iconNeutral,
};

export function ContextualNotification({
  tone = "brand",
  icon,
  title,
  action,
  compact = false,
  plain = false,
  className,
  children,
  ...rest
}: ContextualNotificationProps) {
  const rootClass = useMemo(() => {
    const parts = [
      styles.root,
      plain ? styles.plain : toneBackgroundClass[tone],
      compact ? styles.compact : "",
      className ?? "",
    ];
    return parts.filter(Boolean).join(" ");
  }, [className, compact, plain, tone]);

  return (
    <div className={rootClass} {...rest}>
      {icon && (
        <span className={[styles.icon, toneIconClass[tone]].join(" ")} aria-hidden>
          {icon}
        </span>
      )}
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
        {action && (
          <button type="button" className={styles.action} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default ContextualNotification;
