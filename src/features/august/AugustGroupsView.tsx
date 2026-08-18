import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { Tabs } from '@ds/components/Tabs'
import { Chip } from '@ds/components/Chip'
import PageAction from '@ds/components/PageAction'
import { Button } from '@ds/components/Button'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import Card from '@/components/ui/Card'
import { formatMoney } from '@/lib/format'
import {
  AUGUST_PAYMENTS,
  pluralPayments,
  usnPayment,
  type AugustPayment,
  type Snapshot,
} from '@/data/august'
import PaymentRow from './PaymentRow'
import GroupRow from '@/features/october/GroupRow'
import GroupDrawer from '@/features/october/GroupDrawer'
import { augustBlockGroups, augustHeroAmount, type PayGroup } from '@/features/october/groups'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import '@/features/august/AugustView.css'

type Tab = 'topay' | 'done'

/**
 * Сценарий «20 августа», самый полный вариант: ООО на УСН «Доходы» + НДС 5%, один
 * сотрудник (директор). Налоги к уплате свёрнуты в группы (просрочено / УСН / НДС /
 * сотрудники) — тот же паттерн «Блоки», что и в октябрьском сценарии
 * (`OctoberGroupsView`), но на данных `AUGUST_PAYMENTS`: 1-й из трёх платежей НДС за
 * II квартал и взносы с зарплатой за июль просрочены; налог по УСН за 9 месяцев виден
 * отдельной строкой всегда (пока квартал не закрыт — «в процессе», без клика); к уплате —
 * аванс сотруднику, страховые взносы, НДФЛ, 2-й платёж НДС и окончательный расчёт
 * по зарплате за август.
 */
export default function AugustGroupsView() {
  const navigate = useNavigate()
  const { isPaid } = usePayments()
  const [tab, setTab] = useState<Tab>('topay')
  const [openGroup, setOpenGroup] = useState<PayGroup | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>('mid')
  const usn = usnPayment(snapshot)
  const usnDone = isPaid(usn.id)

  const isDone = (p: AugustPayment) => p.state === 'paid' || isPaid(p.id)
  const asPaid = (p: AugustPayment): AugustPayment =>
    p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' }

  const groups = augustBlockGroups(isPaid, snapshot)
  const done = AUGUST_PAYMENTS.filter(isDone)
  const heroAmount = augustHeroAmount(isPaid)

  // Клик по группе: один налог — сразу уплата; несколько — дровер.
  const onGroup = (g: PayGroup) => {
    if (!g.payable) return undefined
    if (g.items.length === 1) return () => navigate(payTo(g.items[0].id))
    return () => setOpenGroup(g)
  }

  // Параметры дровера зависят от группы (актуально для «Просрочено» — там несколько строк).
  const drawerProps = openGroup && {
    title:
      openGroup.key === 'overdue'
        ? `${pluralPayments(openGroup.items.length)} просрочено`
        : openGroup.title,
    note:
      openGroup.key === 'overdue'
        ? 'Уплатите как можно скорее — начисляются пени'
        : 'Зарплатные налоги и взносы к уплате',
    noteTone: (openGroup.key === 'overdue' ? 'error' : 'neutral') as 'error' | 'neutral',
    totalLabel: openGroup.key === 'overdue' ? 'Всего просрочено' : 'Всего к уплате',
    items: openGroup.items,
  }

  return (
    <div className="av">
      <header className="av__header">
        <p className="av__amount">{formatMoney(heroAmount)}</p>
        <p className="av__amount-label">Осталось уплатить</p>
      </header>

      <div data-coach="pay">
        <Card className="av__list">
          <Tabs
            className="av__tabs"
            value={tab}
            onChange={(id) => setTab(id as Tab)}
            items={[
              { id: 'topay', label: 'К уплате' },
              { id: 'done', label: 'Выполнено' },
            ]}
          />

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
              {done.slice(0, 3).map((p) => (
                <div key={p.id} className="av__row">
                  <PaymentRow payment={asPaid(p)} />
                </div>
              ))}
              {usnDone && (
                <div className="av__row av__row--quarter">
                  <PaymentRow payment={asPaid(usn)} />
                </div>
              )}
              {done.length === 0 && !usnDone && <p className="av__empty">Пока ничего нет.</p>}
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

      <div className="av__links">
        <PageAction
          title="Налогообложение и патенты"
          description="УСН «Доходы» 6% + НДС 5%"
          iconLeft={<EmblemTIcon />}
        />
        <div data-coach="sign">
          <PageAction
            title="Доверенность"
            description={`${MCHD_COUNT} добавлено`}
            iconLeft={<PenIcon />}
          />
        </div>
        <PageAction
          title="Подключенные сервисы"
          description={connectedServicesText(CONNECTED_SERVICES)}
          iconLeft={<IntegrationIcon />}
        />
        <PageAction
          title="Тариф"
          description={TARIFF_NAME}
          iconLeft={<RequisitesTIcon />}
        />
      </div>

      {drawerProps && (
        <GroupDrawer open onClose={() => setOpenGroup(null)} {...drawerProps} />
      )}

      {/* Служебный тумблер прототипа (не элемент продукта) — переключает снимок квартала:
          середина квартала (аванс УСН считается) / квартал закрыт (посчитан), чтобы показать
          строку «Налог по УСН» в обоих состояниях. Вынесен в угол, чтобы не читаться как
          часть интерфейса. */}
      <div className="av__snapshot">
        <span className="av__snapshot-label">Снимок квартала (УСН)</span>
        <div className="av__snapshot-tabs">
          <Chip chipType="Tab" isSelected={snapshot === 'mid'} onClick={() => setSnapshot('mid')}>
            Середина квартала
          </Chip>
          <Chip chipType="Tab" isSelected={snapshot === 'closed'} onClick={() => setSnapshot('closed')}>
            Квартал закрыт
          </Chip>
        </div>
      </div>
    </div>
  )
}
