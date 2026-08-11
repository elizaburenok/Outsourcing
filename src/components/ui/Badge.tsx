import type { ReactNode } from 'react'
import './Badge.css'

/**
 * Микро-бейдж статуса/пометки. В DS готового компонента-бейджа нет
 * (Widget/Navigator — статичные заглушки), поэтому собран строго на токенах DS,
 * без хардкода цветов и размеров. Тон повторяет бейджи из референсов Точки.
 */
export type BadgeTone = 'neutral' | 'brand' | 'success' | 'error' | 'muted'

export default function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
