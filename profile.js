document.addEventListener('DOMContentLoaded', () => {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
        // Если пользователя нет, перенаправляем на автоматическую регистрацию/вход
        window.location.href = 'registration.html';
        return;
    }
    
    let userData = JSON.parse(currentUserData);
    
    const userIdDisplay = document.getElementById('user-id-display');
    const usernameDisplay = document.getElementById('username-display');
    const emailDisplay = document.getElementById('email-display');
    const dobDisplay = document.getElementById('dob-display');
    const regDateDisplay = document.getElementById('reg-date-display');
    const passwordDisplay = document.getElementById('password-display');
    const editBtn = document.getElementById('edit-profile-btn');
    const deleteBtn = document.getElementById('delete-profile-btn');

    // Поскольку пароль теперь равен имени и является видимым, мы отображаем его
    userData.password = userData.password || userData.username; 
    
    const saveUserData = () => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };
    
    const updateDisplay = () => {
        userIdDisplay.textContent = userData.id || 'N/A';
        usernameDisplay.textContent = userData.username || 'N/A';
        emailDisplay.textContent = userData.email || 'N/A';
        dobDisplay.textContent = userData.dob || 'N/A';
        regDateDisplay.textContent = userData.registrationDate || 'N/A';
        passwordDisplay.textContent = userData.password || 'N/A'; // Отображаем имя как пароль
        // Удалена строка для passwordChangesDisplay
    };
    updateDisplay();

    // 💡 Логика изменения профиля
    editBtn.addEventListener('click', () => {
        // Убрана опция 'ПАРОЛЬ', так как он привязан к Telegram ID/Имени
        const choice = prompt("Что вы хотите изменить? Введите 'ИМЯ' (пользователя) или 'ДАТА' (рождения):").toUpperCase();

        if (choice === 'ИМЯ') {
            const newName = prompt(`Текущее имя пользователя: ${userData.username}. Введите новое Имя Пользователя (для отображения):`);
            if (newName && newName.trim() !== userData.username) {
                userData.username = newName.trim();
                saveUserData();
                alert('Имя пользователя успешно изменено!');
            } else if (newName && newName.trim() === userData.username) {
                alert('Вы ввели то же самое имя.');
            }
        } else if (choice === 'ДАТА') {
            const newDOB = prompt(`Текущая дата рождения: ${userData.dob}. Введите новую дату рождения (формат ДД.ММ.ГГГГ):`);
            if (newDOB) {
                userData.dob = newDOB;
                saveUserData();
                alert('Дата рождения успешно изменена!');
            }
        } else {
            alert('Некорректный выбор. Пожалуйста, введите "ИМЯ" или "ДАТА".');
        }
        updateDisplay();
    });

    // 💡 Логика удаления профиля
    deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm('ВНИМАНИЕ! Вы уверены, что хотите навсегда удалить свой профиль? Это действие необратимо и удалит все ваши локальные данные (балансы, животных).');
        if (confirmDelete) {
            // Очищаем все локальные данные, связанные с пользователем
            localStorage.removeItem('currentUser');
            localStorage.removeItem('purchaseBalance');
            localStorage.removeItem('realBalance');
            localStorage.removeItem('purchasedAnimals'); // Очищаем список животных

            alert('Ваш локальный профиль был удален навсегда. Для продолжения используйте команду /start в боте.');
            
            // Перезагрузка Mini App, чтобы запустить процесс автоматического входа/регистрации заново
            window.location.href = 'registration.html';
        } else {
            alert('Удаление отменено.');
        }
    });
});