document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, запущены ли мы внутри Telegram Mini App
    if (window.Telegram && window.Telegram.WebApp) {
        const WebApp = window.Telegram.WebApp;
        WebApp.ready();

        const currentUserData = localStorage.getItem('currentUser');
        const tgUser = WebApp.initDataUnsafe.user;
        
        // Если пользователь уже вошел в систему (есть в localStorage), перенаправляем на главную
        if (currentUserData) {
             window.location.href = 'index.html';
             return;
        }

        // Если есть данные Telegram, выполняем автоматический вход
        if (tgUser && tgUser.id) {
            
            const username = tgUser.username || tgUser.first_name;
            const password = tgUser.first_name; // Имя как видимый "пароль"
            const registrationDate = new Date().toISOString().split('T')[0];
            
            // Формируем объект пользователя для localStorage
            const newUser = {
                id: tgUser.id,
                username: username,
                password: password, 
                dob: 'N/A', 
                email: 'N/A',
                registrationDate: registrationDate,
                passwordChanges: 0
            };

            // Сохраняем пользователя (имитация регистрации/входа)
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Устанавливаем начальные балансы, если их нет
            if (!localStorage.getItem('purchaseBalance')) {
                localStorage.setItem('purchaseBalance', '0.00');
            }
            if (!localStorage.getItem('realBalance')) {
                localStorage.setItem('realBalance', '0.00');
            }

            // Успех! Перенаправляем на главную страницу
            window.location.href = 'index.html';
            
        } else {
            // Ошибка: данные Telegram недоступны
            document.querySelector('.profile-card h2').textContent = "Ошибка Входа 🛑";
            document.querySelector('.profile-card p').innerHTML = "Не удалось получить данные Telegram. Пожалуйста, откройте Мини-Приложение через кнопку в боте.";
            document.getElementById('registration-form').innerHTML = '<p style="color: red;">Попробуйте перезапустить бота и открыть Ферму снова.</p>';
        }

    } else {
        // Если открыто не в TWA
        document.querySelector('.profile-card h2').textContent = "Доступ Запрещен 🔒";
        document.querySelector('.profile-card p').innerHTML = "Эта страница предназначена только для запуска внутри Telegram Mini App. Пожалуйста, откройте бота.";
        document.getElementById('registration-form').innerHTML = '<p style="color: red;">Ссылка на бот: @Ваш_Бот</p>';
    }
});