import { Bell, Gift, Settings, LogOut, ChevronDown } from 'lucide-react'
import './EcosystemHeader.css'

/**
 * Экосистемная шапка Точки — ДАННОСТЬ платформы, не наша навигация.
 * ОБ живёт внутри этой оболочки. Здесь она статична (chrome): наша навигация
 * строится ниже — от контента Главной (левый NavigationBar + вкладки).
 */
export default function EcosystemHeader() {
  return (
    <header className="eco">
      <div className="eco__inner">
        <div className="eco__logo" aria-label="Точка Банк">
          точка<br />банк
        </div>

        <nav className="eco__nav" aria-label="Экосистема">
          <span className="eco__tab eco__tab--active">Главная</span>
          <span className="eco__tab">Платежи</span>
          <span className="eco__tab">Сервисы</span>
        </nav>

        <div className="eco__right">
          <button className="eco__user" type="button">
            <span className="eco__avatar" aria-hidden>ПН</span>
            <span className="eco__user-name">Носковец П.А., ООО</span>
            <ChevronDown size={18} strokeWidth={1.75} />
          </button>
          <button className="eco__icon eco__icon--dot" aria-label="Уведомления" type="button">
            <Bell size={20} strokeWidth={1.75} />
          </button>
          <button className="eco__icon" aria-label="Бонусы" type="button">
            <Gift size={20} strokeWidth={1.75} />
          </button>
          <button className="eco__icon" aria-label="Настройки" type="button">
            <Settings size={20} strokeWidth={1.75} />
          </button>
          <button className="eco__icon" aria-label="Выход" type="button">
            <LogOut size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
