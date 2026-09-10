import { Widget } from "./Widget";
import styles from "./WidgetPlayground.module.css";

export function WidgetPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Widget</h2>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <div className={styles.label}>Title + list + both footers</div>
          <Widget footerVariant="both" />
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>Title + accessory + both footers</div>
          <Widget hasRightAccessory footerVariant="both" />
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>List footer only</div>
          <Widget footerVariant="list" />
        </div>
        <div className={styles.cell}>
          <div className={styles.label}>Action footer only</div>
          <Widget footerVariant="action" />
        </div>
      </div>
    </section>
  );
}
