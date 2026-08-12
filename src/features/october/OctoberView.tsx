import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Landmark,
  Users,
  AlertTriangle,
  History,
  Receipt,
  PenLine,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { Tabs } from '@ds/components/Tabs'
import { Cell } from '@ds/components/Cell'
import PageAction from '@ds/components/PageAction'
import { Button } from '@ds/components/Button'
import Card from '@/components/ui/Card'
import AccountantTasks from '@/features/accountant/AccountantTasks'
import { formatMoney } from '@/lib/format'
import { pluralPayments, type AugustPayment } from '@/data/august'
import { OCTOBER_PAYMENTS, octoberUsn } from '@/data/october'
import PaymentRow from '@/features/august/PaymentRow'
import OverdueDrawer from '@/features/august/OverdueDrawer'
import '@/features/august/AugustView.css'

type Tab = 'topay' | 'done'

/**
 * Все просроченные платежи — одной строкой-триггером (открывает дровер).
 * На 10 октября просрочек нет, но компонент оставлен для полноты сценария.
 */
function OverdueRow({ items, onOpen }: { items: AugustPayment[]; onOpen: () => void }) {
  const total = items.reduce((sum, p) => sum + p.amount, 0)
  return (
    <button type="button" className="av__overdue-head" onClick={onOpen}>
      <Cell
        textScale="M"
        verticalSpacing="compact"
        title={<span className="pay-title">{pluralPayments(items.length)} просрочено</span>}
        description={
          <span className="pay-note pay-note--overdue">
            Уплатите как можно скорее — начисляются пени
          </span>
        }
        leftAccessory={
          <span className="pay-icon pay-icon--error">
            <AlertTriangle size={20} strokeWidth={2} />
          </span>
        }
        rightAccessory={<span className="pay-amount">{formatMoney(total)}</span>}
      />
    </button>
  )
}

function SectionCard({
  icon: Icon,
  title,
  note,
  onClick,
}: {
  icon: LucideIcon
  title: string
  note?: string
  onClick?: () => void
}) {
  return (
    <Card
      className={`section-card ${onClick ? 'section-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="section-card__icon">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div className="section-card__text">
        <p className="section-card__title">{title}</p>
        {note && <p className="section-card__note">{note}</p>}
      </div>
    </Card>
  )
}

/**
 * Главная ОБ на 10 октября. Квартал закрыт (30 сентября), но точная сумма налога по УСН
 * ещё считается бухгалтером — она закреплена отдельной строкой-напоминанием (сразу под
 * просроченными) с бейджем-часами и подписью «за III квартал», без цифры. В шапке — просто
 * «Осталось уплатить», без привязки к месяцу.
 */
export default function OctoberView() {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [tab, setTab] = useState<Tab>('topay')
  const [overdueOpen, setOverdueOpen] = useState(false)
  const usn = octoberUsn()

  const isDone = (p: AugustPayment) => p.state === 'paid' || isPaid(p.id)
  const asPaid = (p: AugustPayment): AugustPayment =>
    p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' }

  const overdue = OCTOBER_PAYMENTS.filter((p) => p.state === 'overdue' && !isPaid(p.id))
  const upcoming = OCTOBER_PAYMENTS.filter((p) => p.state === 'due' && !isPaid(p.id))
  const done = OCTOBER_PAYMENTS.filter(isDone)

  const openPay = (id: string) => () => navigate(payTo(id))

  // Порядок «К уплате»: просрочка (если есть) — свёрнутой строкой; затем закреплённый
  // налог по УСН за III квартал (ещё считается — строка-напоминание с бейджем-часами,
  // без суммы, некликабельная); затем ближайшие твёрдые сроки.
  type Row = { key: string; node: ReactNode; quarter?: boolean }
  const rows: Row[] = []
  if (tab === 'topay') {
    if (overdue.length > 0)
      rows.push({
        key: 'overdue',
        node: <OverdueRow items={overdue} onOpen={() => setOverdueOpen(true)} />,
      })
    rows.push({
      key: usn.id,
      node: <PaymentRow payment={usn} />,
      quarter: true,
    })
    upcoming.forEach((p) =>
      rows.push({ key: p.id, node: <PaymentRow payment={p} onClick={openPay(p.id)} /> }),
    )
  } else {
    done.forEach((p) => rows.push({ key: p.id, node: <PaymentRow payment={asPaid(p)} /> }))
  }

  // Цифра сверху — только твёрдые суммы к уплате. Налог по УСН ещё считается (числа нет),
  // поэтому в сумму не входит: он живёт отдельной строкой-напоминанием, без цифры.
  const heroAmount = OCTOBER_PAYMENTS.filter((p) => !isDone(p)).reduce((sum, p) => sum + p.amount, 0)
  const heroLabel = 'Осталось уплатить'

  return (
    <div className="av">
      <header className="av__header">
        <p className="av__amount">{formatMoney(heroAmount)}</p>
        <p className="av__amount-label">{heroLabel}</p>
      </header>

      <Tabs
        className="av__tabs"
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        items={[
          { id: 'topay', label: 'К уплате' },
          { id: 'done', label: 'Выполнено' },
        ]}
      />

      {/* Якорь коуча онбординга «уплата налога» (обёртка div — коуч ищет data-coach). */}
      <div data-coach="pay">
        <Card className="av__list">
          {rows.map((r) => (
            <div key={r.key} className={`av__row ${r.quarter ? 'av__row--quarter' : ''}`}>
              {r.node}
            </div>
          ))}
          {rows.length === 0 && <p className="av__empty">Пока ничего нет.</p>}
          {tab === 'done' && (
            <div className="av__show-all">
              <Button
                visualVariant="Secondary"
                className="av__show-all-btn"
                onClick={() => navigate(ROUTES.history)}
              >
                Показать все
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="av__cards">
        <AccountantTasks />
        <SectionCard icon={History} title="Операции" onClick={() => navigate(ROUTES.history)} />
        <SectionCard icon={Receipt} title="ЕНС" note="Заявка принята" />
        <SectionCard icon={Users} title="Сотрудники" note="1 сотрудник" />
      </div>

      <div className="av__links">
        <PageAction
          title="Налогообложение и патенты"
          description="УСН «Доходы» — 6%"
          iconLeft={<Landmark size={20} strokeWidth={1.75} />}
        />
        <div data-coach="sign">
          <PageAction
            title="Электронная подпись"
            description="Действует до 01.08.2028"
            iconLeft={<PenLine size={20} strokeWidth={1.75} />}
          />
        </div>
        <PageAction
          title="Маркетплейсы"
          description="Wildberries, Ozon, Яндекс Маркет"
          iconLeft={<ShoppingBag size={20} strokeWidth={1.75} />}
        />
      </div>

      <OverdueDrawer open={overdueOpen} items={overdue} onClose={() => setOverdueOpen(false)} />
    </div>
  )
}
