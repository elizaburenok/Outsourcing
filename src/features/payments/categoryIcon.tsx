import { HeartPulse, Landmark, Users, Coins, Percent, type LucideIcon } from 'lucide-react'
import type { PayCategory } from '@/data/august'
import './payment-row.css'

type Tone = 'brand' | 'error' | 'success' | 'neutral'

/** Иконка и тон кружка по категории платежа — общий источник для всех списков операций. */
export const CATEGORY: Record<PayCategory, { icon: LucideIcon; tone: Tone }> = {
  ndfl: { icon: Landmark, tone: 'brand' },
  travma: { icon: HeartPulse, tone: 'error' },
  salary: { icon: Users, tone: 'success' },
  vznos: { icon: Coins, tone: 'brand' },
  usn: { icon: Percent, tone: 'brand' },
}

/** Кружок-категория. `muted` — приглушённый нейтральный вид (напр. состояние «в процессе»). */
export function PayIcon({ category, muted = false }: { category: PayCategory; muted?: boolean }) {
  const { icon: Icon, tone } = CATEGORY[category]
  return (
    <span className={`pay-icon pay-icon--${muted ? 'neutral' : tone}`}>
      <Icon size={20} strokeWidth={2} />
    </span>
  )
}
