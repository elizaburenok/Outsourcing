import { Button, type ButtonPreviewState, type ButtonVisualVariant } from "./Button";
import styles from "./ButtonPlayground.module.css";

const variants: ButtonVisualVariant[] = ["Primary", "Secondary", "Transparent", "White"];
const states: ButtonPreviewState[] = ["default", "hover", "disabled", "loading"];

export function ButtonPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Button</h2>
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
                  <Button
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
