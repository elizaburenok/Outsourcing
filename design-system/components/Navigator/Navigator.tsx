import type { HTMLAttributes } from "react";
import { useMemo } from "react";
import styles from "./Navigator.module.css";

export type NavigatorVariant = "1-label" | "2-label" | "general";

export type NavigatorProps = HTMLAttributes<HTMLDivElement> & {
  navigatorVariant?: NavigatorVariant;
  isSkeleton?: boolean;
  hasChevron?: boolean;
  /** Shows bottom list-style control (Figma `isButton`). */
  withFooter?: boolean;
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

function TitleBlock({ hasChevron }: { hasChevron: boolean }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <p className={styles.title}>Text XL</p>
        {hasChevron && (
          <span className={styles.chevron} aria-hidden>
            <ChevronRight className={styles.chevronSvg} />
          </span>
        )}
      </div>
    </div>
  );
}

function RowOneLabel({ skeleton }: { skeleton: boolean }) {
  if (skeleton) {
    return (
      <div className={`${styles.row} ${styles.rowTightGap}`}>
        <div className={styles.skeletonCircle} />
        <div className={styles.skeletonBar}>
          <div className={styles.skeletonFill} />
        </div>
      </div>
    );
  }
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

function RowTwoLabel({ skeleton }: { skeleton: boolean }) {
  if (skeleton) {
    return (
      <div className={`${styles.row} ${styles.rowTightGap}`}>
        <div className={styles.skeletonCircle} />
        <div className={styles.textCol}>
          <div className={styles.skeletonBar}>
            <div className={styles.skeletonFill} />
          </div>
          <div className={styles.skeletonBar} style={{ minHeight: 18 }}>
            <div className={styles.skeletonFill} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.row}>
      <div className={styles.leftPad}>
        <div className={styles.avatar} aria-hidden />
      </div>
      <div className={styles.textCol}>
        <p className={styles.textM}>Text M</p>
        <p className={styles.textS}>Text S</p>
      </div>
      <div className={styles.rightPad}>
        <div className={styles.radio} aria-hidden />
      </div>
    </div>
  );
}

export function Navigator({
  navigatorVariant = "1-label",
  isSkeleton = false,
  hasChevron = true,
  withFooter = true,
  className,
  ...rest
}: NavigatorProps) {
  const rootClass = useMemo(() => {
    const parts = [styles.root];
    if (navigatorVariant === "general") parts.push(styles.general);
    if (className) parts.push(className);
    return parts.join(" ");
  }, [className, navigatorVariant]);

  if (navigatorVariant === "general") {
    return (
      <article className={rootClass} {...rest}>
        <div className={styles.generalText}>
          <div className={styles.generalTitleRow}>
            <p className={styles.title}>Text XL</p>
            {hasChevron && (
              <span className={styles.chevron} aria-hidden>
                <ChevronRight className={styles.chevronSvg} />
              </span>
            )}
          </div>
          <p className={styles.textS}>Text S</p>
        </div>
        <div className={styles.radio} aria-hidden />
      </article>
    );
  }

  return (
    <article className={rootClass} {...rest}>
      <TitleBlock hasChevron={hasChevron} />
      <div className={styles.body}>
        {navigatorVariant === "1-label" && (
          <>
            <RowOneLabel skeleton={isSkeleton} />
            <RowOneLabel skeleton={isSkeleton} />
            <RowOneLabel skeleton={isSkeleton} />
          </>
        )}
        {navigatorVariant === "2-label" && (
          <>
            <RowTwoLabel skeleton={isSkeleton} />
            <RowTwoLabel skeleton={isSkeleton} />
            <RowTwoLabel skeleton={isSkeleton} />
          </>
        )}
      </div>
      {withFooter && (
        <div className={styles.footer}>
          <button type="button" className={styles.footerBtn}>
            Text S
          </button>
        </div>
      )}
    </article>
  );
}
