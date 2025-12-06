document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const dobInput = document.getElementById('reg-dob');
    const usernameError = document.getElementById('username-error');

    const getExistingUsers = () => {
        const users = localStorage.getItem('allUsers');
        const initialUsers = users ? JSON.parse(users) : [{ id: 100001, username: 'admin', password: '123', purchaseBalance: 0, realBalance: 0 }]; 
        return initialUsers;
    };
    
    const saveUsers = (users) => {
        localStorage.setItem('allUsers', JSON.stringify(users));
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUsername = usernameInput.value.trim();
        const existingUsers = getExistingUsers();
        
        const isDuplicate = existingUsers.some(user => user.username.toLowerCase() === newUsername.toLowerCase());

        if (isDuplicate) {
            usernameError.textContent = '❌ Это имя пользователя уже занято. Выберите другое.';
            return;
        }

        usernameError.textContent = ''; 

        const newUserId = Date.now(); 
        
        const newUser = {
            id: newUserId, 
            username: newUsername,
            password: passwordInput.value,
            dob: dobInput.value,
            registrationDate: new Date().toLocaleDateString('ru-RU'),
            passwordChanges: 0,
            purchaseBalance: 0.00, 
            realBalance: 0.00
        };

        existingUsers.push(newUser);
        saveUsers(existingUsers);
        
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('purchaseBalance', 0.00); 
        localStorage.setItem('realBalance', 0.00);      

        alert('✅ Регистрация прошла успешно! Выполнен вход.');
        window.location.href = 'index.html'; 
    });
});