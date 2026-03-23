/* ========================================
   KAM Cockpit — Application Logic
   ======================================== */

(function () {
    'use strict';

    // ==========================================
    // DATA MODEL & DEFAULTS
    // ==========================================

    const STORAGE_KEY = 'kam_cockpit_data';

    const DEFAULT_DATA = {
        accounts: {
            MAIF: {
                kam: 'Sophie Martin',
                sponsor: 'Jean Dupont',
                actions: [
                    {
                        id: generateId(),
                        action: 'Renouvellement contrat flotte auto',
                        responsible: 'Sophie Martin',
                        deadline: '2026-04-15',
                        progress: 75,
                        nextAction: 'Envoyer la proposition tarifaire révisée',
                    },
                    {
                        id: generateId(),
                        action: 'Déploiement assurance habitation collective',
                        responsible: 'Pierre Lemoine',
                        deadline: '2026-05-01',
                        progress: 40,
                        nextAction: 'Organiser le comité de pilotage',
                    },
                    {
                        id: generateId(),
                        action: 'Étude de marché produits santé',
                        responsible: 'Sophie Martin',
                        deadline: '2026-03-20',
                        progress: 20,
                        nextAction: 'Finaliser le benchmark concurrentiel',
                    },
                ],
            },
            DANONE: {
                kam: 'Julien Moreau',
                sponsor: 'Claire Fontaine',
                actions: [
                    {
                        id: generateId(),
                        action: 'Lancement gamme bio premium',
                        responsible: 'Julien Moreau',
                        deadline: '2026-06-01',
                        progress: 55,
                        nextAction: 'Valider le packaging final avec le marketing',
                    },
                    {
                        id: generateId(),
                        action: 'Négociation référencement GMS',
                        responsible: 'Amandine Roche',
                        deadline: '2026-04-30',
                        progress: 30,
                        nextAction: 'Préparer la grille tarifaire pour Carrefour',
                    },
                    {
                        id: generateId(),
                        action: 'Plan promotion été 2026',
                        responsible: 'Julien Moreau',
                        deadline: '2026-05-15',
                        progress: 10,
                        nextAction: 'Rédiger le brief créatif',
                    },
                ],
            },
            PROSOL: {
                kam: 'Marie Lambert',
                sponsor: 'Éric Vasseur',
                actions: [
                    {
                        id: generateId(),
                        action: 'Extension réseau Grand Frais Île-de-France',
                        responsible: 'Marie Lambert',
                        deadline: '2026-07-01',
                        progress: 65,
                        nextAction: 'Signer le bail du point de vente Vincennes',
                    },
                    {
                        id: generateId(),
                        action: 'Digitalisation parcours client',
                        responsible: 'Thibault Perrin',
                        deadline: '2026-04-20',
                        progress: 85,
                        nextAction: 'Tester la V2 du click & collect',
                    },
                    {
                        id: generateId(),
                        action: 'Partenariat producteurs locaux',
                        responsible: 'Marie Lambert',
                        deadline: '2026-03-18',
                        progress: 45,
                        nextAction: 'Organiser les audits qualité fournisseurs',
                    },
                ],
            },
            KRONENBOURG: {
                kam: 'Antoine Girard',
                sponsor: 'Isabelle Morel',
                actions: [
                    {
                        id: generateId(),
                        action: 'Lancement 1664 Blanc édition limitée',
                        responsible: 'Antoine Girard',
                        deadline: '2026-05-20',
                        progress: 80,
                        nextAction: 'Confirmer les volumes avec la production',
                    },
                    {
                        id: generateId(),
                        action: 'Campagne sponsoring Euro 2026',
                        responsible: 'Léa Dubois',
                        deadline: '2026-06-10',
                        progress: 50,
                        nextAction: 'Finaliser la sélection des stades partenaires',
                    },
                    {
                        id: generateId(),
                        action: 'Optimisation supply chain CHR',
                        responsible: 'Antoine Girard',
                        deadline: '2026-03-15',
                        progress: 90,
                        nextAction: 'Déployer le nouveau système de commande',
                    },
                ],
            },
        },
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function generateId() {
        return 'a' + Math.random().toString(36).substr(2, 9);
    }

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('Error loading data, using defaults', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data', e);
        }
    }

    /**
     * Safe average: ignores null/undefined/NaN values.
     * Equivalent to IFERROR(AVERAGE(...)) in Google Sheets.
     */
    function safeAverage(values) {
        const valid = values.filter(
            (v) => v !== null && v !== undefined && !isNaN(v) && typeof v === 'number'
        );
        if (valid.length === 0) return 0;
        return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
    }

    /**
     * Compute status from progress percentage.
     * 🟢 >= 70% | 🟠 >= 30% | 🔴 < 30%
     */
    function getStatus(progress) {
        if (progress >= 70) return { emoji: '🟢', label: 'On Track', cls: 'green' };
        if (progress >= 30) return { emoji: '🟠', label: 'Attention', cls: 'orange' };
        return { emoji: '🔴', label: 'Critique', cls: 'red' };
    }

    /**
     * Check if a deadline is past due AND progress < 100%.
     */
    function isLate(deadline, progress) {
        if (!deadline || progress >= 100) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(deadline);
        d.setHours(0, 0, 0, 0);
        return d < today;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatDateHeader() {
        return new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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

    let data = loadData();
    let currentTab = 'comex';

    // ==========================================
    // DOM REFERENCES
    // ==========================================

    const tabNav = document.getElementById('tabNav');
    const contentArea = document.getElementById('contentArea');
    const headerDate = document.getElementById('headerDate');

    // Modal elements — add action
    const modalOverlay = document.getElementById('modalOverlay');
    const actionForm = document.getElementById('actionForm');
    const formAccountId = document.getElementById('formAccountId');
    const formAction = document.getElementById('formAction');
    const formResponsible = document.getElementById('formResponsible');
    const formDeadline = document.getElementById('formDeadline');
    const formNextAction = document.getElementById('formNextAction');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');

    // Modal elements — edit account
    const editAccountOverlay = document.getElementById('editAccountOverlay');
    const editAccountForm = document.getElementById('editAccountForm');
    const editAccountId = document.getElementById('editAccountId');
    const editKam = document.getElementById('editKam');
    const editSponsor = document.getElementById('editSponsor');
    const editAccountClose = document.getElementById('editAccountClose');
    const editAccountCancel = document.getElementById('editAccountCancel');

    // Export / Import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    // ==========================================
    // RENDERING
    // ==========================================

    function render() {
        renderTabs();
        if (currentTab === 'comex') {
            renderComex();
        } else {
            renderAccount(currentTab);
        }
    }

    function renderTabs() {
        const accountNames = Object.keys(data.accounts);

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
            const avg = safeAverage(account.actions.map((a) => a.progress));
            const status = getStatus(avg);
            html += `
                <button class="tab ${currentTab === name ? 'active' : ''}" data-tab="${escapeHtml(name)}">
                    ${escapeHtml(name)}
                    <span class="tab-badge ${status.cls}">${status.emoji}</span>
                </button>
            `;
        });

        tabNav.innerHTML = html;
    }

    function renderComex() {
        const accountNames = Object.keys(data.accounts);

        // Compute global stats
        let totalActions = 0;
        let totalLate = 0;
        let allProgressValues = [];

        accountNames.forEach((name) => {
            const account = data.accounts[name];
            account.actions.forEach((action) => {
                totalActions++;
                allProgressValues.push(action.progress);
                if (isLate(action.deadline, action.progress)) totalLate++;
            });
        });

        const globalAvg = safeAverage(allProgressValues);
        const globalStatus = getStatus(globalAvg);
        const completedActions = allProgressValues.filter((v) => v >= 100).length;

        let html = `
            <div class="comex-header">
                <h2>Vue d'ensemble COMEX</h2>
                <p>Synthèse du pilotage des comptes clés — mise à jour en temps réel</p>
            </div>

            <div class="comex-stats">
                <div class="stat-card animate-in">
                    <div class="stat-label">Comptes suivis</div>
                    <div class="stat-value blue">${accountNames.length}</div>
                </div>
                <div class="stat-card animate-in">
                    <div class="stat-label">Avancement global</div>
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

            <div class="comex-grid">
        `;

        accountNames.forEach((name) => {
            const account = data.accounts[name];
            const progressValues = account.actions.map((a) => a.progress);
            const avg = safeAverage(progressValues);
            const status = getStatus(avg);
            const lateCount = account.actions.filter((a) =>
                isLate(a.deadline, a.progress)
            ).length;
            const totalAccountActions = account.actions.length;

            html += `
                <div class="account-card status-${status.cls} animate-in" data-navigate="${escapeHtml(name)}">
                    <div class="account-card-header">
                        <div class="account-name">${escapeHtml(name)}</div>
                        <span class="status-badge ${status.cls}">${status.emoji} ${status.label}</span>
                    </div>
                    <div class="account-meta">
                        <div class="meta-item">
                            <span class="meta-label">KAM</span>
                            <span class="meta-value">${escapeHtml(account.kam)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Sponsor</span>
                            <span class="meta-value">${escapeHtml(account.sponsor)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Actions</span>
                            <span class="meta-value">${totalAccountActions}</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-header">
                            <span class="progress-label">Avancement moyen</span>
                            <span class="progress-value ${status.cls}">${avg}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${status.cls}" style="width: ${avg}%"></div>
                        </div>
                    </div>
                    <div class="account-footer">
                        <span>${totalAccountActions} action${totalAccountActions > 1 ? 's' : ''}</span>
                        <span class="late-count ${lateCount === 0 ? 'none' : ''}">
                            ${lateCount > 0 ? '⚠ ' + lateCount + ' en retard' : '✓ Aucun retard'}
                        </span>
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

        const progressValues = account.actions.map((a) => a.progress);
        const avg = safeAverage(progressValues);
        const status = getStatus(avg);
        const lateCount = account.actions.filter((a) =>
            isLate(a.deadline, a.progress)
        ).length;
        const completedCount = account.actions.filter((a) => a.progress >= 100).length;

        let html = `
            <div class="account-header">
                <div class="account-header-left">
                    <h2>${escapeHtml(accountName)}</h2>
                    <span class="status-badge ${status.cls}">${status.emoji} ${status.label}</span>
                </div>
                <div class="account-header-right">
                    <button class="btn btn-ghost btn-sm" data-edit-account="${escapeHtml(accountName)}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifier le compte
                    </button>
                    <button class="btn btn-primary btn-sm" data-add-action="${escapeHtml(accountName)}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nouvelle action
                    </button>
                </div>
            </div>

            <div class="account-info-bar">
                <div class="info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    KAM : <strong>${escapeHtml(account.kam)}</strong>
                </div>
                <div class="info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Sponsor : <strong>${escapeHtml(account.sponsor)}</strong>
                </div>
            </div>

            <div class="account-summary-strip">
                <div class="summary-card">
                    <div class="stat-label">Avancement</div>
                    <div class="stat-value ${status.cls}">${avg}%</div>
                </div>
                <div class="summary-card">
                    <div class="stat-label">Actions</div>
                    <div class="stat-value blue">${account.actions.length}</div>
                </div>
                <div class="summary-card">
                    <div class="stat-label">Terminées</div>
                    <div class="stat-value green">${completedCount}</div>
                </div>
                <div class="summary-card">
                    <div class="stat-label">En retard</div>
                    <div class="stat-value ${lateCount > 0 ? 'red' : 'green'}">${lateCount}</div>
                </div>
            </div>

            <div class="table-container">
        `;

        if (account.actions.length === 0) {
            html += `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    <p>Aucune action pour ce compte</p>
                    <button class="btn btn-primary" data-add-action="${escapeHtml(accountName)}">
                        Ajouter une action
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Responsable</th>
                                <th>Deadline</th>
                                <th>Avancement</th>
                                <th>Statut</th>
                                <th>Prochaine action</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            account.actions.forEach((action) => {
                const actionStatus = getStatus(action.progress);
                const late = isLate(action.deadline, action.progress);
                const sliderColor = actionStatus.cls;

                html += `
                    <tr>
                        <td style="font-weight:500; min-width: 200px;">${escapeHtml(action.action)}</td>
                        <td style="color: var(--text-secondary);">${escapeHtml(action.responsible)}</td>
                        <td>
                            <span class="deadline ${late ? 'late' : ''}">${formatDate(action.deadline)}</span>
                        </td>
                        <td>
                            <div class="inline-slider-container">
                                <input
                                    type="range"
                                    class="inline-slider ${sliderColor}"
                                    min="0" max="100" step="5"
                                    value="${action.progress}"
                                    style="--progress: ${action.progress}%"
                                    data-action-id="${action.id}"
                                    data-account="${escapeHtml(accountName)}"
                                    data-field="progress"
                                >
                                <span class="slider-value ${sliderColor}">${action.progress}%</span>
                            </div>
                        </td>
                        <td class="status-cell">${actionStatus.emoji}</td>
                        <td>
                            <input
                                type="text"
                                class="inline-input"
                                value="${escapeHtml(action.nextAction)}"
                                placeholder="Prochaine action..."
                                data-action-id="${action.id}"
                                data-account="${escapeHtml(accountName)}"
                                data-field="nextAction"
                            >
                        </td>
                        <td>
                            <button class="delete-action-btn" data-delete-action="${action.id}" data-account="${escapeHtml(accountName)}" title="Supprimer cette action">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    // Tab navigation
    tabNav.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        currentTab = tab.dataset.tab;
        render();
    });

    // Navigate to account from COMEX card
    contentArea.addEventListener('click', (e) => {
        const card = e.target.closest('[data-navigate]');
        if (card) {
            currentTab = card.dataset.navigate;
            render();
            return;
        }

        // Add action button
        const addBtn = e.target.closest('[data-add-action]');
        if (addBtn) {
            openAddActionModal(addBtn.dataset.addAction);
            return;
        }

        // Edit account button
        const editBtn = e.target.closest('[data-edit-account]');
        if (editBtn) {
            openEditAccountModal(editBtn.dataset.editAccount);
            return;
        }

        // Delete action button
        const deleteBtn = e.target.closest('[data-delete-action]');
        if (deleteBtn) {
            deleteAction(deleteBtn.dataset.account, deleteBtn.dataset.deleteAction);
            return;
        }
    });

    // Inline slider changes (progress)
    contentArea.addEventListener('input', (e) => {
        if (e.target.matches('.inline-slider')) {
            const { actionId, account, field } = e.target.dataset;
            const value = parseInt(e.target.value, 10);

            // Update display
            const container = e.target.closest('.inline-slider-container');
            const valueSpan = container.querySelector('.slider-value');

            // Update status colors
            const status = getStatus(value);
            e.target.className = `inline-slider ${status.cls}`;
            e.target.style.setProperty('--progress', value + '%');
            valueSpan.className = `slider-value ${status.cls}`;
            valueSpan.textContent = value + '%';

            // Update status emoji
            const row = e.target.closest('tr');
            const statusCell = row.querySelector('.status-cell');
            statusCell.textContent = status.emoji;

            // Save
            updateActionField(account, actionId, field, value);
        }
    });

    // Inline input changes (nextAction)
    contentArea.addEventListener('change', (e) => {
        if (e.target.matches('.inline-input')) {
            const { actionId, account, field } = e.target.dataset;
            updateActionField(account, actionId, field, e.target.value);
        }
    });

    // Add action modal
    function openAddActionModal(accountName) {
        formAccountId.value = accountName;
        formAction.value = '';
        formResponsible.value = '';
        formDeadline.value = '';
        formNextAction.value = '';
        modalOverlay.classList.add('open');
        formAction.focus();
    }

    function closeAddActionModal() {
        modalOverlay.classList.remove('open');
    }

    modalClose.addEventListener('click', closeAddActionModal);
    modalCancel.addEventListener('click', closeAddActionModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeAddActionModal();
    });

    actionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const accountName = formAccountId.value;
        const newAction = {
            id: generateId(),
            action: formAction.value.trim(),
            responsible: formResponsible.value.trim(),
            deadline: formDeadline.value,
            progress: 0,
            nextAction: formNextAction.value.trim(),
        };
        data.accounts[accountName].actions.push(newAction);
        saveData(data);
        closeAddActionModal();
        render();
    });

    // Edit account modal
    function openEditAccountModal(accountName) {
        const account = data.accounts[accountName];
        editAccountId.value = accountName;
        editKam.value = account.kam;
        editSponsor.value = account.sponsor;
        editAccountOverlay.classList.add('open');
        editKam.focus();
    }

    function closeEditAccountModal() {
        editAccountOverlay.classList.remove('open');
    }

    editAccountClose.addEventListener('click', closeEditAccountModal);
    editAccountCancel.addEventListener('click', closeEditAccountModal);
    editAccountOverlay.addEventListener('click', (e) => {
        if (e.target === editAccountOverlay) closeEditAccountModal();
    });

    editAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const accountName = editAccountId.value;
        data.accounts[accountName].kam = editKam.value.trim();
        data.accounts[accountName].sponsor = editSponsor.value.trim();
        saveData(data);
        closeEditAccountModal();
        render();
    });

    // Update action field
    function updateActionField(accountName, actionId, field, value) {
        const account = data.accounts[accountName];
        if (!account) return;
        const action = account.actions.find((a) => a.id === actionId);
        if (!action) return;
        action[field] = value;
        saveData(data);
        // Update tabs to reflect new status
        renderTabs();
    }

    // Delete action
    function deleteAction(accountName, actionId) {
        if (!confirm('Supprimer cette action ?')) return;
        const account = data.accounts[accountName];
        if (!account) return;
        account.actions = account.actions.filter((a) => a.id !== actionId);
        saveData(data);
        render();
    }

    // Export
    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kam_cockpit_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import
    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (imported.accounts) {
                    data = imported;
                    saveData(data);
                    render();
                } else {
                    alert('Format de fichier invalide.');
                }
            } catch (err) {
                alert('Erreur lors de l\'import : ' + err.message);
            }
        };
        reader.readAsText(file);
        importFile.value = '';
    });

    // Keyboard shortcut: Escape to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddActionModal();
            closeEditAccountModal();
        }
    });

    // ==========================================
    // INITIALIZATION
    // ==========================================

    headerDate.textContent = formatDateHeader();
    render();
})();
