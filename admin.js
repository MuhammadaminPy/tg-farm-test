document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('add-animal-form');
    const priceInput = document.getElementById('animal-price');
    const incomeInput = document.getElementById('animal-income');
    const durationDisplay = document.getElementById('calculated-duration');
    const currentAnimalsList = document.getElementById('current-animals-list');
    
    const replenishForm = document.getElementById('admin-replenish-form');
    const giveAnimalForm = document.getElementById('admin-give-animal-form');
    const animalSelect = document.getElementById('animal-select');

    const registeredUsersList = document.getElementById('registered-users-list');
    const userCountDisplay = document.getElementById('user-count');

    const calculateDuration = (price, dailyIncome) => {
        if (price > 0 && dailyIncome > 0) {
            return ((price * 1.5) / dailyIncome).toFixed(2);
        }
        return '0';
    };
    
    const getAnimalDB = () => {
        const animals = localStorage.getItem('globalAnimalsDB');
        if (!animals) {
            const initialAnimals = [
                { id: 1, name: "Корова", price: 30, income: 0.85, duration: calculateDuration(30, 0.85) },
                { id: 2, name: "Овца", price: 80, income: 1.80, duration: calculateDuration(80, 1.80) },
                { id: 3, name: "Петух", price: 150, income: 2.50, duration: calculateDuration(150, 2.50) }
            ];
            localStorage.setItem('globalAnimalsDB', JSON.stringify(initialAnimals));
            return initialAnimals;
        }
        return JSON.parse(animals);
    };
    
    const saveAnimalDB = (db) => {
        localStorage.setItem('globalAnimalsDB', JSON.stringify(db));
    };
    
    let animalsDB = getAnimalDB();

    const getExistingUsers = () => {
        const users = localStorage.getItem('allUsers');
        const initialUsers = users ? JSON.parse(users) : [{ id: 100001, username: 'admin', password: '123', purchaseBalance: 0, realBalance: 0 }]; 
        return initialUsers;
    };
    
    const saveUsers = (users) => {
        localStorage.setItem('allUsers', JSON.stringify(users));
    };

    const getPurchasedAnimals = () => {
        const animals = localStorage.getItem('purchasedAnimals');
        return animals ? JSON.parse(animals) : [];
    };

    const savePurchasedAnimals = (animals) => {
        localStorage.setItem('purchasedAnimals', JSON.stringify(animals));
    };

    const renderUserList = () => {
        const users = getExistingUsers();
        registeredUsersList.innerHTML = '';
        userCountDisplay.textContent = users.length;

        if (users.length === 0) {
            registeredUsersList.innerHTML = '<tr><td colspan="4" class="text-center">Нет зарегистрированных пользователей.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${(user.purchaseBalance || 0).toFixed(2)} Р</td>
                <td>${user.registrationDate || 'N/A'}</td>
            `;
            registeredUsersList.appendChild(row);
        });
    };

    const renderAnimalList = () => {
        currentAnimalsList.innerHTML = '';
        animalsDB.forEach(animal => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${animal.name} | Цена: ${animal.price} Р | Доход: ${animal.income} Р | Срок: ${animal.duration} д.`;
            currentAnimalsList.appendChild(li);
        });
    };
    
    renderAnimalList();
    renderUserList();

    const loadAnimalOptions = () => {
        const animalsDB = getAnimalDB();
        animalSelect.innerHTML = '';
        if (animalsDB.length === 0) {
            animalSelect.innerHTML = '<option value="">Нет доступных животных</option>';
            return;
        }
        
        animalsDB.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.name} (Цена: ${animal.price} Р)`;
            option.dataset.price = animal.price;
            option.dataset.income = animal.income;
            animalSelect.appendChild(option);
        });
    };
    loadAnimalOptions();

    const updateDuration = () => {
        const price = parseFloat(priceInput.value);
        const income = parseFloat(incomeInput.value);
        
        if (price > 0 && income > 0) {
            const duration = calculateDuration(price, income);
            durationDisplay.textContent = duration + ' дней';
        } else {
            durationDisplay.textContent = 'Введите корректные данные';
        }
    };

    priceInput.addEventListener('input', updateDuration);
    incomeInput.addEventListener('input', updateDuration);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('animal-name').value;
        const price = parseFloat(priceInput.value);
        const income = parseFloat(incomeInput.value);
        const duration = calculateDuration(price, income);

        if (price <= 0 || income <= 0) {
            return alert('Ошибка: Цена и Доход должны быть больше нуля.');
        }

        const newAnimal = { 
            id: Date.now(), 
            name, 
            price, 
            income, 
            duration 
        };
        
        animalsDB.push(newAnimal); 
        saveAnimalDB(animalsDB);

        alert(`Животное "${name}" успешно добавлено! Срок работы: ${duration} дней.`);
        
        renderAnimalList();
        loadAnimalOptions(); 
        form.reset();
        durationDisplay.textContent = 'N/A';
    });

    replenishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userId = parseInt(document.getElementById('replenish-user-id').value);
        const amount = parseFloat(document.getElementById('replenish-amount').value);
        
        const users = getExistingUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return alert(`Ошибка: Пользователь с ID ${userId} не найден.`);
        }
        
        users[userIndex].purchaseBalance = (users[userIndex].purchaseBalance || 0) + amount;
        saveUsers(users);

        const currentUserId = JSON.parse(localStorage.getItem('currentUser')).id;
        if (userId === currentUserId) {
             let balance = parseFloat(localStorage.getItem('purchaseBalance') || 0);
             localStorage.setItem('purchaseBalance', (balance + amount).toFixed(2));
        }

        alert(`✅ Баланс для покупок пользователя ID ${userId} пополнен на ${amount.toFixed(2)} Р.`);
        replenishForm.reset();
        renderUserList();
    });

    giveAnimalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userId = parseInt(document.getElementById('give-animal-user-id').value);
        const selectedOption = animalSelect.options[animalSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) return alert('Выберите животное.');

        const animalId = parseInt(selectedOption.value);
        const price = parseFloat(selectedOption.dataset.price);
        const income = parseFloat(selectedOption.dataset.income);
        const animalName = getAnimalDB().find(a => a.id === animalId).name;
        
        const users = getExistingUsers();
        const userFound = users.some(u => u.id === userId);

        if (!userFound) {
            return alert(`Ошибка: Пользователь с ID ${userId} не найден.`);
        }
        
        const targetIncome = price * 1.5;
        const newAnimalRecord = {
            id: Date.now(),
            userId: userId,
            name: animalName,
            price: price,
            income: income,
            targetIncome: targetIncome, 
            purchaseDate: new Date().toISOString()
        };
        
        let purchasedAnimals = getPurchasedAnimals();
        purchasedAnimals.push(newAnimalRecord);
        savePurchasedAnimals(purchasedAnimals);

        alert(`✅ Животное "${animalName}" успешно выдано пользователю ID ${userId}!`);
        giveAnimalForm.reset();
    });
});