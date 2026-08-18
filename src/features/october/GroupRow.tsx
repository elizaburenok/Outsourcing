import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import { pluralPayments } from '@/data/august'
import { PayIcon } from '@/features/august/PaymentRow'
import { nearestDue, pluralTaxes, type PayGroup } from './groups'

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
  if (group.key === 'overdue')
    return <span className="pay-note pay-note--overdue">Закройте задолженности</span>
  if (group.key === 'usn') {
    const usn = group.items[0]
    return (
      <span className="pay-note">
        {usn.state === 'process' ? 'Рассчитаем' : 'Уплатить'} до {usn.dueLabel}
      </span>
    )
  }
  if (group.key === 'nds') {
    const due = nearestDue(group.items)
    return <span className="pay-note">{due ? `до ${due}` : ''}</span>
  }
  const due = nearestDue(group.items)
  // «Сотрудники»: если в группе есть зарплата (не налог) — считаем «платежи», не «налоги».
  const hasSalary = group.items.some((p) => p.category === 'salary')
  const count = hasSalary ? pluralPayments(group.items.length) : pluralTaxes(group.items.length)
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
  const showAmount = !(group.key === 'usn' && group.items[0].state === 'process')
  const cell = (
    <Cell
      textScale="M"
      verticalSpacing="compact"
      title={<span className="pay-title">{group.title}</span>}
      description={groupNote(group)}
      leftAccessory={<GroupIcon group={group} />}
      rightAccessory={
        showAmount ? (
          <span className="pay-amount">{formatMoney(group.total)}</span>
        ) : (
          <span className="pay-amount pay-amount--done">В процессе</span>
        )
      }
    />
  )

  if (!onClick) return cell
  return (
    <button type="button" className="pay-row-btn" onClick={onClick}>
      {cell}
    </button>
  )
}
