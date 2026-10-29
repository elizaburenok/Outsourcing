# Онбординг ООО

Ветка `feat/onboarding-standalone` открывает на `/` и `/home` сценарий онбординга ООО на УСН «Доходы» 6% без переключателя демо-кейсов. Доверенности ФНС и СФР, Wildberries, Ozon и банковские интеграции доступны с главной страницы. Состояние демонстрации хранится в памяти и сбрасывается при обновлении страницы. Используйте только вымышленные данные и токены: это прототип, подключения к реальным сервисам нет.

## Vercel

Импортируйте `elizaburenok/Outsourcing`, выберите ветку `feat/onboarding-standalone` как Production Branch. Root Directory — корень репозитория, Framework — Vite, Build Command — `npm run build`, Output Directory — `dist`. Переменные окружения не требуются. Настройка SPA-маршрутов включена в `vercel.json`.

## Локально

```sh
npm ci
npm run dev
```
