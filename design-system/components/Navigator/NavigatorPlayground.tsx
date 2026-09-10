import { Navigator } from "./Navigator";
import styles from "./NavigatorPlayground.module.css";

export function NavigatorPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Navigator</h2>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.label}>1 Label</div>
          <Navigator navigatorVariant="1-label" isSkeleton={false} />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>1 Label skeleton</div>
          <Navigator navigatorVariant="1-label" isSkeleton />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>2 Label</div>
          <Navigator navigatorVariant="2-label" isSkeleton={false} />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>2 Label skeleton</div>
          <Navigator navigatorVariant="2-label" isSkeleton />
        </div>
        <div className={styles.card}>
          <div className={styles.label}>General</div>
          <Navigator navigatorVariant="general" withFooter={false} />
        </div>
      </div>
    </section>
  );
}
