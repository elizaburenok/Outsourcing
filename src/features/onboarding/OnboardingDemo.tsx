import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Info, Plus, TriangleAlert } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { CellRightAccessory } from '@ds/components/CellRightAccessory'
import PageAction from '@ds/components/PageAction'
import Card from '@/components/ui/Card'
import CreateTaskDrawer from '@/features/case2/CreateTaskDrawer'
import { CreateTaskButton, TasksEntry } from '@/features/clientTasks/TasksEntry'
import { useClientTasks } from '@/state/ClientTasksProvider'
import { ROUTES } from '@/routes'
import WildberriesConnection from './WildberriesConnection'
import FnsAuthorization from './FnsAuthorization'
import OzonConnection, { type OzonStore } from './OzonConnection'
import MarketplaceDashboard, { MarketplaceReports } from './MarketplaceDashboard'
import './OnboardingDemo.css'

type Task = 'signature' | 'sfr' | 'marketplaces' | 'banks' | 'vat'
export type OnboardingPage = 'home' | Task | 'authorizations' | 'wildberries' | 'ozon' | 'bank-connect' | 'wildberries-details' | 'ozon-details' | 'wildberries-dashboard' | 'ozon-dashboard' | 'wildberries-reports' | 'ozon-reports'

const BASE_TASKS: { id: Task; label: string }[] = [
  { id: 'signature', label: 'Выпустите доверенность для ФНС' },
  { id: 'sfr', label: 'Выпустите доверенность в СФР' },
  { id: 'marketplaces', label: 'Подключите маркетплейсы' },
  { id: 'banks', label: 'Настройте интеграции с другими банками' },
]
const SUGGESTED_MARKETPLACES = [
  { name: 'Ozon', icon: 'ozon' },
  { name: 'Wildberries', icon: 'wildberries' },
]
const BANKS = ['Сбербанк', 'Альфа-Банк', 'Т-Банк', 'Банк Открытие', 'Модульбанк']
const BANK_ICONS = ['sber', 'alfa', 'tbank', 'otkritie', 'modul']
const isDemoConnectionError = (value: string) => value.trim().toLowerCase() === 'error'

export default function OnboardingDemo({ withVat, page, onPageChange }: {
  withVat: boolean
  page: OnboardingPage
  onPageChange: (page: OnboardingPage) => void
}) {
  const navigate = useNavigate()
  const { createTask } = useClientTasks()
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
  const tasks = withVat ? [...BASE_TASKS, { id: 'vat' as Task, label: 'Настройте НДС' }] : BASE_TASKS
  const [signatureDrawerOpen, setSignatureDrawerOpen] = useState(false)
  const [sfrDrawerOpen, setSfrDrawerOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [done, setDone] = useState<Task[]>([])
  const [connectingMarketplaces, setConnectingMarketplaces] = useState<string[]>([])
  const [connectedMarketplaces, setConnectedMarketplaces] = useState<string[]>([])
  const [failedMarketplaces, setFailedMarketplaces] = useState<string[]>([])
  const [marketplaceDates, setMarketplaceDates] = useState<Record<string, string>>({ Wildberries: '2026-01-01', Ozon: '2026-01-01' })
  const [wildberriesToken, setWildberriesToken] = useState('')
  const [ozonStores, setOzonStores] = useState<OzonStore[]>([])
  const marketplaceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  useEffect(() => () => { marketplaceTimers.current.forEach(clearTimeout) }, [])
  const [bank, setBank] = useState('')
  const [connectedBanks, setConnectedBanks] = useState<{ name: string; date: string }[]>([])
  const [consent, setConsent] = useState(false)
  const [bankSubmitted, setBankSubmitted] = useState(false)
  const bankError = bankSubmitted && !bank
  const consentError = bankSubmitted && !consent
  const marketplaceTaskDone = connectedMarketplaces.length > 0 && failedMarketplaces.length === 0
  const isTaskDone = (task: Task) => task === 'marketplaces' ? marketplaceTaskDone : done.includes(task)
  const completed = tasks.filter((task) => isTaskDone(task.id)).length
  const issuedAuthorizations = [done.includes('signature') && 'ФНС', done.includes('sfr') && 'СФР'].filter((name): name is string => Boolean(name))

  function finish(task: Task) {
    setDone((current) => current.includes(task) ? current : [...current, task])
    setSignatureDrawerOpen(false)
    setSfrDrawerOpen(false)
    onPageChange('home')
  }

  function startMarketplace(name: string, connectionFailed: boolean) {
    if (marketplaceTimers.current.has(name) || connectedMarketplaces.includes(name)) return
    setConnectingMarketplaces((current) => current.includes(name) ? current : [...current, name])
    marketplaceTimers.current.set(name, setTimeout(() => {
      setConnectingMarketplaces((current) => current.filter((item) => item !== name))
      if (connectionFailed) {
        setFailedMarketplaces((current) => current.includes(name) ? current : [...current, name])
      } else {
        setConnectedMarketplaces((current) => current.includes(name) ? current : [...current, name])
        setFailedMarketplaces((current) => current.filter((item) => item !== name))
      }
      marketplaceTimers.current.delete(name)
    }, 10_000))
  }

  function openBankForm() {
    setBank('')
    setConsent(false)
    setBankSubmitted(false)
    onPageChange('bank-connect')
  }

  function connectBank() {
    setBankSubmitted(true)
    if (!bank || !consent) return
    setConnectedBanks((current) => current.some((item) => item.name === bank) ? current : [...current, { name: bank, date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(new Date()) }])
    setDone((current) => current.includes('banks') ? current : [...current, 'banks'])
    setBankSubmitted(false)
    onPageChange('banks')
  }

  function finishMarketplace() {
    onPageChange('home')
  }

  return <div className={page === 'home' ? 'od od--home' : 'od od--subpage'}>
    {page === 'home' && <>
      <CreateTaskButton onClick={() => setTaskDrawerOpen(true)} />
      {failedMarketplaces.map((name) => <button className="od__connection-error" type="button" key={name} onClick={() => onPageChange(name === 'Wildberries' ? 'wildberries' : 'ozon')}><strong>Не смогли подключить {name}</strong><span>Проверьте корректность данных и попробуйте ещё раз</span></button>)}
      {!onboardingDismissed && <div className="od__card">
        <div className="od__card-intro">
          <div><h2>Настройте банк для себя</h2><p>Простые действия, которые сделают работу удобнее</p></div>
          <div className="od__progress" aria-label={`Выполнено ${completed} из ${tasks.length}`}>
            <span className="od__track"><span style={{ width: `${Math.max(10, completed / tasks.length * 100)}%` }} /></span>
            <span>{completed} из {tasks.length}</span>
            <img className="od__progress-icon" src="/onboarding/progress-icon.svg" alt="" width="24" height="24" />
          </div>
        </div>
        <div className="od__card-tasks">
          {tasks.map((task) => <button className="od__card-task" type="button" key={task.id} onClick={() => task.id === 'signature' ? setSignatureDrawerOpen(true) : task.id === 'sfr' ? setSfrDrawerOpen(true) : onPageChange(task.id)}>
            <span className={isTaskDone(task.id) ? 'od__task-status od__task-status--done' : 'od__task-status'}>{isTaskDone(task.id) ? <Check size={15} strokeWidth={2} /> : <img src="/onboarding/task-plus.svg" alt="" width="24" height="24" />}</span>
            <span className={isTaskDone(task.id) ? 'od__task-label--done' : undefined}>{task.label}</span>
          </button>)}
          <button className="od__card-dismiss" type="button" aria-label="Скрыть настройку банка" onClick={() => setOnboardingDismissed(true)}><img src="/onboarding/task-close.svg" alt="" width="20" height="20" /></button>
        </div>
      </div>}

      <Card className="od__payments"><h2>Платежи</h2><p>Текущих платежей нет</p></Card>
      <TasksEntry onClick={() => navigate(ROUTES.tasks)} />

      <div className="od__links">
        <PageAction title="Налогообложение" description="УСН «Доходы» — 6%" iconLeft={<img src="/onboarding/tax.svg" alt="" width="30" height="30" />} />
        <PageAction title="Доверенности" description={issuedAuthorizations.length ? issuedAuthorizations.join(', ') : 'Выпустите доверенность'} iconLeft={<img src="/onboarding/pen.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('authorizations')} />
        <PageAction title="Маркетплейсы" description={connectedMarketplaces.length ? connectedMarketplaces.join(', ') : 'Подключите маркетплейс'} iconLeft={<img src="/onboarding/basket.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('marketplaces')} />
        <PageAction title="Интеграции" description={connectedBanks.length ? connectedBanks.map((item) => item.name).join(', ') : 'Подключите банк'} iconLeft={<img src="/onboarding/integration.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('banks')} />
        {withVat && <PageAction title="НДС" description={done.includes('vat') ? 'Настроен' : 'Настройте НДС'} iconLeft={<img src="/onboarding/tax.svg" alt="" width="30" height="30" />} onClick={() => onPageChange('vat')} />}
        <PageAction title="Тариф" description="Бухгалтерское обслуживание для ООО" iconLeft={<img src="/onboarding/tariff.svg" alt="" width="30" height="30" />} />
      </div>
    </>}

    <CreateTaskDrawer open={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} onCreate={(title, description, attachments, kind) => { createTask(title, description, { topic: 'other', attachments, kind }) }} />

    {page === 'signature' && <FnsAuthorization onDone={() => finish('signature')} />}

    {page === 'sfr' && <FnsAuthorization variant="sfr" onDone={() => finish('sfr')} />}

    {page === 'authorizations' && <div className="od__screen od__screen--authorizations">
      <h2>Доверенности</h2>
      {([['signature', 'Для налоговой'], ['sfr', 'Для Социального фонда']] as const).map(([id, title]) => done.includes(id)
        ? <Cell key={id} textScale="L" verticalSpacing="none" edgePadding="off" title={title} description="Доверенность выпущена" leftAccessory={<img src="/onboarding/pen.svg" alt="" width="30" height="30" />} />
        : <button className="od__authorization-action" type="button" key={id} onClick={() => id === 'signature' ? setSignatureDrawerOpen(true) : setSfrDrawerOpen(true)}><Cell textScale="L" verticalSpacing="none" edgePadding="off" title={title} description="Выпустить доверенность" leftAccessory={<img src="/onboarding/pen.svg" alt="" width="30" height="30" />} /></button>)}
    </div>}

    {page === 'marketplaces' && <div className="od__screen od__screen--marketplaces">
      <div className="od__marketplaces-list">
        <div className="od__marketplaces-rows">{SUGGESTED_MARKETPLACES.map(({ name, icon }) => {
          const connected = connectedMarketplaces.includes(name)
          const connecting = connectingMarketplaces.includes(name)
          const failed = failedMarketplaces.includes(name)
          return <button type="button" className="od__marketplace" key={name} disabled={connecting} onClick={() => onPageChange(name === 'Wildberries' ? connected ? 'wildberries-dashboard' : 'wildberries' : connected ? 'ozon-dashboard' : 'ozon')}><img src={`/onboarding/${icon}.svg`} alt="" width="40" height="40" /><span className="od__marketplace-text"><span>{name}</span>{(connecting || connected || failed) && <span className="od__marketplace-status">{connecting ? 'Подключаем' : connected ? 'Подключён' : 'Ошибка подключения'}</span>}</span></button>
        })}</div>
        <button className="od__help" type="button"><img src="/onboarding/question-circle.svg" alt="" width="30" height="30" />Для чего нужны маркетплейсы?</button>
      </div>
    </div>}

    {page === 'wildberries' && <WildberriesConnection onStart={(token, date) => { setMarketplaceDates((current) => ({ ...current, Wildberries: date })); setWildberriesToken(token); startMarketplace('Wildberries', isDemoConnectionError(token)) }} onDone={finishMarketplace} />}
    {page === 'ozon' && <OzonConnection onStart={(stores, date) => { setMarketplaceDates((current) => ({ ...current, Ozon: date })); setOzonStores(stores); startMarketplace('Ozon', stores.some((store) => isDemoConnectionError(store.apiKey))) }} onDone={finishMarketplace} />}

    {(page === 'wildberries-dashboard' || page === 'ozon-dashboard') && (() => {
      const name = page === 'wildberries-dashboard' ? 'Wildberries' : 'Ozon'
      const prefix = name === 'Wildberries' ? 'wildberries' : 'ozon'
      return <MarketplaceDashboard key={name} name={name} date={marketplaceDates[name]} onStore={() => onPageChange(`${prefix}-details`)} onReports={() => onPageChange(`${prefix}-reports`)} onDateChange={(date) => setMarketplaceDates((current) => ({ ...current, [name]: date }))} onDisconnect={() => {
        const remaining = connectedMarketplaces.filter((item) => item !== name)
        setConnectedMarketplaces(remaining)
        onPageChange('marketplaces')
      }} />
    })()}
    {(page === 'wildberries-reports' || page === 'ozon-reports') && <MarketplaceReports />}

    {page === 'wildberries-details' && <WildberriesConnection details initialToken={wildberriesToken} onStart={() => {}} onDone={() => onPageChange('wildberries-dashboard')} onSave={(token) => { setWildberriesToken(token); onPageChange('wildberries-dashboard') }} />}
    {page === 'ozon-details' && <OzonConnection details initialStores={ozonStores} onStart={() => {}} onDone={() => onPageChange('ozon-dashboard')} onSave={(stores) => { setOzonStores(stores); onPageChange('ozon-dashboard') }} />}

    {page === 'banks' && connectedBanks.length > 0 && <div className="od__screen od__screen--connected-banks">
      <h2>Подключённые банки</h2>
      {connectedBanks.map(({ name, date }) => <Cell key={name} textScale="L" verticalSpacing="none" edgePadding="off" title={name} description={`Подключён ${date}`} leftAccessory={<img src={`/onboarding/${BANK_ICONS[BANKS.indexOf(name)]}.svg`} alt="" width="40" height="40" />} />)}
      {connectedBanks.length < BANKS.length && <button className="od__connect-bank" type="button" onClick={openBankForm}><Cell textScale="L" verticalSpacing="none" edgePadding="off" title={<span className="od__connect-bank-label">Подключить банк</span>} leftAccessory={<span className="od__connect-bank-icon"><Plus size={24} strokeWidth={2} aria-hidden="true" /></span>} /></button>}
    </div>}

    {(page === 'bank-connect' || (page === 'banks' && !connectedBanks.length)) && <div className="od__screen od__screen--banks">
      <h2>Подключить банк</h2>
      <Cell className="od__bank-intro" textScale="M" verticalSpacing="none" horizontalSpacing="off" edgePadding="off" title="Выберите один банк, с которым хотите настроить интеграцию" />
      <div className="od__bank-cells" role="radiogroup" aria-label="Выберите банк" aria-invalid={bankError} aria-describedby={bankError ? 'bank-selection-error' : undefined}>{BANKS.map((name, index) => connectedBanks.some((item) => item.name === name) ? null : <div className="od__bank-cell" key={name}><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={name} leftAccessory={<img src={`/onboarding/${BANK_ICONS[index]}.svg`} alt="" width="44" height="44" />} rightAccessory={<CellRightAccessory kind="Radio" checked={bank === name} ariaLabel={name} onCheckedChange={() => setBank(name)} />} /></div>)}{bankError && <div className="od__bank-error" id="bank-selection-error" role="alert">Выберите банк для подключения</div>}</div>
      <div className="od__bank-consent" role="group" aria-invalid={consentError} aria-describedby={consentError ? 'bank-consent-error' : undefined}><Cell textScale="M" verticalSpacing="none" edgePadding="off" title={<><span className="od__bank-consent-link">Соглашаюсь</span> на передачу данных, составляющих банковскую тайну</>} description="Согласие нужно нам для работы с вашими данными. Они не выйдут за пределы Точки." rightAccessory={<CellRightAccessory kind="Checkbox" checked={consent} ariaLabel="Согласие на передачу данных" onCheckedChange={setConsent} />} />{consentError && <div className="od__bank-error" id="bank-consent-error" role="alert">Необходимо подтвердить согласие</div>}</div>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" onClick={connectBank}>Подключить</button></div>
    </div>}

    {page === 'vat' && <div className="od__screen">
      <h2>Настройте НДС</h2><p>Передайте бухгалтеру сведения о ставке НДС и операциях, чтобы он проверил настройки учёта.</p>
      <div className="od__page-footer"><button className="od__screen-cta" type="button" onClick={() => finish('vat')}>Данные переданы</button></div>
    </div>}

    <Drawer open={signatureDrawerOpen} onClose={() => setSignatureDrawerOpen(false)} side="right" className="od__drawer" aria-label="Выпуск доверенности для ФНС">
      <DrawerHeader onClose={() => setSignatureDrawerOpen(false)} />
      <div className="od__body od__signature">
        <img src="/onboarding/hand-heart.png" alt="" width="120" height="120" />
        <h2>Отправка документов с любых гаджетов в налоговую</h2>
        <p>Достаточно выпустить доверенность на АО «Точка». Новые возможности:</p>
        <ul><li>Подписывайте декларацию и уведомления по ЕНП, документы и письма в налоговую смс-кодом — всё без электронной подписи.</li><li>По вашему желанию возьмём всё на себя: будем отправлять декларацию по УСН, уведомление по ЕНП в налоговую.</li></ul>
        <p>Предупредим не позже, чем за 7 дней до отправки, чтобы вы всё проверили и отредактировали по необходимости.</p>
        <div className="od__notice"><TriangleAlert size={19} color="#E9B43E" /><div><strong>Обратите внимание</strong><p>Мы отправим декларацию за тот год и уведомление в ФНС за тот квартал, в котором вы подключили услугу. Отчитаться за более ранний период нужно самостоятельно.</p></div></div>
      </div>
      <DrawerFooter primaryAction={{ label: 'Выпустить доверенность', onClick: () => { setSignatureDrawerOpen(false); onPageChange('signature') } }} />
    </Drawer>
    <Drawer open={sfrDrawerOpen} onClose={() => setSfrDrawerOpen(false)} side="right" className="od__drawer" aria-label="Выпуск доверенности в СФР">
      <DrawerHeader onClose={() => setSfrDrawerOpen(false)} />
      <div className="od__body od__signature">
        <img src="/onboarding/hand-heart.png" alt="" width="120" height="120" />
        <h2>Отправка документов с любых гаджетов в Социальный фонд</h2>
        <p>Достаточно выпустить доверенность на АО «Точка».</p>
        <p>Подписывайте кадровые отчёты в Социальный фонд смс-кодом — всё без электронной подписи.</p>
      </div>
      <DrawerFooter primaryAction={{ label: 'Выпустить доверенность', onClick: () => { setSfrDrawerOpen(false); onPageChange('sfr') } }} />
    </Drawer>
  </div>
}
