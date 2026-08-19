import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Users, Receipt, PenLine, ShoppingBag, ClipboardCheck } from 'lucide-react'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { Tabs } from '@ds/components/Tabs'
import PageAction from '@ds/components/PageAction'
import { Button } from '@ds/components/Button'
import Card from '@/components/ui/Card'
import { countWaiting } from '@/data/reports'
import { formatMoney } from '@/lib/format'
import { pluralPayments, type AugustPayment } from '@/data/august'
import { OCTOBER_PAYMENTS } from '@/data/october'
import PaymentRow from '@/features/august/PaymentRow'
import SectionCard from './SectionCard'
import GroupRow from './GroupRow'
import GroupDrawer from './GroupDrawer'
import { octoberBlockGroups, octoberHeroAmount, type PayGroup } from './groups'
import '@/features/august/AugustView.css'

type Tab = 'topay' | 'done'

/**
 * Вариант «Блоки»: налоги к уплате свёрнуты в три строки-группы (просрочено / УСН /
 * сотрудники). Клик по группе: один налог к уплате → сразу страница уплаты; несколько →
 * дровер со списком; налог по УСН пока считается → строка некликабельна. Сумма в шапке —
 * по всем твёрдым платежам (как на текущей Главной).
 */
export default function OctoberGroupsView() {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [tab, setTab] = useState<Tab>('topay')
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)

  const isDone = (p: AugustPayment) => p.state === 'paid' || isPaid(p.id)
  const asPaid = (p: AugustPayment): AugustPayment =>
    p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' }

  const groups = octoberBlockGroups(isPaid)
  const done = OCTOBER_PAYMENTS.filter(isDone)
  const heroAmount = octoberHeroAmount(isPaid)

  // Клик по группе: неоплачиваемая (УСН в процессе) — без действия; один налог — уплата;
  // несколько — дровер.
  const onGroup = (g: PayGroup) => {
    if (!g.payable) return undefined
    if (g.items.length === 1) return () => navigate(payTo(g.items[0].id))
    return () => setOpenGroup(g)
  }

  // Параметры дровера зависят от группы.
  const drawerProps = openGroup && {
    title:
      openGroup.key === 'overdue'
        ? `${pluralPayments(openGroup.items.length)} просрочено`
        : openGroup.title,
    totalLabel: openGroup.key === 'overdue' ? 'Уплатите как можно скорее' : 'Общая сумма',
    items: openGroup.items,
  }

  return (
    <div className="av">
      <header className="av__header">
        <p className="av__amount">{formatMoney(heroAmount)}</p>
        <p className="av__amount-label">Осталось уплатить</p>
      </header>

      <Tabs
        className="av__tabs"
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        items={[
          { id: 'topay', label: 'К уплате' },
          { id: 'done', label: 'Выполнено' },
        ]}
      />

      <div data-coach="pay">
        <Card className="av__list">
          {tab === 'topay' ? (
            groups.length > 0 ? (
              groups.map((g) => (
                <div key={g.key} className="av__row">
                  <GroupRow group={g} onClick={onGroup(g)} />
                </div>
              ))
            ) : (
              <p className="av__empty">Всё уплачено.</p>
            )
          ) : (
            <>
              {done.map((p) => (
                <div key={p.id} className="av__row">
                  <PaymentRow payment={asPaid(p)} />
                </div>
              ))}
              {done.length === 0 && <p className="av__empty">Пока ничего нет.</p>}
              <div className="av__show-all">
                <Button
                  visualVariant="Secondary"
                  className="av__show-all-btn"
                  onClick={() => navigate(ROUTES.history)}
                >
                  Показать все
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="av__cards">
        <div data-coach="tasks" className="av__card-cell">
          <SectionCard
            icon={ClipboardCheck}
            title="Отчётность"
            note="Под контролем у бухгалтера"
            badge={countWaiting()}
            onClick={() => navigate(ROUTES.reports)}
          />
        </div>
        <SectionCard icon={Receipt} title="ЕНС" note="Заявка принята" />
        <SectionCard icon={Users} title="Сотрудники" note="1 сотрудник" />
      </div>

      <div className="av__links">
        <PageAction
          title="Налогообложение и патенты"
          description="УСН «Доходы» — 6%"
          iconLeft={<Landmark size={20} strokeWidth={1.75} />}
        />
        <div data-coach="sign">
          <PageAction
            title="Электронная подпись"
            description="Действует до 01.08.2028"
            iconLeft={<PenLine size={20} strokeWidth={1.75} />}
          />
        </div>
        <PageAction
          title="Маркетплейсы"
          description="Wildberries, Ozon, Яндекс Маркет"
          iconLeft={<ShoppingBag size={20} strokeWidth={1.75} />}
        />
      </div>

      {drawerProps && (
        <GroupDrawer open onClose={() => setOpenGroup(null)} {...drawerProps} />
      )}
    </div>
  )
}
