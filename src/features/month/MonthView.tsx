import { Button } from '@ds/components/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import MomentRow from '@/features/payments/MomentRow'
import { formatMoney } from '@/lib/format'
import {
  QUARTER,
  TODAY,
  monthByKey,
  summarizeMonth,
  daysUntilLabel,
  type MonthBlock,
} from '@/data/quarter'
import './MonthView.css'

function NextAction({ month, s }: { month: MonthBlock; s: ReturnType<typeof summarizeMonth> }) {
  if (!s.next || !s.nextId) return null
  const moment = month.moments.find((m) => m.id === s.nextId)!
  const when = daysUntilLabel(s.next.day)
  const names = moment.items.map((it) => it.title).join(' · ')

  return (
    <Card className="mv-next">
      <div className="mv-next__row">
        <div className="mv-next__info">
          <p className="mv-next__label">Ближайший платёж · {when}</p>
          <p className="mv-next__date">{s.next.dateLabel}</p>
          <p className="mv-next__names">{names}</p>
        </div>
        <div className="mv-next__money">
          <p className="mv-next__amount">{formatMoney(s.next.amount)}</p>
          <Button visualVariant="Primary">Открыть платёж</Button>
        </div>
      </div>
    </Card>
  )
}

export default function MonthView() {
  const month = monthByKey(QUARTER, TODAY.monthKey)
  if (!month) return null
  const s = summarizeMonth(month)
  const progressPct = Math.round((s.momentsPaid / s.momentsTotal) * 100)
  const firstUpcomingId = month.moments.find((m) => !m.paid)?.id

  return (
    <div className="mv">
      {/* Свод месяца — компактный, месяц меньше квартала */}
      <Card className="mv-summary">
        <div className="mv-summary__head">
          <div>
            <p className="mv-summary__title">{TODAY.monthTitle}</p>
            <p className="mv-summary__today">сегодня {TODAY.label}</p>
          </div>
          {s.overdueCount === 0 ? (
            <Badge tone="success">Просрочек нет</Badge>
          ) : (
            <Badge tone="error">Просрочено: {s.overdueCount}</Badge>
          )}
        </div>
        <div className="mv-summary__amount">
          <p className="mv-summary__label">Осталось уплатить в этом месяце</p>
          <p className="mv-summary__big">{formatMoney(s.remaining)}</p>
          <p className="mv-summary__context">
            из {formatMoney(s.totalDue)} · оплачено {formatMoney(s.paidAmount)}
          </p>
        </div>
        <div className="mv-summary__progress-track">
          <div className="mv-summary__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mv-summary__caption">{s.momentsPaid} из {s.momentsTotal} сроков закрыто</p>
      </Card>

      {/* Ближайшее действие — операционный фокус месяца */}
      <NextAction month={month} s={s} />

      {/* Таймлайн месяца с маркером «сегодня» */}
      <Card className="mv-timeline">
        {month.moments.map((m, i) => (
          <div key={m.id} className="mv-timeline__wrap">
            {m.id === firstUpcomingId && (
              <div className="mv-today">
                <span className="mv-today__line" />
                <span className="mv-today__label">Сегодня · {TODAY.label}</span>
                <span className="mv-today__line" />
              </div>
            )}
            {i > 0 && m.id !== firstUpcomingId && <div className="mv-timeline__divider" />}
            <MomentRow moment={m} isNext={m.id === s.nextId} />
          </div>
        ))}
      </Card>

      {/* Что делаем мы в этом месяце */}
      {month.weDo.length > 0 && (
        <div className="mv-wedo">
          <p className="mv-wedo__title">Что делаем мы за вас в этом месяце</p>
          <ul className="mv-wedo__list">
            {month.weDo.map((w) => (
              <li key={w.id} className="mv-wedo__item">
                <span className={`mv-dot ${w.done ? 'mv-dot--done' : 'mv-dot--progress'}`} aria-hidden />
                <span className="mv-wedo__text">
                  {w.title}
                  <span className="mv-wedo__note"> — {w.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
