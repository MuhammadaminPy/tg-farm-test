document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'registration.html';
        return;
    }
    
    const animalListContainer = document.getElementById('animal-list');
    
    let userBalances = {
        purchase: parseFloat(localStorage.getItem('purchaseBalance') || 0.00),
        real: parseFloat(localStorage.getItem('realBalance') || 0.00)
    };
    
    const getPurchasedAnimals = () => {
        const animals = localStorage.getItem('purchasedAnimals');
        return animals ? JSON.parse(animals) : [];
    };

    const savePurchasedAnimals = (animals) => {
        localStorage.setItem('purchasedAnimals', JSON.stringify(animals));
    };
    
    const saveBalances = () => {
        localStorage.setItem('purchaseBalance', userBalances.purchase.toFixed(2));
        localStorage.setItem('realBalance', userBalances.real.toFixed(2));
    };

    const calculateDuration = (price, dailyIncome) => {
        return ((price * 1.5) / dailyIncome).toFixed(2);
    };

    const getAnimalDB = () => {
        const animals = localStorage.getItem('globalAnimalsDB');
        if (!animals) {
            return [
                { id: 1, name: "Корова", price: 30, income: 0.85, icon: '🐄' },
                { id: 2, name: "Овца", price: 80, income: 1.80, icon: '🐑' },
                { id: 3, name: "Петух", price: 150, income: 2.50, icon: '🐓' }
            ];
        }
        return JSON.parse(animals);
    };
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const createAnimalCard = (animal) => {
        const duration = calculateDuration(animal.price, animal.income);
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `
            <h3>${animal.name}</h3>
            <p><strong>Цена:</strong> ${animal.price.toFixed(2)} Р</p>
            <p><strong>Доход в день:</strong> ${animal.income.toFixed(2)} Р</p>
            <p><strong>Срок работы:</strong> ${duration} дней</p>
            <button class="buy-btn" data-id="${animal.id}" data-price="${animal.price}" data-income="${animal.income}">Купить</button>
        `;
        animalListContainer.appendChild(card);
    };

    getAnimalDB().forEach(createAnimalCard);

    animalListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const animalId = parseInt(e.target.dataset.id);
            const animalPrice = parseFloat(e.target.dataset.price);
            const animalIncome = parseFloat(e.target.dataset.income);
            
            if (userBalances.purchase >= animalPrice) {
                
                userBalances.purchase -= animalPrice;
                saveBalances();
                
                let purchasedAnimals = getPurchasedAnimals(); 
                purchasedAnimals.push({
                    id: Date.now(), 
                    userId: currentUser.id,
                    name: getAnimalDB().find(a => a.id === animalId).name,
                    price: animalPrice,
                    income: animalIncome,
                    targetIncome: animalPrice * 1.5, 
                    purchaseDate: new Date().toISOString()
                });
                savePurchasedAnimals(purchasedAnimals);

                alert(`✅ Поздравляем! Вы успешно купили животное за ${animalPrice.toFixed(2)} Р.\nВаш Баланс для Покупок: ${userBalances.purchase.toFixed(2)} Р.`);
                
            } else {
                alert(`❌ Недостаточно средств на Балансе для Покупок. Требуется: ${animalPrice.toFixed(2)} Р. Ваш баланс: ${userBalances.purchase.toFixed(2)} Р.`);
            }
        }
    });
});