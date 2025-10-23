(function(window, document){
    class SettingsManagement {
        constructor(formSelector = '#settingsForm', storageKey = 'siteSettings') {
            this.formSelector = formSelector;
            this.storageKey = storageKey;
            this.settings = {
                siteName: '',
                siteDescription: '',
                logoUrl: '',
                contactEmail: '',
                currency: 'CNY',
                theme: 'light',
                itemsPerPage: 12,
                version: '1.0.1'
            };
            this.form = null;
        }

        async loadSettings() {
            try {
                const raw = localStorage.getItem(this.storageKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        this.settings = Object.assign({}, this.settings, parsed);
                        return this.settings;
                    }
                }
                // optional: try fetch('/api/settings') if backend exists
                return this.settings;
            } catch (e) {
                console.error('loadSettings failed', e);
                return this.settings;
            }
        }

        populateForm() {
            if (!this.settings) return;
            if (!this.form) this.form = document.querySelector(this.formSelector);
            if (!this.form) return;
            const set = (id, v) => {
                const el = this.form.querySelector('#' + id) || document.getElementById(id);
                if (!el) return;
                try { el.value = v ?? ''; } catch (e) { /* ignore non-inputs */ }
            };
            set('siteName', this.settings.siteName);
            set('siteDescription', this.settings.siteDescription);
            set('logoUrl', this.settings.logoUrl);
            set('contactEmail', this.settings.contactEmail);
            set('currency', this.settings.currency);
            set('theme', this.settings.theme);
            set('itemsPerPage', this.settings.itemsPerPage);
            const verEl = document.getElementById('appVersion');
            if (verEl) verEl.textContent = this.settings.version ?? verEl.textContent;
        }

        readForm() {
            if (!this.form) this.form = document.querySelector(this.formSelector);
            if (!this.form) return;
            const get = id => {
                const el = this.form.querySelector('#' + id) || document.getElementById(id);
                return el ? el.value : '';
            };
            this.settings.siteName = (get('siteName') || '').trim();
            this.settings.siteDescription = (get('siteDescription') || '').trim();
            this.settings.logoUrl = (get('logoUrl') || '').trim();
            this.settings.contactEmail = (get('contactEmail') || '').trim();
            this.settings.currency = get('currency') || 'CNY';
            this.settings.theme = get('theme') || 'light';
            const ipp = parseInt(get('itemsPerPage') || this.settings.itemsPerPage, 10);
            this.settings.itemsPerPage = Number.isNaN(ipp) ? this.settings.itemsPerPage : ipp;
        }

        async saveSettings() {
            try {
                this.readForm();
                localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            } catch (e) {
                console.error('saveSettings failed', e);
            }
            // optional: POST to /api/settings if backend exists
        }

        attachListeners() {
            if (!this.form) this.form = document.querySelector(this.formSelector);
            if (!this.form) return;
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSettings();
                const s = document.getElementById('saveStatus');
                if (s) { s.textContent = '已保存'; setTimeout(()=>s.textContent='',2000); }
            });
            const resetBtn = this.form.querySelector('[data-action="reset-defaults"]');
            if (resetBtn) resetBtn.addEventListener('click', (e)=>{ e.preventDefault(); this.settings = {siteName:'',siteDescription:'',logoUrl:'',contactEmail:'',currency:'CNY',theme:'light',itemsPerPage:12,version:this.settings.version}; this.populateForm(); });
        }

        async init() {
            if (document.readyState === 'loading') await new Promise(r=>document.addEventListener('DOMContentLoaded', r, {once:true}));
            this.form = document.querySelector(this.formSelector);
            await this.loadSettings();
            this.populateForm();
            this.attachListeners();
        }
    }

    if (!window.SettingsManagementInstance) {
        window.SettingsManagementInstance = new SettingsManagement();
        window.SettingsManagementInstance.init().catch(e=>console.error('Settings init failed', e));
    }
})(window, document);
