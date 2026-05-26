// === 1. СОСТОЯНИЕ ПРИЛОЖЕНИЯ (ЛОГИКА) ===
// Мы больше не используем LocalStorage. 
// Теперь мы общаемся с нашим настоящим Node.js сервером!

const appState = {
    quizAnswers: {
        category: null,
        problem: null,
        budget: null
    },
    // Адрес нашего бэкенда
    apiUrl: 'glow-care-1-qs22.onrender.com/api'
};

// === 2. ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ===
const app = {
    showSection: function(sectionId) {
        document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');
        window.scrollTo(0, 0);
    },

    startQuiz: function() {
        appState.quizAnswers = { category: null, problem: null, budget: null };
        document.querySelectorAll('.quiz-step').forEach(step => step.classList.add('hidden'));
        document.getElementById('quiz-step-1').classList.remove('hidden');
        document.getElementById('quiz-progress').style.width = '33%';
        this.showSection('quiz');
    },

    answerQuiz: function(questionKey, answerValue, nextStepOrSection) {
        appState.quizAnswers[questionKey] = answerValue;

        if (questionKey === 'category') {
            this.renderProblemsStep(answerValue);
        }

        if (nextStepOrSection === 'results') {
            // Показываем экран загрузки
            this.showSection('loading');
            
            // Ждем 5 секунд для "анализа"
            setTimeout(() => {
                // Вызываем функцию, которая сделает HTTP-запрос к нашему серверу
                this.fetchAndShowResults();
            }, 5000);
        } else {
            document.querySelectorAll('.quiz-step').forEach(step => step.classList.add('hidden'));
            document.getElementById(`quiz-step-${nextStepOrSection}`).classList.remove('hidden');
            const progress = (nextStepOrSection / 3) * 100;
            document.getElementById('quiz-progress').style.width = `${progress}%`;
        }
    },

    renderProblemsStep: function(category) {
        const container = document.getElementById('problems-container');
        container.innerHTML = '';
        let problems = [];
        if (category === 'skin') {
            problems = [
                { id: 'dryness', label: 'Сухость, стянутость, шелушение' },
                { id: 'acne', label: 'Прыщи, черные точки, воспаления' },
                { id: 'wrinkles', label: 'Морщины, потеря упругости' },
                { id: 'pigmentation', label: 'Пигментация, постакне' }
            ];
        } else if (category === 'hair') {
            problems = [
                { id: 'split-ends', label: 'Секущиеся кончики, ломкость' },
                { id: 'hair-dryness', label: 'Сухие, как солома, пушатся' },
                { id: 'hair-loss', label: 'Выпадение волос' },
                { id: 'dandruff', label: 'Перхоть, зуд кожи головы' }
            ];
        } else if (category === 'body') {
            problems = [
                { id: 'cellulite', label: 'Целлюлит, растяжки' },
                { id: 'body-dryness', label: 'Сухая кожа тела, шелушение' },
                { id: 'irritation', label: 'Раздражение, вросшие волосы' }
            ];
        }
        problems.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = p.label;
            btn.onclick = () => this.answerQuiz('problem', p.id, 3);
            container.appendChild(btn);
        });
    },

    // --- РЕЗУЛЬТАТЫ (ПОДКЛЮЧЕНО К БЭКЕНДУ) ---
    fetchAndShowResults: async function() {
        try {
            // Формируем строку запроса, например: ?category=skin&problem=acne&budget=mid
            const queryParams = new URLSearchParams(appState.quizAnswers).toString();
            
            // Делаем реальный GET запрос к Node.js серверу
            const response = await fetch(`${appState.apiUrl}/products?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Сетевая ошибка');
            }

            const matchedProducts = await response.json();
            
            this.showSection('results');
            this.renderProducts(matchedProducts);

        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            alert('Не удалось связаться с API сервером. Пожалуйста, убедитесь, что сервер Node.js (server.js) запущен.');
            this.showSection('home');
        }
    },

    renderProducts: function(matchedProducts) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        if (!matchedProducts || matchedProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>Ой, пока ничего не нашлось 😔</h3>
                    <p>Попробуйте выбрать другой бюджет или подождите обновлений нашего каталога.</p>
                </div>
            `;
            return;
        }

        matchedProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const imgSrc = product.img || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18e0d6b6%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A30pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18e0d6b6%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%23f5f5f5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22220.5%22%20y%3D%22212.5%22%3E%D0%A4%D0%BE%D1%82%D0%BE%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

            card.innerHTML = `
                <img src="${imgSrc}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-ingredients">
                        <strong>Состав:</strong><br>
                        ${product.ingredients}
                    </div>
                    <!-- При клике открываем реферальную ссылку и отправляем запрос на трекинг -->
                    <a href="${product.link}" target="_blank" class="btn btn-primary" onclick="app.trackClick('${product.id}')">Где купить</a>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // --- ОТСЛЕЖИВАНИЕ КЛИКОВ (Отправка на бэкенд) ---
    trackClick: async function(productId) {
        try {
            await fetch(`${appState.apiUrl}/track-click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productId })
            });
        } catch (error) {
            console.error('Ошибка трекинга:', error);
        }
    },

    // --- АДМИНКА ---
    loginAdmin: function() {
        const passwordInput = document.getElementById('admin-password').value;
        const errorMsg = document.getElementById('login-error');
        if (passwordInput === 'admin123') { 
            errorMsg.classList.add('hidden');
            document.getElementById('admin-password').value = '';
            this.showSection('admin-panel');
            this.renderAdminStats();
        } else {
            errorMsg.classList.remove('hidden');
        }
    },

    logoutAdmin: function() {
        this.showSection('home');
    },

    renderAdminStats: async function() {
        const statsList = document.getElementById('stats-list');
        statsList.innerHTML = '<div class="spinner" style="margin-top: 2rem;"></div>';

        try {
            // Запрашиваем статистику у сервера
            const response = await fetch(`${appState.apiUrl}/stats`);
            const products = await response.json();
            
            statsList.innerHTML = '';
            
            if (products.length === 0) {
                statsList.innerHTML = '<p>В базе пока нет товаров.</p>';
                return;
            }

            const sortedProducts = products.sort((a, b) => b.clicks - a.clicks);

            sortedProducts.forEach(p => {
                const item = document.createElement('div');
                item.className = 'stat-item';
                item.innerHTML = `
                    <div class="stat-info">
                        <span>${p.brand} - ${p.name}</span>
                    </div>
                    <div class="stat-actions">
                        <span class="stat-clicks">${p.clicks} кликов</span>
                        <button class="btn btn-secondary btn-small" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; border-color: #d9534f; color: #d9534f; margin-left: 10px;" onclick="app.deleteProduct('${p.id}')">Удалить</button>
                    </div>
                `;
                statsList.appendChild(item);
            });
        } catch (error) {
            console.error('Ошибка:', error);
            statsList.innerHTML = '<p class="error-text">Ошибка соединения с сервером. Запустите Node.js (node server.js).</p>';
        }
    },

    deleteProduct: async function(productId) {
        if (confirm('Вы уверены, что хотите удалить этот товар из API?')) {
            try {
                // Отправляем DELETE запрос на сервер
                await fetch(`${appState.apiUrl}/products/${productId}`, { method: 'DELETE' });
                this.renderAdminStats(); // Обновляем список
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    },

    addProduct: async function(event) {
        event.preventDefault();
        
        const newProduct = {
            id: 'p' + Date.now(),
            category: document.getElementById('new-category').value,
            problem: document.getElementById('new-problem').value,
            budget: document.getElementById('new-budget').value,
            name: document.getElementById('new-name').value,
            brand: document.getElementById('new-brand').value,
            img: document.getElementById('new-img').value,
            description: document.getElementById('new-desc').value,
            ingredients: document.getElementById('new-ingredients').value,
            link: document.getElementById('new-link').value,
            clicks: 0
        };

        try {
            // Отправляем POST запрос на сервер
            await fetch(`${appState.apiUrl}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            
            this.renderAdminStats();
            document.getElementById('add-product-form').reset();
            alert('Товар успешно отправлен на сервер API!');
        } catch (error) {
            console.error('Ошибка добавления:', error);
            alert('Не удалось добавить товар. Проверьте запущен ли сервер.');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.showSection('home');
});