import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus, ClipboardCheck, FileText } from 'lucide-react'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { HeaderButton } from '@ds/components/HeaderButton'
import PageAction from '@ds/components/PageAction'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import SectionCard from '@/features/october/SectionCard'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import type { PayGroup } from '@/features/october/groups'
import type { AugustPayment, PayState } from '@/data/august'
import { CASE2, TASKS_IN_PROGRESS, type ObCaseData } from '@/data/case2'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import CreateTaskDrawer from './CreateTaskDrawer'
import '@/features/august/AugustView.css'
import './Case2View.css'

const sum = (list: AugustPayment[]) => list.reduce((s, p) => s + p.amount, 0)

/** Порядок внутри группы: сначала просроченное, потом к уплате, потом «по графику». */
const STATE_RANK: Record<PayState, number> = { overdue: 0, due: 1, process: 2, paid: 3 }
const byUrgency = (list: AugustPayment[]) =>
  [...list].sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state])

/** Сумма группы для карточки — только то, что реально пора платить («в расчёте» не в счёт). */
function splitTotals(list: AugustPayment[]): { total: number } {
  return { total: sum(list.filter((p) => p.state !== 'process')) }
}

/**
 * Заголовок строки-группы: если в группе один платёж — показываем его конкретное название
 * (напр. «1-й платёж за III квартал»), иначе — общее имя домена («Налоги и взносы»).
 */
function groupTitle(domain: string, items: AugustPayment[]): string {
  return items.length === 1 ? items[0].title : domain
}

/**
 * КЕЙС 2 (макет 210-28862) — ООО на УСН «Доходы» 6% + НДС, есть сотрудники, «сегодня» —
 * октябрь 2026. У клиента одновременно готовые к уплате платежи и задолженность. Главная:
 *  - сверху кнопка «Создать задачу» → дроппер постановки задачи бухгалтеру;
 *  - блок «Платежи» — три группы-домена: «Налоги и взносы» (аванс по УСН),
 *    «НДС: III квартал» (текущий квартал), «Сотрудники» (НДФЛ и взносы, в т.ч.
 *    просроченные за август). Если в группе один платёж — строка называет его конкретно
 *    и ведёт сразу на страницу уплаты; если несколько — заголовок общий, а клик открывает
 *    дровер раздела со списком к уплате (см. `GroupDrawer`);
 *  - две плитки в ряд: «Задачи» (сколько задач у бухгалтера в работе → отчётность) и
 *    «Бухучёт» (все выполненные платежи по налогам и взносам → раздел «Бухучёт»);
 *  - список сущностей снизу — как на остальных экранах.
 * Данные — из `@/data/case2` (самодостаточно, не трогают `AUGUST_PAYMENTS`).
 */
export default function Case2View({ data = CASE2 }: { data?: ObCaseData }) {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)
  const [taskOpen, setTaskOpen] = useState(false)

  // Ячейки блока «Платежи»: Налоги и взносы → НДС → Сотрудники.
  // «Налоги и взносы» — общий домен собственных налогов ООО (УСН, имущественные и т.д.).
  // Сейчас в нём только готовый к уплате налог по УСН за III квартал.
  const taxesOpen = byUrgency(data.taxes.filter((p) => !isPaid(p.id)))
  const taxesGroup: PayGroup = {
    key: 'usn',
    title: groupTitle('Налоги и взносы', taxesOpen),
    items: taxesOpen,
    ...splitTotals(taxesOpen),
    payable: taxesOpen.some((p) => p.state !== 'process'),
  }

  // НДС — только текущий (III) квартал: 1-й платёж к уплате, 2-й и 3-й по графику.
  // На карточке показываем сумму того, что уже пора платить (`due`), в дровере — весь квартал.
  const ndsOpen = byUrgency(data.nds.filter((p) => !isPaid(p.id)))
  const ndsDue = ndsOpen.filter((p) => p.state !== 'process')

  const employeesOpen = byUrgency(data.employees.filter((p) => !isPaid(p.id)))
  const employeesGroup: PayGroup =
    employeesOpen.length > 0
      ? {
          key: 'employees',
          title: groupTitle('Сотрудники', employeesOpen),
          items: employeesOpen,
          ...splitTotals(employeesOpen),
          payable: true,
        }
      : { key: 'employees', title: 'Сотрудники', items: [], total: 0, payable: false, done: true }

  const groups: PayGroup[] = [
    taxesGroup,
    ...(ndsOpen.length > 0
      ? [
          {
            key: 'nds',
            title: groupTitle('НДС: III квартал', ndsOpen),
            items: ndsOpen,
            // Сумма на карточке — только то, что пора платить сейчас (текущая доля квартала).
            total: sum(ndsDue.length > 0 ? ndsDue : ndsOpen),
            payable: ndsDue.length > 0,
          } as PayGroup,
        ]
      : []),
    employeesGroup,
  ]

  // Клик по ячейке: если в группе один платёж и его уже можно уплатить — сразу на страницу
  // уплаты; иначе (несколько платежей или предварительный расчёт) — дровер раздела с
  // вкладками «К уплате / Выполнено».
  const onGroup = (g: PayGroup) => () => {
    if (g.items.length === 1 && g.items[0].state !== 'process') {
      navigate(payTo(g.items[0].id))
      return
    }
    setOpenGroup(g)
  }

  const drawerProps = openGroup && {
    title: openGroup.title,
    items: openGroup.items,
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

      {/* Две плитки: «Задачи» (в работе у бухгалтера) и «Бухучёт» (все выполненные
          платежи по налогам и взносам) — макет 971-15104. */}
      <div className="av__cards">
        <div data-coach="tasks" className="av__card-cell">
          <SectionCard
            icon={ClipboardCheck}
            title="Задачи"
            note={`${TASKS_IN_PROGRESS.toLocaleString('ru-RU')} в работе у бухгалтера`}
            onClick={() => navigate(ROUTES.reports)}
          />
        </div>
        <div className="av__card-cell">
          <SectionCard
            icon={FileText}
            title="Бухучёт"
            note="Доходы и расходы"
            onClick={() => navigate(ROUTES.accounting)}
          />
        </div>
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
