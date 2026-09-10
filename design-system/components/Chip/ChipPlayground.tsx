import type { ComponentProps } from "react";
import { Chip, type ChipFigmaState, type ChipFigmaType } from "./Chip";
import styles from "./ChipPlayground.module.css";

const matrix: Array<{
  chipType: ChipFigmaType;
  label: string;
  props: Partial<ComponentProps<typeof Chip>>;
  states: ChipFigmaState[];
}> = [
  {
    chipType: "Chip",
    label: "Chip",
    props: { isSelected: false, hasResetIcon: false },
    states: ["Default", "Hovered", "Disabled"],
  },
  {
    chipType: "Chip",
    label: "Chip selected",
    props: { isSelected: true, hasResetIcon: false },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Tab",
    label: "Tab",
    props: { isSelected: false, hasRightAccessory: true },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Tab",
    label: "Tab selected",
    props: { isSelected: true },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Dropdown",
    label: "Dropdown",
    props: { isSelected: false },
    states: ["Default", "Hovered", "Pressed"],
  },
  {
    chipType: "Dropdown",
    label: "Dropdown selected + reset",
    props: { isSelected: true, hasResetIcon: true },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Action",
    label: "Action",
    props: { isSelected: false },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Action",
    label: "Action selected",
    props: { isSelected: true, hasResetIcon: false },
    states: ["Default", "Hovered"],
  },
  {
    chipType: "Action",
    label: "Action selected + reset",
    props: { isSelected: true, hasResetIcon: true },
    states: ["Default", "Hovered"],
  },
];

export function ChipPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Chip</h2>
      <div className={styles.blocks}>
        {matrix.map((row) => (
          <div key={row.label} className={styles.block}>
            <div className={styles.blockTitle}>{row.label}</div>
            <div className={styles.row}>
              {row.states.map((st) => (
                <Chip
                  key={st}
                  chipType={row.chipType}
                  presentation={st}
                  isDropdownOpen={row.chipType === "Dropdown" && st === "Pressed"}
                  disabled={st === "Disabled"}
                  {...row.props}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
