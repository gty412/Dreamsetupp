class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('dreamsetup-lang') || 'ru';
        this.translations = {};
        this.supportedLangs = ['ru', 'uk', 'en'];
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.initLanguageSwitcher();
        this.setActiveLangButton(this.currentLang);
    }

    getLocalesPath() {
        const path = window.location.pathname;
        const depth = path.split('/').filter(x => x && !x.includes('.html')).length;
        return depth === 0 ? '' : '../'.repeat(depth);
    }

    async loadTranslations(lang) {
        try {
            const basePath = this.getLocalesPath();
            const url = `${basePath}locales/${lang}.json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки переводов:', error);
            this.translations = {};
        }
    }

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.translations[key];
                } else {
                    el.innerHTML = this.translations[key];
                }
            }
        });
    }

    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang) || lang === this.currentLang) return;
        this.currentLang = lang;
        localStorage.setItem('dreamsetup-lang', lang);
        await this.loadTranslations(lang);
        this.applyTranslations();
        document.documentElement.lang = lang;
        this.setActiveLangButton(lang);
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    setActiveLangButton(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) return;

        switcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (btn) {
                const lang = btn.dataset.lang;
                this.setLanguage(lang);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});