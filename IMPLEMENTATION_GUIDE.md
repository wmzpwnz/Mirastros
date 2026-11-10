# Mirastros: запуск и дальнейшая работа

См. [текущую готовность релиза](docs/RELEASE_READINESS.md) и
[доставку через GitHub](deployment/GITHUB_DEPLOYMENT.md).

Изменения приложения проходят через GitHub. Production не редактируется
вручную агентами. Не включайте `.env`, ключи, базы, логи и зависимости в коммиты.
Google требует настроенного client ID и серверной проверки ID token.
Telegram Mini App передаёт подписанный initData в backend. Apple/VK-кнопки
отключены до реализации проверенных callback-потоков.
