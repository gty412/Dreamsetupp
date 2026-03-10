const ThemeManager = {
    STORAGE_KEY: 'dreamsetup-theme',
    currentTheme: 'dark',
    
    init() {
        console.log('🎨 ThemeManager инициализирован');
        this.loadTheme();
        this.initThemeButtons();
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                console.log('🔄 Тема изменена на другой странице:', e.newValue);
                this.applyTheme(e.newValue, false);
            }
        });
        window.addEventListener('themeChanged', (e) => {
            console.log('📢 Обновляем кнопки на странице');
            this.updateAllButtons();
        });
    },
    
    loadTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        if (savedTheme) {
            this.applyTheme(savedTheme, false);
        } else {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.applyTheme(systemTheme, false);
        }
    },
    
    applyTheme(theme, saveToStorage = true) {
        console.log('🎨 Применяем тему:', theme);
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.updateAllButtons();
        if (saveToStorage) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    },
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        return newTheme;
    },
    
    updateAllButtons() {
        const icon = this.currentTheme === 'dark' ? '🌙' : '☀️';
        document.querySelectorAll('.theme-toggle, #theme-toggle').forEach(btn => {
            const iconSpan = btn.querySelector('.theme-icon, #theme-icon');
            if (iconSpan) {
                iconSpan.textContent = icon;
            } else {
                btn.textContent = icon;
            }
        });
    },
    
    initThemeButtons() {
        const buttons = document.querySelectorAll('.theme-toggle, #theme-toggle');
        buttons.forEach(btn => {
            btn.removeEventListener('click', this.handleClick);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        });
        this.updateAllButtons();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}