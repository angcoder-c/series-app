// Check authentication
function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem('auth_token');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// State
let currentSeries = [];
let allSeries = [];
let allGenres = [];
let selectedGenreIds = [];
let editingSeriesId = null;
let currentDetailSeriesId = null;

// DOM elements
const seriesGrid = document.getElementById('series-grid');
const modal = document.getElementById('series-detail');
const createModal = document.getElementById('create-modal');
const editModal = document.getElementById('edit-modal');
const detailCloseBtn = document.querySelector('#series-detail .close');
const createCloseBtn = document.querySelector('#create-modal .close');
const editCloseBtn = document.querySelector('#edit-modal .close');
const seriesForm = document.getElementById('series-form');
const editForm = document.getElementById('edit-form');
const formMessage = document.getElementById('form-message');
const editMessage = document.getElementById('edit-message');
const ratingForm = document.getElementById('rating-form');
const ratingMessage = document.getElementById('rating-message');
const ratingAverage = document.getElementById('rating-average');
const ratingCount = document.getElementById('rating-count');
const ratingScore = document.getElementById('rating-score');
const ratingComment = document.getElementById('rating-comment');
const logoutBtn = document.getElementById('logout-btn');
const createBtn = document.getElementById('create-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const genresContainer = document.getElementById('genres-container');
const newGenreInput = document.getElementById('new-genre');
const addGenreBtn = document.getElementById('add-genre-btn');

// Utility functions
function getPlaceholderDataUrl(label, width, height) {
    const safeLabel = (label || 'No Image').replace(/[<>]/g, '').slice(0, 32);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#151515"/><stop offset="100%" stop-color="#262626"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#c9c9c9" font-size="20" font-family="Arial, sans-serif">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeSeries(series) {
    return {
        id: series.id,
        title: series.title || 'Sin titulo',
        synopsis: series.synopsis ?? series.description ?? null,
        release_year: series.release_year ?? null,
        status: series.status ?? null,
        total_seasons: series.total_seasons ?? null,
        total_episodes: series.total_episodes ?? null,
        image_url: series.image_url ?? null,
        image_public_id: series.image_public_id ?? null
    };
}

function translateStatus(status) {
    const map = {
        'ongoing': 'En emisión',
        'ended': 'Finalizada',
        'cancelled': 'Cancelada',
        'upcoming': 'Próximamente'
    };
    return map[status] || status;
}

function toOptionalNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

// Genre functions
async function loadGenres() {
    try {
        const response = await fetch(`${API_URL}/genres`);
        if (!response.ok) throw new Error('Error al cargar géneros');
        allGenres = await response.json();
        renderGenreCheckboxes();
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

function renderGenreCheckboxes() {
    genresContainer.innerHTML = allGenres.map(genre => `
        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="checkbox" value="${genre.id}" class="genre-checkbox">
            ${genre.name}
        </label>
    `).join('');

    document.querySelectorAll('.genre-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedGenreIds.push(parseInt(e.target.value));
            } else {
                selectedGenreIds = selectedGenreIds.filter(id => id !== parseInt(e.target.value));
            }
        });
    });
}

async function createGenre() {
    const genreName = newGenreInput.value.trim();
    if (!genreName) {
        alert('Por favor ingresa un nombre de género');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/genres`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: genreName })
        });

        if (!response.ok) throw new Error('Error al crear género');
        
        await loadGenres();
        newGenreInput.value = '';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Series CRUD functions
async function loadSeries() {
    try {
        const response = await fetch(`${API_URL}/series?limit=100`);
        if (!response.ok) throw new Error('Error al cargar series');
        
        const data = await response.json();
        allSeries = (Array.isArray(data) ? data : data.value || []).map(normalizeSeries);
        currentSeries = [...allSeries];
        renderSeries(currentSeries);
    } catch (error) {
        seriesGrid.innerHTML = `<div class="loading error">Error: ${error.message}</div>`;
        console.error('Full error:', error);
    }
}

function renderSeries(series) {
    if (series.length === 0) {
        seriesGrid.innerHTML = '<div class="loading">No hay series</div>';
        return;
    }

    seriesGrid.innerHTML = series.map(s => `
        <div class="series-card" data-id="${s.id}">
            <img src="${s.image_url || getPlaceholderDataUrl(s.title, 200, 300)}"
                 data-fallback="${getPlaceholderDataUrl(s.title, 200, 300)}"
                 alt="${s.title}" 
                 onerror="this.src=this.dataset.fallback">
            <div class="series-card-title">${s.title}</div>
        </div>
    `).join('');

    document.querySelectorAll('.series-card').forEach(card => {
        card.addEventListener('click', () => openDetail(card.dataset.id));
    });
}

async function openDetail(seriesId) {
    try {
        const response = await fetch(`${API_URL}/series/${seriesId}`);
        if (!response.ok) throw new Error('Error al cargar detalles');
        
        const rawSeries = await response.json();
        const series = normalizeSeries(rawSeries);
        editingSeriesId = series.id;
        
        const detailPlaceholder = getPlaceholderDataUrl(series.title, 300, 450);
        document.getElementById('detail-image').src = series.image_url || detailPlaceholder;
        document.getElementById('detail-image').onerror = function() {
            this.src = detailPlaceholder;
        };
        document.getElementById('detail-title').textContent = series.title;
        document.getElementById('detail-synopsis').textContent = series.synopsis || 'Sin sinopsis disponible';
        document.getElementById('detail-year').textContent = series.release_year || '-';
        document.getElementById('detail-status').textContent = translateStatus(series.status) || '-';
        document.getElementById('detail-seasons').textContent = series.total_seasons || '-';
        document.getElementById('detail-episodes').textContent = series.total_episodes || '-';
        currentDetailSeriesId = series.id;
        
        modal.style.display = 'flex';
        await loadSeriesRating(series.id);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadSeriesRating(seriesId) {
    if (!ratingForm) return;

    ratingMessage.textContent = '';
    try {
        const response = await fetch(`${API_URL}/ratings/series/${seriesId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const ratingData = await response.json();
        ratingAverage.textContent = ratingData.average_score ?? '-';
        ratingCount.textContent = ratingData.ratings_count ?? 0;
        ratingScore.value = ratingData.my_rating?.score ? String(ratingData.my_rating.score) : '5';
        ratingComment.value = ratingData.my_rating?.comment || '';
    } catch (error) {
        ratingAverage.textContent = '-';
        ratingCount.textContent = '0';
        ratingScore.value = '5';
        ratingComment.value = '';
        ratingMessage.textContent = `No se pudo cargar el rating: ${error.message}`;
    }
}

async function saveRating(event) {
    event.preventDefault();

    if (!currentDetailSeriesId) {
        ratingMessage.textContent = 'No hay una serie seleccionada.';
        return;
    }

    const submitButton = ratingForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    ratingMessage.textContent = 'Guardando rating...';

    try {
        const response = await fetch(`${API_URL}/ratings`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                series_id: currentDetailSeriesId,
                score: Number(ratingScore.value),
                comment: ratingComment.value.trim() || null
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        ratingMessage.textContent = 'Rating guardado correctamente';
        await loadSeriesRating(currentDetailSeriesId);
    } catch (error) {
        ratingMessage.textContent = `Error al guardar rating: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
}

async function uploadImageIfNeeded() {
    const fileInput = document.getElementById('image_file');
    const manualUrl = document.getElementById('image_url')?.value?.trim();

    if (manualUrl) return { image_url: manualUrl, image_public_id: null };
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return { image_url: null, image_public_id: null };

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const uploadResponse = await fetch(`${API_URL}/series/upload-image`, {
        method: 'POST',
        body: formData
    });

    if (!uploadResponse.ok) {
        throw new Error(`Upload HTTP ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    return {
        image_url: uploadData.image_url || null,
        image_public_id: uploadData.image_public_id || null
    };
}

async function createSeries(event) {
    event.preventDefault();
    const submitButton = seriesForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    formMessage.textContent = 'Creando...';

    const payload = {
        title: seriesForm.title.value.trim(),
        synopsis: seriesForm.synopsis.value.trim(),
        description: seriesForm.synopsis.value.trim(),
        release_year: toOptionalNumber(seriesForm.release_year.value),
        status: seriesForm.status.value || null,
        total_seasons: toOptionalNumber(seriesForm.total_seasons.value),
        total_episodes: toOptionalNumber(seriesForm.total_episodes.value),
        image_url: null,
        image_public_id: null
    };

    try {
        formMessage.textContent = 'Subiendo imagen...';
        const uploadedImage = await uploadImageIfNeeded();
        payload.image_url = uploadedImage.image_url;
        payload.image_public_id = uploadedImage.image_public_id;

        formMessage.textContent = 'Creando serie...';
        const response = await fetch(`${API_URL}/series`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const created = normalizeSeries(await response.json());
        currentSeries = [created, ...currentSeries];
        allSeries = [created, ...allSeries];
        renderSeries(currentSeries);
        seriesForm.reset();
        selectedGenreIds = [];
        formMessage.textContent = 'Serie creada correctamente';
    } catch (error) {
        formMessage.textContent = `Error al crear: ${error.message}`;
        console.error('Create error:', error);
    } finally {
        submitButton.disabled = false;
    }
}

async function deleteSeries(seriesId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta serie?')) return;

    try {
        const response = await fetch(`${API_URL}/series/${seriesId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Error al eliminar');

        currentSeries = currentSeries.filter(s => s.id !== seriesId);
        allSeries = allSeries.filter(s => s.id !== seriesId);
        renderSeries(currentSeries);
        modal.style.display = 'none';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Edit functions
async function openEditModal(seriesId) {
    try {
        const response = await fetch(`${API_URL}/series/${seriesId}`);
        if (!response.ok) throw new Error('Error al cargar detalles');
        
        const series = await response.json();
        
        // Populate edit form
        document.getElementById('edit-title').value = series.title || '';
        document.getElementById('edit-release_year').value = series.release_year || '';
        document.getElementById('edit-status').value = series.status || 'ongoing';
        document.getElementById('edit-total_seasons').value = series.total_seasons || '';
        document.getElementById('edit-total_episodes').value = series.total_episodes || '';
        document.getElementById('edit-image_url').value = series.image_url || '';
        document.getElementById('edit-synopsis').value = series.description || series.synopsis || '';
        
        // Store the ID being edited
        editingSeriesId = seriesId;
        
        // Close detail modal and open edit modal
        modal.style.display = 'none';
        editModal.style.display = 'flex';
        editMessage.textContent = '';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function updateSeries(event) {
    event.preventDefault();
    const submitButton = editForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    editMessage.textContent = 'Guardando...';

    const payload = {
        title: document.getElementById('edit-title').value.trim(),
        description: document.getElementById('edit-synopsis').value.trim(),
        synopsis: document.getElementById('edit-synopsis').value.trim(),
        release_year: toOptionalNumber(document.getElementById('edit-release_year').value),
        status: document.getElementById('edit-status').value || null,
        total_seasons: toOptionalNumber(document.getElementById('edit-total_seasons').value),
        total_episodes: toOptionalNumber(document.getElementById('edit-total_episodes').value),
        image_url: document.getElementById('edit-image_url').value.trim() || null,
    };

    try {
        // Handle image upload if new file selected
        const fileInput = document.getElementById('edit-image_file');
        if (fileInput.files && fileInput.files.length > 0) {
            editMessage.textContent = 'Subiendo imagen...';
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            const uploadResponse = await fetch(`${API_URL}/series/upload-image`, {
                method: 'POST',
                body: formData
            });

            if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                payload.image_url = uploadData.image_url || null;
                payload.image_public_id = uploadData.image_public_id || null;
            }
        }

        editMessage.textContent = 'Actualizando serie...';
        const response = await fetch(`${API_URL}/series/${editingSeriesId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const updated = normalizeSeries(await response.json());
        
        // Update in local arrays
        const idx = allSeries.findIndex(s => s.id === editingSeriesId);
        if (idx >= 0) {
            allSeries[idx] = updated;
            currentSeries = currentSeries.map(s => s.id === editingSeriesId ? updated : s);
        }
        
        renderSeries(currentSeries);
        editForm.reset();
        editModal.style.display = 'none';
        editMessage.textContent = 'Serie actualizada correctamente';
        setTimeout(() => { editMessage.textContent = ''; }, 2000);
    } catch (error) {
        editMessage.textContent = `Error al actualizar: ${error.message}`;
        console.error('Update error:', error);
    } finally {
        submitButton.disabled = false;
    }
}

// Search functionality
function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        currentSeries = [...allSeries];
    } else {
        currentSeries = allSeries.filter(s => 
            s.title.toLowerCase().includes(query) || 
            (s.synopsis && s.synopsis.toLowerCase().includes(query))
        );
    }
    renderSeries(currentSeries);
}

function clearSearch() {
    searchInput.value = '';
    currentSeries = [...allSeries];
    renderSeries(currentSeries);
}

// Event listeners
seriesForm.addEventListener('submit', createSeries);
editForm.addEventListener('submit', updateSeries);
addGenreBtn.addEventListener('click', createGenre);
ratingForm.addEventListener('submit', saveRating);

// Create modal
createBtn.addEventListener('click', () => {
    seriesForm.reset();
    selectedGenreIds = [];
    formMessage.textContent = '';
    createModal.style.display = 'flex';
});

// Detail modal
detailCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    editingSeriesId = null;
    currentDetailSeriesId = null;
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        editingSeriesId = null;
        currentDetailSeriesId = null;
    }
});

document.getElementById('edit-btn').addEventListener('click', () => {
    openEditModal(editingSeriesId);
});

document.getElementById('delete-btn').addEventListener('click', () => {
    deleteSeries(editingSeriesId);
});

// Create modal close
createCloseBtn.addEventListener('click', () => {
    createModal.style.display = 'none';
});

createModal.addEventListener('click', (e) => {
    if (e.target === createModal) {
        createModal.style.display = 'none';
    }
});

// Edit modal close
editCloseBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Search
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
});
searchBtn.addEventListener('click', performSearch);
clearBtn.addEventListener('click', clearSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Initialize
if (checkAuth()) {
    loadGenres();
    loadSeries();
}
