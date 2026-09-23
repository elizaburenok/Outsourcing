import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Tabs } from '@ds/components/Tabs'
import { formatMoney } from '@/lib/format'
import { payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { type AugustPayment, type PayCategory } from '@/data/august'
import PaymentRow from '@/features/august/PaymentRow'
import PaymentResultModal from '@/features/payment/PaymentResultModal'
import AccountSelectModal from '@/features/payment/AccountSelectModal'
import './GroupDrawer.css'

type DrawerTab = 'topay' | 'done'

/** Короткое имя раздела для шапки дровера — вместо полного названия платежа. */
const DOMAIN_LABEL: Record<PayCategory, string> = {
  usn: 'Налог по УСН',
  nds: 'НДС',
  ndfl: 'Сотрудники',
  travma: 'Сотрудники',
  salary: 'Сотрудники',
  vznos: 'Сотрудники',
}

/** Если все платежи из одного раздела — его короткое имя, иначе (смешанная группа,
 *  напр. «N просрочено») undefined и в шапке остаётся переданный `title`. */
function singleDomainLabel(items: AugustPayment[]): string | undefined {
  if (items.length === 0) return undefined
  const first = DOMAIN_LABEL[items[0].category]
  return items.every((p) => DOMAIN_LABEL[p.category] === first) ? first : undefined
}

/**
 * Дровер раздела справа — обобщение OverdueDrawer. Открывается по клику на доменную
 * карточку (Налоги и взносы, НДС, Сотрудники) и всегда содержит два таба (макет
 * 1112-12994): «К уплате» — открытые платежи домена (сумма под заголовком, кликабельные
 * строки ведут на уплату, в футере «Уплатить всё»), и «Выполнено» — уже закрытые платежи
 * этого раздела за текущий период (некликабельные, со статусом «Оплачено»). Собран на DS
 * `Drawer`/`Tabs`/`DrawerFooter`.
 *
 * Платежи, которые ещё нельзя уплатить (`process` — «в расчёте» или «по графику»),
 * показываются отдельной секцией «Не входит в расчёты» под списком к уплате (макет
 * 949-17180). Сумма раздела и «Уплатить всё» считаются только по тому, что реально можно
 * платить сейчас.
 */
export default function GroupDrawer({
  open,
  title,
  payAllLabel = 'Уплатить всё',
  items,
  doneItems = [],
  onClose,
}: {
  open: boolean
  title: string
  payAllLabel?: string
  items: AugustPayment[]
  /** Закрытые платежи раздела для таба «Выполнено» (пусто → таб показывает заглушку). */
  doneItems?: AugustPayment[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { markPaid } = usePayments()
  const [showAccounts, setShowAccounts] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [tab, setTab] = useState<DrawerTab>('topay')

  // `hasEstimate` — есть ли у платежа известная сумма (предварительная либо твёрдая).
  const hasEstimate = (p: AugustPayment) =>
    p.state !== 'process' || p.preliminary || !!p.payFromLabel
  // Что можно платить сейчас, а что ещё нет («в расчёте» / «по графику»).
  const payable = items.filter((p) => p.state !== 'process')
  const upcoming = items.filter((p) => p.state === 'process')
  // Разделение на «сейчас / позже» показываем только когда в группе есть и то и другое.
  // Если что-то одно — список рисуем как раньше, чтобы не менять остальные экраны.
  const isMixed = payable.length > 0 && upcoming.length > 0
  const payableTotal = payable.reduce((sum, p) => sum + p.amount, 0)

  // В шапке — короткое имя раздела (Налог по УСН / НДС / Сотрудники), а не полное
  // название платежа. Для смешанных групп («N просрочено») остаётся переданный title.
  const header = singleDomainLabel(items) ?? title
  // Платить ещё нечего (всё в расчёте, суммы предварительные) — вместо «Осталось
  // уплатить» подписываем, что это прикидка и время платить не пришло.
  const notReady = items.length > 0 && payable.length === 0
  // «Осталось уплатить» — только то, что реально пора платить. Если платить нечего
  // вовсе, показываем прикидку по известным суммам (сценарии «Всё хорошо» на Главной).
  const total = notReady
    ? items.filter(hasEstimate).reduce((sum, p) => sum + p.amount, 0)
    : payableTotal

  if (!open) return null

  // «Уплатить» из дровера ведёт не сразу к результату, а к выбору счёта списания
  // (макет 1178-16236): сперва модалка со счётами, и только по «Выбрать» платёж уходит
  // и показывается результат.
  function payAll() {
    setShowAccounts(true)
  }

  // Счёт выбран в модалке — списываем и показываем результат. `_accountId` пока не
  // влияет на данные прототипа (счёт условный), но флоу проходит через выбор.
  function confirmAccount(_accountId: string) {
    payable.forEach((p) => markPaid(p.id))
    setShowAccounts(false)
    setShowResult(true)
  }

  function finishResult() {
    setShowResult(false)
    onClose()
  }

  /**
   * Строка платежа: кликабельна только если её можно уплатить. Для неготовой строки в
   * смешанной группе даём подпись под суммой («Пока рано») — иначе она визуально ничем
   * не отличается от оплачиваемых соседей. Слева — лого-иконка категории (40×40).
   */
  const row = (p: AugustPayment) => (
    <div key={p.id} className="gd__row">
      <PaymentRow
        payment={p}
        edgePadding="off"
        verticalSpacing="none"
        amountCaption={isMixed && p.state === 'process' && p.amount > 0 ? 'Пока рано' : undefined}
        onClick={
          p.state === 'process'
            ? undefined
            : () => {
                onClose()
                navigate(payTo(p.id))
              }
        }
      />
    </div>
  )

  /** Секция «Не входит в расчёты» — предварительный расчёт налога отдельной группой
   *  с заголовком-подписью и внутренним отступом 24px до строк (макет 949-17180). */
  const upcomingGroup = (
    <section className="gd__upcoming">
      <p className="gd__upcoming-label">Не входит в расчёты</p>
      <div className="gd__list">{upcoming.map(row)}</div>
    </section>
  )

  /**
   * Содержимое «К уплате». Готовые платежи — единым списком; то, что ещё нельзя платить
   * (`process`), выносим отдельной секцией «Не входит в расчёты» под списком (макет
   * 949-17180). Если готового нет вовсе — секция становится единственным содержимым.
   */
  function toPayList() {
    if (items.length === 0)
      return <p className="gd__empty">Всё уплачено — открытых платежей нет.</p>

    if (!isMixed) {
      if (payable.length === 0 && upcoming.length > 0) return upcomingGroup
      return <div className="gd__list">{items.map(row)}</div>
    }

    return (
      <>
        {payable.length > 0 && <div className="gd__list">{payable.map(row)}</div>}
        {upcomingGroup}
      </>
    )
  }

  /** Содержимое «Выполнено» — закрытые платежи раздела (некликабельные, статус «Оплачено»). */
  function doneList() {
    if (doneItems.length === 0)
      return <p className="gd__empty">Пока нет выполненных платежей.</p>
    return (
      <div className="gd__list">
        {doneItems.map((p) => (
          <div key={p.id} className="gd__row">
            <PaymentRow payment={p} edgePadding="off" verticalSpacing="none" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Drawer open={open} onClose={onClose} side="right" aria-label={title} className="gd__panel">
        <DrawerHeader onClose={onClose}>{header}</DrawerHeader>

        {tab === 'topay' && items.length > 0 && (
          <div className="gd__total">
            <span className="gd__total-amount">{formatMoney(total)}</span>
            <span className="gd__total-label">
              {notReady ? 'Пока рано платить. Расчёт предварительный.' : 'Осталось уплатить'}
            </span>
          </div>
        )}

        <div className="gd__tabs">
          <Tabs
            items={[
              { id: 'topay', label: 'К уплате' },
              { id: 'done', label: 'Выполнено' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as DrawerTab)}
          />
        </div>

        <div className="gd__body">{tab === 'topay' ? toPayList() : doneList()}</div>

        {tab === 'topay' && payable.length > 0 && (
          <DrawerFooter type="1 Button" primaryAction={{ label: payAllLabel, onClick: payAll }} />
        )}
      </Drawer>

      {showAccounts && (
        <AccountSelectModal
          onSelect={confirmAccount}
          onClose={() => setShowAccounts(false)}
        />
      )}

      {showResult && (
        <PaymentResultModal title="Всё уплачено!" onDone={finishResult}>
          <p>Отправили платёж {formatMoney(payableTotal)}.</p>
          <p>Информация по платежу появится в ленте событий в течение 5 минут.</p>
        </PaymentResultModal>
      )}
    </>
  )
}
