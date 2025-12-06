document.addEventListener('DOMContentLoaded', () => {
    const currentUserData = localStorage.getItem('currentUser');
    const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

    if (!currentUser) {
        if (!window.location.href.includes('registration.html')) {
            window.location.href = 'registration.html';
            return;
        }
    }
    
    const purchaseBalanceEl = document.getElementById('purchase-balance');
    const realBalanceEl = document.getElementById('real-balance');
    const animalStatusGrid = document.getElementById('animal-status-grid');
    const replenishStarsBtn = document.getElementById('replenish-stars-btn');
    const withdrawBtn = document.querySelector('.yellow-btn');
    const reinvestBtn = document.querySelector('.reinvest-btn');

    let userBalances = {
        purchase: parseFloat(localStorage.getItem('purchaseBalance') || 0.00),
        real: parseFloat(localStorage.getItem('realBalance') || 0.00)
    };
    const COMMISSION_RATE = 0.15; 

    const updateBalances = () => {
        if (purchaseBalanceEl) {
            purchaseBalanceEl.textContent = userBalances.purchase.toFixed(2) + ' Р';
        }
        if (realBalanceEl) {
            realBalanceEl.textContent = userBalances.real.toFixed(2) + ' Р';
        }
        localStorage.setItem('purchaseBalance', userBalances.purchase.toFixed(2));
        localStorage.setItem('realBalance', userBalances.real.toFixed(2));
    };

    updateBalances();

    if (replenishStarsBtn) {
        replenishStarsBtn.addEventListener('click', () => {
            if (window.Telegram && window.Telegram.WebApp && currentUser) {
                const amountStars = prompt("Введите сумму Stars, которую вы хотите обменять на рубли (Имитация):");
                const stars = parseInt(amountStars);
                
                if (stars > 0) {
                    const mockInvoiceUrl = `https://t.me/invoice/mock_invoice_for_${currentUser.id}_${stars}`;

                    window.Telegram.WebApp.openInvoice(mockInvoiceUrl, (status) => {
                        if (status === 'paid') {
                            const exchangeRate = 0.5;
                            const amountInRubles = stars * exchangeRate;
                            
                            userBalances.purchase += amountInRubles;
                            updateBalances();
                            alert(`✅ Платеж Stars успешно завершен! Начислено ${amountInRubles.toFixed(2)} Р на Баланс для Покупок.`);
                        } else {
                            alert(`Статус платежа Stars: ${status}. Баланс не изменен.`);
                        }
                    });
                } else {
                    alert('Введите корректное количество Stars.');
                }
            } else {
                alert('Эта функция доступна только в приложении Telegram Mini App.');
            }
        });
    }

    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            alert('Вывод: Введите сумму для вывода с Реального Баланса. (Функция пока не активна)');
        });
    }

    if (reinvestBtn) {
        reinvestBtn.addEventListener('click', () => {
            const direction = prompt("Откуда хотите реинвестировать? Введите 'ИГРОВОЙ' (на Реальный) или 'РЕАЛЬНЫЙ' (на Игровой):").toUpperCase();
            
            if (direction === 'РЕАЛЬНЫЙ') {
                handleRealToPurchase();
            } else if (direction === 'ИГРОВОЙ') {
                handlePurchaseToReal();
            } else {
                alert('Некорректный выбор. Пожалуйста, введите "ИГРОВОЙ" или "РЕАЛЬНЫЙ".');
            }
        });
    }

    function handleRealToPurchase() {
        let amount = prompt(`Перевод: РЕАЛЬНЫЙ -> ИГРОВОЙ (1 к 1). Ваш Реальный Баланс: ${userBalances.real.toFixed(2)} Р. Введите сумму:`);
        amount = parseFloat(amount);

        if (isNaN(amount) || amount <= 0) return alert('Пожалуйста, введите корректную сумму.');
        if (amount > userBalances.real) return alert('Недостаточно средств на Реальном Балансе.');

        userBalances.real -= amount;
        userBalances.purchase += amount;

        alert(`Успешно переведено ${amount.toFixed(2)} Р с Реального на Игровой Баланс (1 к 1).`);
        updateBalances();
    }

    function handlePurchaseToReal() {
        let amount = prompt(`Перевод: ИГРОВОЙ -> РЕАЛЬНЫЙ (Комиссия ${COMMISSION_RATE * 100}%). Ваш Игровой Баланс: ${userBalances.purchase.toFixed(2)} Р. Введите сумму:`);
        amount = parseFloat(amount);

        if (isNaN(amount) || amount <= 0) return alert('Пожалуйста, введите корректную сумму.');
        if (amount > userBalances.purchase) return alert('Недостаточно средств на Балансе для Покупок.');

        const commission = amount * COMMISSION_RATE;
        const amountToReal = amount - commission;

        userBalances.purchase -= amount;
        userBalances.real += amountToReal;

        alert(`Успешно реинвестировано: ${amount.toFixed(2)} Р.\nКомиссия (${COMMISSION_RATE * 100}%): ${commission.toFixed(2)} Р.\nЗачислено на Реальный Баланс: ${amountToReal.toFixed(2)} Р.`);
        updateBalances();
    }
    
    const now = new Date(); 

    const getPurchasedAnimals = () => {
        const animals = localStorage.getItem('purchasedAnimals');
        const allPurchased = animals ? JSON.parse(animals) : [];
        return allPurchased.filter(animal => animal.userId == currentUser.id);
    };

    const renderPurchasedAnimals = () => {
        const animals = getPurchasedAnimals();
        animalStatusGrid.innerHTML = ''; 

        if (animals.length === 0) {
            animalStatusGrid.innerHTML = '<p class="no-animals-msg">У вас пока нет активных животных. Перейдите на страницу Ферма, чтобы начать!</p>';
            return;
        }

        animals.forEach(animal => {
            const purchaseDate = new Date(animal.purchaseDate);
            const daysSincePurchase = (now - purchaseDate) / (1000 * 60 * 60 * 24);
            const earnedIncome = Math.min(daysSincePurchase * animal.income, animal.targetIncome);
            const remainingIncome = animal.targetIncome - earnedIncome;
            const remainingDays = (remainingIncome > 0) ? (remainingIncome / animal.income) : 0;
            const progressPercent = (earnedIncome / animal.targetIncome) * 100;
            
            const card = document.createElement('div');
            card.className = 'active-animal-card';
            card.innerHTML = `
                <h4>${animal.name}</h4>
                <div class="status-line"><strong>Доход в день:</strong> ${animal.income.toFixed(2)} Р</div>
                <div class="status-line"><strong>Заработано:</strong> ${earnedIncome.toFixed(2)} Р / ${animal.targetIncome.toFixed(2)} Р</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent.toFixed(1)}%;"></div>
                </div>
                <div class="status-line"><strong>Осталось жить:</strong> ${remainingDays.toFixed(2)} дней</div>
            `;
            animalStatusGrid.appendChild(card);
            
            if (remainingIncome <= 0) {
                 card.style.opacity = '0.6';
                 card.innerHTML += `<div style="color: red; font-weight: bold; margin-top: 10px;">🔴 Срок работы истек!</div>`;
            }
        });
    };

    renderPurchasedAnimals();
});