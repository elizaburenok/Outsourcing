import { useState } from 'react'
import { ChevronDown, ListFilter } from 'lucide-react'
import { Chip } from '@ds/components/Chip'
import { Button } from '@ds/components/Button'
import { useScenario } from '@/state/ScenarioProvider'
import { HOME_SCENARIOS, SCENARIO_ORDER } from '@/data/scenarios'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes'
import './ScenarioSwitch.css'

/**
 * Служебный тумблер сценариев прототипа (не элемент продукта). Плавает в левом нижнем
 * углу поверх интерфейса: переключает состояние Главной («Всё хорошо» / «Есть просрочка»)
 * и сбрасывает весь сценарий в дефолт (в т.ч. уплаты текущей сессии). Собран из DS —
 * Chip (сегменты) и Button (сброс).
 */
export default function ScenarioSwitch() {
  const { scenario, setScenario, reset } = useScenario()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={collapsed ? 'scn scn--collapsed' : 'scn'} aria-label="Демо-сценарий прототипа">
      <div className="scn__header">
        {!collapsed && <span className="scn__label">Демо-сценарий</span>}
        <button
          className="scn__toggle"
          type="button"
          aria-label={collapsed ? 'Развернуть демо-сценарии' : 'Свернуть демо-сценарии'}
          aria-expanded={!collapsed}
          aria-controls="scenario-switch-content"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <ListFilter size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
        </button>
      </div>
      <div className="scn__content" id="scenario-switch-content" hidden={collapsed}>
        <div className="scn__tabs">
          {SCENARIO_ORDER.map((id) => (
            <Chip
              key={id}
              chipType="Tab"
              isSelected={scenario === id}
              onClick={() => {
                setScenario(id)
                if (id === 'onboarding' || id === 'onboarding_vat') navigate(ROUTES.home)
              }}
            >
              {HOME_SCENARIOS[id].label}
            </Chip>
          ))}
        </div>
        <Button visualVariant="Transparent" onClick={reset}>
          Сбросить сценарий
        </Button>
      </div>
    </aside>
  )
}
