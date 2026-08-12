import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import { PayIcon, PayIconPending } from '@/features/august/PaymentRow'
import { nearestDue, pluralTaxes, type PayGroup } from './groups'

/** Иконка группы: просрочка — треугольник-ошибка; УСН — лого налога (с часами, если считается);
 *  сотрудники — аватар. */
function GroupIcon({ group }: { group: PayGroup }) {
  if (group.key === 'overdue')
    return (
      <span className="pay-icon pay-icon--error">
        <AlertTriangle size={20} strokeWidth={2} />
      </span>
    )
  if (group.key === 'usn') {
    const usn = group.items[0]
    return usn.state === 'process' ? <PayIconPending category="usn" /> : <PayIcon category="usn" />
  }
  // Сотрудники — единый аватар вне зависимости от состава.
  return <PayIcon category="salary" />
}

/** Подпись группы. */
function groupNote(group: PayGroup): ReactNode {
  if (group.key === 'overdue')
    return (
      <span className="pay-note pay-note--overdue">
        Уплатите как можно скорее — начисляются пени
      </span>
    )
  if (group.key === 'usn') {
    const usn = group.items[0]
    return (
      <span className="pay-note">
        {usn.state === 'process' ? 'Рассчитаем' : 'Уплатить'} до {usn.dueLabel}
      </span>
    )
  }
  const due = nearestDue(group.items)
  return (
    <span className="pay-note">
      {pluralTaxes(group.items.length)}
      {due ? ` · до ${due}` : ''}
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
        showAmount ? <span className="pay-amount">{formatMoney(group.total)}</span> : undefined
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
