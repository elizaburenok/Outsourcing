import { useState } from 'react'
import { CirclePlus, ShoppingBag } from 'lucide-react'
import { usePayments } from '@/state/PaymentsProvider'
import { HeaderButton } from '@ds/components/HeaderButton'
import PageAction from '@ds/components/PageAction'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import type { PayGroup } from '@/features/october/groups'
import type { AugustPayment, PayState } from '@/data/august'
import { CASE2, type ObCaseData } from '@/data/case2'
import { MCHD_COUNT, MARKETPLACES, INTEGRATIONS, TARIFF_NAME, marketplacesText, integrationsText } from '@/data/company'
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
 *  - список сущностей снизу — как на остальных экранах.
 * Данные — из `@/data/case2` (самодостаточно, не трогают `AUGUST_PAYMENTS`).
 */
export default function Case2View({ data = CASE2 }: { data?: ObCaseData }) {
  const { isPaid } = usePayments()
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)
  const [taskOpen, setTaskOpen] = useState(false)

  // Ячейки блока «Платежи»: Налоги и взносы → НДС → Сотрудники.
  // «Налоги и взносы» — общий домен собственных налогов ООО (УСН, имущественные и т.д.).
  // Сейчас в нём только готовый к уплате налог по УСН за III квартал.
  // Когда все налоги домена уплачены, строка не пропадает, а остаётся со статусом
  // «Оплачено» (как «Сотрудники») — клик по ней открывает дровер с вкладкой «Выполнено».
  const taxesOpen = byUrgency(data.taxes.filter((p) => !isPaid(p.id)))
  // Когда текущий налог уплачен, домен не гаснет в «Оплачено», а показывает следующий
  // предварительный расчёт (IV квартал, «Пока рано») — если он задан в данных кейса
  // (макет 1178-16236, экран «По УСН всё уплачено»).
  const taxesGroup: PayGroup =
    taxesOpen.length > 0
      ? {
          key: 'usn',
          title: groupTitle('Налоги и взносы', taxesOpen),
          items: taxesOpen,
          ...splitTotals(taxesOpen),
          payable: taxesOpen.some((p) => p.state !== 'process'),
        }
      : data.taxesUpcoming
        ? {
            key: 'usn',
            title: groupTitle('Налоги и взносы', [data.taxesUpcoming]),
            items: [data.taxesUpcoming],
            total: data.taxesUpcoming.amount,
            payable: false,
          }
        : { key: 'usn', title: 'Налоги и взносы', items: [], total: 0, payable: false, done: true }

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

  // Клик по любой ячейке (в т.ч. по одиночным УСН и НДС) сперва открывает дровер раздела
  // с вкладками «К уплате / Выполнено» — как в «Сотрудниках»; на страницу уплаты ведёт уже
  // строка внутри дровера (макет 1112-12994).
  const onGroup = (g: PayGroup) => () => setOpenGroup(g)

  // Закрытые платежи раздела для вкладки «Выполнено»: оплаченные в этой сессии помечаем
  // «Оплачено сегодня» (как в «Бухучёте»). Источник — полный список домена по ключу группы.
  const domainSource: Partial<Record<PayGroup['key'], AugustPayment[]>> = {
    usn: data.taxes,
    nds: data.nds,
    employees: data.employees,
  }
  const doneOf = (list: AugustPayment[]): AugustPayment[] =>
    list
      .filter((p) => p.state === 'paid' || isPaid(p.id))
      .map((p) => (p.state === 'paid' ? p : { ...p, state: 'paid' as PayState, paidLabel: 'сегодня' }))

  const drawerProps = openGroup && {
    title: openGroup.title,
    items: openGroup.items,
    doneItems: doneOf(domainSource[openGroup.key] ?? []),
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
          title="Маркетплейсы"
          description={marketplacesText(MARKETPLACES)}
          iconLeft={<ShoppingBag size={24} strokeWidth={1.5} />}
        />
        <PageAction
          title="Интеграции"
          description={integrationsText(INTEGRATIONS)}
          iconLeft={<IntegrationIcon />}
        />
        <PageAction title="Тариф" description={TARIFF_NAME} iconLeft={<RequisitesTIcon />} />
      </div>

      {drawerProps && <GroupDrawer open onClose={() => setOpenGroup(null)} {...drawerProps} />}
      <CreateTaskDrawer open={taskOpen} onClose={() => setTaskOpen(false)} />
    </div>
  )
}
