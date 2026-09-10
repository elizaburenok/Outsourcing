import type { HTMLAttributes } from "react";
import { useMemo } from "react";
import styles from "./Widget.module.css";

export type WidgetFooterVariant = "none" | "list" | "action" | "both";

export type WidgetProps = HTMLAttributes<HTMLDivElement> & {
  hasChevron?: boolean;
  hasRightAccessory?: boolean;
  footerVariant?: WidgetFooterVariant;
};

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden width={18} height={18}>
      <path
        d="M7 4.5 11.5 9 7 13.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Row() {
  return (
    <div className={styles.row}>
      <div className={styles.leftPad}>
        <div className={styles.avatar} aria-hidden />
      </div>
      <div className={styles.textCol}>
        <p className={styles.textM}>Text M</p>
      </div>
      <div className={styles.rightPad}>
        <div className={styles.radio} aria-hidden />
      </div>
    </div>
  );
}

export function Widget({
  hasChevron = true,
  hasRightAccessory = false,
  footerVariant = "both",
  className,
  ...rest
}: WidgetProps) {
  const rootClass = useMemo(() => [styles.card, className].filter(Boolean).join(" "), [className]);

  return (
    <section className={rootClass} {...rest}>
      <header className={styles.titleStrip}>
        <div className={styles.titleCluster}>
          <h2 className={styles.title}>Text XL</h2>
          {hasChevron && (
            <span className={styles.chevron} aria-hidden>
              <ChevronRight className={styles.chevronSvg} />
            </span>
          )}
        </div>
        {hasRightAccessory && (
          <div className={styles.accessory}>
            <p className={styles.accessoryText}>Text M</p>
            <span className={styles.accessoryIcon} aria-hidden />
          </div>
        )}
      </header>
      <div className={styles.body}>
        <Row />
        <Row />
        <Row />
      </div>
      {footerVariant !== "none" && (
        <footer className={styles.footer}>
          {(footerVariant === "list" || footerVariant === "both") && (
            <button type="button" className={styles.footerList}>
              Text S
            </button>
          )}
          {(footerVariant === "action" || footerVariant === "both") && (
            <button type="button" className={styles.footerAction}>
              Text M
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
