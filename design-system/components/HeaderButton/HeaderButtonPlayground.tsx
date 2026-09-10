import { HeaderButton, type HeaderButtonPreviewState, type HeaderButtonVisualVariant } from "./HeaderButton";
import styles from "./HeaderButtonPlayground.module.css";

const variants: HeaderButtonVisualVariant[] = ["Primary", "Secondary", "Danger", "Chrome"];
const states: HeaderButtonPreviewState[] = ["default", "hover", "loading", "disabled"];

export function HeaderButtonPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Header Button</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.corner} />
            {states.map((s) => (
              <th key={s} className={styles.colHead}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v}>
              <th className={styles.rowHead}>{v}</th>
              {states.map((s) => (
                <td key={s} className={styles.cell}>
                  <HeaderButton
                    visualVariant={v}
                    preview={s === "default" ? undefined : s}
                    loading={s === "loading"}
                    disabled={s === "disabled"}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
