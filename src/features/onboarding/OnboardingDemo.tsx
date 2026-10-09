import { useState } from 'react'
import { Check, CirclePlus, Info, TriangleAlert } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { CellRightAccessory } from '@ds/components/CellRightAccessory'
import PageAction from '@ds/components/PageAction'
import Card from '@/components/ui/Card'
import './OnboardingDemo.css'

type Task = 'signature' | 'marketplaces' | 'banks' | 'vat'
export type OnboardingPage = 'home' | Task | 'wildberries'

const BASE_TASKS: { id: Task; label: string }[] = [
  { id: 'signature', label: 'Добавьте подпись' },
  { id: 'marketplaces', label: 'Подключите маркетплейсы' },
  { id: 'banks', label: 'Настройте интеграции с другими банками' },
]
const MARKETPLACES = ['Wildberries', 'Ozon', 'Яндекс Маркет', 'Магнит Маркет']
const MARKETPLACE_ICONS = ['wildberries', 'ozon', 'yandex', 'magnit']
const BANKS = ['Сбербанк', 'Альфа-Банк', 'Т-Банк', 'Банк Открытие', 'Модульбанк']
const BANK_ICONS = ['sber', 'alfa', 'tbank', 'otkritie', 'modul']

export default function OnboardingDemo({ withVat, page, onPageChange }: {
  withVat: boolean
  page: OnboardingPage
  onPageChange: (page: OnboardingPage) => void
}) {
  const tasks = withVat ? [...BASE_TASKS, { id: 'vat' as Task, label: 'Настройте НДС' }] : BASE_TASKS
  const [signatureDrawerOpen, setSignatureDrawerOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [done, setDone] = useState<Task[]>([])
  const [marketplace, setMarketplace] = useState('')
  const [wildberriesDate, setWildberriesDate] = useState('01.01.2025')
  const [wildberriesConfigured, setWildberriesConfigured] = useState(false)
  const [bank, setBank] = useState('')
  const [consent, setConsent] = useState(false)
  const completed = tasks.filter((task) => done.includes(task.id)).length

  function finish(task: Task) {
    setDone((current) => current.includes(task) ? current : [...current, task])
    setSignatureDrawerOpen(false)
    onPageChange('home')
  }

  return <div className={page === 'home' ? 'od od--home' : 'od od--subpage'}>
    {page === 'home' && <>
      {!onboardingDismissed && <div className="od__card">
        <div className="od__card-intro">
          <div><h2>Настройте банк для себя</h2><p>Простые действия, которые сделают работу удобнее</p></div>
          <div className="od__progress" aria-label={`Выполнено ${completed} из ${tasks.length}`}>
            <span className="od__track"><span style={{ width: `${Math.max(10, completed / tasks.length * 100)}%` }} /></span>
            <span>{completed} из {tasks.length}</span>
            <img className="od__progress-icon" src="/onboarding/progress-icon.svg" alt="" width="24" height="24" />
          </div>
          <img className="od__settings-art" src="/onboarding/settings.svg" alt="" width="210" height="240" />
        </div>
        <div className="od__card-tasks">
          {tasks.map((task) => <button className="od__card-task" type="button" key={task.id} onClick={() => onPageChange(task.id)}>
            <span className={done.includes(task.id) ? 'od__task-status od__task-status--done' : 'od__task-status'}>{done.includes(task.id) ? <Check size={17} /> : <img src="/onboarding/task-plus.svg" alt="" width="24" height="24" />}</span>
            <span>{task.label}</span>
          </button>)}
          <button className="od__card-dismiss" type="button" aria-label="Скрыть настройку банка" onClick={() => setOnboardingDismissed(true)}><img src="/onboarding/task-close.svg" alt="" width="20" height="20" /></button>
        </div>
      </div>}

      <Card className="od__payments"><h2>Платежи</h2><p>Текущих платежей нет</p></Card>

      <div className="od__links">
        <PageAction title="Налогообложение" description="УСН «Доходы» — 6%" iconLeft={<img src="/onboarding/tax.svg" alt="" width="30" height="30" />} />
        <PageAction title="Доверенность" description={done.includes('signature') ? 'Доверенность выпущена' : 'Добавьте подпись'} iconLeft={<img src="/onboarding/pen.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('signature')} />
        <PageAction title="Маркетплейсы" description={done.includes('marketplaces') ? marketplace : 'Не подключено'} iconLeft={<img src="/onboarding/basket.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('marketplaces')} />
        <PageAction title="Интеграции" description={done.includes('banks') ? bank : 'Подключите банк'} iconLeft={<img src="/onboarding/integration.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('banks')} />
        <PageAction title="Тариф" description="Бухгалтерское обслуживание для ООО" iconLeft={<img src="/onboarding/tariff.svg" alt="" width="30" height="30" />} />
      </div>
    </>}

    {page === 'signature' && <div className="od__screen">
      <p className="od__screen-intro">Добавьте электронную подпись для обмена документами с госорганами. Она юридически равна подписи на бумаге.</p>
      <Card className="od__signature-card">
        <h2>Мои подписи</h2>
        <button type="button" className="od__add-signature" onClick={() => setSignatureDrawerOpen(true)}><CirclePlus size={24} />Добавить подпись</button>
      </Card>
      <div className="od__screen-actions">
        <PageAction title="Автоматическая сдача отчётности" description="Сейчас отправляете вручную в ФНС и СФР" iconLeft={<img src="/onboarding/report-auto.svg" alt="" width="30" height="30" />} />
        <PageAction title="Автонастройка компьютера" description="Подготовим компьютер и проверим работу электронной подписи" iconLeft={<img src="/onboarding/laptop.svg" alt="" width="30" height="30" />} />
      </div>
    </div>}

    {page === 'marketplaces' && <div className="od__screen od__screen--marketplaces">
      <div className="od__info"><img src="/onboarding/information-filled.svg" alt="" width="18" height="18" /><span>Подключите ваши маркетплейсы и загрузите отчёты, чтобы мы правильно учли операции по ним и корректно посчитали налог</span></div>
      <div className="od__marketplaces-list">
        <p className="od__marketplaces-heading">Не подключено</p>
        <div className="od__marketplaces-rows">{MARKETPLACES.map((name, index) => <button type="button" className="od__marketplace" key={name} aria-pressed={marketplace === name} onClick={() => { if (name === 'Wildberries') { setMarketplace(''); onPageChange('wildberries') } else setMarketplace(name) }}><img src={`/onboarding/${MARKETPLACE_ICONS[index]}.svg`} alt="" width="40" height="40" /><span>{name}</span></button>)}</div>
        <button className="od__help" type="button"><img src="/onboarding/question-circle.svg" alt="" width="30" height="30" />Как работает сервис</button>
      </div>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" disabled={!marketplace} onClick={() => finish('marketplaces')}>Подключить</button></div>
    </div>}

    {page === 'wildberries' && <div className="od__screen od__screen--wildberries">
      <Cell className="od__wb-intro" textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title={<><span>Настройте интеграцию, чтобы мы автоматически получали отчёты и учитывали их в подсчёте налогов.</span><span>Укажите дату, с которой Точка будет учитывать доходы от продаж на маркетплейсе.</span></>} />
      <div className="od__wb-inputs">
        <Card className="od__wb-card">
          <h2>Автозагрузка отчётов</h2>
          <button className="od__wb-action" type="button" onClick={() => setWildberriesConfigured(true)}><CirclePlus size={24} strokeWidth={1.5} /><span>{wildberriesConfigured ? 'Интеграция настроена' : 'Настроить интеграцию'}</span></button>
        </Card>
        <label className="od__wb-date"><span className="od__wb-date-label">Начало расчёта</span><span className="od__wb-date-control"><input type="text" inputMode="numeric" value={wildberriesDate} onChange={(event) => setWildberriesDate(event.target.value)} aria-label="Начало расчёта" /><img src="/onboarding/calendar.svg" alt="" width="24" height="24" /></span><span className="od__wb-date-help">С этой даты будем учитывать доходы от продаж</span></label>
      </div>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" onClick={() => { setMarketplace('Wildberries'); finish('marketplaces') }}>Подключить</button></div>
    </div>}

    {page === 'banks' && <div className="od__screen od__screen--banks">
      <h2>Подключить банк</h2>
      <Cell className="od__bank-intro" textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title="Выберите один банк, с которым хотите настроить интеграцию" />
      <div className="od__bank-cells" role="radiogroup" aria-label="Выберите банк">{BANKS.map((name, index) => <div className="od__bank-cell" key={name}><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={name} leftAccessory={<img src={`/onboarding/${BANK_ICONS[index]}.svg`} alt="" width="44" height="44" />} rightAccessory={<CellRightAccessory kind="Radio" checked={bank === name} ariaLabel={name} onCheckedChange={() => setBank(name)} />} /></div>)}</div>
      <div className="od__bank-consent"><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={<><span className="od__bank-consent-link">Соглашаюсь</span> на передачу данных, составляющих банковскую тайну</>} description="Согласие нужно нам для работы с вашими данными. Они не выйдут за пределы Точки." rightAccessory={<CellRightAccessory kind="Checkbox" checked={consent} ariaLabel="Согласие на передачу данных" onCheckedChange={setConsent} />} /></div>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" disabled={!bank || !consent} onClick={() => finish('banks')}>Подключить</button></div>
    </div>}

    {page === 'vat' && <div className="od__screen">
      <h2>Настройте НДС</h2><p>Передайте бухгалтеру сведения о ставке НДС и операциях, чтобы он проверил настройки учёта.</p>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" onClick={() => finish('vat')}>Данные переданы</button></div>
    </div>}

    <Drawer open={signatureDrawerOpen} onClose={() => setSignatureDrawerOpen(false)} side="right" className="od__drawer" aria-label="Доверенность ФНС">
      <DrawerHeader onClose={() => setSignatureDrawerOpen(false)}>Доверенность ФНС</DrawerHeader>
      <div className="od__body od__signature">
        <img src="/onboarding/hand-heart.png" alt="" width="120" height="120" />
        <h2>Отправка документов с любых гаджетов в налоговую</h2>
        <p>Достаточно выпустить доверенность на АО «Точка». Новые возможности:</p>
        <ul><li>Подписывайте декларацию и уведомления по ЕНП, документы и письма в налоговую смс-кодом — всё без электронной подписи.</li><li>По вашему желанию возьмём всё на себя: будем отправлять декларацию по УСН, уведомление по ЕНП в налоговую.</li></ul>
        <p>Предупредим не позже, чем за 7 дней до отправки, чтобы вы всё проверили и отредактировали по необходимости.</p>
        <div className="od__notice"><TriangleAlert size={19} color="#E9B43E" /><div><strong>Обратите внимание</strong><p>Мы отправим декларацию за тот год и уведомление в ФНС за тот квартал, в котором вы подключили услугу. Отчитаться за более ранний период нужно самостоятельно.</p></div></div>
      </div>
      <DrawerFooter primaryAction={{ label: done.includes('signature') ? 'Готово' : 'Выпустить доверенность', onClick: () => finish('signature') }} />
    </Drawer>
  </div>
}
