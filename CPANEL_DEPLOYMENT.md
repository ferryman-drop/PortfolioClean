# Інструкція розгортання на cPanel

## Крок 1: Завантаження файлів
1. Увійдіть в cPanel
2. Відкрийте File Manager
3. Перейдіть в папку `public_html`
4. Завантажте архів `PortfolioForCpanel.zip`
5. Розархівуйте файли

## Крок 2: Налаштування Node.js App
1. У cPanel знайдіть "Node.js App Manager"
2. Натисніть "Create Application"
3. Заповніть поля:
   - **Node.js version**: 18.x або 20.x
   - **Application mode**: Production
   - **Application root**: `/home/username/public_html`
   - **Application URL**: `yourdomain.com`
   - **Application startup file**: `server.js`

## Крок 3: Встановлення залежностей
Через SSH або Terminal cPanel:
```bash
cd /home/username/public_html
npm install
npm run build
```

## Крок 4: Запуск додатку
```bash
npm start
```

## Альтернативний спосіб через SSH:
```bash
# Підключення
ssh username@yourdomain.com

# Перехід в папку
cd public_html

# Встановлення залежностей
npm install

# Створення production build
npm run build

# Запуск з PM2 (рекомендовано)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Важливі файли:
- `server.js` - головний файл сервера
- `.htaccess` - налаштування Apache
- `ecosystem.config.js` - конфігурація PM2
- `package.json` - залежності та скрипти

## Перевірка роботи:
- Відкрийте ваш домен у браузері
- Перевірте логи в cPanel або через SSH
- Якщо є помилки - перевірте версію Node.js 