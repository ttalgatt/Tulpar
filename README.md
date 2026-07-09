# Бұзау.kz (Buzau)

Маркетплейс объявлений о домашних животных, скоте, около-животных товарах и услугах для Казахстана. Двуязычный (русский / қазақша), быстрый, с фильтрами и удобной модерацией.

## Технологии

- **Next.js 14** (App Router, RSC, Server Actions) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **lucide-react**
- **next-intl** — i18n (ru / kk)
- **Supabase** — PostgreSQL + Auth + Storage + RLS
- **Vercel** — хостинг приложения
- **Cloudflare** — DNS / CDN / WAF

## Структура

```
src/
  app/
    [locale]/            # все локализованные страницы
      (account)/         # профиль, мои объявления, избранное
      (admin)/admin/     # админка и модерация
      auth/              # вход / регистрация / сброс пароля
      listings/          # каталог + создание + детальная
      events/            # события (выставки, соревнования)
      page.tsx           # главная
      layout.tsx         # html/body, провайдеры
    auth/callback/       # OAuth/email callback (без локали)
    layout.tsx           # пустой root layout
    globals.css
  components/
    ui/                  # shadcn-компоненты
    layout/              # Header, Footer, LocaleSwitcher, UserMenu
    listings/            # карточки, фильтры, форма объявления
    events/              # карточки событий
  hooks/                 # use-toast и т.п.
  i18n/                  # next-intl routing/request
  lib/
    auth.ts              # getCurrentUser, isModerator, isAdmin
    supabase/{client,server,middleware}.ts
    listings/            # бизнес-логика объявлений
    utils.ts
  messages/{ru,kk}.json  # переводы
  middleware.ts          # next-intl + Supabase session refresh
supabase/
  migrations/            # SQL-миграции (нумерованные)
  seed.sql               # справочники локаций и категорий
  config.toml            # Supabase CLI
```

## Быстрый старт

### Предусловия

- Node.js ≥ 20
- pnpm 9 (`npm i -g pnpm`)
- Supabase CLI (`npm i -g supabase`)
- Аккаунт [supabase.com](https://supabase.com) и [vercel.com](https://vercel.com)

### 1. Установка зависимостей

```bash
pnpm install
```

### 2. Настройка Supabase

```bash
# Создайте проект на supabase.com и заберите URL/ANON_KEY/SERVICE_ROLE_KEY
supabase login
supabase link --project-ref <your-ref>

# Применить миграции и сидинг
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql

# Сгенерировать типы
pnpm db:types
```

### 3. Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Запуск

```bash
pnpm dev
```

Откройте http://localhost:3000

## Скрипты

| Команда            | Назначение                                |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Запуск dev-сервера                        |
| `pnpm build`       | Production-сборка                         |
| `pnpm start`       | Запуск собранного приложения              |
| `pnpm lint`        | ESLint                                    |
| `pnpm typecheck`   | TypeScript без эмита                      |
| `pnpm format`      | Prettier (запись)                         |
| `pnpm format:check`| Prettier проверка                         |
| `pnpm db:types`    | Сгенерировать `database.types.ts`         |

## База данных

Миграции в `supabase/migrations/` пронумерованы и применяются в порядке имени. Базовые таблицы:

- `profiles` — расширение `auth.users`
- `regions` / `cities` / `districts` — иерархия локаций РК
- `categories` — иерархия со `kind` (`pets`, `livestock`, `goods`, `services`, `events`)
- `listings` — объявления, FTS через `search_tsv`
- `listing_photos`, `listing_attributes` (EAV), `favorites`
- `events` — выставки, соревнования
- `user_roles` (`admin` / `moderator`), `reports` (жалобы)

RLS включён на всех таблицах. Анонимы видят только `published`, владельцы видят свои объявления, модераторы — всё.

## Деплой

### Vercel

1. Импортируйте репозиторий в Vercel
2. Добавьте переменные из `.env.example` в Settings → Environment Variables
3. Деплой произойдёт автоматически

### Cloudflare

1. Добавьте домен в Cloudflare
2. DNS-записи: `CNAME` на `cname.vercel-dns.com` с включённым прокси (orange cloud)
3. SSL/TLS → Full (strict)
4. В Vercel → Settings → Domains добавьте домен и подтвердите ownership

### CI

GitHub Actions запускают `lint`, `typecheck`, `build` на каждом PR — см. `.github/workflows/ci.yml`.

## Дорожная карта (фазы)

- [x] **Фаза 0** — каркас, i18n, auth, layout
- [x] **Фаза 1** — объявления (домашние животные)
- [x] **Фаза 2** — скот, товары, услуги
- [x] **Фаза 3** — события
- [x] **Фаза 4** — админка и модерация

См. также `doc/brief.md` и план в `.cursor/plans/`.
