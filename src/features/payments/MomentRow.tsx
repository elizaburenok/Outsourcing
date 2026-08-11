import { useState } from 'react'
import { Cell } from '@ds/components/Cell'
import Badge from '@/components/ui/Badge'
import { formatMoney } from '@/lib/format'
import type { PaymentItem, Urgency, PayStatus } from '@/data/quarter'
import './MomentRow.css'

/** Состояние платёжного момента. `pending` — сумма ещё не посчитана (без числа). */
export type MomentState = 'paid' | 'due' | 'pending'

/** Минимальная форма момента, достаточная для строки (совместима с PaymentMoment). */
export type MomentLike = {
  id: string
  day: number
  monthShort: string
  items: PaymentItem[]
  paid?: boolean
  urgency?: Urgency
  status?: PayStatus
}

type Tone = 'done' | 'soon' | 'overdue' | 'future' | 'pending'

const sumItems = (items: PaymentItem[]) => items.reduce((s, it) => s + it.amount, 0)

/** Медальон даты слева от платёжного момента. */
export function DateMedallion({
  day,
  monthShort,
  tone,
}: {
  day: number
  monthShort: string
  tone: Tone
}) {
  return (
    <span className={`medallion medallion--${tone}`}>
      <span className="medallion__day">{day}</span>
      <span className="medallion__month">{monthShort}</span>
    </span>
  )
}

/**
 * Строка платёжного момента (общая для всех горизонтов и сценариев).
 * Бандл (несколько платежей к одному сроку) раскрывается по клику.
 *
 * `state` управляет подачей: если не передан — старое поведение (по moment.paid/status);
 * если передан — показываем ровно «оплачено / к уплате / ещё не посчитана».
 */
export default function MomentRow({
  moment,
  isNext,
  state,
  pendingLabel,
}: {
  moment: MomentLike
  isNext: boolean
  state?: MomentState
  pendingLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const bundle = moment.items.length > 1
  const only = moment.items[0]

  // Итоговое состояние: явное (сценарий) либо вывод из данных (старые экраны).
  const resolved: MomentState = state ?? (moment.paid ? 'paid' : 'due')
  const isSoftDefault = !state && !moment.paid && moment.status === 'preliminary'

  // Тон медальона
  let tone: Tone
  if (resolved === 'paid') tone = 'done'
  else if (resolved === 'pending') tone = 'pending'
  else if (moment.urgency === 'overdue') tone = 'overdue'
  else if (state) tone = isNext ? 'soon' : 'future'
  else tone = moment.urgency === 'soon' ? 'soon' : 'future'

  const total = sumItems(moment.items)
  const amountTone = isSoftDefault ? 'amount--soft' : 'amount--strong'

  const title = bundle ? `${moment.items.length} платежа к сроку` : only.title
  const description = bundle ? (
    moment.items.map((it) => it.title).join(' · ')
  ) : (
    <>
      {only.basis}
      {!only.viaEnp && <span className="sfr-tag"> · в СФР, мимо ЕНП</span>}
    </>
  )

  const right = (
    <span className="moment-right">
      {resolved === 'pending' ? (
        <Badge tone="neutral">Рассчитаем{pendingLabel ? ` к ${pendingLabel}` : ' к сроку'}</Badge>
      ) : (
        <>
          <span className={`amount ${resolved === 'paid' ? 'amount--done' : amountTone}`}>
            {formatMoney(total)}
          </span>
          {resolved === 'paid' ? (
            <Badge tone="muted">Оплачено</Badge>
          ) : isNext ? (
            <Badge tone="brand">Ближайший срок</Badge>
          ) : null}
        </>
      )}
    </span>
  )

  return (
    <div className={`moment ${resolved === 'paid' ? 'moment--done' : ''}`}>
      <button
        type="button"
        className="moment__head"
        onClick={bundle ? () => setOpen((v) => !v) : undefined}
        data-static={bundle ? undefined : 'true'}
      >
        <Cell
          textScale="M"
          verticalSpacing="compact"
          title={
            <span className="moment__title">
              {title}
              {bundle && (
                <span className={`caret ${open ? 'caret--open' : ''}`} aria-hidden>
                  ⌄
                </span>
              )}
            </span>
          }
          description={<span className="moment__sub">{description}</span>}
          leftAccessory={<DateMedallion day={moment.day} monthShort={moment.monthShort} tone={tone} />}
          rightAccessory={right}
        />
      </button>

      {bundle && open && (
        <ul className="moment__items">
          {moment.items.map((it) => (
            <li key={it.id} className="moment__item">
              <span className="moment__item-name">
                {it.title}
                <span className="moment__item-basis"> {it.basis}</span>
                {!it.viaEnp && <span className="sfr-tag"> · в СФР</span>}
              </span>
              <span className="moment__item-amount">
                {resolved === 'pending' ? '—' : formatMoney(it.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
