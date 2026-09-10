import type { HTMLAttributes, ReactNode } from "react";
import { useMemo } from "react";
import styles from "./Tabs.module.css";

export type TabItem = {
  id: string;
  label: ReactNode;
};

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  items: TabItem[];
  /** Id активной вкладки. */
  value: string;
  onChange?: (id: string) => void;
};

/**
 * Tabs Carousel — горизонтальный ряд текстовых вкладок (Figma «Tabs Carousel»).
 * Активная вкладка — primary, неактивные — neutral 3. Прокрутка по горизонтали.
 */
export function Tabs({ items, value, onChange, className, ...rest }: TabsProps) {
  const rootClass = useMemo(
    () => [styles.root, className].filter(Boolean).join(" "),
    [className],
  );

  return (
    <div className={rootClass} role="tablist" {...rest}>
      {items.map((item) => {
        const isSelected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} ${isSelected ? styles.selected : ""}`.trim()}
            onClick={() => onChange?.(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
