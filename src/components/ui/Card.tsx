import type { HTMLAttributes } from 'react'
import './Card.css'

/** Белая карточка-контейнер на токенах DS (Widget из DS — статичный скаффолд). */
export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={'card' + (className ? ' ' + className : '')} {...rest} />
}
