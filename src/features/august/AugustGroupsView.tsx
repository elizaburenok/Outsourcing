import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { Tabs } from '@ds/components/Tabs'
import PageAction from '@ds/components/PageAction'
import { Button } from '@ds/components/Button'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import SectionCard from '@/features/october/SectionCard'
import { countWaiting } from '@/data/reports'
import {
  AUGUST_PAYMENTS,
  pluralPayments,
  usnPayment,
  type AugustPayment,
  type Snapshot,
} from '@/data/august'
import PaymentRow from './PaymentRow'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import { augustBlockGroups, type PayGroup } from '@/features/october/groups'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import '@/features/august/AugustView.css'

type Tab = 'topay' | 'done'

/**
 * Сценарий «24 августа», самый полный вариант: ООО на УСН «Доходы» + НДС 5%, один
 * сотрудник (директор). Налоги к уплате свёрнуты в группы (просрочено / УСН / НДС /
 * сотрудники) — тот же паттерн «Блоки», что и в октябрьском сценарии
 * (`OctoberGroupsView`), но на данных `AUGUST_PAYMENTS`: взносы с зарплатой за июль
 * просрочены; налог по УСН за 9 месяцев виден отдельной строкой всегда (пока квартал не
 * закрыт — «в процессе», без клика); к уплате — аванс сотруднику, страховые взносы,
 * НДФЛ, 1-й платёж НДС за II квартал и окончательный расчёт по зарплате за август.
 */
export default function AugustGroupsView() {
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

  const groups = augustBlockGroups(isPaid, snapshot)
  // Уплаченные в этой сессии — первыми (самый новый выше), остальные — в исходном порядке.
  const done = AUGUST_PAYMENTS.filter(isDone).sort((a, b) => {
    const ai = paidOrder.indexOf(a.id)
    const bi = paidOrder.indexOf(b.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  // Клик по группе: один налог — сразу уплата; несколько — дровер. «Сотрудники» всегда через
  // дровер (даже с одним платежом) — клиент может уплатить прямо оттуда или открыть платёж
  // подробнее.
  const onGroup = (g: PayGroup) => {
    if (!g.payable) return undefined
    if (g.key !== 'employees' && g.items.length === 1) return () => navigate(payTo(g.items[0].id))
    return () => setOpenGroup(g)
  }

  // Параметры дровера зависят от группы (актуально для «Просрочено» — там несколько строк).
  const drawerProps = openGroup && {
    title:
      openGroup.key === 'overdue'
        ? `${pluralPayments(openGroup.items.length)} просрочено`
        : openGroup.title,
    totalLabel: 'Общая сумма к уплате',
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
            note="Под контролем у бухгалтера"
            badge={countWaiting()}
            onClick={() => navigate(ROUTES.reports)}
          />
        </div>
      </div>

      <div className="av__links">
        <PageAction
          title="Налогообложение и патенты"
          description="УСН «Доходы» 6% + НДС 5%"
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
        <PageAction
          title="Тариф"
          description={TARIFF_NAME}
          iconLeft={<RequisitesTIcon />}
        />
      </div>

      {drawerProps && (
        <GroupDrawer open onClose={() => setOpenGroup(null)} {...drawerProps} />
      )}
    </div>
  )
}
