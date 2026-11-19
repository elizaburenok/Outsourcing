import { publicAsset } from '@/lib/publicAsset'
import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { TextField } from '@ds/components/TextField'
import { ContextualNotification } from '@ds/components/ContextualNotification'
import { FlowResultModal } from '@ds/components/FlowResultModal'
import './WildberriesConnection.css'

export default function WildberriesConnection({ onStart, onDone, initialToken = '', details = false, onSave }: { onStart: (token: string, date: string) => void; onDone: () => void; initialToken?: string; details?: boolean; onSave?: (token: string) => void }) {
  const [token, setToken] = useState(initialToken)
  const [date, setDate] = useState('2026-01-01')
  const [editingDate, setEditingDate] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const formattedDate = date ? date.split('-').reverse().join('.') : '01.01.2026'

  useEffect(() => {
    if (!submitted) return
    const button = resultRef.current?.querySelector<HTMLButtonElement>('button')
    button?.focus()
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab') { event.preventDefault(); button?.focus() }
    }
    document.addEventListener('keydown', keepFocus)
    return () => document.removeEventListener('keydown', keepFocus)
  }, [submitted])

  return <>
    <form className="od__screen wb" noValidate onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (!submitted && token.trim() && (details || date)) { if (details) onSave?.(token.trim()); else { setSubmitted(true); onStart(token.trim(), date) } } }}>
      <div className="wb__intro">
        <p>Добавьте токен API категорий «Статистика», «Финансы» и «Документы» для доступа к вашему магазину на Wildberries, чтобы мы автоматически загружали отчёты маркетплейса через API.</p>
        <p>Срок действия токена — 6 месяцев, не забывайте его обновлять, чтобы автозагрузка работала.</p>
      </div>
      <div className="wb__token">
        <TextField className="wb__field" label="Токен API" placeholder="Вставьте токен" value={token} onChange={(event) => setToken(event.target.value)} errorMessage={attempted && !token.trim() ? 'Укажите токен API' : undefined} required autoComplete="off" spellCheck={false} />
        <details className="wb__help">
          <summary>Как получить</summary>
          <p>В личном кабинете продавца Wildberries откройте «Настройки» → «Доступ к API». Создайте токен с доступом к категориям «Статистика», «Финансы» и «Документы», скопируйте его и вставьте в поле выше.</p>
        </details>
      </div>
      {!details && <ContextualNotification className="wb__notice" icon={<img src={publicAsset('/onboarding/information-filled.svg')} alt="" width="20" height="20" />} action={{ label: editingDate ? 'Скрыть дату' : 'Изменить дату', onClick: () => setEditingDate((value) => !value) }}>
        <p>Пересчитаем все операции от маркетплейса с {formattedDate}, чтобы корректно учесть в расчётах. Если первые продажи случились позже, ничего делать не нужно. А если хотите отчитаться за прошлый год или добавляли комиссию вручную — отредактируйте дату.</p>
      </ContextualNotification>}
      {!details && editingDate && <TextField className="wb__date" label="Начало расчёта" type="date" value={date} errorMessage={attempted && !date ? 'Укажите дату начала расчёта' : undefined} required onChange={(event) => setDate(event.target.value)} />}
      <div className="od__page-footer wb__footer"><button className="od__screen-cta" type="submit">{details ? 'Сохранить' : 'Подключить'}</button></div>
    </form>
    {submitted && <div className="wb__result" ref={resultRef}>
      <FlowResultModal tone="brand" icon={<Clock size={24} strokeWidth={2} />} title="Скоро подключим маркетплейс" primaryLabel="Готово" onPrimary={() => { setToken(''); onDone() }}>
        <p>Ежемесячные отчёты из Wildberries будут автоматически загружаться в Бухгалтерию, чтобы мы считали ваши налоги с учётом комиссии маркетплейса</p>
      </FlowResultModal>
    </div>}
  </>
}
