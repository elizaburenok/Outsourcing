import { useMemo } from "react";
import { HeaderButton } from "../HeaderButton/HeaderButton";
import { BellIcon, GiftIcon, GearIcon, LogoutIcon } from "../icons";
import logo from "../../src/logo/Точка банк.png";
import styles from "./MainPageNavigationBar.module.css";

export type NavItem = {
  id: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export type MainPageNavigationBarProps = {
  /** Ecosystem-level nav tabs (Главная / Платежи / Сервисы). */
  navItems: NavItem[];
  userName: string;
  avatarInitials: string;
  hasNotification?: boolean;
  onUserClick?: () => void;
  onNotificationsClick?: () => void;
  onGiftClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
};

export function MainPageNavigationBar({
  navItems,
  userName,
  avatarInitials,
  hasNotification = false,
  onUserClick,
  onNotificationsClick,
  onGiftClick,
  onSettingsClick,
  onLogoutClick,
  className,
}: MainPageNavigationBarProps) {
  const rootClass = useMemo(() => {
    const parts = [styles.root];
    if (className) parts.push(className);
    return parts.join(" ");
  }, [className]);

  return (
    <header className={rootClass}>
      <div className={styles.inner}>
        <div className={styles.logoZone}>
          <img src={logo} alt="Точка Банк" className={styles.logo} />
        </div>

        <nav className={styles.navZone} aria-label="Экосистема">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.tab}
              aria-current={item.active ? "page" : undefined}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.rightZone}>
          <button className={styles.user} type="button" onClick={onUserClick}>
            <span className={styles.avatar} aria-hidden>
              {avatarInitials}
            </span>
            <span className={styles.userName}>{userName}</span>
            <svg
              className={styles.chevron}
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M5 7L9 11L13 7"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={styles.actions}>
            <span className={styles.notifyWrap}>
              <HeaderButton
                visualVariant="Chrome"
                hasText={false}
                icon={<BellIcon />}
                aria-label="Уведомления"
                onClick={onNotificationsClick}
              />
              {hasNotification && <span className={styles.notifyDot} aria-hidden />}
            </span>
            <HeaderButton
              visualVariant="Chrome"
              hasText={false}
              icon={<GiftIcon />}
              aria-label="Бонусы"
              onClick={onGiftClick}
            />
            <HeaderButton
              visualVariant="Chrome"
              hasText={false}
              icon={<GearIcon />}
              aria-label="Настройки"
              onClick={onSettingsClick}
            />
            <HeaderButton
              visualVariant="Chrome"
              hasText={false}
              icon={<LogoutIcon />}
              aria-label="Выход"
              onClick={onLogoutClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
