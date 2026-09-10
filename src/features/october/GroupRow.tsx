import type { ReactNode } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import { pluralPayments } from '@/data/august'
import { PayIcon } from '@/features/august/PaymentRow'
import type { AugustPayment } from '@/data/august'
import { nearestDue, type PayGroup } from './groups'

/**
 * Подпись «N платёж/платежа просрочен(ы), срок вышел …» — когда среди платежей группы
 * есть просроченные, но не все (примешаны к предстоящим/ещё не готовым). Общий паттерн
 * для НДС и УСН (макет 894-96775): красным, счётчик — по просроченным, дата — по первому
 * из них (отсортированы overdue → due/process).
 */
function overdueMixNote(items: AugustPayment[]): ReactNode | undefined {
  if (items.length < 2) return undefined
  const overdueItems = items.filter((p) => p.state === 'overdue')
  if (overdueItems.length === 0) return undefined
  const count = pluralPayments(overdueItems.length)
  const verb = overdueItems.length === 1 ? 'просрочен' : 'просрочены'
  const date = overdueItems[0].dueLabel
  return (
    <span className="pay-note pay-note--overdue">
      {count} {verb}
      {date ? `, срок вышел ${date}` : ''}
    </span>
  )
}

/** Иконка группы: просрочка — треугольник-ошибка; УСН/НДС — лого налога; сотрудники — аватар. */
function GroupIcon({ group }: { group: PayGroup }) {
  if (group.key === 'overdue')
    return (
      <span className="pay-icon pay-icon--error">
        <AlertTriangle size={20} strokeWidth={2} />
      </span>
    )
  if (group.key === 'usn') return <PayIcon category="usn" />
  if (group.key === 'nds') return <PayIcon category="nds" />
  // Сотрудники — единый аватар вне зависимости от состава.
  return <PayIcon category="salary" />
}

/** Подпись группы. */
function groupNote(group: PayGroup): ReactNode {
  if (group.done)
    return <span className="pay-note pay-note--done">Всё уплачено, ничего делать не нужно</span>
  if (group.key === 'overdue')
    return <span className="pay-note pay-note--overdue">Уплатите как можно скорее</span>
  if (group.key === 'usn') {
    const mix = overdueMixNote(group.items)
    if (mix) return mix
    const usn = group.items[0]
    if (usn.preliminary) return <span className="pay-note">Пока платить не нужно</span>
    // Ещё не готов, но известна дата начала окна оплаты — «С 20 октября» (макет 407-47908).
    if (usn.state === 'process' && usn.payFromLabel)
      return <span className="pay-note">С {usn.payFromLabel}</span>
    return (
      <span className="pay-note">
        {usn.state === 'process' ? 'Рассчитаем' : 'Уплатить'} до {usn.dueLabel}
      </span>
    )
  }
  if (group.key === 'nds') {
    // Несколько платежей, среди них есть просроченный — называем сколько и с какого
    // срока просрочка (макет 894-96775), красным. Остальные случаи — один платёж или
    // все в срок — просто ближайшая дата.
    const mix = overdueMixNote(group.items)
    if (mix) return mix
    // Номер платежа — в заголовке группы; во второй строке — только срок.
    const due = nearestDue(group.items)
    return <span className="pay-note">{due ? `До ${due}` : ''}</span>
  }
  const due = nearestDue(group.items)
  // «Сотрудники» — единый блок зарплатных начислений: считаем «платежи» (взносы, НДФЛ,
  // зарплата — всё это платежи по сотруднику), независимо от состава.
  const count = pluralPayments(group.items.length)
  return (
    <span className="pay-note">
      {count}
      {due ? ` с ${due}` : ''}
    </span>
  )
}

/**
 * Строка-сводка группы для варианта «Блоки». Кликабельна, если задан `onClick`
 * (родитель решает: одна строка → уплата, несколько → дровер, УСН в процессе → без клика).
 */
export default function GroupRow({
  group,
  onClick,
}: {
  group: PayGroup
  onClick?: () => void
}) {
  // Сумму не показываем, если группа полностью уплачена (done) или УСН ещё считается (process) —
  // кроме кейса 2, где даже в `process` показываем предварительную сумму с подписью снизу.
  const usnProcessing = group.key === 'usn' && group.items[0].state === 'process'
  // Ещё не готов, но окно оплаты известно (`payFromLabel`): сумма + подпись «Пока рано».
  const usnEarly = usnProcessing && !group.items[0].preliminary && !!group.items[0].payFromLabel
  const rightAccessory = group.done ? (
    <Check size={20} strokeWidth={2.25} className="pay-check" />
  ) : usnProcessing && group.items[0].preliminary ? (
    <span className="pay-amount-col">
      <span className="pay-amount">{formatMoney(group.total)}</span>
      <span className="pay-amount-caption">Предварительно</span>
    </span>
  ) : usnEarly ? (
    <span className="pay-amount-col">
      <span className="pay-amount">{formatMoney(group.total)}</span>
      <span className="pay-amount-caption">Пока рано</span>
    </span>
  ) : usnProcessing ? (
    <span className="pay-amount pay-amount--done">В процессе</span>
  ) : (
    <span className="pay-amount">{formatMoney(group.total)}</span>
  )
  const cell = (
    <Cell
      textScale="M"
      verticalSpacing="compact"
      title={<span className="pay-title">{group.title}</span>}
      description={groupNote(group)}
      leftAccessory={<GroupIcon group={group} />}
      rightAccessory={rightAccessory}
    />
  )

  if (!onClick) return cell
  return (
    <button type="button" className="pay-row-btn" onClick={onClick}>
      {cell}
    </button>
  )
}
