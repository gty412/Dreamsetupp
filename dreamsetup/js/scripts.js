document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Делаем глобально доступным
window.ThemeManager = ThemeManager;
const GalleryZoom = {
    init() {
        this.modal = document.getElementById('zoom-modal');
        this.modalImg = document.getElementById('zoom-image');
        this.closeBtn = document.getElementById('zoom-close');
        this.images = document.querySelectorAll('.zoomable');
        
        if (!this.images.length) return;
        
        this.images.forEach(img => {
            img.addEventListener('click', () => this.open(img));
            img.classList.add('cursor-zoom-in', 'transition', 'duration-300');
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.02)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
        });
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },
    
    open(img) {
        if (!this.modal || !this.modalImg) return;
        
        this.modalImg.src = img.src;
        this.modalImg.alt = img.alt;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.modal.classList.add('modal-visible');
        }, 10);
    },
    
    close() {
        if (!this.modal) return;
        
        this.modal.classList.add('hidden');
        this.modal.classList.remove('modal-visible');
        document.body.style.overflow = '';
    }
};

const ReadingProgress = {
    init() {
        this.bar = document.getElementById('reading-progress');
        if (!this.bar) return;
        
        window.addEventListener('scroll', () => this.update());
        window.addEventListener('resize', () => this.update());
        this.update();
    },
    
    update() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        this.bar.style.width = scrolled + '%';
        
        if (scrolled > 50) {
            this.bar.classList.add('bg-green-500');
            this.bar.classList.remove('bg-[#64B5F6]');
        } else {
            this.bar.classList.add('bg-[#64B5F6]');
            this.bar.classList.remove('bg-green-500');
        }
    }
};

const FavoritesManager = {
    init() {
        this.buttons = document.querySelectorAll('.favorite-btn');
        this.favorites = JSON.parse(localStorage.getItem('dreamsetup-favorites')) || [];
        
        this.buttons.forEach(btn => {
            const id = btn.dataset.id;
            if (this.favorites.includes(id)) {
                btn.classList.add('text-red-500');
                btn.classList.remove('text-gray-400');
            }
            
            btn.addEventListener('click', () => this.toggle(btn));
        });
        
        this.updateCounter();
    },
    
    toggle(btn) {
        const id = btn.dataset.id;
        const index = this.favorites.indexOf(id);
        
        if (index === -1) {
            this.favorites.push(id);
            btn.classList.add('text-red-500');
            btn.classList.remove('text-gray-400');
            this.showNotification('➕ Добавлено в избранное');
        } else {
            this.favorites.splice(index, 1);
            btn.classList.remove('text-red-500');
            btn.classList.add('text-gray-400');
            this.showNotification('➖ Удалено из избранного');
        }
        
        localStorage.setItem('dreamsetup-favorites', JSON.stringify(this.favorites));
        this.updateCounter();
    },
    
    updateCounter() {
        const counter = document.getElementById('favorites-counter');
        if (counter) {
            counter.textContent = this.favorites.length;
            counter.classList.toggle('hidden', this.favorites.length === 0);
        }
    },
    
    showNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = text;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
};

const SearchModule = {
    init() {
        this.searchBtn = document.getElementById('search-btn');
        this.modal = document.getElementById('search-modal');
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');
        this.closeBtn = document.getElementById('search-close');
        
        if (!this.searchBtn) return;
        
        this.content = this.buildSearchIndex();
        
        this.searchBtn.addEventListener('click', () => this.open());
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        if (this.input) {
            this.input.addEventListener('input', () => this.search());
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
        });
    },
    
    buildSearchIndex() {
        return [
            { title: 'Главная', url: '/', keywords: 'home start' },
            { title: 'Эргономика', url: '/html/features.html', keywords: 'ergonomics chair desk posture' },
            { title: 'Освещение', url: '/html/features.html#lighting', keywords: 'light lamp bias' },
            { title: 'Механическая клавиатура', url: '/html/devices.html', keywords: 'keyboard mechanical switches' },
            { title: 'Монитор', url: '/html/devices.html', keywords: 'monitor display screen' },
            { title: 'Чек-лист настройки', url: '/html/setup.html', keywords: 'checklist setup configuration' },
            { title: 'Прогресс бар', url: '/html/setup.html', keywords: 'progress checklist' }
        ];
    },
    
    open() {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        setTimeout(() => this.input?.focus(), 100);
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
        if (this.input) this.input.value = '';
        if (this.results) this.results.innerHTML = '';
        document.body.style.overflow = '';
    },
    
    search() {
        if (!this.input || !this.results) return;
        
        const query = this.input.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.results.innerHTML = '';
            return;
        }
        
        const matches = this.content.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.keywords.toLowerCase().includes(query)
        );
        
        this.renderResults(matches);
    },
    
    renderResults(matches) {
        if (matches.length === 0) {
            this.results.innerHTML = '<div class="text-gray-400 text-center py-8">Ничего не найдено</div>';
            return;
        }
        
        this.results.innerHTML = matches.map(item => `
            <a href="${item.url}" class="block p-4 hover:bg-gray-800 border-b border-gray-700 transition">
                <div class="text-white">${item.title}</div>
                <div class="text-sm text-gray-400">${item.url}</div>
            </a>
        `).join('');
    }
};

const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

const ScrollToTop = {
    init() {
        this.button = document.getElementById('scroll-top');
        if (!this.button) return;
        
        window.addEventListener('scroll', () => this.toggle());
        this.button.addEventListener('click', () => this.scroll());
        this.toggle();
    },
    
    toggle() {
        if (window.scrollY > 500) {
            this.button.classList.remove('hidden');
            this.button.classList.add('flex');
        } else {
            this.button.classList.add('hidden');
            this.button.classList.remove('flex');
        }
    },
    
    scroll() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

const ScrollAnimations = {
    init() {
        this.elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });
        
        this.elements.forEach(el => observer.observe(el));
    }
};

const PomodoroTimer = {
    init() {
        this.button = document.getElementById('pomodoro-btn');
        this.display = document.getElementById('pomodoro-display');
        
        if (!this.button || !this.display) return;
        
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isWork = true;
        
        this.button.addEventListener('click', () => this.toggle());
    },
    
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    },
    
    start() {
        this.isRunning = true;
        this.button.textContent = '⏸️ Пауза';
        this.button.classList.add('bg-yellow-600');
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.switchMode();
            }
        }, 1000);
    },
    
    stop() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.button.textContent = '▶️ Старт';
        this.button.classList.remove('bg-yellow-600');
    },
    
    switchMode() {
        this.isWork = !this.isWork;
        this.timeLeft = this.isWork ? this.workTime : this.breakTime;
        
        const message = this.isWork ? '🍅 Время работать!' : '☕ Время отдыха!';
        this.showNotification(message);
    },
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    
    showNotification(text) {
        if (Notification.permission === 'granted') {
            new Notification(text);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
};

const QuoteGenerator = {
    init() {
        this.container = document.getElementById('quote-container');
        if (!this.container) return;
        
        this.quotes = [
            { text: "Код — это поэзия, написанная на языке машин", author: "Dream Setup" },
            { text: "Твое рабочее место — твой храм продуктивности", author: "Том Сакс" },
            { text: "Хороший инструмент вдохновляет на великие дела", author: "Дэвид Хайнемайер Ханссон" },
            { text: "Эргономика — это не роскошь, а необходимость", author: "Стюарт Макгилл" },
            { text: "Минимализм — это не отсутствие чего-то, а присутствие всего нужного", author: "Джошуа Беккер" }
        ];
        
        this.update();
        
        setInterval(() => this.update(), 30000);
    },
    
    update() {
        const random = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        this.container.innerHTML = `
            <p class="text-lg italic">"${random.text}"</p>
            <p class="text-sm text-gray-400 mt-2">— ${random.author}</p>
        `;
    }
};

const ImageCache = {
    init() {
        if ('caches' in window) {
            this.cacheImages();
        }
    },
    
    async cacheImages() {
        const images = document.querySelectorAll('img[data-src]');
        const cache = await caches.open('dreamsetup-images');
        
        images.forEach(img => {
            const src = img.dataset.src;
            img.src = src;
            
            fetch(src).then(response => {
                cache.put(src, response);
            });
        });
    }
};

const ProgressSaver = {
    init() {
        this.checklists = document.querySelectorAll('.checklist-item');
        if (!this.checklists.length) return;
        
        this.loadProgress();
        
        this.checklists.forEach(item => {
            item.addEventListener('change', () => this.saveProgress());
        });
    },
    
    saveProgress() {
        const progress = {};
        this.checklists.forEach(item => {
            progress[item.dataset.id] = item.checked;
        });
        localStorage.setItem('dreamsetup-checklist', JSON.stringify(progress));
    },
    
    loadProgress() {
        const saved = localStorage.getItem('dreamsetup-checklist');
        if (!saved) return;
        
        const progress = JSON.parse(saved);
        this.checklists.forEach(item => {
            if (progress[item.dataset.id]) {
                item.checked = true;
            }
        });
    }
};

const ClickAnalytics = {
    init() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (!target) return;
            
            const data = {
                element: target.tagName,
                text: target.textContent?.slice(0, 50),
                href: target.href,
                time: new Date().toISOString(),
                page: window.location.pathname
            };
            
            console.log('📊 Click:', data);
        });
    }
};

const MobileMenu = {
    init() {
        this.btn = document.getElementById('menu-btn');
        this.overlay = document.getElementById('mobile-overlay');
        this.lines = [
            document.getElementById('b-line1'),
            document.getElementById('b-line2'),
            document.getElementById('b-line3')
        ];

        if (!this.btn || !this.overlay) return;

        this.btn.addEventListener('click', () => this.toggle());

        // Закрываем при клике на ссылки
        const links = this.overlay.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    },

    toggle() {
        const isOpen = !this.overlay.classList.contains('translate-x-full');
        if (isOpen) this.close(); else this.open();
    },

    open() {
        this.overlay.classList.remove('translate-x-full');
        document.body.classList.add('overflow-hidden');
        
        // Анимация иконки
        this.lines[0].classList.add('rotate-45', 'translate-y-2');
        this.lines[1].classList.add('opacity-0');
        this.lines[2].classList.add('-rotate-45', '-translate-y-2');
    },

    close() {
        this.overlay.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
        
        // Возвращаем иконку
        this.lines[0].classList.remove('rotate-45', 'translate-y-2');
        this.lines[1].classList.remove('opacity-0');
        this.lines[2].classList.remove('-rotate-45', '-translate-y-2');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    MobileMenu.init();
    GalleryZoom.init();
    ReadingProgress.init();
    FavoritesManager.init();
    SearchModule.init();
    SmoothScroll.init();
    ScrollToTop.init();
    ScrollAnimations.init();
    QuoteGenerator.init();
    ImageCache.init();
    ProgressSaver.init();
    
    if (document.getElementById('pomodoro-btn')) {
        PomodoroTimer.init();
    }
    
    if (window.location.hostname === 'localhost') {
        ClickAnalytics.init();
    }
    
    document.body.classList.add('js-loaded');
    
    console.log('🚀 Dream Setup JS загружен и готов к работе!');
});

const DynamicLoader = {
    async loadSection(url, targetId) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = temp.querySelector('.dynamic-content').innerHTML;
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }
};

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showHelp();
            }
            
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                this.showHelp();
            }

            if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
                ThemeManager.setTheme(
                    document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
                );
            }
        });
    },
    
    showHelp() {
        const shortcuts = [
            'Ctrl+K - Поиск',
            'T - Переключить тему',
            '? - Показать помощь',
            'ESC - Закрыть модальные окна'
        ];
        
        alert('⌨️ Горячие клавиши:\n\n' + shortcuts.join('\n'));
    }
};

KeyboardShortcuts.init();

window.DreamSetup = {
    ThemeManager,
    GalleryZoom,
    FavoritesManager,
    PomodoroTimer,
    DynamicLoader
};