# Доставка Mirastros через GitHub

Цепочка: Codex/MacBook → GitHub → проверки и сборка Actions → VPS.
Никаких `.env`, приватных ключей или баз в Git. Сборки создаются вне VPS.

## Один раз со стороны владельца

В Settings → Secrets and variables → Actions добавить:

- `MIRASTROS_DEPLOY_SSH_KEY`: приватный ключ отдельного пользователя доставки.
  Для подготовленного VPS ключ находится в `/root/mirastros-deploy/id_ed25519`.
  Переносить его в GitHub только по проверенному SSH, не через чат.
- `MIRASTROS_SSH_KNOWN_HOSTS`: проверенная строка host key для
  `84.200.80.125` из `known_hosts`. Не отключать проверку ключа.

Создать GitHub Environment `production`, настроить required reviewer владельца
и допуск только утверждённых веток. Защитить стабильную ветку `Mirastros`
через Pull Requests и успешные проверки. Доступность защиты зависит от тарифа GitHub.

Проверить и слить PR. В Actions → Verify and deploy Mirastros → Run workflow
выбрать утверждённую ветку и установить `deploy=true`. Запуск доставки разрешён
только владельцу репозитория (`github.actor == github.repository_owner`). Процесс выполняется
только по ручному запуску, а не на каждом push; при включённом required reviewer
доставка также ждёт подтверждения окружения production.

## Подготовка администратора VPS

Требуются PostgreSQL 14 с pgvector, Redis, Nginx, Python 3.10+ и инструменты сборки.
Создать системного пользователя `mirastros` и каталоги `/srv/mirastros/releases`,
`/srv/mirastros/shared`. Создать root-owned файл `shared/backend.env`, группа
`mirastros`, режим 0640, с runtime-параметрами. Он должен быть совместим
с EnvironmentFile systemd и shell-assignments; не вставлять произвольный shell-код.

Обязательны DATABASE_URL, REDIS_URL, стабильный SECRET_KEY, ENVIRONMENT=production,
DEBUG=false, CORS_ORIGINS. DeepSeek требует DEEPSEEK_API_KEY. БД и Redis слушают
только loopback. Рекомендуется swap для VPS с 1 GB RAM.

Из утверждённого Git-коммита установить `receive-release.sh` как root-owned
`/usr/local/sbin/mirastros-receive` (0755). В authorized_keys выделенный публичный
ключ должен иметь опции:

```
restrict,command="/usr/local/sbin/mirastros-receive" ssh-ed25519 ...
```

Ключ не даёт интерактивную shell-сессию, forwarding или произвольную root-команду.
Владельцу сервера следует отозвать ключ при утечке и сменить ранее раскрытый пароль.

Установить systemd units из `deployment/systemd/mirastros-{api,web}.service`.
API слушает 127.0.0.1:8000, web — 127.0.0.1:3000. Nginx проксирует `/api/`
со снятием префикса в API, остальные запросы — в web. Для домена настроить DNS,
получить действующий сертификат и включить HTTPS. IP-конфигурация служит только
для первоначальной проверки, не заменяет домен и TLS.

Приёмник проверяет формат SHA, размер и структуру архива, устанавливает Python-
зависимости в release-specific venv, инициализирует только пустую БД и переключает
символическую ссылку current. При провале readiness и страницы входа возвращает
предыдущий релиз. Для изменений существующей схемы нужны отдельные миграции:
откат приложения не откатывает БД.

Старые релизы сохраняются для отката. Следить за свободным диском и удалять
устаревшие только после проверки; текущий и предыдущий рабочий релиз сохранять.

## Проверка после доставки

- `systemctl is-active mirastros-api mirastros-web nginx`;
- внутренний `/health/readiness` и внешний `/api/health/readiness`;
- страницы входа и регистрации, загрузка JS/CSS и изображений;
- тестовая регистрация/вход, запрос DeepSeek с тестовым аккаунтом;
- проверка HTTPS с корректной цепочкой сертификатов;
- проверка доступности с внешней сети, а не только через Tailscale.
