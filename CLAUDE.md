# Правила проекта — «Главная ОБ для аутсорса ООО»

## 🔒 Жёсткое правило: все компоненты и токены — только из design-system

Любой UI в этом прототипе собирается **исключительно** из канонической дизайн-системы:

- **Папка DS:** `/Users/tochkamac/Downloads/Прототипы/design-system`
- Подключена алиасами: `@ds` (vite + tsconfig) → корень DS. Импорт компонентов —
  `@ds/components/<Name>`, токенов — `@ds/tokens`.

**Нельзя** хардкодить цвета, размеры шрифта, начертания, отступы, скругления — берём
только токены DS. **Нельзя** верстать «свои» компоненты, если в DS есть подходящий.

Если нужного компонента или токена в DS нет — **расширяем саму DS**, а не хардкодим в
прототипе. Сначала ищем в `@ds/components` и `@ds/tokens`, и только потом собираем экран.

### Что есть в DS (инвентарь)

- **Компоненты** (`@ds/components/*`): Button, Calendar, Cell, CellLeftAccessory,
  CellRightAccessory, Chip, Drawer, Dropdown, HeaderButton, NavigationBar, Navigator,
  PageAction, SearchInput, SkillsModal, TextAreaField, TextField, Widget.
- **Токены** (`@ds/tokens`): colors, typography, spacing, rounding (+ `css-variables.css`).
- **Шрифт:** TT Norms (Pro) Tochka — из `@ds/font-family`.
- Галерея всех компонентов: `https://elizaburenok.github.io/design-system/`.

## Продуктовая рамка и остальной контекст

- Рамка, скоуп, IA, платёжный ритм, гипотезы — в `PLAN.md` и в памяти проекта (`ob-outsource-*`).
- Референсы вёрстки (Figma, DS-ссылки) — в `references/`.
- Правило навигации: свой верхний навбар не делаем (экосистемная шапка Точки — данность
  платформы); задачи не сваливаем в один агрегат-виджет.
