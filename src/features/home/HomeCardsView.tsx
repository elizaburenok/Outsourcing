import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes'
import PageAction from '@ds/components/PageAction'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import GroupDrawer from '@/features/october/GroupDrawer'
import { countWaiting, pluralDocs } from '@/data/reports'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import type { AugustPayment } from '@/data/august'
import CategoryCard from './CategoryCard'
import { useHomeModel } from './useHomeModel'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  cardContent,
  cardTone,
  type CardContent,
  type CardTone,
  type DomainCategoryId,
  type DomainHistoryGroup,
  type Severity,
} from './domain'
import '@/features/august/AugustView.css'
import './HomeCardsView.css'

/** Снимок дровера в момент открытия — чтобы список и суммы не «схлопывались» после уплаты. */
type DrawerState = {
  title: string
  items: AugustPayment[]
  history: DomainHistoryGroup[]
}

/** Рисковые карточки всплывают наверх: overdue → attention → ok. */
const RANK: Record<Severity, number> = { overdue: 0, attention: 1, ok: 2 }

/**
 * Главная на архитектуре «Пульс»: платежи собраны в стабильные доменные карточки
 * (УСН, НДС, Сотрудники), состояние выражено severity, просрочка поднимает карточку
 * наверх и красит её. Вкладок «К уплате / Выполнено» нет — полный список сделанного
 * живёт в разделе «История». Общей суммы в шапке нет — статус виден по самим карточкам.
 * УСН и НДС — регулярные: даже без открытой суммы карточка остаётся серой (не зеленеет)
 * и показывает дату следующего платежа; Сотрудники зеленеют «Всё уплачено» как обычно.
 */
export default function HomeCardsView() {
  const navigate = useNavigate()
  const { levels, paymentsByCat, historyByCat } = useHomeModel()
  const [drawer, setDrawer] = useState<DrawerState | null>(null)

  // Промоушен: рисковые карточки выше; внутри группы — канонический порядок.
  const ordered = [...CATEGORY_ORDER].sort((a, b) => RANK[levels[a]] - RANK[levels[b]])

  // «Отчётность» — такая же доменная карточка, но её ведёт бухгалтер. Жёлтый тон
  // (attention), когда есть незакрытые задачи клиента (подписать/подтвердить), иначе
  // нейтральный «всё под контролем». Число ждущих ответа — в заголовок, вместо бейджа.
  const waitingReports = countWaiting()
  const reportsTone: CardTone = waitingReports > 0 ? 'attention' : 'neutral'
  const reportsContent: CardContent =
    waitingReports > 0
      ? { title: pluralDocs(waitingReports), subtitle: 'Ждём вашего ответа' }
      : { title: 'Всё под контролем', subtitle: 'Бухгалтер ведёт сам' }

  // Карточка всегда открывает дровер раздела с табами «К уплате / Готово» — даже когда
  // платить нечего: под «Готово» доступна история операций домена. Снимок списка/истории
  // фиксируем на момент открытия, чтобы после уплаты он не «схлопнулся».
  function handleCard(id: DomainCategoryId) {
    setDrawer({
      title: CATEGORIES[id].label,
      items: paymentsByCat[id],
      history: historyByCat[id],
    })
  }

  return (
    <div className="av">
      <div data-coach="pay" className="hc__grid">
        {ordered.map((id) => {
          const payments = paymentsByCat[id]
          const severity = levels[id]
          return (
            <CategoryCard
              key={id}
              label={CATEGORIES[id].label}
              tone={cardTone(id, severity)}
              content={cardContent(CATEGORIES[id], severity, payments)}
              interactive
              onClick={() => handleCard(id)}
            />
          )
        })}

        <CategoryCard
          label="Отчётность"
          tone={reportsTone}
          content={reportsContent}
          interactive
          coach="tasks"
          onClick={() => navigate(ROUTES.reports)}
        />
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
        <PageAction title="Тариф" description={TARIFF_NAME} iconLeft={<RequisitesTIcon />} />
      </div>

      {drawer && (
        <GroupDrawer
          open
          onClose={() => setDrawer(null)}
          title={drawer.title}
          totalLabel="Общая сумма к уплате"
          items={drawer.items}
          history={drawer.history}
        />
      )}
    </div>
  )
}
