document.addEventListener('DOMContentLoaded', () => {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
        window.location.href = 'registration.html';
        return;
    }
    
    let userData = JSON.parse(currentUserData);
    
    const userIdDisplay = document.getElementById('user-id-display');
    const usernameDisplay = document.getElementById('username-display');
    const dobDisplay = document.getElementById('dob-display');
    const regDateDisplay = document.getElementById('reg-date-display');
    const passwordChangesDisplay = document.getElementById('password-changes-display');
    const editBtn = document.getElementById('edit-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteBtn = document.getElementById('delete-profile-btn');

    const saveUserData = () => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };
    
    const updateDisplay = () => {
        userIdDisplay.textContent = userData.id || 'N/A';
        usernameDisplay.textContent = userData.username || 'N/A';
        dobDisplay.textContent = userData.dob || 'N/A';
        regDateDisplay.textContent = userData.registrationDate || 'N/A';
        passwordChangesDisplay.textContent = userData.passwordChanges;
    };
    updateDisplay();

    editBtn.addEventListener('click', () => {
        const choice = prompt("Что вы хотите изменить? Введите 'ИМЯ', 'ДАТА' (рождения), или 'ПАРОЛЬ':").toUpperCase();

        if (choice === 'ИМЯ') {
            const newName = prompt(`Текущее имя: ${userData.username}. Введите новое Имя Пользователя:`);
            if (newName && newName.trim() !== userData.username) {
                userData.username = newName.trim();
                saveUserData();
                alert('Имя пользователя успешно изменено!');
            } else if (newName.trim() === userData.username) {
                 alert('Вы ввели то же самое имя.');
            }
        } else if (choice === 'ДАТА') {
            const newDOB = prompt(`Текущая дата рождения: ${userData.dob}. Введите новую дату рождения (формат ДД.ММ.ГГГГ):`);
            if (newDOB) {
                userData.dob = newDOB;
                saveUserData();
                alert('Дата рождения успешно изменена!');
            }
        } else if (choice === 'ПАРОЛЬ') {
            if (userData.passwordChanges >= userData.maxPasswordChanges) {
                return alert(`Ошибка: Вы уже меняли пароль ${userData.passwordChanges} раз. Лимит (${userData.maxPasswordChanges}) исчерпан.`);
            }
            
            const newPass = prompt("Введите новый пароль:");
            if (newPass) {
                userData.passwordChanges++;
                userData.maxPasswordChanges = 2;
                saveUserData();
                alert(`Пароль успешно изменен! Осталось попыток: ${userData.maxPasswordChanges - userData.passwordChanges}.`);
            }
        } else {
            alert('Некорректный выбор.');
        }
        updateDisplay();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser'); 
        alert('Вы успешно вышли из профиля.');
        window.location.href = 'registration.html';
    });

    deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm('ВНИМАНИЕ! Вы уверены, что хотите навсегда удалить свой профиль? Это действие необратимо.');
        if (confirmDelete) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('purchaseBalance');
            localStorage.removeItem('realBalance');
            alert('Ваш профиль был удален навсегда. Спасибо, что были с нами!');
            window.location.href = 'registration.html';
        } else {
            alert('Удаление отменено.');
        }
    });
});