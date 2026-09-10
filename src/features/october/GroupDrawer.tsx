import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Chip } from '@ds/components/Chip'
import { formatMoney } from '@/lib/format'
import { payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { pluralPayments, type AugustPayment, type PayCategory } from '@/data/august'
import type { DomainHistoryGroup } from '@/features/home/domain'
import PaymentRow from '@/features/august/PaymentRow'
import PaymentResultModal from '@/features/payment/PaymentResultModal'
import './GroupDrawer.css'

type Tab = 'topay' | 'done'

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
 * карточку (УСН, НДС, Сотрудники) и всегда содержит два таба: «К уплате» — открытые
 * платежи домена (сумма под заголовком, кликабельные строки ведут на уплату, в футере
 * «Уплатить всё»), и «Выполнено» — история операций домена по месяцам. Собран на DS
 * `Drawer`/`Tabs`/`DrawerFooter`.
 */
export default function GroupDrawer({
  open,
  title,
  payAllLabel = 'Уплатить всё',
  items,
  history = [],
  onClose,
}: {
  open: boolean
  title: string
  payAllLabel?: string
  items: AugustPayment[]
  /** Оплаченные операции домена по месяцам — под табом «Выполнено» (пусто → таб пустой). */
  history?: DomainHistoryGroup[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { markPaid } = usePayments()
  const [showResult, setShowResult] = useState(false)

  // Платёж в состоянии `process` (напр. аванс УСН, пока квартал не закрыт) показываем
  // строкой-справкой, но платить его нельзя: из «Уплатить всё» исключаем. Предварительный
  // расчёт (`preliminary`) и «пока рано» с известной суммой (`payFromLabel`) попадают в
  // общую сумму сверху — цифра уже есть, просто платить рано; обычный `process` без суммы
  // в total не идёт.
  const hasEstimate = (p: AugustPayment) =>
    p.state !== 'process' || p.preliminary || !!p.payFromLabel
  const payable = items.filter((p) => p.state !== 'process')
  const total = items.filter(hasEstimate).reduce((sum, p) => sum + p.amount, 0)
  // Сумма реально оплаченного по «Уплатить всё» — только `payable` (без «пока рано»/
  // «в расчёте»), иначе модалка результата завышает сумму, когда в группе есть смесь
  // просроченного и ещё не готового (напр. УСН/НДС с просрочкой, макет 894-96775).
  const payableTotal = payable.reduce((sum, p) => sum + p.amount, 0)

  const [tab, setTab] = useState<Tab>('topay')

  // В шапке — короткое имя раздела (Налог по УСН / НДС / Сотрудники), а не полное
  // название платежа. Для смешанных групп («N просрочено») остаётся переданный title.
  const header = singleDomainLabel(items) ?? title
  // Платить ещё нечего (всё в расчёте, суммы предварительные) — вместо «Осталось
  // уплатить» подписываем, что это прикидка и время платить не пришло.
  const notReady = items.length > 0 && payable.length === 0

  if (!open) return null

  function payAll() {
    payable.forEach((p) => markPaid(p.id))
    setShowResult(true)
  }

  function finishResult() {
    setShowResult(false)
    onClose()
  }

  return (
    <>
      <Drawer open={open} onClose={onClose} side="right" aria-label={title}>
        <DrawerHeader onClose={onClose}>{header}</DrawerHeader>

        {items.length > 0 && (
          <div className="gd__total">
            <span className="gd__total-amount">{formatMoney(total)}</span>
            <span className="gd__total-label">
              {notReady ? 'Пока рано платить. Расчёт предварительный.' : 'Осталось уплатить'}
            </span>
          </div>
        )}

        {/* Табы «К уплате / Выполнено» — сегменты (DS Chip Tab), закреплены под общей суммой
            вне скролла списка (см. макет 848-31345). */}
        <div className="gd__tabs" role="tablist">
          <Chip chipType="Tab" isSelected={tab === 'topay'} onClick={() => setTab('topay')}>
            К уплате
          </Chip>
          <Chip chipType="Tab" isSelected={tab === 'done'} onClick={() => setTab('done')}>
            Выполнено
          </Chip>
        </div>

        <div className="gd__body">
          {tab === 'topay' ? (
            items.length > 0 ? (
              <div className="gd__list">
                {items.map((p) => (
                  <div key={p.id} className="gd__row">
                    <PaymentRow
                      payment={p}
                      edgePadding="off"
                      verticalSpacing="none"
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
                ))}
              </div>
            ) : (
              <p className="gd__empty">Всё уплачено — открытых платежей нет.</p>
            )
          ) : history.length > 0 ? (
            <div className="gd__history">
              {history.map((group) => (
                <section key={group.id} className="gd__group">
                  <p className="gd__group-label">{group.label}</p>
                  <div className="gd__list">
                    {group.payments.map((p) => (
                      <div key={p.id} className="gd__row">
                        <PaymentRow payment={p} edgePadding="off" verticalSpacing="none" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="gd__empty">Пока нет завершённых операций.</p>
          )}
        </div>

        {tab === 'topay' && payable.length > 0 && (
          <DrawerFooter type="1 Button" primaryAction={{ label: payAllLabel, onClick: payAll }} />
        )}
      </Drawer>

      {showResult && (
        <PaymentResultModal title="Платежи отправлены" onDone={finishResult}>
          <p>
            Отправили {pluralPayments(payable.length)} на {formatMoney(payableTotal)}.
          </p>
          <p>Информация по платежам появится в ленте событий в течение 5 минут.</p>
        </PaymentResultModal>
      )}
    </>
  )
}
