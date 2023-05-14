# Телеграм-бот для работы с ChatGPT
Наш телеграм бот позволяет общаться с ChatGPT на основе OpenAI (GPT-3.5). Пользователи могут отправлять текстовые сообщения, и бот будет отвечать на них, используя нейронную сеть OpenAI. Мы используем фреймворк Nest.js, библиотеку telegraf и модуль OpenAI для работы с искусственным интеллектом.

## Установка
Следуйте этим шагам, чтобы установить и запустить телеграм бота на своем локальном компьютере.

### Клонирование репозитория
Клонируйте репозиторий на свой локальный компьютер, используя следующую команду:

```bash
git clone https://github.com/yoyopokki/chatgpt-telegram-bot.git
```

### Создание .env файла
В корневом каталоге проекта создайте файл .env со следующими переменными окружения:

```makefile
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
OPENAI_API_KEY=<your-openai-api-key>

POSTGRESQL_HOST=<your-postgres-host>
POSTGRESQL_PORT=<your-postgres-port>
POSTGRESQL_USERNAME=<your-postgres-username>
POSTGRESQL_PASSWORD=<your-postgres-password>
POSTGRESQL_DATABASE=<your-postgres-database>
```

### Установка и запуск Docker Compose
Выполните следующую команду для установки и запуска проекта:

```bash
docker-compose up
```

### Запуск без Docker
Если вы хотите запустить приложение без использования Docker, выполните следующие шаги:

- Установите Node.js 16 и PostgreSQL 12 на свой компьютер.

- Создайте базу данных в PostgreSQL 12 и настройте переменные окружения в файле .env.

- Установите зависимости, выполнив команду:

```bash
npm install
```
Запустите приложение, выполнив команду:

```bash
npm run start:dev
```
После запуска приложение будет доступно на http://localhost:3000/.
Чтобы запустить телеграм-бота, необходимо перейти по ссылке http://localhost:3000/telegram-bot/start.
