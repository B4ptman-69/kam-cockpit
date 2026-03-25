/* ========================================
   KAM Cockpit — Application Logic (Cloud Sync with Supabase)
   ======================================== */

(function () {
    'use strict';

    // ==========================================
    // SUPABASE CONFIGURATION
    // ==========================================

    const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || '';
    const SUPABASE_KEY = window.CONFIG?.SUPABASE_KEY || '';
    // Initialisation du client Supabase
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // ==========================================
    // DATA MODEL & DEFAULTS
    // ==========================================

    const STORAGE_KEY = 'kam_cockpit_data';

    const ACCOUNT_ICONS = {
        'PROSOL': '🛒',
        'CCEP': '🥤',
        'KRONENBOURG': '🍻',
        'MAIF': '🛡️',
        'DANONE': '🥛'
    };

    const DEFAULT_DATA = {
        accounts: {
            PROSOL: {
                kam: 'Victor Sanson (Field & People)',
                sponsor: 'JÏZ',
                businessMetrics: { caRealise: 0, caCible: 700000, margeBrute: 250000 },
                commercialDynamics: { rdvConquete: 0, opportunites: 0 },
                actions: [
                    { id: generateId(), action: 'Présentation Social Ads local avec DP', responsible: 'Victor Sanson', deadline: '2026-04-20', progress: 30, nextAction: 'Intégration de DP dans le kit ouverture' },
                    { id: generateId(), action: 'RDV avec DMK Grand Frais (Sigrid Baron)', responsible: 'Stéphanie (L\'Uzyne)', deadline: '2026-04-20', progress: 10, nextAction: 'Intégration de DP dans le kit ouverture' },
                    { id: generateId(), action: 'Business Review – Rencontre avec Bénédicte Delorme', responsible: 'Victor Sanson', deadline: '2026-06-05', progress: 0, nextAction: 'Institutionnaliser la relation au-delà de l\'opérationnel' }
                ]
            },
            CCEP: {
                kam: 'À définir',
                sponsor: 'JÏZ',
                businessMetrics: { caRealise: 0, caCible: 1000000, margeBrute: 300000 },
                commercialDynamics: { rdvConquete: 0, opportunites: 0 },
                actions: [
                    { id: generateId(), action: 'Sécurisation parfaite des projets en cours', responsible: 'KAM', deadline: '2026-04-30', progress: 50, nextAction: '' },
                    { id: generateId(), action: 'Cartographie organisation / décideurs', responsible: 'KAM', deadline: '2026-05-15', progress: 20, nextAction: '' },
                    { id: generateId(), action: 'Identification leviers alternatifs (CHR, circuits spécialisés)', responsible: 'KAM', deadline: '2026-05-30', progress: 20, nextAction: '' },
                    { id: generateId(), action: 'Présence terrain renforcée', responsible: 'KAM', deadline: '2026-06-01', progress: 30, nextAction: '' }
                ]
            },
            KRONENBOURG: {
                kam: 'Stéphanie PERRET',
                sponsor: 'Elliot BRAME',
                businessMetrics: { caRealise: 370000, caCible: 1200000, margeBrute: 370000 },
                commercialDynamics: { rdvConquete: 0, opportunites: 0 },
                actions: [
                    { id: generateId(), action: 'Rencontrer les postes cross-catégorie (M. Bec, T. Guery, C. Demanges)', responsible: 'ALL', deadline: '2026-03-31', progress: 40, nextAction: 'Aller chercher 3 nouveaux briefs' },
                    { id: generateId(), action: 'Faire resigner TT avec le TDF', responsible: 'SPE / MXS', deadline: '2026-06-30', progress: 20, nextAction: 'Garantie CA & MB à LT' },
                    { id: generateId(), action: 'Sécuriser le contrat de collaboration exclusif', responsible: 'SPE/CDI/EBR', deadline: '2026-12-31', progress: 10, nextAction: 'Contrat d\'activation pluriannuel' }
                ]
            },
            MAIF: {
                kam: 'Robin',
                sponsor: 'Fred',
                businessMetrics: { caRealise: 122600, caCible: 250000, margeBrute: 125000 },
                commercialDynamics: { rdvConquete: 0, opportunites: 0 },
                actions: [
                    { id: generateId(), action: 'RDV UZYNE', responsible: 'Robin', deadline: '2026-03-31', progress: 80, nextAction: 'Faire parler / Redirection' },
                    { id: generateId(), action: 'Intégrer brief global', responsible: 'Robin / Vincent', deadline: '2026-06-30', progress: 30, nextAction: 'Collaborer sur 1 opé' },
                    { id: generateId(), action: 'Prise de RDV avec pôle socle + corpo', responsible: 'Robin', deadline: '2026-04-15', progress: 10, nextAction: '' },
                    { id: generateId(), action: 'Détecter opportunités si salons, events spé, festival…', responsible: 'Robin', deadline: '2026-05-15', progress: 20, nextAction: '' },
                    { id: generateId(), action: 'Préparer sortie de Sport Market (reco commune)', responsible: 'Robin', deadline: '2026-06-01', progress: 50, nextAction: '' }
                ]
            },
            DANONE: {
                kam: 'Coline Orsseaud',
                sponsor: 'Fred',
                businessMetrics: { caRealise: 0, caCible: 800000, margeBrute: 280000 },
                commercialDynamics: { rdvConquete: 0, opportunites: 0 },
                actions: [
                    { id: generateId(), action: 'ROI CIRCANA', responsible: 'Coline', deadline: '2026-04-30', progress: 20, nextAction: 'Preuve des ROI' },
                    { id: generateId(), action: 'ONE TEAM – Christelle Cholet', responsible: 'Coline (Fred)', deadline: '2026-04-30', progress: 40, nextAction: 'Projet 360' },
                    { id: generateId(), action: 'Yaourt / Cooptation', responsible: 'Coline', deadline: '2026-06-30', progress: 10, nextAction: 'Nouvelles marques' },
                    { id: generateId(), action: 'ACHATS', responsible: '?', deadline: '2026-05-31', progress: 0, nextAction: 'Offre One Team et massification' },
                    { id: generateId(), action: 'USE CASE fait pour eux + L\'organigramme et leurs agences', responsible: 'Coline', deadline: '2026-05-15', progress: 50, nextAction: '' }
                ]
            }
        }
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function generateId() {
        return 'a' + Math.random().toString(36).substr(2, 9);
    }

    function formatNumber(num) {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    function formatCurrency(num) {
        if (!num) return '0 €';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    }

    /**
     * Local storage fallback
     */
    function loadLocalData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { console.warn('Error loading local data', e); }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    function saveLocalData(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
        catch (e) { console.error('Error saving local data', e); }
    }

    /**
     * Supabase Cloud Sync
     */
    async function syncFromSupabase() {
        if (!supabase) return loadLocalData();

        try {
            const { data: rows, error } = await supabase.from('accounts').select('*');
            if (error) throw error;

            if (rows && rows.length > 0) {
                const cloudData = { accounts: {} };
                rows.forEach(row => {
                    const defaultAcc = DEFAULT_DATA.accounts[row.name] || {};
                    cloudData.accounts[row.name] = {
                        kam: row.kam,
                        sponsor: row.sponsor,
                        businessMetrics: row.businessMetrics || defaultAcc.businessMetrics || { caRealise: 0, caCible: 0, margeBrute: 0 },
                        commercialDynamics: row.commercialDynamics || defaultAcc.commercialDynamics || { rdvConquete: 0, opportunites: 0 },
                        actions: row.actions || []
                    };
                });
                
                // Merge any missing defaults that weren't in DB yet
                Object.keys(DEFAULT_DATA.accounts).forEach(name => {
                    if (!cloudData.accounts[name]) cloudData.accounts[name] = JSON.parse(JSON.stringify(DEFAULT_DATA.accounts[name]));
                });
                
                saveLocalData(cloudData); // Update cache
                return cloudData;
            } else {
                // Initialize DB with defaults if empty
                for (const name in DEFAULT_DATA.accounts) {
                    const acc = DEFAULT_DATA.accounts[name];
                    await supabase.from('accounts').insert({
                        name: name,
                        kam: acc.kam,
                        sponsor: acc.sponsor,
                        businessMetrics: acc.businessMetrics,
                        commercialDynamics: acc.commercialDynamics,
                        actions: acc.actions
                    });
                }
                return JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
        } catch (err) {
            console.error('Supabase sync error:', err);
            return loadLocalData();
        }
    }

    async function pushAccountToSupabase(accountName) {
        if (!supabase) return;
        const account = data.accounts[accountName];
        if (!account) return;

        try {
            const { error } = await supabase.from('accounts').upsert({
                name: accountName,
                kam: account.kam,
                sponsor: account.sponsor,
                businessMetrics: account.businessMetrics,
                commercialDynamics: account.commercialDynamics,
                actions: account.actions,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (err) {
            console.error(`Error pushing ${accountName} to Supabase:`, err);
        }
    }

    function safeAverage(values) {
        const valid = values.filter(v => v !== null && v !== undefined && !isNaN(v) && typeof v === 'number');
        if (valid.length === 0) return 0;
        return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
    }

    function getStatus(progress) {
        if (progress >= 70) return { emoji: '🟢', label: 'On Track', cls: 'green' };
        if (progress >= 30) return { emoji: '🟠', label: 'Attention', cls: 'orange' };
        return { emoji: '🔴', label: 'Critique', cls: 'red' };
    }

    function isLate(deadline, progress) {
        if (!deadline || progress >= 100) return false;
        const today = new Date(); today.setHours(0,0,0,0);
        const d = new Date(deadline); d.setHours(0,0,0,0);
        return d < today;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatDateHeader() {
        return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==========================================
    // APP STATE
    // ==========================================

    let data = { accounts: {} };
    let currentTab = 'comex';

    // ==========================================
    // DOM REFERENCES
    // ==========================================

    const tabNav = document.getElementById('tabNav');
    const contentArea = document.getElementById('contentArea');
    const headerDate = document.getElementById('headerDate');

    const modalOverlay = document.getElementById('modalOverlay');
    const actionForm = document.getElementById('actionForm');
    const formAccountId = document.getElementById('formAccountId');
    const formAction = document.getElementById('formAction');
    const formResponsible = document.getElementById('formResponsible');
    const formDeadline = document.getElementById('formDeadline');
    const formNextAction = document.getElementById('formNextAction');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');

    const editAccountOverlay = document.getElementById('editAccountOverlay');
    const editAccountForm = document.getElementById('editAccountForm');
    const editAccountId = document.getElementById('editAccountId');
    const editKam = document.getElementById('editKam');
    const editSponsor = document.getElementById('editSponsor');
    const editAccountClose = document.getElementById('editAccountClose');
    const editAccountCancel = document.getElementById('editAccountCancel');

    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;
    const moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;

    // ==========================================
    // THEME MANAGEMENT
    // ==========================================

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kam_cockpit_theme', theme);
        if (sunIcon && moonIcon) {
            if (theme === 'light') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('kam_cockpit_theme') || 'dark';
    applyTheme(savedTheme);

    // ==========================================
    // RENDERING
    // ==========================================

    function render() {
        renderTabs();
        if (currentTab === 'comex') renderComex();
        else renderAccount(currentTab);
    }

    function renderTabs() {
        const accountNames = Object.keys(data.accounts).sort((a,b) => a.localeCompare(b));
        let html = `
            <button class="tab ${currentTab === 'comex' ? 'active' : ''}" data-tab="comex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Dashboard COMEX
            </button>
        `;

        accountNames.forEach((name) => {
            const account = data.accounts[name];
            const avg = safeAverage(account.actions.map(a => a.progress));
            const status = getStatus(avg);
            html += `
                <button class="tab ${currentTab === name ? 'active' : ''}" data-tab="${escapeHtml(name)}">
                    ${ACCOUNT_ICONS[name] || '🏢'} ${escapeHtml(name)}
                    <span class="tab-badge ${status.cls}">${status.emoji}</span>
                </button>
            `;
        });
        tabNav.innerHTML = html;
    }

    function renderComex() {
        const accountNames = Object.keys(data.accounts).sort((a,b) => a.localeCompare(b));
        let totalActions = 0, totalLate = 0, allProgressValues = [];
        let totalCaRealise = 0, totalCaCible = 0;
        let totalRdv = 0, totalOpps = 0;

        accountNames.forEach(name => {
            const account = data.accounts[name];
            account.actions.forEach(action => {
                totalActions++; 
                allProgressValues.push(action.progress);
                if (isLate(action.deadline, action.progress)) totalLate++;
            });
            totalCaRealise += (account.businessMetrics?.caRealise || 0);
            totalCaCible += (account.businessMetrics?.caCible || 0);
            totalRdv += (account.commercialDynamics?.rdvConquete || 0);
            totalOpps += (account.commercialDynamics?.opportunites || 0);
        });

        const globalAvg = safeAverage(allProgressValues);
        const globalStatus = getStatus(globalAvg);
        const completedActions = allProgressValues.filter(v => v >= 100).length;

        let html = `
            <div class="comex-header">
                <h2>Vue d'ensemble COMEX</h2>
                <p>Synthèse cloud synchronisée — mise à jour en temps réel</p>
            </div>
            
            <div class="comex-stats-business">
                <div class="stat-card animate-in business-card">
                    <div class="stat-label">CA Global (Réalisé / Cible)</div>
                    <div class="stat-value blue">${formatCurrency(totalCaRealise)} <span class="stat-target">/ ${formatCurrency(totalCaCible)}</span></div>
                    <div class="progress-bar mt-2"><div class="progress-fill blue" style="width: ${totalCaCible ? (totalCaRealise/totalCaCible*100) : 0}%"></div></div>
                </div>
                <div class="stat-card animate-in business-card">
                    <div class="stat-label">Dynamique Co. Globale</div>
                    <div class="stat-value orange">${totalRdv} <span class="stat-target" style="font-size:0.6em; opacity:0.8;">RDV de conquête</span></div>
                    <div class="stat-target mt-1">${totalOpps} opportunités détectées</div>
                </div>
            </div>

            <div class="comex-stats mt-4">
                <div class="stat-card animate-in">
                    <div class="stat-label">Comptes suivis</div>
                    <div class="stat-value blue">${accountNames.length}</div>
                </div>
                <div class="stat-card animate-in">
                    <div class="stat-label">Avancement plans d'actions</div>
                    <div class="stat-value ${globalStatus.cls}">${globalAvg}%</div>
                </div>
                <div class="stat-card animate-in">
                    <div class="stat-label">Actions terminées</div>
                    <div class="stat-value green">${completedActions}/${totalActions}</div>
                </div>
                <div class="stat-card animate-in">
                    <div class="stat-label">Actions en retard</div>
                    <div class="stat-value ${totalLate > 0 ? 'red' : 'green'}">${totalLate}</div>
                </div>
            </div>
            <div class="comex-grid mt-4">
        `;

        accountNames.forEach(name => {
            const account = data.accounts[name];
            const avg = safeAverage(account.actions.map(a => a.progress));
            const status = getStatus(avg);
            const lateCount = account.actions.filter(a => isLate(a.deadline, a.progress)).length;
            
            const caR = account.businessMetrics?.caRealise || 0;
            const caC = account.businessMetrics?.caCible || 0;
            const rdv = account.commercialDynamics?.rdvConquete || 0;

            html += `
                <div class="account-card status-${status.cls} animate-in" data-navigate="${escapeHtml(name)}">
                    <div class="account-card-header">
                        <div class="account-name">${ACCOUNT_ICONS[name] || '🏢'} ${escapeHtml(name)}</div>
                        <span class="status-badge ${status.cls}">${status.emoji} ${status.label}</span>
                    </div>
                    <div class="account-stats-mini border-bottom-subtle pb-2 mb-2">
                        <div class="mini-stat">
                            <span class="mini-stat-label">CA Réalisé</span>
                            <span class="mini-stat-value">${formatCurrency(caR)}</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-label">Cible</span>
                            <span class="mini-stat-value">${formatCurrency(caC)}</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-label">RDV Conquête</span>
                            <span class="mini-stat-value">${rdv}</span>
                        </div>
                    </div>
                    <div class="account-meta">
                        <div class="meta-item"><span class="meta-label">KAM</span><span class="meta-value">${escapeHtml(account.kam)}</span></div>
                        <div class="meta-item"><span class="meta-label">Sponsor</span><span class="meta-value">${escapeHtml(account.sponsor)}</span></div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-header"><span class="progress-label">Avancement actions</span><span class="progress-value ${status.cls}">${avg}%</span></div>
                        <div class="progress-bar"><div class="progress-fill ${status.cls}" style="width: ${avg}%"></div></div>
                    </div>
                    <div class="account-footer mt-2">
                        <span>${account.actions.length} action${account.actions.length > 1 ? 's' : ''}</span>
                        <span class="late-count ${lateCount === 0 ? 'none' : ''}">${lateCount > 0 ? '⚠ ' + lateCount + ' en retard' : '✓ Aucun retard'}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        contentArea.innerHTML = html;
    }

    function renderAccount(accountName) {
        const account = data.accounts[accountName];
        if (!account) return;
        const avg = safeAverage(account.actions.map(a => a.progress));
        const status = getStatus(avg);
        const lateCount = account.actions.filter(a => isLate(a.deadline, a.progress)).length;
        const completedCount = account.actions.filter(a => a.progress >= 100).length;

        const bm = account.businessMetrics || { caRealise:0, caCible:0, margeBrute:0 };
        const cd = account.commercialDynamics || { rdvConquete:0, opportunites:0 };

        let html = `
            <div class="account-header">
                <div class="account-header-left">
                    <h2>${ACCOUNT_ICONS[accountName] || '🏢'} ${escapeHtml(accountName)}</h2>
                </div>
                <div class="account-header-right">
                    <button class="btn btn-ghost btn-sm" data-edit-account="${escapeHtml(accountName)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Modifier KAM</button>
                    <button class="btn btn-primary btn-sm" data-add-action="${escapeHtml(accountName)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nouvelle action</button>
                </div>
            </div>
            <div class="account-info-bar">
                <div class="info-chip">KAM : <strong>${escapeHtml(account.kam)}</strong></div>
                <div class="info-chip">Sponsor : <strong>${escapeHtml(account.sponsor)}</strong></div>
            </div>

            <!-- Nouveaux widgets business et dynamique -->
            <div class="business-metrics-grid mb-4">
                <div class="metric-block">
                    <h4>Performance Business</h4>
                    <div class="metric-row-edit mt-2">
                        <div class="input-wrap">
                            <label>CA Réalisé (€)</label>
                            <input type="text" class="block-input update-metric" data-account="${escapeHtml(accountName)}" data-parent="businessMetrics" data-field="caRealise" value="${formatNumber(bm.caRealise)}">
                        </div>
                        <div class="input-wrap">
                            <label>CA Cible (€)</label>
                            <input type="text" class="block-input update-metric" data-account="${escapeHtml(accountName)}" data-parent="businessMetrics" data-field="caCible" value="${formatNumber(bm.caCible)}">
                        </div>
                        <div class="input-wrap">
                            <label>Marge Brute (€)</label>
                            <input type="text" class="block-input update-metric" data-account="${escapeHtml(accountName)}" data-parent="businessMetrics" data-field="margeBrute" value="${formatNumber(bm.margeBrute)}">
                        </div>
                    </div>
                </div>
                <div class="metric-block">
                    <h4>Dynamique Commerciale</h4>
                    <div class="metric-row-edit mt-2">
                        <div class="input-wrap">
                            <label>RDV Conquête</label>
                            <input type="text" class="block-input update-metric" data-account="${escapeHtml(accountName)}" data-parent="commercialDynamics" data-field="rdvConquete" value="${formatNumber(cd.rdvConquete)}">
                        </div>
                        <div class="input-wrap">
                            <label>Op. Détectées</label>
                            <input type="text" class="block-input update-metric" data-account="${escapeHtml(accountName)}" data-parent="commercialDynamics" data-field="opportunites" value="${formatNumber(cd.opportunites)}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="account-summary-strip">
                <div class="summary-card"><div class="stat-label">Avancement</div><div class="stat-value ${status.cls}">${avg}%</div><div class="text-xs text-muted mt-1">${status.label}</div></div>
                <div class="summary-card"><div class="stat-label">Actions</div><div class="stat-value blue">${account.actions.length}</div></div>
                <div class="summary-card"><div class="stat-label">Terminées</div><div class="stat-value green">${completedCount}</div></div>
                <div class="summary-card"><div class="stat-label">En retard</div><div class="stat-value ${lateCount > 0 ? 'red' : 'green'}">${lateCount}</div></div>
            </div>
            
            <h3 class="mb-3 text-lg">Plan d'actions</h3>
            <div class="table-container">
        `;

        if (account.actions.length === 0) {
            html += `<div class="empty-state"><p>Aucune action</p></div>`;
        } else {
            html += `
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Action</th><th>Resp.</th><th>Deadline</th><th>Avancement</th><th>Statut</th><th>Prochaine action</th><th></th></tr></thead>
                        <tbody>
            `;
            account.actions.forEach((action) => {
                const actionStatus = getStatus(action.progress);
                const late = isLate(action.deadline, action.progress);
                html += `
                    <tr>
                        <td style="font-weight:500;"><input type="text" class="inline-input" style="font-weight:500; width: 100%; min-width: 200px;" value="${escapeHtml(action.action)}" data-action-id="${action.id}" data-account="${escapeHtml(accountName)}" data-field="action"></td>
                        <td><input type="text" class="inline-input" style="width: 100%; min-width: 100px;" value="${escapeHtml(action.responsible)}" data-action-id="${action.id}" data-account="${escapeHtml(accountName)}" data-field="responsible"></td>
                        <td><input type="date" class="inline-input ${late ? 'late' : ''}" style="width: auto; min-width: 120px;" value="${action.deadline || ''}" data-action-id="${action.id}" data-account="${escapeHtml(accountName)}" data-field="deadline"></td>
                        <td>
                            <div class="inline-slider-container">
                                <input type="range" class="inline-slider ${actionStatus.cls}" min="0" max="100" step="5" value="${action.progress}" style="--progress: ${action.progress}%" data-action-id="${action.id}" data-account="${escapeHtml(accountName)}" data-field="progress">
                                <span class="slider-value ${actionStatus.cls}">${action.progress}%</span>
                            </div>
                        </td>
                        <td class="status-cell">${actionStatus.emoji}</td>
                        <td><input type="text" class="inline-input" value="${escapeHtml(action.nextAction)}" data-action-id="${action.id}" data-account="${escapeHtml(accountName)}" data-field="nextAction"></td>
                        <td><button class="delete-action-btn" data-delete-action="${action.id}" data-account="${escapeHtml(accountName)}">&times;</button></td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    tabNav.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        currentTab = tab.dataset.tab;
        render();
    });

    contentArea.addEventListener('click', (e) => {
        const card = e.target.closest('[data-navigate]');
        if (card) { currentTab = card.dataset.navigate; render(); return; }
        const addBtn = e.target.closest('[data-add-action]');
        if (addBtn) { openAddActionModal(addBtn.dataset.addAction); return; }
        const editBtn = e.target.closest('[data-edit-account]');
        if (editBtn) { openEditAccountModal(editBtn.dataset.editAccount); return; }
        const deleteBtn = e.target.closest('[data-delete-action]');
        if (deleteBtn) { deleteAction(deleteBtn.dataset.account, deleteBtn.dataset.deleteAction); return; }
    });

    contentArea.addEventListener('input', (e) => {
        if (e.target.matches('.inline-slider')) {
            const { actionId, account, field } = e.target.dataset;
            const value = parseInt(e.target.value, 10);
            const status = getStatus(value);
            e.target.className = `inline-slider ${status.cls}`;
            e.target.style.setProperty('--progress', value + '%');
            const row = e.target.closest('tr');
            row.querySelector('.slider-value').className = `slider-value ${status.cls}`;
            row.querySelector('.slider-value').textContent = value + '%';
            row.querySelector('.status-cell').textContent = status.emoji;
            updateActionField(account, actionId, field, value);
        }
    });

    contentArea.addEventListener('change', (e) => {
        if (e.target.matches('.inline-input')) {
            const { actionId, account, field } = e.target.dataset;
            updateActionField(account, actionId, field, e.target.value);
        }
        if (e.target.matches('.update-metric')) {
            const { account, parent, field } = e.target.dataset;
            const raw = e.target.value.replace(/[^\d.-]/g, '');
            const parsedValue = parseFloat(raw) || 0;
            e.target.value = formatNumber(parsedValue);
            updateMetricField(account, parent, field, parsedValue);
        }
    });

    function openAddActionModal(accountName) {
        formAccountId.value = accountName;
        actionForm.reset();
        modalOverlay.classList.add('open');
        formAction.focus();
    }

    function closeAddActionModal() { modalOverlay.classList.remove('open'); }
    if(modalClose) modalClose.onclick = closeAddActionModal;
    if(modalCancel) modalCancel.onclick = closeAddActionModal;

    if(actionForm) {
        actionForm.onsubmit = async (e) => {
            e.preventDefault();
            const accountName = formAccountId.value;
            const newAction = { id: generateId(), action: formAction.value.trim(), responsible: formResponsible.value.trim(), deadline: formDeadline.value, progress: 0, nextAction: formNextAction.value.trim() };
            data.accounts[accountName].actions.push(newAction);
            await pushAccountToSupabase(accountName);
            saveLocalData(data);
            closeAddActionModal();
            render();
        };
    }

    function openEditAccountModal(accountName) {
        const account = data.accounts[accountName];
        editAccountId.value = accountName;
        editKam.value = account.kam;
        editSponsor.value = account.sponsor;
        editAccountOverlay.classList.add('open');
    }

    function closeEditAccountModal() { editAccountOverlay.classList.remove('open'); }
    if(editAccountClose) editAccountClose.onclick = closeEditAccountModal;
    if(editAccountCancel) editAccountCancel.onclick = closeEditAccountModal;

    if(editAccountForm) {
        editAccountForm.onsubmit = async (e) => {
            e.preventDefault();
            const accountName = editAccountId.value;
            data.accounts[accountName].kam = editKam.value.trim();
            data.accounts[accountName].sponsor = editSponsor.value.trim();
            await pushAccountToSupabase(accountName);
            saveLocalData(data);
            closeEditAccountModal();
            render();
        };
    }

    async function updateActionField(accountName, actionId, field, value) {
        const account = data.accounts[accountName];
        const action = account.actions.find(a => a.id === actionId);
        action[field] = value;
        await pushAccountToSupabase(accountName);
        saveLocalData(data);
        renderTabs();
        if (field === 'deadline') renderAccount(accountName);
    }

    async function updateMetricField(accountName, parentKey, fieldKey, value) {
        const account = data.accounts[accountName];
        if(!account[parentKey]) account[parentKey] = {};
        account[parentKey][fieldKey] = value;
        await pushAccountToSupabase(accountName);
        saveLocalData(data);
        renderTabs(); // refresh badges if needed (though metrics don't affect badges right now, but good practice)
    }

    async function deleteAction(accountName, actionId) {
        if (!confirm('Supprimer ?')) return;
        data.accounts[accountName].actions = data.accounts[accountName].actions.filter(a => a.id !== actionId);
        await pushAccountToSupabase(accountName);
        saveLocalData(data);
        render();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init() {
        if(headerDate) headerDate.textContent = formatDateHeader();
        data = await syncFromSupabase();
        render();
    }

    init();
})();
