import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Users } from 'lucide-react'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { Tabs } from '@ds/components/Tabs'
import PageAction from '@ds/components/PageAction'
import { Button } from '@ds/components/Button'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import SectionCard from '@/features/october/SectionCard'
import {
  AUGUST_PAYMENTS,
  pluralPayments,
  usnPayment,
  type AugustPayment,
  type Snapshot,
} from '@/data/august'
import PaymentRow from '@/features/august/PaymentRow'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import { augustBlockGroups, type PayGroup } from '@/features/october/groups'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import '@/features/august/AugustView.css'

type Tab = 'topay' | 'done'

/**
 * КЕЙС 2 (вариант «Блоки») — ООО на УСН «Доходы» 6% БЕЗ НДС, один сотрудник (директор).
 * Тот же паттерн «Блоки», что и `AugustGroupsView`, но под режим без НДС:
 *  - в виджете «К уплате» нет строки НДС; «Сотрудники» — два ближайших зарплатных платежа
 *    со сроком 28 августа (страховые взносы + НДФЛ, 28 600 ₽);
 *  - сетка карточек разделов: Отчётность («Ведёт бухгалтер»), Сотрудники («1 сотрудник»);
 *  - НДС скрыт и во вкладке «Выполнено».
 * Экран самодостаточный: данные берёт из `AUGUST_PAYMENTS`, показывается через демо-тумблер
 * (сценарий `case2`), не привязан к доменной модели Пульса.
 */
export default function Case2View() {
  const navigate = useNavigate()
  const { isPaid, paidOrder } = usePayments()
  const [tab, setTab] = useState<Tab>('topay')
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)
  const snapshot: Snapshot = 'mid'
  const usn = usnPayment(snapshot)
  const usnDone = isPaid(usn.id)

  const isDone = (p: AugustPayment) => p.state === 'paid' || isPaid(p.id)
  const asPaid = (p: AugustPayment): AugustPayment =>
    p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' }

  // Кейс 2 — режим без НДС: из общей раскладки убираем группу НДС, а «Сотрудники»
  // показываем как два ближайших зарплатных платежа со сроком 28 августа (страховые
  // взносы + НДФЛ, 28 600 ₽) — ровно как на согласованном скрине кейса 2.
  const EMPLOYEE_IDS = ['vznos-jul', 'ndfl-aug-1']
  const groups = augustBlockGroups(isPaid, snapshot, true)
    .filter((g) => g.key !== 'nds')
    .map((g) => {
      if (g.key !== 'employees') return g
      const items = AUGUST_PAYMENTS.filter((p) => EMPLOYEE_IDS.includes(p.id) && !isPaid(p.id))
      return items.length > 0
        ? { ...g, items, total: items.reduce((s, p) => s + p.amount, 0), payable: true, done: false }
        : { ...g, items: [], total: 0, payable: false, done: true }
    })

  // Уплаченные в этой сессии — первыми (самый новый выше), остальные — в исходном порядке.
  // НДС в кейсе 2 не показываем и во вкладке «Выполнено».
  const done = AUGUST_PAYMENTS.filter((p) => isDone(p) && p.category !== 'nds').sort((a, b) => {
    const ai = paidOrder.indexOf(a.id)
    const bi = paidOrder.indexOf(b.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  // Клик по группе: один налог — сразу уплата; несколько — дровер. «Сотрудники» всегда через
  // дровер (даже с одним платежом).
  const onGroup = (g: PayGroup) => {
    if (!g.payable) return undefined
    if (g.key !== 'employees' && g.items.length === 1) return () => navigate(payTo(g.items[0].id))
    return () => setOpenGroup(g)
  }

  const drawerProps = openGroup && {
    title:
      openGroup.key === 'overdue'
        ? `${pluralPayments(openGroup.items.length)} просрочено`
        : openGroup.title,
    totalLabel: 'Общая сумма',
    items: openGroup.items,
  }

  return (
    <div className="av">
      <div data-coach="pay">
        <Card className="av__list">
          <Tabs
            className="av__tabs"
            value={tab}
            onChange={(id) => setTab(id as Tab)}
            items={[
              { id: 'topay', label: 'К уплате' },
              { id: 'done', label: 'Выполнено' },
            ]}
          />

          {tab === 'topay' ? (
            groups.map((g) => (
              <div key={g.key} className="av__row">
                <GroupRow group={g} onClick={onGroup(g)} />
              </div>
            ))
          ) : (
            <>
              {done.slice(0, 3).map((p) => (
                <div key={p.id} className="av__row">
                  <PaymentRow payment={asPaid(p)} />
                </div>
              ))}
              {usnDone && (
                <div className="av__row av__row--quarter">
                  <PaymentRow payment={asPaid(usn)} />
                </div>
              )}
              {done.length === 0 && !usnDone && <p className="av__empty">Пока ничего нет.</p>}
              <div className="av__show-all">
                <Button
                  visualVariant="Secondary"
                  className="av__show-all-btn"
                  onClick={() => navigate(ROUTES.history)}
                >
                  Показать все
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="av__cards">
        <div data-coach="tasks" className="av__card-cell">
          <SectionCard
            icon={ClipboardCheck}
            title="Отчётность"
            note="Ведёт бухгалтер"
            onClick={() => navigate(ROUTES.reports)}
          />
        </div>
        <SectionCard icon={Users} title="Сотрудники" note="1 сотрудник" />
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
    </div>
  )
}
