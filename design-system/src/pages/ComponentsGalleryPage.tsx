import { useState } from 'react';
import { Button } from '@components/Button';
import { ButtonPlayground } from '@components/Button/ButtonPlayground';
import { Calendar } from '@components/Calendar';
import { CellPlayground } from '@components/Cell/CellPlayground';
import { ChipPlayground } from '@components/Chip/ChipPlayground';
import { DrawerFooter } from '@components/Drawer/DrawerFooter';
import { DrawerHeader } from '@components/Drawer/DrawerHeader';
import { Dropdown, type DropdownItem } from '@components/Dropdown';
import { FlowResultModal } from '@components/FlowResultModal';
import { HeaderButtonPlayground } from '@components/HeaderButton/HeaderButtonPlayground';
import { MainPageNavigationBarPlayground } from '@components/MainPageNavigationBar/MainPageNavigationBarPlayground';
import { NavigationBar } from '@components/NavigationBar';
import { NavigatorPlayground } from '@components/Navigator/NavigatorPlayground';
import { PageAction } from '@components/PageAction';
import { SearchInput } from '@components/SearchInput';
import {
  SkillsModal,
  type Competency,
  type Skill,
} from '@components/SkillsModal';
import { TextAreaField } from '@components/TextAreaField';
import { TextField } from '@components/TextField';
import { WidgetPlayground } from '@components/Widget/WidgetPlayground';
import styles from './ComponentsGalleryPage.module.css';

const dropdownListItems: DropdownItem[] = [
  { id: '1', label: 'Первый пункт', subtitle: 'Подзаголовок' },
  { id: '2', label: 'Второй пункт' },
  { id: '3', label: 'Отключён', disabled: true },
];

const dropdownGroupedItems: DropdownItem[] = [
  {
    id: 'g1a',
    label: 'Элемент A',
    groupId: 'grp1',
    groupLabel: 'Группа 1',
  },
  { id: 'g1b', label: 'Элемент B', groupId: 'grp1' },
  {
    id: 'g2a',
    label: 'Элемент C',
    groupId: 'grp2',
    groupLabel: 'Группа 2',
  },
];

const demoSkills: Skill[] = [
  { id: 's1', label: 'Анализ данных', competencyId: 'c1' },
  { id: 's2', label: 'Коммуникация', competencyId: 'c1' },
  { id: 's3', label: 'Планирование', competencyId: 'c2' },
];

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M6 14L11.5 19.5L22 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const demoCompetencies: Competency[] = [
  { id: 'c1', label: 'Hard skills' },
  { id: 'c2', label: 'Soft skills' },
];

export function ComponentsGalleryPage() {
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [skillsSelected, setSkillsSelected] = useState<Set<string>>(
    () => new Set(['s1']),
  );
  const [competencyId, setCompetencyId] = useState<string | undefined>();
  const [flowResultOpen, setFlowResultOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Компоненты</h1>
        <p className={styles.lead}>
          Обзор дизайн-системы — все секции на одной странице.
        </p>
      </header>

      <div className={styles.stack}>
        <ButtonPlayground />
        <ChipPlayground />
        <HeaderButtonPlayground />
        <MainPageNavigationBarPlayground />
        <NavigatorPlayground />
        <CellPlayground />
        <WidgetPlayground />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>SearchInput</h2>
          <div className={styles.demoColumn}>
            <SearchInput label="Поиск" placeholder="По умолчанию" size="m" />
            <SearchInput
              label="Заполненный"
              variant="filled"
              size="l"
              defaultValue="Значение"
            />
            <SearchInput
              label="Ошибка"
              error
              errorMessage="Сообщение об ошибке"
              size="m"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>TextField</h2>
          <div className={styles.demoColumn}>
            <TextField label="Подпись поля" placeholder="Ввод…" />
            <TextField
              label="С ошибкой"
              placeholder="Ввод…"
              errorMessage="Обязательное поле"
            />
            <TextField label="Компактное" compact placeholder="Поиск…" />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>TextAreaField</h2>
          <div className={styles.demoColumn}>
            <TextAreaField label="Комментарий" placeholder="Текст…" rows={3} />
            <TextAreaField
              label="В карточке"
              variant="raisedCard"
              placeholder="Текст…"
              rows={3}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>NavigationBar</h2>
          <div className={styles.navHost}>
            <NavigationBar
              hasBackButton
              hasTextBlock
              hasItems
              title="Заголовок"
              subtitle="Подзаголовок"
              onBackClick={() => undefined}
              items={[
                { id: '1', label: 'Раздел 1', active: true },
                { id: '2', label: 'Раздел 2' },
                { id: '3', label: 'Отключён', disabled: true },
              ]}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PageAction</h2>
          <PageAction
            title="Действие на странице"
            description="Краткое описание"
            onClick={() => undefined}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Calendar</h2>
          <div className={styles.calendarHost}>
            <Calendar
              open
              selectedDate={new Date()}
              onClose={() => undefined}
              onSelect={() => undefined}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dropdown</h2>
          <div className={styles.dropdownRow}>
            <div className={styles.dropdownFrame}>
              <Dropdown
                type="list"
                mode="desktop"
                open
                items={dropdownListItems}
                onClose={() => undefined}
              />
            </div>
            <div className={styles.dropdownFrame}>
              <Dropdown
                type="list-groups"
                mode="desktop"
                open
                items={dropdownGroupedItems}
                onClose={() => undefined}
              />
            </div>
            <div className={styles.dropdownFrame}>
              <Dropdown
                type="loading"
                mode="desktop"
                open
                items={[]}
                onClose={() => undefined}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>DrawerHeader и DrawerFooter</h2>
          <div className={styles.drawerShell}>
            <DrawerHeader onClose={() => undefined}>
              Заголовок панели
            </DrawerHeader>
            <div className={styles.drawerBody}>
              Пример контента выдвижной панели.
            </div>
            <DrawerFooter
              type="2 Button"
              primaryAction={{ label: 'Готово', onClick: () => undefined }}
              secondaryAction={{ label: 'Отмена', onClick: () => undefined }}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>SkillsModal</h2>
          <Button nativeType="button" onClick={() => setSkillsOpen(true)}>
            Открыть модальное окно навыков
          </Button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>FlowResultModal</h2>
          <Button nativeType="button" onClick={() => setFlowResultOpen(true)}>
            Открыть результат флоу
          </Button>
        </section>
      </div>

      {flowResultOpen && (
        <FlowResultModal
          tone="success"
          icon={<CheckIcon />}
          title="Копилка подключена"
          primaryLabel="Готово"
          onPrimary={() => setFlowResultOpen(false)}
        >
          <p>Обычно всё занимает 5 минут, но не более часа.</p>
        </FlowResultModal>
      )}

      <SkillsModal
        open={skillsOpen}
        skills={demoSkills}
        competencies={demoCompetencies}
        selectedSkillIds={skillsSelected}
        selectedCompetencyId={competencyId}
        onClose={() => setSkillsOpen(false)}
        onApplyFilter={(next) => {
          setSkillsSelected(next);
          setSkillsOpen(false);
        }}
        onCompetencyChange={(id) => setCompetencyId(id)}
      />
    </div>
  );
}
