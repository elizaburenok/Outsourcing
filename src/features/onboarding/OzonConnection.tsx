import { publicAsset } from '@/lib/publicAsset'
import { useEffect, useRef, useState } from 'react'
import { CirclePlus, Clock, Trash2 } from 'lucide-react'
import { TextField } from '@ds/components/TextField'
import { ContextualNotification } from '@ds/components/ContextualNotification'
import { FlowResultModal } from '@ds/components/FlowResultModal'
import './WildberriesConnection.css'
import './OzonConnection.css'

export type OzonStore = { id: number; name: string; clientId: string; apiKey: string }

export default function OzonConnection({ onStart, onDone, initialStores, details = false, onSave }: { onStart: (stores: OzonStore[], date: string) => void; onDone: () => void; initialStores?: OzonStore[]; details?: boolean; onSave?: (stores: OzonStore[]) => void }) {
  const [stores, setStores] = useState<OzonStore[]>(initialStores ?? [{ id: 0, name: '', clientId: '', apiKey: '' }])
  const [nextId, setNextId] = useState(Math.max(...stores.map((store) => store.id)) + 1)
  const updateStore = (id: number, field: 'name' | 'clientId' | 'apiKey', value: string) => setStores((current) => current.map((store) => store.id === id ? { ...store, [field]: value } : store))
  const [date, setDate] = useState('2026-01-01')
  const [editingDate, setEditingDate] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

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
    <form className="od__screen wb ozon" noValidate onSubmit={(event) => {
      event.preventDefault()
      setAttempted(true)
      if (!submitted && stores.every((store) => store.name.trim() && store.clientId.trim() && store.apiKey.trim()) && (details || date)) { if (details) onSave?.(stores); else { setSubmitted(true); onStart(stores, date) } }
    }}>
      <p>Добавьте токен Client ID и API Key для доступа к вашему магазину на Ozon, чтобы мы автоматически загружали отчёты маркетплейса через API</p>
      {stores.map((store, index) => <div className="ozon__inputs" key={store.id}>
        {stores.length > 1 && <div className="ozon__store-heading"><strong>{['Первый', 'Второй', 'Третий', 'Четвёртый', 'Пятый'][index] ?? `${index + 1}-й`} магазин</strong>{index > 0 && <button type="button" aria-label={`Удалить магазин ${index + 1}`} onClick={() => setStores((current) => current.filter((item) => item.id !== store.id))}><Trash2 size={24} /></button>}</div>}
        <div className="wb__token"><TextField className="wb__field" label="Название магазина" placeholder="Например, цветы для дома" name={`storeName-${store.id}`} value={store.name} onChange={(event) => updateStore(store.id, 'name', event.target.value)} errorMessage={attempted && !store.name.trim() ? 'Укажите название магазина' : undefined} required autoComplete="off" /></div>
        <div className="wb__token">
          <TextField className="wb__field" label="Client ID" placeholder="Вставьте токен" name={`clientId-${store.id}`} value={store.clientId} onChange={(event) => updateStore(store.id, 'clientId', event.target.value)} errorMessage={attempted && !store.clientId.trim() ? 'Укажите Client ID' : undefined} required autoComplete="off" spellCheck={false} />
          {!(attempted && !store.clientId.trim()) && <details className="wb__help">
            <summary>Как получить API-ключ и Client ID</summary>
            <p>В кабинете продавца Ozon откройте «Настройки» → «API-ключи». Скопируйте Client ID и создайте API-ключ для доступа к отчётам. Вставьте полученные данные в форму.</p>
          </details>}
        </div>
        <div className="wb__token"><TextField className="wb__field" label="API Key" placeholder="Вставьте токен" name={`apiKey-${store.id}`} value={store.apiKey} onChange={(event) => updateStore(store.id, 'apiKey', event.target.value)} errorMessage={attempted && !store.apiKey.trim() ? 'Укажите API Key' : undefined} required autoComplete="off" spellCheck={false} /></div>
      </div>)}
      <button className="ozon__add-store" type="button" onClick={() => { setStores((current) => [...current, { id: nextId, name: '', clientId: '', apiKey: '' }]); setNextId((id) => id + 1) }}><CirclePlus size={24} strokeWidth={2} /> Добавить ещё один магазин</button>
      {!details && <ContextualNotification className="wb__notice" icon={<img src={publicAsset('/onboarding/information-filled.svg')} alt="" width="20" height="20" />} action={{ label: editingDate ? 'Скрыть дату' : 'Изменить дату', onClick: () => setEditingDate((value) => !value) }}>
        <p>Пересчитаем все операции от маркетплейса с {date ? date.split('-').reverse().join('.') : '…'}, чтобы корректно учесть в расчётах. Если первые продажи случились позже, ничего делать не нужно. А если хотите отчитаться за прошлый год или добавляли комиссию вручную — отредактируйте дату.</p>
      </ContextualNotification>}
      {!details && editingDate && <div className="wb__token"><TextField className="wb__field" label="Начало расчёта" name="startDate" type="date" value={date} errorMessage={attempted && !date ? 'Укажите дату начала расчёта' : undefined} required onChange={(event) => setDate(event.target.value)} /></div>}
      <div className="od__page-footer wb__footer"><button className="od__screen-cta" type="submit">{details ? 'Сохранить' : 'Подключить'}</button></div>
    </form>
    {submitted && <div className="wb__result" ref={resultRef}>
      <FlowResultModal tone="brand" icon={<Clock size={24} strokeWidth={2} />} title="Скоро подключим маркетплейс" primaryLabel="Готово" onPrimary={onDone}>
        <p>Ежемесячные отчёты из Ozon будут автоматически загружаться в Бухгалтерию, чтобы мы считали ваши налоги с учётом комиссии маркетплейса</p>
      </FlowResultModal>
    </div>}
  </>
}
