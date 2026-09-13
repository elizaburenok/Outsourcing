import { Chip } from '@ds/components/Chip'
import { Button } from '@ds/components/Button'
import { useScenario } from '@/state/ScenarioProvider'
import { HOME_SCENARIOS, SCENARIO_ORDER } from '@/data/scenarios'
import './ScenarioSwitch.css'

/**
 * Служебный тумблер сценариев прототипа (не элемент продукта). Плавает в левом нижнем
 * углу поверх интерфейса: переключает состояние Главной («Всё хорошо» / «Есть просрочка»)
 * и сбрасывает весь сценарий в дефолт (в т.ч. уплаты текущей сессии). Собран из DS —
 * Chip (сегменты) и Button (сброс).
 */
export default function ScenarioSwitch() {
  const { scenario, setScenario, reset } = useScenario()

  return (
    <aside className="scn" aria-label="Демо-сценарий прототипа">
      <span className="scn__label">Демо-сценарий</span>
      <div className="scn__tabs">
        {SCENARIO_ORDER.map((id) => (
          <Chip
            key={id}
            chipType="Tab"
            isSelected={scenario === id}
            onClick={() => setScenario(id)}
          >
            {HOME_SCENARIOS[id].label}
          </Chip>
        ))}
      </div>

      <Button visualVariant="Transparent" onClick={reset}>
        Сбросить сценарий
      </Button>
    </aside>
  )
}
