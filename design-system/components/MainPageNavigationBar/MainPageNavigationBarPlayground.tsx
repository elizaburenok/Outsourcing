import { useState } from "react";
import { MainPageNavigationBar, type NavItem } from "./MainPageNavigationBar";
import styles from "./MainPageNavigationBarPlayground.module.css";

const initialNavItems: NavItem[] = [
  { id: "home", label: "Главная", active: true },
  { id: "payments", label: "Платежи" },
  { id: "services", label: "Сервисы" },
];

export function MainPageNavigationBarPlayground() {
  const [navItems, setNavItems] = useState(initialNavItems);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Main Page Navigation Bar</h2>
      <div className={styles.frame}>
        <MainPageNavigationBar
          navItems={navItems.map((item) => ({
            ...item,
            onClick: () =>
              setNavItems((prev) =>
                prev.map((i) => ({ ...i, active: i.id === item.id })),
              ),
          }))}
          userName="Иванов И.И., ООО"
          avatarInitials="ИИ"
          hasNotification
        />
      </div>
    </section>
  );
}
