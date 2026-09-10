import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'
import { ROUTES } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { HeaderButton } from '@ds/components/HeaderButton'
import { Cell } from '@ds/components/Cell'
import { CellRightAccessory } from '@ds/components/CellRightAccessory'
import PageAction from '@ds/components/PageAction'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import type { PayGroup } from '@/features/october/groups'
import { categoryHistory } from '@/features/home/domain'
import { pluralPayments, type AugustPayment } from '@/data/august'
import { CASE2_USN, CASE2_NDS, CASE2_EMPLOYEES, CASE2_PAYABLES, TASKS_IN_PROGRESS } from '@/data/case2'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import CreateTaskDrawer from './CreateTaskDrawer'
import '@/features/august/AugustView.css'
import './Case2View.css'

const sum = (list: AugustPayment[]) => list.reduce((s, p) => s + p.amount, 0)

/**
 * КЕЙС 2 (макет 210-28862) — ООО на УСН «Доходы» 6% + НДС, есть сотрудники. Главная:
 *  - сверху кнопка «Создать задачу» → дроппер постановки задачи бухгалтеру;
 *  - блок «Платежи» — фиксированный список из трёх ячеек: налог по УСН («в расчёте»),
 *    НДС (к уплате, до 28 сентября), сотрудники (2 платежа к уплате, до 28 сентября).
 *    Клик по ячейке открывает дровер раздела; вкладки «К уплате / Выполнено» — внутри
 *    дровера (см. `GroupDrawer`, макет 848-31345), а не в самом блоке;
 *  - блок «Задачи» (сколько задач у бухгалтера в работе) — полноширинный, кликабельный;
 *  - список сущностей снизу — как на остальных экранах.
 * Данные — из `@/data/case2` (самодостаточно, не трогают `AUGUST_PAYMENTS`).
 */
export default function Case2View() {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)
  const [taskOpen, setTaskOpen] = useState(false)

  // Ячейки блока «Платежи»: УСН («в расчёте», некликабелен) → НДС → Сотрудники.
  const usnGroup: PayGroup = {
    key: 'usn',
    title: 'Налог по УСН за III кв. 2026',
    items: [CASE2_USN],
    total: CASE2_USN.amount,
    payable: false,
  }
  const ndsOpen = CASE2_NDS.filter((p) => !isPaid(p.id))
  const employeesOpen = CASE2_EMPLOYEES.filter((p) => !isPaid(p.id))
  const employeesGroup: PayGroup =
    employeesOpen.length > 0
      ? {
          key: 'employees',
          title: 'Сотрудники',
          items: employeesOpen,
          total: sum(employeesOpen),
          payable: true,
        }
      : { key: 'employees', title: 'Сотрудники', items: [], total: 0, payable: false, done: true }

  const groups: PayGroup[] = [
    usnGroup,
    ...(ndsOpen.length > 0
      ? [
          {
            key: 'nds',
            // Один платёж — называем его; несколько (в т.ч. с просрочкой) — «НДС: N платежей»,
            // подпись со сроком/просрочкой считает `GroupRow` (макет 894-96775).
            title: ndsOpen.length > 1 ? `НДС: ${pluralPayments(ndsOpen.length)}` : ndsOpen[0].title,
            items: ndsOpen,
            total: sum(ndsOpen),
            payable: true,
          } as PayGroup,
        ]
      : []),
    employeesGroup,
  ]

  // Все ячейки кликабельны — клик открывает дровер раздела (вкладки «К уплате / Выполнено» —
  // внутри него). Для УСН «в расчёте» дровер показывает предварительный расчёт (без уплаты).
  const onGroup = (g: PayGroup) => () => setOpenGroup(g)

  const drawerProps = openGroup && {
    title: openGroup.title,
    items: openGroup.items,
    // «Выполнено» — уплаченные налоги за прошлые периоды (+ оплаченные в этой сессии).
    history:
      openGroup.key !== 'overdue'
        ? categoryHistory(openGroup.key, CASE2_PAYABLES, isPaid, 'Сентябрь')
        : [],
  }

  return (
    <div className="av">
      <div className="av__create case2__create" data-coach="add-task">
        <HeaderButton
          visualVariant="Secondary"
          icon={<CirclePlus size={20} strokeWidth={2} />}
          onClick={() => setTaskOpen(true)}
        >
          Создать задачу
        </HeaderButton>
      </div>

      <div data-coach="pay">
        <Card className="av__list">
          <div className="av__pay-head">
            <span className="av__pay-title">Платежи</span>
          </div>

          {groups.map((g) => (
            <div key={g.key} className="av__row">
              <GroupRow group={g} onClick={onGroup(g)} />
            </div>
          ))}
        </Card>
      </div>

      <div className="av__tasks" data-coach="tasks">
        <Card>
          <button
            type="button"
            className="pay-row-btn"
            onClick={() => navigate(ROUTES.reports)}
          >
            <Cell
              textScale="M"
              verticalSpacing="compact"
              title={<span className="pay-title">Задачи</span>}
              description={
                <span className="pay-note">{TASKS_IN_PROGRESS.toLocaleString('ru-RU')} в работе</span>
              }
              rightAccessory={<CellRightAccessory kind="Disclosure" />}
            />
          </button>
        </Card>
      </div>

      <div className="av__links">
        <PageAction
          title="Налогообложение и патенты"
          description="УСН «Доходы» — 6%"
          iconLeft={<EmblemTIcon />}
        />
        <div data-coach="sign">
          <PageAction
            title="Доверенность"
            description={`${MCHD_COUNT} добавлено`}
            iconLeft={<PenIcon />}
          />
        </div>
        <PageAction
          title="Подключенные сервисы"
          description={connectedServicesText(CONNECTED_SERVICES)}
          iconLeft={<IntegrationIcon />}
        />
        <PageAction title="Тариф" description={TARIFF_NAME} iconLeft={<RequisitesTIcon />} />
      </div>

      {drawerProps && <GroupDrawer open onClose={() => setOpenGroup(null)} {...drawerProps} />}
      <CreateTaskDrawer open={taskOpen} onClose={() => setTaskOpen(false)} />
    </div>
  )
}
