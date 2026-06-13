let editMode = false;
let currentFilter = '';

document.addEventListener('DOMContentLoaded', function() {
    renderLeaderboard();
    setupNavigation();
    setupSearch();
    setupExport();
    setupEditModeToggle();
});

const uuidCache = {};

async function getUuidForName(name) {
    if (uuidCache[name]) {
        return uuidCache[name];
    }
    
    if (name === "?" || !name) {
        return null;
    }
    
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
        if (response.ok) {
            const data = await response.json();
            uuidCache[name] = data.id;
            return data.id;
        }
    } catch (e) {
        console.log("Could not fetch UUID for:", name);
    }
    return null;
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderLeaderboard(e.target.value);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}

function renderLeaderboard(filter = '') {
    currentFilter = filter;
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    const filtered = leaderboardData.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(player => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        
        // Player Info
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        
        const playerAvatar = document.createElement('div');
        playerAvatar.className = 'player-avatar';
        
        const avatarRank = document.createElement('div');
        avatarRank.className = `avatar-rank avatar-rank--${player.rank}`;
        avatarRank.textContent = player.rank;
        
        const avatarImgWrap = document.createElement('div');
        avatarImgWrap.className = 'avatar-img-wrap';
        
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-img';
        avatarImg.src = `https://minotar.net/avatar/${player.avatar}/56`;
        avatarImg.alt = player.name;
        
        avatarImgWrap.appendChild(avatarImg);
        playerAvatar.appendChild(avatarRank);
        playerAvatar.appendChild(avatarImgWrap);
        
        const sanitizeAvatarName = (name) => {
            return name.trim().replace(/\s+/g, '').replace(/[^A-Za-z0-9_]/g, '');
        };
        
        const updateAvatar = async (newName) => {
            const sanitized = sanitizeAvatarName(newName || player.avatar);
            const targetName = sanitized || sanitizeAvatarName(player.avatar);
            avatarImg.src = `https://minotar.net/avatar/${targetName}/56`;
            const uuid = await getUuidForName(targetName);
            if (uuid) {
                avatarImg.src = `https://crafatar.com/avatars/${uuid}?size=56`;
            }
        };
        
        // Load UUID and upgrade to Crafatar if available
        updateAvatar(player.avatar);
        
        const details = document.createElement('div');
        details.className = 'player-details';
        
        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = player.name;
        name.contentEditable = editMode;
        name.classList.toggle('editable', editMode);
        if (editMode) {
            name.addEventListener('input', () => {
                const editedName = name.textContent.trim();
                if (editedName) {
                    updateAvatar(editedName);
                }
            });
            name.addEventListener('blur', () => {
                const editedName = name.textContent.trim();
                player.name = editedName || '?';
                player.avatar = sanitizeAvatarName(editedName) || player.avatar;
                updateAvatar(player.avatar);
            });
            name.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    name.blur();
                }
            });
        }
        
        const title = document.createElement('div');
        title.className = 'player-title';
        title.innerHTML = `<span class="title-icon">◆</span> ${player.title} (${player.points})`;
        
        details.appendChild(name);
        details.appendChild(title);
        playerDiv.appendChild(playerAvatar);
        playerDiv.appendChild(details);
        
        // Region
        const regionDiv = document.createElement('div');
        regionDiv.className = `region ${player.region.toLowerCase()}`;
        regionDiv.textContent = player.region;
        
        // Tiers
        const tiersDiv = document.createElement('div');
        tiersDiv.className = 'tiers';
        player.tiers.forEach(tier => {
            const tierIcon = document.createElement('div');
            tierIcon.className = `tier-icon ${tier}`;
            tierIcon.textContent = tier.toUpperCase();
            tierIcon.title = tier;
            tiersDiv.appendChild(tierIcon);
        });
        
        row.appendChild(playerDiv);
        row.appendChild(regionDiv);
        row.appendChild(tiersDiv);
        
        leaderboardList.appendChild(row);
    });
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Tu môžeš pridať logiku pre prepínanie medzi stránkami
            const page = this.textContent.trim();
            console.log('Navigácia na:', page);
        });
    });
}

function setupExport() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDataFile);
        exportBtn.classList.add('hidden');
    }
}

function setupEditModeToggle() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            editMode = !editMode;
            updateEditControls();
            renderLeaderboard(currentFilter);
            updateServerIpEditable();
        }
    });
}

function updateServerIpEditable() {
    const serverIpEl = document.getElementById('server-ip-value');
    if (!serverIpEl) return;

    serverIpEl.contentEditable = editMode;
    serverIpEl.classList.toggle('editable', editMode);
    if (editMode) {
        serverIpEl.addEventListener('blur', () => {
            serverIpEl.textContent = serverIpEl.textContent.trim() || 'mcpvp.club';
        });
        serverIpEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                serverIpEl.blur();
            }
        });
    }
}

function updateEditControls() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.classList.toggle('hidden', !editMode);
    }
    updateServerIpEditable();
}

function exportDataFile() {
    const dataStr = 'const leaderboardData = ' + JSON.stringify(leaderboardData, null, 4) + ';';
    const dataBlob = new Blob([dataStr], { type: 'application/javascript' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.js';
    link.click();
    URL.revokeObjectURL(url);
}
