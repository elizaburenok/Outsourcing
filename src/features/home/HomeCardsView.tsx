import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes'
import PageAction from '@ds/components/PageAction'
import { EmblemTIcon, PenIcon, IntegrationIcon, RequisitesTIcon } from '@ds/components/icons'
import GroupDrawer from '@/features/october/GroupDrawer'
import { REPORTS, REPORTS_OK, countWaiting, countPreparing, pluralDocs, pluralTasks } from '@/data/reports'
import { MCHD_COUNT, CONNECTED_SERVICES, TARIFF_NAME, connectedServicesText } from '@/data/company'
import type { AugustPayment } from '@/data/august'
import { useScenario } from '@/state/ScenarioProvider'
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
} from './domain'
import '@/features/august/AugustView.css'
import './HomeCardsView.css'

/** Снимок дровера в момент открытия — чтобы список и суммы не «схлопывались» после уплаты. */
type DrawerState = {
  title: string
  items: AugustPayment[]
  history: DomainHistoryGroup[]
}

/** Рисковые карточки всплывают наверх по цвету: красные → жёлтые → серые. Единая шкала
 *  для всех карточек Главной (доменных и «Отчётности»), не только для трёх доменов. */
const TONE_RANK: Record<CardTone, number> = { overdue: 0, attention: 1, ok: 2, neutral: 2 }

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
  const { scenario } = useScenario()
  const [drawer, setDrawer] = useState<DrawerState | null>(null)

  // «Отчётность» — такая же доменная карточка, но её ведёт бухгалтер. Жёлтый тон
  // (attention), когда есть незакрытые задачи клиента (подписать/подтвердить), иначе
  // нейтральный. В сценарии «Всё хорошо» клиент уже ответил на всё — вместо бейджа с
  // числом ждущих ответа показываем, сколько задач бухгалтер сейчас готовит.
  const reports = scenario === 'ok' ? REPORTS_OK : REPORTS
  const waitingReports = countWaiting(reports)
  const preparingReports = countPreparing(reports)
  const reportsTone: CardTone = waitingReports > 0 ? 'attention' : 'neutral'
  const reportsContent: CardContent =
    waitingReports > 0
      ? { title: pluralDocs(waitingReports), subtitle: 'Ждём вашего ответа' }
      : preparingReports > 0
        ? { title: pluralTasks(preparingReports), subtitle: 'В работе у бухгалтера' }
        : { title: 'Всё под контролем', subtitle: 'Бухгалтер ведёт сам' }

  // Карточка всегда открывает дровер раздела с табами «К уплате / Выполнено» — даже когда
  // платить нечего: под «Выполнено» доступна история операций домена. Снимок списка/истории
  // фиксируем на момент открытия, чтобы после уплаты он не «схлопнулся».
  function handleCard(id: DomainCategoryId) {
    setDrawer({
      title: CATEGORIES[id].label,
      items: paymentsByCat[id],
      history: historyByCat[id],
    })
  }

  // Единый список карточек Главной — доменные (в каноническом порядке) + «Отчётность»
  // последней — и общая сортировка по цвету: красные → жёлтые → серые. Сортировка
  // стабильна, поэтому внутри одного цвета порядок остаётся как в исходном списке.
  const cards: {
    key: string
    label: string
    tone: CardTone
    content: CardContent
    coach?: string
    onClick: () => void
  }[] = [
    ...CATEGORY_ORDER.map((id) => {
      const severity = levels[id]
      return {
        key: id,
        label: CATEGORIES[id].label,
        tone: cardTone(id, severity),
        content: cardContent(CATEGORIES[id], severity, paymentsByCat[id]),
        onClick: () => handleCard(id),
      }
    }),
    {
      key: 'reports',
      label: 'Отчётность',
      tone: reportsTone,
      content: reportsContent,
      coach: 'tasks',
      onClick: () => navigate(ROUTES.reports),
    },
  ].sort((a, b) => TONE_RANK[a.tone] - TONE_RANK[b.tone])

  return (
    <div className="av">
      <div data-coach="pay" className="hc__grid">
        {cards.map((card) => (
          <CategoryCard
            key={card.key}
            label={card.label}
            tone={card.tone}
            content={card.content}
            interactive
            coach={card.coach}
            onClick={card.onClick}
          />
        ))}
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
          totalLabel="Общая сумма"
          items={drawer.items}
          history={drawer.history}
        />
      )}
    </div>
  )
}
