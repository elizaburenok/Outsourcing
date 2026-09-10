import type { ReactNode } from "react";
import styles from "./Cell.module.css";

export type CellTextScale = "5XL" | "4XL" | "3XL" | "2XL" | "XL" | "L" | "M" | "S" | "XS";

export type CellVerticalSpacing = "default" | "none" | "compact";

export type CellHorizontalSpacing = "on" | "off";

/** Боковой (левый/правый) padding корня — независим от `horizontalSpacing` (тот управляет
 * только внутренними гэпами между иконкой/текстом/правым аксессуаром). "off" — для
 * edge-to-edge списков, где боковой отступ задаёт сам контейнер списка, а не Cell. */
export type CellEdgePadding = "on" | "off";

export type CellLayoutVariant = "cell" | "bullet";

export type CellProps = {
  textScale: CellTextScale;
  verticalSpacing?: CellVerticalSpacing;
  horizontalSpacing?: CellHorizontalSpacing;
  edgePadding?: CellEdgePadding;
  layoutVariant?: CellLayoutVariant;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  className?: string;
};

const titleClassByScale: Record<CellTextScale, string> = {
  "5XL": styles.title5xl,
  "4XL": styles.title4xl,
  "3XL": styles.title3xl,
  "2XL": styles.title2xl,
  XL: styles.titleXl,
  L: styles.titleL,
  M: styles.titleM,
  S: styles.titleS,
  XS: styles.titleXs,
};

function padClass(v: CellVerticalSpacing | undefined) {
  switch (v ?? "default") {
    case "none":
      return styles.padNone;
    case "compact":
      return styles.padCompact;
    default:
      return styles.padDefault;
  }
}

function leftGutterClass(scale: CellTextScale, horizontal: CellHorizontalSpacing) {
  if (horizontal === "off") return styles.leftSlotGutterOff;
  if (scale === "5XL" || scale === "4XL" || scale === "3XL") return styles.leftSlotGutterWide;
  if (scale === "2XL" || scale === "XL" || scale === "L") return styles.leftSlotGutterDefault;
  return styles.leftSlotGutterTight;
}

export function Cell({
  textScale,
  verticalSpacing = "default",
  horizontalSpacing = "on",
  edgePadding = "on",
  layoutVariant = "cell",
  title,
  subtitle,
  description,
  leftAccessory,
  rightAccessory,
  className,
}: CellProps) {
  const titleClass = titleClassByScale[textScale];
  const hasSubtitle = Boolean(subtitle);
  const hasDescription = Boolean(description);
  const multiText = hasSubtitle && hasDescription && Boolean(rightAccessory);

  const rootClass = [
    styles.root,
    padClass(verticalSpacing),
    edgePadding === "off" ? styles.paddingOff : styles.paddingOn,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (layoutVariant === "bullet") {
    return (
      <div className={rootClass}>
        <div className={styles.bullet}>
          <p className={[styles.bulletMark, titleClass].join(" ")} aria-hidden>
            —
          </p>
          <div className={styles.bulletBody}>
            <p className={titleClass}>{title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {leftAccessory ? (
        <div className={[styles.leftSlot, leftGutterClass(textScale, horizontalSpacing)].join(" ")}>
          {leftAccessory}
        </div>
      ) : null}
      <div className={styles.main}>
        <div className={styles.textCol}>
          {hasSubtitle ? <p className={styles.meta}>{subtitle}</p> : null}
          <p className={titleClass}>{title}</p>
          {hasDescription ? <p className={styles.meta}>{description}</p> : null}
        </div>
        {rightAccessory ? (
          <div
            className={[
              styles.rightSlot,
              horizontalSpacing === "on" ? styles.rightSlotGutterOn : styles.rightSlotGutterOff,
              multiText ? styles.rightSlotAlignMulti : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {rightAccessory}
          </div>
        ) : null}
      </div>
    </div>
  );
}
