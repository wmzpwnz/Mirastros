# План завершения задачи «История консультаций»

**Цель:** довести фичу до полного соответствия spec с минимальными рисками и быстрым первым результатом.

---

## Стратегия: два подхода

| Подход | Описание | Срок | Результат |
|--------|----------|------|-----------|
| **A. MVP (без нового backend)** | Страница `/history` собирает данные из существующих 6 API, объединяет на фронте | 2–3 дня | Пользователь видит всю историю, фильтр по типу, пагинация |
| **B. Полный spec** | Единый API `/api/history`, delete/favorite/stats/export/share, все компоненты | 2–3 недели | Полное соответствие requirements |

**Рекомендация:** сначала сделать подход A (MVP), чтобы ссылка «История» сразу вела на рабочую страницу. Затем поэтапно вводить подход B.

---

## Этап 1: MVP — страница «История» без нового backend (2–3 дня)

Используем только существующие API. Никаких изменений в backend.

### 1.1 API-клиент (web)

**Файл:** `apps/web/src/services/api.ts`

Добавить методы для всех сервисов по аналогии с `getTarotHistory`:

```typescript
// Уже есть: getTarotHistory, getDreamHistory
// Добавить:
async getNumerologyHistory(limit = 20, offset = 0) {
  return this.request(`/numerology/history?limit=${limit}&offset=${offset}`);
}
async getIchingHistory(limit = 20, offset = 0) {
  return this.request(`/iching/history?limit=${limit}&offset=${offset}`);
}
async getLenormandHistory(limit = 20, offset = 0) {
  return this.request(`/lenormand/history?limit=${limit}&offset=${offset}`);
}
async getSynastryHistory(limit = 20, offset = 0) {
  return this.request(`/synastry/history?limit=${limit}&offset=${offset}`);
}
```

Добавить единый метод, который вызывает все и объединяет (для одной страницы):

```typescript
async getUnifiedHistory(params: { serviceType?: string; page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const services = ['tarot', 'numerology', 'iching', 'dreams', 'lenormand', 'synastry'];
  const toFetch = params.serviceType ? [params.serviceType] : services;
  const results = await Promise.allSettled([
    toFetch.includes('tarot') ? this.getTarotHistory(pageSize, offset) : null,
    toFetch.includes('numerology') ? this.getNumerologyHistory(pageSize, offset) : null,
    toFetch.includes('iching') ? this.getIchingHistory(pageSize, offset) : null,
    toFetch.includes('dreams') ? this.getDreamHistory(pageSize, offset) : null,
    toFetch.includes('lenormand') ? this.getLenormandHistory(pageSize, offset) : null,
    toFetch.includes('synastry') ? this.getSynastryHistory(pageSize, offset) : null,
  ].filter(Boolean));
  // Нормализовать в единый формат { id, type, title, question, preview, createdAt } и объединить
  // Отсортировать по createdAt desc, взять slice для page
  return { items: [...], total: N, page, pageSize };
}
```

Либо без единого метода: на странице вызывать 6 запросов параллельно, нормализовать ответы в общий тип, объединить, отсортировать по дате и нарезать пагинацию на клиенте (проще, но при большой истории может быть тяжело — тогда пагинацию делать «по сервису» или грузить по одному сервису при выборе фильтра).

**Упрощённый вариант MVP:** не единый список с пагинацией по всем сервисам, а табы/фильтр «по типу сервиса»; при выборе типа — один запрос к соответствующему API с пагинацией. Так не нужно объединять на клиенте и проще реализовать.

### 1.2 Типы (web)

**Файл:** `apps/web/src/types/index.ts` (или `apps/web/src/types/history.ts`)

```typescript
export type ConsultationServiceType = 'tarot' | 'numerology' | 'iching' | 'dreams' | 'lenormand' | 'synastry';

export interface ConsultationHistoryItem {
  id: string;
  type: ConsultationServiceType;
  title: string;
  question: string | null;
  preview: string;
  createdAt: string;
  // позже: isFavorite?: boolean;
}
```

### 1.3 Компонент карточки консультации

**Файл:** `apps/web/src/components/history/ConsultationCard.tsx`

- Показывает: тип сервиса (badge), дату, вопрос (обрезанный), превью результата.
- Клик ведёт на `/history/[type]/[id]` или открывает модалку с деталями (на MVP можно только ссылку на детали).
- Использовать компоненты дизайн-системы: Card, Badge, Button.

### 1.4 Компонент списка с пагинацией

**Файл:** `apps/web/src/components/history/HistoryList.tsx`

- Принимает `items`, `loading`, `error`, `page`, `totalPages`, `onPageChange`.
- Сетка карточек (1 col mobile, 2–3 desktop).
- Пагинация: кнопки «Назад»/«Вперёд» или номера страниц (из дизайн-системы Pagination).
- Empty state: «Консультаций пока нет».
- Error state: сообщение + «Повторить».

### 1.5 Фильтр по типу сервиса (MVP)

**Файл:** `apps/web/src/components/history/HistoryFilters.tsx` (упрощённый)

- Выпадающий список (Select) или табы: «Все», «Таро», «Нумерология», «И-Цзин», «Сны», «Ленорман», «Синастрия».
- При смене — перезапрос данных (один API при выборе типа, при «Все» — либо 6 запросов + объединение, либо оставить «Все» как «Таро» по умолчанию для простоты).

### 1.6 Страница истории

**Файл:** `apps/web/src/app/history/page.tsx`

- Protected: редирект на логин, если нет пользователя.
- Состояния: `serviceType`, `page`, `loading`, `error`, `items`, `total`, `totalPages`.
- Вверху: заголовок «История консультаций», HistoryFilters.
- По центру: HistoryList (карточки + пагинация).
- При монтировании и при смене фильтра/страницы — вызов API (getUnifiedHistory или отдельные getXxxHistory).
- Использовать Section, Container из дизайн-системы.

### 1.7 Навигация

- Убедиться, что в Navbar/меню есть ссылка «История» на `/history` (если ещё нет).
- Ссылки с сервисов уже ведут на `/history` через ResultActions — после создания страницы они начнут работать.

**Критерий готовности этапа 1:** пользователь заходит на `/history`, видит список своих консультаций (по всем или выбранному типу), листает страницы, кликает по карточке (на MVP можно вести на заглушку детали или модалку с полным текстом из существующих полей).

---

## Этап 2: Детальный просмотр (1 день)

### 2.1 Страница детали консультации

**Вариант без нового backend:** детали уже есть в ответах существующих API (например, один элемент из списка). Можно сделать маршрут `/history/[type]/[id]`: при открытии снова запросить соответствующий history (или один элемент по id, если в каком-то API есть get by id).

**Файл:** `apps/web/src/app/history/[type]/[id]/page.tsx`

- `type` — tarot | numerology | iching | dreams | lenormand | synastry.
- По `type` вызывать нужный API (например, getTarotHistory с limit=100 и найти по id на клиенте; или добавить на backend GET `/api/tarot/readings/{id}` и т.п.).
- Отобразить: тип, дату, вопрос, полный результат, кнопку «Назад к истории».

Если по API нельзя получить одну консультацию по id — на backend добавить эндпоинты вида `GET /api/tarot/readings/{id}` (и аналоги для остальных), с проверкой ownership. Тогда фронт просто запрашивает один item по id.

---

## Этап 3: Backend — единый API и удаление (3–4 дня)

### 3.1 Роутер истории

**Файл:** `apps/backend/app/api/history.py` (новый)

- Подключить в `main.py`: `app.include_router(history.router, prefix="/api/history", tags=["History"])`.

### 3.2 GET /api/history (unified)

- Параметры: `service_type`, `date_from`, `date_to`, `search`, `sort` (date_desc/date_asc/service), `page`, `page_size`.
- Внутри вызывать существующие сервисы (get_reading_history и т.д.), нормализовать в общую схему, объединить, отфильтровать по дате/поиску, отсортировать, применить пагинацию.
- Возвращать: `{ items: [...], total, page, page_size, total_pages }`.
- Аутентификация обязательна.

### 3.3 GET /api/history/{id}

- Параметр: `id` + опционально `type` (или определять тип по префиксу/таблице). Получить одну консультацию из нужной таблицы, проверить user_id, вернуть 404/403 при отсутствии или чужой.

### 3.4 DELETE /api/history/{id}

- Определить тип консультации (по id в одной из таблиц или по полю type в unified ответе). Удалить запись, проверить user_id. Вернуть 204 или { deleted: true }.

### 3.5 Схемы

**Файл:** `apps/backend/app/schemas/history.py`

- `ConsultationHistoryItem`, `ConsultationHistoryResponse`, `ConsultationDetailResponse`, фильтры (query params).

После этапа 3 фронт можно перевести на единый `getUnifiedHistory` к `GET /api/history` и добавить кнопку «Удалить» с подтверждением и вызовом DELETE.

---

## Этап 4: Избранное и статистика (2 дня)

### 4.1 Миграция БД

- Добавить в таблицы консультаций поле `is_favorite BOOLEAN DEFAULT FALSE`: tarot_readings, numerology_calculations, iching_consultations, dream_interpretations, lenormand_readings, synastries.
- Файл миграции: `apps/backend/alembic/versions/XXX_add_consultation_favorites.py`.

### 4.2 POST /api/history/{id}/favorite

- Toggle is_favorite для записи, проверить ownership. Вернуть { is_favorite: true/false }.

### 4.3 GET /api/history/stats

- Агрегация по user_id: total_count, by_service (tarot: N, ...), most_used_service, first_consultation_at, last_consultation_at, favorites_count. Кэш на 1–5 минут по user_id опционально.

### 4.4 Frontend

- В карточке и в деталях — иконка «звезда» (избранное), вызов toggle favorite, обновление списка/статуса.
- Блок HistoryStats на странице `/history`: всего консультаций, самый частый сервис, даты первой/последней, кол-во избранных.
- Фильтр «Только избранные» в HistoryFilters (передавать `favorites_only=true` в GET /api/history).

---

## Этап 5: Экспорт (Premium) и шаринг (Platinum) (3–4 дня)

### 5.1 POST /api/history/export

- Body: `{ consultation_ids: string[], format: 'pdf' | 'json' | 'csv' }`.
- Проверка tier (premium/platinum). Генерация файла (PDF через reportlab/weasyprint, JSON/CSV — свои сериализаторы), возврат файла с заголовками Content-Disposition.

### 5.2 ExportDialog (frontend)

- Модалка: выбор формата, выбор консультаций (или «текущая»/«выбранные»). Кнопка «Скачать». Для freemium — блок с предложением апгрейда.

### 5.3 POST /api/history/share

- Body: `{ consultation_id: string }`. Проверка platinum. Создать запись в consultation_shares (token, consultation_id, user_id, created_at, is_revoked=false). Вернуть { share_url: string }.

### 5.4 GET /api/shared/{share_token}

- Публичный (без JWT). По токену найти запись, если is_revoked или истёк срок — 404. Вернуть консультацию без чувствительных данных (user_id и т.д.).

### 5.5 ShareDialog, страница /shared/[token]

- ShareDialog: показать ссылку, кнопка «Копировать», «Отозвать».
- Страница `apps/web/src/app/shared/[token]/page.tsx`: запрос GET /api/shared/{token}, отображение консультации, «Кто поделился / когда».

---

## Этап 6: Массовые действия и полировка (2 дня)

### 6.1 Bulk endpoints

- POST /api/history/bulk-delete: `{ consultation_ids: string[] }`, проверка ownership, удаление.
- POST /api/history/bulk-favorite: `{ consultation_ids: string[], action: 'add' | 'remove' }`.

### 6.2 Frontend

- В HistoryList: чекбоксы у карточек, «Выбрать все на странице». Панель BulkActions: «Удалить выбранные», «В избранное», «Экспорт» (premium). Подтверждение для удаления.

### 6.3 Тесты и a11y

- Unit-тесты: API history (хотя бы GET /api/history, DELETE, toggle favorite, stats).
- Интеграционный сценарий: открыть /history → фильтр → открыть деталь → удалить.
- Проверка клавиатуры и ARIA на странице истории.

---

## Порядок выполнения (чеклист)

- [ ] **Этап 1 — MVP**  
  - [ ] api.ts: getNumerologyHistory, getIchingHistory, getLenormandHistory, getSynastryHistory  
  - [ ] api.ts: getUnifiedHistory (или логика на странице: 6 запросов + объединение по типу/табам)  
  - [ ] types: ConsultationHistoryItem, ConsultationServiceType  
  - [ ] ConsultationCard.tsx  
  - [ ] HistoryList.tsx  
  - [ ] HistoryFilters.tsx (фильтр по типу)  
  - [ ] app/history/page.tsx  
  - [ ] Проверка: ссылка «История» с сервисов ведёт на рабочую страницу  

- [ ] **Этап 2 — Детали**  
  - [ ] Backend (опционально): GET /api/tarot/readings/{id}, … по сервисам, или единый GET /api/history/{id}  
  - [ ] app/history/[type]/[id]/page.tsx или модалка с деталями  

- [ ] **Этап 3 — Единый API и удаление**  
  - [ ] history.py: GET /api/history, GET /api/history/{id}, DELETE /api/history/{id}  
  - [ ] schemas/history.py  
  - [ ] Frontend: перевести на GET /api/history, кнопка «Удалить» + подтверждение  

- [ ] **Этап 4 — Избранное и статистика**  
  - [ ] Миграция is_favorite  
  - [ ] POST /api/history/{id}/favorite, GET /api/history/stats  
  - [ ] HistoryStats, иконка избранного, фильтр «Только избранные»  

- [ ] **Этап 5 — Экспорт и шаринг**  
  - [ ] POST /api/history/export, ExportDialog, tier-check  
  - [ ] POST /api/history/share, GET /api/shared/{token}, ShareDialog, /shared/[token]  

- [ ] **Этап 6 — Bulk и полировка**  
  - [ ] bulk-delete, bulk-favorite, BulkActions, чекбоксы  
  - [ ] Тесты и доступность  

---

## Оценка по срокам

| Этап | Срок |
|------|------|
| 1. MVP | 2–3 дня |
| 2. Детали | 1 день |
| 3. Unified API + Delete | 3–4 дня |
| 4. Favorites + Stats | 2 дня |
| 5. Export + Share | 3–4 дня |
| 6. Bulk + Polish | 2 дня |
| **Итого** | **~13–16 дней** |

Если ограничиться только этапами 1–3, пользователь получит рабочую историю с просмотром и удалением за **~6–8 дней**.
