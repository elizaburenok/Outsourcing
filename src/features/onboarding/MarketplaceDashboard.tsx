import { useState } from 'react'
import { CalendarDays, ChevronRight, FileText, KeyRound, Power } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { TextField } from '@ds/components/TextField'
import PageAction from '@ds/components/PageAction'
import './MarketplaceDashboard.css'

const groups = [
  { month: 'Сентябрь', rows: [['3 — 9 сентября', '312 417,45 ₽']] },
  { month: 'Август', rows: [['27 августа — 2 сентября', '780 618,89 ₽'], ['20 — 26 августа', '564 710 ₽'], ['13 — 19 августа', '312 417,45 ₽'], ['6 — 12 августа', '780 618,89 ₽']] },
  { month: 'Июль', rows: [['30 июля — 5 августа', '564 710 ₽'], ['23 — 29 июля', '312 417,45 ₽']] },
  { month: 'Июнь', rows: [['30 июня — 5 июля', '564 710 ₽'], ['23 — 29 июня', '312 417,45 ₽']] },
]
const reportIcon = <span className="mp__report-icon"><FileText size={24} /></span>

export function MarketplaceReports() {
  return <div className="od__screen mp mp--reports">{groups.map(({ month, rows }) => <section className="mp__month" key={month}><h2>{month}</h2>{rows.map(([title, amount]) => <Cell key={title} title={title} description={amount} textScale="L" verticalSpacing="none" edgePadding="off" leftAccessory={reportIcon} />)}</section>)}</div>
}

export default function MarketplaceDashboard({ name, date, onReports, onStore, onDateChange, onDisconnect }: {
  name: string; date: string; onReports: () => void; onStore: () => void; onDateChange: (date: string) => void; onDisconnect: () => void
}) {
  const [editingDate, setEditingDate] = useState(false)
  const [draftDate, setDraftDate] = useState(date)
  return <div className="od__screen mp">
    <p>Автоматически учитываем ваши доходы с маркетплейса и считаем налоги с учётом комиссии площадки</p>
    <section className="mp__navigator" aria-label="Отчёты">
      <button type="button" className="mp__heading" onClick={onReports}>Отчёты <ChevronRight size={16} /></button>
      <div className="mp__preview">{groups.slice(0, 3).map(({ month, rows }) => <Cell key={month} title={month} description={rows[0][1]} textScale="M" verticalSpacing="default" edgePadding="off" leftAccessory={reportIcon} />)}</div>
      <button type="button" className="mp__show-all" onClick={onReports}>Показать все</button>
    </section>
    <div className="mp__actions">
      <PageAction title={`Магазин на ${name}`} description="Добавленный токен" iconLeft={<KeyRound size={30} />} onClick={onStore} />
      <PageAction title="Учёт дохода по отчётам" description={`С ${date.split('-').reverse().join('.')}`} iconLeft={<CalendarDays size={30} />} onClick={() => setEditingDate((value) => !value)} />
      {editingDate && <form className="mp__date" onSubmit={(event) => { event.preventDefault(); if (draftDate) { onDateChange(draftDate); setEditingDate(false) } }}><TextField label="Начало расчёта" type="date" value={draftDate} required onChange={(event) => setDraftDate(event.target.value)} /><button className="od__screen-cta" type="submit">Сохранить</button></form>}
      <PageAction className="mp__disconnect" title="Отключить" description="Не учитывать доход с маркетплейса" iconLeft={<Power size={30} />} onClick={onDisconnect} />
    </div>
  </div>
}
