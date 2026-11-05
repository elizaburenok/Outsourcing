import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ClipboardList, ChevronDown, Calculator, Pencil } from 'lucide-react'
import NavigationBar from '@ds/components/NavigationBar'
import { Button } from '@ds/components/Button'
import { HeaderButton } from '@ds/components/HeaderButton'
import { Cell } from '@ds/components/Cell'
import PageShell from '@/components/PageShell/PageShell'
import Card from '@/components/ui/Card'
import { ROUTES } from '@/routes'
import { formatMoney } from '@/lib/format'
import { getPayableById } from '@/data/payment'
import { getVatCalculation } from '@/data/vat'
import { usePayments } from '@/state/PaymentsProvider'
import TaxCalcDrawer from './TaxCalcDrawer'
import PaymentResultModal from './PaymentResultModal'
import './TaxPaymentPage.css'

/** Строка-навигатор (карточка с заголовком/описанием и правой иконкой). */
function NavTile({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <Card className="tpp-tile" role="button" tabIndex={0} onClick={onClick}>
      <Cell
        textScale="M"
        verticalSpacing="none"
        edgePadding="off"
        title={<span className="tpp-tile__title">{title}</span>}
        description={<span className="tpp-tile__desc">{description}</span>}
        rightAccessory={<span className="tpp-tile__icon">{icon}</span>}
      />
    </Card>
  )
}

/**
 * Страница уплаты налога (дизайн из «Пульса» / Figma, пересобран на DS). Открывается
 * по клику на налог с Главной. Кнопка «Уплатить» помечает платёж оплаченным и
 * показывает результат флоу; после «Готово» платёж уходит во вкладку «Выполнено».
 * «Расчёт налогов» (дровер) — для всех налогов и взносов, кроме зарплаты директора.
 */
export default function TaxPaymentPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { markPaid, isPaid } = usePayments()
  const payable = getPayableById(id)

  const [showCalc, setShowCalc] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Неизвестный платёж — возвращаемся на Главную.
  useEffect(() => {
    if (!payable) navigate(ROUTES.home, { replace: true })
  }, [payable, navigate])

  // Автоскрытие тоста.
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  if (!payable) return null
  const vat = getVatCalculation(payable)
  const vatView = searchParams.get('vatView') === 'accordion' ? 'accordion' : 'screens'
  const paid = isPaid(payable.id)

  function goHome() {
    navigate(ROUTES.home)
  }

  function pay() {
    markPaid(payable!.id)
    setShowResult(true)
  }

  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          onBackClick={goHome}
          hasTextBlock
          hasRootLink
          rootLinkText="Онлайн-бухгалтерия"
          onRootLinkClick={goHome}
          title={payable.title}
          subtitle={payable.subtitle}
        />
      }
    >
      <div className="tpp">
        <header className="tpp__header">
          <p className="tpp__amount">{formatMoney(payable.amount)}</p>
          {payable.dueLabel && <p className="tpp__due">{vat && paid ? 'Уплачено' : `До ${payable.dueLabel}`}</p>}
        </header>

        {!vat && <HeaderButton
          className="tpp__change-amount-btn"
          visualVariant="Secondary"
          icon={<Pencil size={20} strokeWidth={1.75} />}
          onClick={() => setToast('Изменение суммы появится позже')}
        >
          Изменить сумму
        </HeaderButton>}

        {vat && (
          <div className="tpp__vat-summary">
            <div className="tpp__vat-copy">
              <p>Вы можете изменить сумму и уплатить весь НДС сразу — налоговая будет ежемесячно списывать с ЕНС по 1/3 от общей суммы налога.</p>
              <p>Предлагаем распределить налоговую нагрузку и платить частями строго в нужные сроки: {formatMoney(vat.installments[0])} до 28 {vat.months[0]}, {formatMoney(vat.installments[1])} до 28 {vat.months[1]} и {formatMoney(vat.installments[2])} до 28 {vat.months[2]}.</p>
            </div>
            <div className="tpp__vat-total">
              <span>Всего НДС за {vat.quarter} квартал</span>
              <strong>{formatMoney(vat.tax)}</strong>
            </div>
          </div>
        )}

        <div className="tpp__navigators">
          {payable.hasCalc && (
            <NavTile
              title="Расчёт налогов"
              description="Почему такая сумма?"
              icon={<Calculator size={22} strokeWidth={1.75} />}
              onClick={() => setShowCalc(true)}
            />
          )}
          <NavTile
            title="Реквизиты получателя"
            description={payable.requisites}
            icon={<ClipboardList size={22} strokeWidth={1.75} />}
            onClick={() => setToast('Реквизиты скопированы')}
          />
        </div>

        <button
          type="button"
          className="tpp__account"
          onClick={() => setToast('Выбор счёта недоступен в прототипе')}
        >
          <span className="tpp__account-text">
            <span className="tpp__account-label">Со счёта</span>
            <span className="tpp__account-value">{payable.account}</span>
          </span>
          <ChevronDown size={18} strokeWidth={2} className="tpp__account-chevron" />
        </button>
      </div>

      <div className="tpp__footer">
        <Button
          className="tpp__footer-btn"
          visualVariant="Secondary"
          onClick={vat ? () => { markPaid(payable.id); goHome() } : () => setToast('Отметить сданным появится позже')}
        >
          {vat ? 'Уже уплачено' : 'Уже сдано'}
        </Button>
        <Button className="tpp__footer-btn" visualVariant="Primary" onClick={pay} disabled={paid}>
          Уплатить
        </Button>
      </div>

      {payable.hasCalc && (
        <TaxCalcDrawer key={vatView} payable={payable} open={showCalc} onClose={() => setShowCalc(false)} vatView={vatView} />
      )}

      {showResult && (
        <PaymentResultModal title={payable.paidTitle} onDone={goHome}>
          <p>Отправили платёж {formatMoney(payable.amount)}.</p>
          <p>Информация по платежу появится в ленте событий в течение 5 минут.</p>
        </PaymentResultModal>
      )}

      {toast && <div className="tpp__toast">{toast}</div>}
    </PageShell>
  )
}
