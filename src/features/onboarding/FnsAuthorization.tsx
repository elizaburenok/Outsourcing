import { useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { CellRightAccessory } from '@ds/components/CellRightAccessory'
import './FnsAuthorization.css'

type InfoModal = 'powers' | 'autoSend' | null

const POWERS = [
  'Представлять налоговую декларацию, другую отчётность',
  'Получать документы от налоговой, в том числе о постановке на учёт и снятии',
  'Представлять, получать и подписывать документы по применению специальных налоговых режимов, налогу на игорный бизнес',
  'Подписывать и представлять документы, заявление на зачёт и возврат налога',
  'Подписывать и представлять запрос и согласие налогоплательщика на представление сведений из налоговой',
]
const SFR_POWERS = [
  'Подписывать и представлять отчётность в Социальный фонд',
  'Получать документы от Социального фонда',
  'Получать информацию о больничных и пособиях от Социального фонда',
]

function Details({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <section className="fns__details">
    <button type="button" className="fns__disclosure" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {title}<ChevronDown size={18} className={open ? 'fns__chevron fns__chevron--open' : 'fns__chevron'} aria-hidden="true" />
    </button>
    {open && <div className="fns__details-body">{children}</div>}
  </section>
}

function Datum({ label, children }: { label: string; children: ReactNode }) {
  return <div className="fns__datum"><span>{label}</span><strong>{children}</strong></div>
}

export default function FnsAuthorization({ onDone, variant = 'fns' }: { onDone: () => void; variant?: 'fns' | 'sfr' }) {
  const isSfr = variant === 'sfr'
  const [autoSend, setAutoSend] = useState(true)
  const [signingConsent, setSigningConsent] = useState(false)
  const [showError, setShowError] = useState(false)
  const [modal, setModal] = useState<InfoModal>(null)

  function sign() {
    if (!signingConsent) {
      setShowError(true)
      return
    }
    onDone()
  }

  return <div className="fns">
    <div className="fns__content">
      <header className="fns__intro">
        <h1>{isSfr ? 'Для Социального фонда' : 'Для налоговой'}</h1>
        <Cell textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title="Мы составили доверенность на АО «Точка». Ознакомьтесь с ней и подпишите электронной подписью." />
      </header>

      <section className="fns__section" aria-labelledby={`${variant}-powers-title`}>
        <h2 id={`${variant}-powers-title`}>Полномочия</h2>
        <div className="fns__bullets">
          {isSfr ? <Cell textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title={<>Подписание и отправка отчётов в Социальный фонд — <button className="fns__inline-link" type="button" onClick={() => setModal('powers')}>полные полномочия</button></>} /> : <>
            <Cell textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" layoutVariant="bullet" title={<>Представлять интересы налогоплательщика в отношениях с налоговыми органами — <button className="fns__inline-link" type="button" onClick={() => setModal('powers')}>полные полномочия</button></>} />
            <Cell textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" layoutVariant="bullet" title="Предоставлять статистическую отчётность в органы Росстата" />
          </>}
        </div>
      </section>

      <section className="fns__section" aria-labelledby={`${variant}-term-title`}>
        <h2 id={`${variant}-term-title`}>Срок доверенности</h2>
        <Cell textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title="С 16 июля 2024 по 1 декабря 2028 года" />
      </section>

      <Details title="Подписант">
        <h3>Тот, кто подпишет доверенность и его паспорт</h3>
        <Datum label="Наименование">ИП Михайлов Владимир Николаевич</Datum>
        <div className="fns__data-grid"><Datum label="ИНН">644 876 984 984</Datum><Datum label="СНИЛС">647-890-874 87</Datum><Datum label="ОГРН">1117 7463 5860 800</Datum></div>
        <h3>Паспорт подписанта</h3>
        <Datum label="ФИО">Михайлов Владимир Николаевич</Datum>
        <Datum label="Дата рождения">08.01.1981</Datum>
        <Datum label="Выдан">УМВД России по Липецкой области</Datum>
        <div className="fns__data-grid"><Datum label="Серия и номер">18 89 183891</Datum><Datum label="Дата выдачи">07.12.2020</Datum><Datum label="Код подразделения">891-375</Datum></div>
      </Details>

      <Details title="Представитель">
        <h3>Тот, на кого будет выпущена доверенность</h3>
        <Datum label="Наименование представителя">АО «Точка»</Datum>
        <div className="fns__data-grid"><Datum label="ИНН">9705 1208 64</Datum><Datum label="КПП">770 401 001</Datum><Datum label="ОГРН">1187 7466 3714 3</Datum></div>
      </Details>

      <div className="fns__consents">
        {!isSfr && <div className="fns__consent"><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={<>Соглашаюсь на то, чтобы АО «Точка» <button type="button" className="fns__inline-link" onClick={() => setModal('autoSend')}>отправляло за меня</button> отчётность в налоговую</>} rightAccessory={<CellRightAccessory kind="Checkbox" checked={autoSend} ariaLabel="Согласие на отправку отчётности" onCheckedChange={setAutoSend} />} /></div>}
        <div className={showError && !signingConsent ? 'fns__consent fns__consent--error' : 'fns__consent'}><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={`Соглашаюсь на подписание моих документов электронной подписью АО «Точка» для отправки в ${isSfr ? 'Социальный фонд' : 'налоговую'}`} rightAccessory={<CellRightAccessory kind="Checkbox" checked={signingConsent} ariaLabel="Согласие на подписание документов" onCheckedChange={(checked) => { setSigningConsent(checked); if (checked) setShowError(false) }} />} />{showError && !signingConsent && <p className="fns__error" role="alert">Дайте согласие, чтобы продолжить</p>}</div>
      </div>
    </div>
    <div className="fns__footer"><button className="od__screen-cta" type="button" onClick={sign}>Подписать</button></div>

    {modal && <div className="fns__modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
      <section className="fns__modal" role="dialog" aria-modal="true" aria-label={modal === 'powers' ? 'Полные полномочия' : 'Автотправка'}>
        <button type="button" className="fns__modal-close" aria-label="Закрыть" onClick={() => setModal(null)}><X size={24} /></button>
        {modal === 'powers' ? <><h2>Полные полномочия</h2><ul>{(isSfr ? SFR_POWERS : POWERS).map((power) => <li key={power}>{power}</li>)}</ul></> : <><h2>Будем подписывать и отправлять документы за вас</h2><p>Уведомим перед отправкой декларации по УСН, уведомлений по ЕНП и других документов в налоговую, чтобы вы всё проверили и отредактировали по необходимости.</p><p>Беспокоиться о сроках не придётся — мы всё сделаем вовремя, убережём от штрафов и блокировки счёта. А ещё уведомим о каждом принятом или отправленном документе.</p><p>Обратите внимание: отправленные документы будут подписаны АО «Точка».</p></>}
      </section>
    </div>}
  </div>
}
