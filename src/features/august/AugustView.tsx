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
import { Chip } from '@ds/components/Chip'
import { Cell } from '@ds/components/Cell'
import PageAction from '@ds/components/PageAction'
import Card from '@/components/ui/Card'
import AccountantTasks from '@/features/accountant/AccountantTasks'
import { formatMoney } from '@/lib/format'
import {
  AUGUST_PAYMENTS,
  pluralPayments,
  usnPayment,
  type AugustPayment,
  type Snapshot,
} from '@/data/august'
import PaymentRow from './PaymentRow'
import OverdueDrawer from './OverdueDrawer'
import './AugustView.css'

type Tab = 'topay' | 'done'

/**
 * Все просроченные платежи — одной строкой-триггером. Клик открывает дровер справа
 * со списком (что именно просрочено), а не раскрывает аккордеон внутри списка.
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

export default function AugustView() {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [tab, setTab] = useState<Tab>('topay')
  const [snapshot, setSnapshot] = useState<Snapshot>('mid')
  const [overdueOpen, setOverdueOpen] = useState(false)
  const usn = usnPayment(snapshot)

  // Платёж «сделан», если он был оплачен изначально или уплачен в этой сессии.
  const isDone = (p: AugustPayment) => p.state === 'paid' || isPaid(p.id)
  // Помечаем строку оплаченной «сегодня» (для уплаченных в сессии).
  const asPaid = (p: AugustPayment): AugustPayment =>
    p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' }

  const overdue = AUGUST_PAYMENTS.filter((p) => p.state === 'overdue' && !isPaid(p.id))
  const upcoming = AUGUST_PAYMENTS.filter((p) => p.state === 'due' && !isPaid(p.id))
  const done = AUGUST_PAYMENTS.filter(isDone)
  const usnDone = isPaid(usn.id)

  const openPay = (id: string) => () => navigate(payTo(id))

  // Порядок «К уплате»: все просроченные — одной свёрнутой строкой; затем аванс УСН
  // (высокий приоритет — второй строкой), но только когда сумма уже посчитана —
  // пока квартал не закрыт (state 'process'), показывать нечего, это не прогноз;
  // затем ближайшие сроки. Строки (кроме стопки просрочки) ведут на страницу уплаты.
  type Row = { key: string; node: ReactNode; quarter?: boolean }
  const rows: Row[] = []
  if (tab === 'topay') {
    if (overdue.length > 0)
      rows.push({
        key: 'overdue',
        node: <OverdueRow items={overdue} onOpen={() => setOverdueOpen(true)} />,
      })
    if (usn.state !== 'process' && !usnDone)
      rows.push({
        key: usn.id,
        node: <PaymentRow payment={usn} onClick={openPay(usn.id)} />,
        quarter: true,
      })
    upcoming.forEach((p) =>
      rows.push({ key: p.id, node: <PaymentRow payment={p} onClick={openPay(p.id)} /> }),
    )
  } else {
    done.forEach((p) => rows.push({ key: p.id, node: <PaymentRow payment={asPaid(p)} /> }))
    if (usnDone)
      rows.push({ key: usn.id, node: <PaymentRow payment={asPaid(usn)} />, quarter: true })
  }

  // Цифра сверху не зависит от вкладки — всегда «сколько осталось уплатить» (с учётом
  // уже уплаченных в этой сессии).
  const heroAmount = AUGUST_PAYMENTS.filter((p) => !isDone(p)).reduce((sum, p) => sum + p.amount, 0)
  const heroLabel = 'Осталось уплатить в августе'

  return (
    <div className="av">
      {/* Хедер — крупная сумма активной вкладки */}
      <header className="av__header">
        <p className="av__amount">{formatMoney(heroAmount)}</p>
        <p className="av__amount-label">{heroLabel}</p>
      </header>

      {/* Вкладки: К уплате / Готово (Tabs Carousel) */}
      <Tabs
        className="av__tabs"
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        items={[
          { id: 'topay', label: 'К уплате' },
          { id: 'done', label: 'Выполнено' },
        ]}
      />

      {/* Единый список платежей — без разбивки по месяцам. Якорь коуча «уплата налога»
          (обёртка div, т.к. коуч ищет data-coach на «сыром» элементе). */}
      <div data-coach="pay">
        <Card className="av__list">
          {rows.map((r) => (
            <div key={r.key} className={`av__row ${r.quarter ? 'av__row--quarter' : ''}`}>
              {r.node}
            </div>
          ))}
          {rows.length === 0 && <p className="av__empty">Пока ничего нет.</p>}
        </Card>
      </div>

      {/* Переход к истории — все операции за прошлые месяцы. Показываем во вкладке «Готово». */}
      {tab === 'done' && (
        <PageAction
          title="Все операции за прошлые месяцы"
          description="Июль, июнь, май и раньше"
          iconLeft={<History size={20} strokeWidth={1.75} />}
          onClick={() => navigate(ROUTES.history)}
        />
      )}

      {/* Плитки разделов */}
      <div className="av__cards">
        <AccountantTasks />
        <SectionCard icon={History} title="Операции" onClick={() => navigate(ROUTES.history)} />
        <SectionCard icon={Receipt} title="ЕНС" note="Заявка принята" />
        <SectionCard icon={Users} title="Сотрудники" note="1 сотрудник" />
      </div>

      {/* Ссылки-разделы */}
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

      {/* Просроченные платежи — в дровере справа */}
      <OverdueDrawer open={overdueOpen} items={overdue} onClose={() => setOverdueOpen(false)} />

      {/* Служебный тумблер прототипа (не элемент продукта) — переключает снимок квартала:
          середина квартала (аванс УСН считается) / квартал закрыт (посчитан). Вынесен в
          угол экрана, чтобы не читаться как часть интерфейса. */}
      <div className="av__snapshot">
        <span className="av__snapshot-label">Снимок квартала</span>
        <div className="av__snapshot-tabs">
          <Chip chipType="Tab" isSelected={snapshot === 'mid'} onClick={() => setSnapshot('mid')}>
            Середина квартала
          </Chip>
          <Chip chipType="Tab" isSelected={snapshot === 'closed'} onClick={() => setSnapshot('closed')}>
            Квартал закрыт
          </Chip>
        </div>
      </div>
    </div>
  )
}
