import { useState } from 'react'
import { ChevronDown, ListFilter } from 'lucide-react'
import { Chip } from '@ds/components/Chip'
import { useScenario } from '@/state/ScenarioProvider'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/routes'
import './ScenarioSwitch.css'

/**
 * Служебный переключатель между онбордингом и главной с готовыми платежами.
 */
export default function ScenarioSwitch() {
  const { scenario, setScenario } = useScenario()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)
  const isVatDemo = /\/pay\/demo-due-c[23]-nds-q3-/.test(location.pathname)
  const vatView = searchParams.get('vatView') === 'accordion' ? 'accordion' : 'screens'
  const scenarios = [
    { id: 'onboarding', label: 'Онбординг' },
    { id: 'case2', label: 'Готовые платежи' },
  ] as const

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
          {scenarios.map(({ id, label }) => (
            <Chip
              key={id}
              chipType="Tab"
              isSelected={scenario === id}
              onClick={() => {
                if (scenario !== id) setScenario(id)
                navigate(ROUTES.home)
              }}
            >
              {label}
            </Chip>
          ))}
        </div>
        {isVatDemo && <div className="scn__variant">
          <span className="scn__variant-label">Детализация НДС</span>
          <div className="scn__tabs">
            {([['screens', 'По экранам'], ['accordion', 'Аккордеон']] as const).map(([id, label]) =>
              <Chip key={id} chipType="Tab" isSelected={vatView === id} onClick={() => {
                const next = new URLSearchParams(searchParams)
                if (id === 'accordion') next.set('vatView', 'accordion')
                else next.delete('vatView')
                setSearchParams(next)
              }}>{label}</Chip>)}
          </div>
        </div>}
      </div>
    </aside>
  )
}
