// =================================================================
//  1. GLOBAL STATE & VARIABLES
// =================================================================
let cars = [];
let dealers = [];
let isLoggedIn = false;
let currentUser = { id: 'u1', firstName: 'Demo', lastName: 'User', email: 'demo@example.com', phone: '', appointments: [], documents: [], viewed: [] };
let afterLoginAction = null;
let compareSet = new Set();
const reviews = [];
const sections = ['home', 'about', 'cars', 'dealers', 'dealer-detail', 'car-detail', 'auth', 'register', 'profile', 'dealer-dashboard', 'contact'];

// =================================================================
//  2. APP INITIALIZATION
// =================================================================
async function initializeApp() {
    try {
        const carsResponse = await fetch('/Home/GetCarsData');
        if (!carsResponse.ok) throw new Error(`Server error fetching cars: ${carsResponse.status}`);
        cars = await carsResponse.json();

        const dealersResponse = await fetch('/Home/GetDealersData');
        if (!dealersResponse.ok) throw new Error(`Server error fetching dealers: ${dealersResponse.status}`);
        dealers = await dealersResponse.json();

        console.log("Data successfully loaded from ASP.NET backend.");
        init();

    } catch (error) {
        console.error("Critical error loading application data:", error);
        document.querySelector('main').innerHTML =
            `<div class="text-center p-10">
                <h2 class="text-xl font-semibold text-red-600">Failed to Load Application Data</h2>
                <p class="text-slate-500 mt-2">Could not connect to the server. Please try refreshing the page.</p>
             </div>`;
    }
}

function init() {
    buildFeatured();
    updateAuthUI();
    if (byId('year')) byId('year').textContent = new Date().getFullYear();
    setupEventListeners();
}

// =================================================================
//  3. UTILITY & NAVIGATION FUNCTIONS
// =================================================================
const R = (n) => 'R ' + (n || 0).toLocaleString('en-ZA');
const byId = (id) => document.getElementById(id);
const showToast = (msg) => {
    const t = byId('toast');
    if (t) {
        t.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 2200);
    }
};
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
    return hash;
}
function navTo(key) {
    sections.forEach(s => byId('page-' + s)?.classList.add('hidden'));
    byId('page-' + key)?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateAuthUI() {
    const isLoggedInState = isLoggedIn;
    byId('loginBtn').classList.toggle('hidden', isLoggedInState);
    byId('profileBtn').classList.toggle('hidden', !isLoggedInState);
    byId('logoutBtn').classList.toggle('hidden', !isLoggedInState);
    byId('loginBtnM').classList.toggle('hidden', isLoggedInState);
    byId('profileBtnM').classList.toggle('hidden', !isLoggedInState);
    byId('logoutBtnM').classList.toggle('hidden', !isLoggedInState);
}
function toggleMenu(which) {
    const map = { demo: 'dropdown-demo', new: 'dropdown-new' };
    const arr = { demo: 'arrow-demo', new: 'arrow-new' };
    Object.keys(map).forEach(k => {
        const dd = byId(map[k]);
        const ar = byId(arr[k]);
        if (!dd || !ar) return;
        if (k === which) {
            const isHidden = dd.classList.contains('hidden');
            dd.classList.toggle('hidden', !isHidden);
            ar.textContent = isHidden ? '▴' : '▾';
        } else {
            dd.classList.add('hidden');
            ar.textContent = '▾';
        }
    });
}

// =================================================================
//  4. COMPARE FEATURE FUNCTIONS
// =================================================================
function toggleCompare(id, btnEl) {
    if (compareSet.has(id)) {
        compareSet.delete(id);
        if (btnEl) btnEl.textContent = 'Add to Compare';
    } else {
        if (compareSet.size >= 3) {
            showToast('You can compare up to 3 cars');
            return;
        }
        compareSet.add(id);
        if (btnEl) btnEl.textContent = 'Added';
    }
    updateCompareButton();
}

function updateCompareButton() {
    const count = compareSet.size;
    const btn = byId('compareBtn');
    if (!btn) return;
    btn.textContent = `Compare (${count}/3)`;
    btn.disabled = count === 0;
    const panel = byId('comparePanel');
    panel.classList.toggle('hidden', count === 0);
    if (count > 0) {
        renderComparePanel();
    }
}

function renderComparePanel() {
    const wrap = byId('compareContent');
    wrap.innerHTML = '';
    compareSet.forEach(id => {
        const car = cars.find(c => c.id === id);
        if (!car) return;
        const box = document.createElement('div');
        box.className = 'rounded-xl border border-slate-200 p-3 flex gap-3 items-center';
        const photoUrl = (car.photos || "").split(',')[0];
        box.innerHTML = `<img src="${photoUrl}" class="w-16 h-10 bg-slate-100 rounded object-cover" alt="${car.model}"><div class="flex-1"><div class="text-sm font-medium">${car.brand} ${car.model}</div><div class="text-xs text-slate-600">${car.year} • ${car.type}</div></div><button class="text-slate-500 hover:text-red-600" data-remove="${car.id}">Remove</button>`;
        box.querySelector('[data-remove]').addEventListener('click', () => {
            compareSet.delete(car.id);
            updateCompareButton();
            document.querySelectorAll(`[data-compare="${car.id}"]`).forEach(btn => btn.textContent = 'Add to Compare');
        });
        wrap.appendChild(box);
    });
}

function hideCompare() {
    byId('comparePanel').classList.add('hidden');
}

function openCompareModal() {
    byId('compareModal').classList.remove('hidden');
    buildCompareModal();
}

function closeCompareModal() {
    byId('compareModal').classList.add('hidden');
}

function buildCompareModal() {
    const ids = Array.from(compareSet).slice(0, 3);
    const table = byId('compareTable');
    table.style.gridTemplateColumns = `1fr repeat(${ids.length}, minmax(0, 1fr))`;
    table.innerHTML = '';
    const labels = {
        'Car': c => `${c.brand} ${c.model}`, 'Price': c => R(c.price), 'Year': c => c.year, 'Type': c => c.type,
        'Mileage': c => c.mileage ? `${c.mileage.toLocaleString('en-ZA')} km` : '-',
        'Fuel': c => c.fuelType, 'Transmission': c => c.transmission, 'Features': c => (c.features || "").split(',').slice(0, 4).join(', '),
    };
    const labelCol = document.createElement('div');
    labelCol.className = 'space-y-3';
    Object.keys(labels).forEach(label => {
        const cell = document.createElement('div');
        cell.className = 'p-3 rounded-lg bg-slate-50 border border-slate-100 font-medium h-14 flex items-center';
        cell.textContent = label;
        labelCol.appendChild(cell);
    });
    table.appendChild(labelCol);
    ids.forEach(id => {
        const car = cars.find(c => c.id === id);
        if (!car) return;
        const carCol = document.createElement('div');
        carCol.className = 'space-y-3';
        Object.values(labels).forEach(getValue => {
            const cell = document.createElement('div');
            cell.className = 'p-3 rounded-lg border border-slate-200 h-14 flex items-center';
            cell.textContent = getValue(car);
            carCol.appendChild(cell);
        });
        table.appendChild(carCol);
    });
}

// =================================================================
//  5. PAGE/COMPONENT BUILDERS
// =================================================================

function buildFeatured() {
    const grid = byId('featuredGrid');
    if (!grid || !cars) return;
    grid.innerHTML = '';
    const sortedCars = [...cars].sort((a, b) => b.price - a.price);
    sortedCars.slice(0, 3).forEach(c => grid.appendChild(cardCar(c)));
}

function buildCarsPage(preset = {}) {
    const brands = [...new Set(cars.map(c => c.brand))].sort();
    const brandSelect = byId('fBrand');
    if (brandSelect) {
        brandSelect.innerHTML = '<option value="">Any Brand</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
        byId('fBrand').value = preset.brand || '';
        byId('fModel').value = preset.model || '';
        byId('fType').value = preset.type || '';
    }
    renderCars();
}

function renderCars() {
    const filters = {
        brand: byId('fBrand').value, model: byId('fModel').value.toLowerCase(), type: byId('fType').value,
        minPrice: parseInt(byId('fPriceMin').value, 10) || 0, maxPrice: parseInt(byId('fPriceMax').value, 10) || Infinity,
    };
    const filteredCars = cars.filter(c =>
        (!filters.brand || c.brand === filters.brand) &&
        (!filters.model || c.model.toLowerCase().includes(filters.model)) &&
        (!filters.type || c.type === filters.type) &&
        (c.price >= filters.minPrice) && (c.price <= filters.maxPrice)
    );
    byId('listingCount').textContent = filteredCars.length;
    const grid = byId('carsGrid');
    grid.innerHTML = '';
    filteredCars.forEach(c => grid.appendChild(cardCar(c)));
}

function cardCar(car) {
    const div = document.createElement('div');
    div.className = 'rounded-2xl border border-slate-200 overflow-hidden shadow-card flex flex-col';
    const km = car.mileage ? `• ${car.mileage.toLocaleString('en-ZA')} km` : '';
    const photoUrl = (car.photos || "").split(',')[0];
    div.innerHTML = `
        <div class="relative"><img src="${photoUrl}" alt="${car.brand} ${car.model}" class="w-full h-40 object-cover bg-slate-100"><div class="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-white/80 border border-slate-200">${car.type}</div></div>
        <div class="p-4 flex-1 flex flex-col"><div class="font-semibold">${car.brand} ${car.model}</div><div class="text-sm text-slate-600">${car.year} • ${car.transmission} ${km}</div><div class="mt-2 text-accent-700 font-bold">${R(car.price)}</div><div class="mt-auto pt-3 flex gap-2"><button class="flex-1 px-3 py-2 rounded-lg border border-slate-200 hover:border-accent-500" data-detail="${car.id}">View</button><button class="flex-1 px-3 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600" data-compare="${car.id}">${compareSet.has(car.id) ? 'Added' : 'Add to Compare'}</button></div></div>`;
    div.querySelector('[data-detail]').addEventListener('click', () => openCarDetail(car.id));
    div.querySelector('[data-compare]').addEventListener('click', (e) => toggleCompare(car.id, e.target));
    return div;
}

function openCarDetail(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    currentUser.viewed.unshift(id);
    currentUser.viewed = [...new Set(currentUser.viewed)].slice(0, 10);
    byId('carTitle').textContent = `${car.brand} ${car.model} (${car.year})`;
    byId('carPrice').textContent = R(car.price);
    byId('carMeta').textContent = `${car.year} • ${car.fuelType} • ${car.transmission} • ${car.type} ${car.mileage ? '• ' + car.mileage.toLocaleString('en-ZA') + ' km' : ''}`;
    byId('carFeatures').innerHTML = (car.features || "").split(',').map(f => `<li>${f.trim()}</li>`).join('');
    const photoThumbs = byId('photoThumbs');
    const photoMain = byId('photoMain');
    photoThumbs.innerHTML = '';
    const photoList = (car.photos || "").split(',');
    photoMain.innerHTML = `<img src="${photoList[0]}" class="w-full h-full object-cover">`;
    photoList.forEach(src => {
        const thumb = document.createElement('button');
        thumb.className = 'w-24 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-accent-500';
        thumb.innerHTML = `<img src="${src.trim()}" class="w-full h-full object-cover">`;
        thumb.onclick = () => { photoMain.innerHTML = `<img src="${src.trim()}" class="w-full h-full object-cover">`; };
        photoThumbs.appendChild(thumb);
    });
    const compareBtn = byId('carCompareToggle');
    compareBtn.textContent = compareSet.has(car.id) ? 'Remove from Compare' : 'Add to Compare';
    compareBtn.onclick = () => {
        toggleCompare(car.id);
        compareBtn.textContent = compareSet.has(car.id) ? 'Remove from Compare' : 'Add to Compare';
    };
    byId('carBook').onclick = () => {
        if (isLoggedIn) {
            openDealer(car.dealerId);
            byId('apptMsg').value = `Hi, I'm interested in the ${car.year} ${car.brand} ${car.model}.`;
            byId('apptMsg').focus();
        } else {
            showToast('Please log in to book an appointment.');
            afterLoginAction = () => openCarDetail(car.id);
            navTo('auth');
        }
    };
    buildRecommendations(car);
    navTo('car-detail');
}

function buildRecommendations(currentCar) {
    const recWrap = byId('recommendations');
    recWrap.innerHTML = '';
    const recommended = cars.filter(c => c.id !== currentCar.id && c.brand === currentCar.brand).slice(0, 2);
    recommended.forEach(c => {
        const card = document.createElement('div');
        card.className = 'rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-accent-500';
        card.innerHTML = `<div class="text-sm font-medium">${c.brand} ${c.model}</div><div class="text-xs text-slate-600">${c.year} • ${c.type}</div><div class="text-accent-700 font-semibold mt-1">${R(c.price)}</div>`;
        card.onclick = () => openCarDetail(c.id);
        recWrap.appendChild(card);
    });
}

function buildDealersPage(filter = {}) {
    const grid = byId('dealersGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const filteredDealers = dealers.filter(d => {
        if (!filter.type) return true;
        return cars.some(c => c.dealerId === d.id && c.type === filter.type);
    });
    byId('dealerCount').textContent = filteredDealers.length;
    filteredDealers.forEach(d => {
        const card = document.createElement('div');
        card.className = 'rounded-2xl border border-slate-200 p-4 shadow-card';
        const carCount = cars.filter(c => c.dealerId === d.id).length;
        card.innerHTML = `
            <div class="flex items-start justify-between"><div><div class="font-semibold">${d.name}</div><div class="text-sm text-slate-600">${d.location}</div></div><span class="text-xs px-2 py-1 rounded bg-accent-50 text-accent-700 border border-accent-100">${carCount} cars</span></div>
            <div class="text-sm text-slate-600 mt-2">${d.contactDetails}</div>
            <div class="mt-4 flex gap-2"><button class="px-3 py-2 rounded-lg border border-slate-200 hover:border-accent-500" data-view="${d.id}">View Dealership</button><button class="px-3 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600" data-browse="${d.id}">Browse Cars</button></div>`;
        card.querySelector('[data-view]').addEventListener('click', () => openDealer(d.id));
        card.querySelector('[data-browse]').addEventListener('click', () => {
            const dealerCars = cars.filter(c => c.dealerId === d.id);
            byId('listingCount').textContent = dealerCars.length;
            const carsGrid = byId('carsGrid');
            carsGrid.innerHTML = '';
            dealerCars.forEach(c => carsGrid.appendChild(cardCar(c)));
            navTo('cars');
        });
        grid.appendChild(card);
    });
}

function openDealer(id) {
    const dealer = dealers.find(d => d.id === id);
    if (!dealer) return;
    byId('dealerName').textContent = dealer.name;
    byId('dealerLocation').textContent = dealer.location;
    byId('dealerContact').textContent = dealer.contactDetails;
    const grid = byId('dealerCarsGrid');
    grid.innerHTML = '';
    cars.filter(c => c.dealerId === dealer.id).forEach(c => grid.appendChild(cardCar(c)));
    const map = byId('dealerMap');
    const hue = Math.abs(hashCode(dealer.location)) % 360;
    map.innerHTML = `<svg viewBox="0 0 800 300" class="w-full h-full"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8f1ff"/><stop offset="100%" stop-color="#cfe3ff"/></linearGradient></defs><rect width="800" height="300" fill="url(#g1)" /><g><circle cx="400" cy="150" r="60" fill="hsl(${hue},70%,60%)" opacity="0.25"></circle><circle cx="400" cy="150" r="6" fill="hsl(${hue},70%,40%)"></circle><text x="410" y="155" font-size="14" fill="#334155">${dealer.location}</text></g></svg>`;
    renderDealerReviews(id);
    const appointmentForm = byId('appointmentForm');
    appointmentForm.onsubmit = (e) => {
        e.preventDefault();
        if (isLoggedIn) {
            // In a real app, this would be an API call
            showToast('Appointment booked (Demo)');
        } else {
            showToast('Please log in to book an appointment.');
            afterLoginAction = () => openDealer(dealer.id);
            navTo('auth');
        }
    };
    navTo('dealer-detail');
}

function renderDealerReviews(dealerId) {
    const list = byId('reviewsList');
    const items = reviews.filter(r => r.dealerId === dealerId);
    list.innerHTML = items.length === 0 ? '<div class="text-sm text-slate-500">No reviews yet. Be the first.</div>' : items.map(r => `<div class="rounded-lg border border-slate-200 p-3"><div class="flex items-center justify-between"><div class="font-medium text-amber-500">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><div class="text-xs text-slate-500">${new Date(r.date).toLocaleDateString()}</div></div><div class="text-sm text-slate-700 mt-1">${r.text}</div><div class="text-xs text-slate-500 mt-1">by ${r.user}</div></div>`).join('');
    const form = byId('reviewForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const rating = parseInt(byId('reviewRating').value, 10);
        const text = byId('reviewText').value.trim();
        if (!rating || !text) return;
        reviews.push({ dealerId, rating, text, user: (isLoggedIn ? currentUser.name : 'Guest'), date: Date.now() });
        form.reset();
        renderDealerReviews(dealerId);
        showToast('Review posted');
    }
}
function seedDealerView() {
    const inv = byId('dashInventory');
    inv.innerHTML = '';
    cars.forEach(c => { inv.innerHTML += `<div class="rounded-xl border border-slate-200 p-3 flex items-center justify-between"><div><div class="text-sm font-medium">${c.brand} ${c.model} (${c.year})</div><div class="text-xs text-slate-600">${c.type} • ${R(c.price)}</div></div><button class="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:border-accent-500">Edit</button></div>`; });
    const appts = byId('dashAppointments');
    appts.innerHTML = currentUser.appointments.length === 0 ? '<div class="text-slate-500">No appointments yet.</div>' : currentUser.appointments.map(a => {
        const statusClasses = { 'Pending': 'bg-slate-50 text-slate-700 border-slate-200', 'Confirmed': 'bg-green-50 text-green-700 border-green-200', 'Declined': 'bg-red-50 text-red-700 border-red-200' };
        return `<div class="rounded-lg border border-slate-200 p-3"><div class="flex items-center justify-between"><div><div class="font-medium">${a.name}</div><div class="text-xs text-slate-600">${a.date} at ${a.time}</div></div><span class="text-xs px-2 py-1 rounded ${statusClasses[a.status]}">${a.status}</span></div><div class="text-xs text-slate-600 mt-1">${a.message || 'No message.'}</div><div class="flex gap-2 mt-3"><button class="px-3 py-1 rounded-lg border border-slate-200 hover:border-green-500" onclick="updateAppointmentStatus('${a.id}', 'Confirmed')">Confirm</button><button class="px-3 py-1 rounded-lg border border-slate-200 hover:border-red-500" onclick="updateAppointmentStatus('${a.id}', 'Declined')">Decline</button></div></div>`;
    }).join('');
}
function updateAppointmentStatus(id, status) {
    const appt = currentUser.appointments.find(a => a.id === id);
    if (appt) {
        appt.status = status;
        seedDealerView();
        renderMyAppointments();
        showToast(`Appointment ${status.toLowerCase()}`);
    }
}
function renderDocs() {
    const list = byId('docList');
    if (!list) return;
    list.innerHTML = currentUser.documents.length === 0
        ? '<div class="text-xs text-slate-500">No documents uploaded.</div>'
        : currentUser.documents.map(d => `
            <div class="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-2">
              <div class="truncate pr-2">${d.name} <span class="text-xs text-slate-500">(${Math.round(d.size / 1024)} KB)</span></div>
              <button class="text-xs px-2 py-1 rounded border border-slate-200 hover:border-red-400 flex-shrink-0" onclick="removeDoc('${d.id}')">Remove</button>
            </div>`).join('');
}
function removeDoc(id) {
    currentUser.documents = currentUser.documents.filter(d => d.id !== id);
    renderDocs();
}
function renderMyAppointments() {
    const wrap = byId('myAppointments');
    if (!wrap) return;
    wrap.innerHTML = currentUser.appointments.length === 0
        ? '<div class="text-sm text-slate-500">You have no scheduled appointments.</div>'
        : currentUser.appointments.map(a => {
            const statusClasses = { 'Pending': 'bg-slate-100 text-slate-700', 'Confirmed': 'bg-green-100 text-green-700', 'Declined': 'bg-red-100 text-red-700' };
            return `
            <div class="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-4">
              <div>
                <div class="font-semibold">${a.dealerName}</div>
                <div class="text-sm text-slate-600">${a.date} at ${a.time}</div>
              </div>
              <span class="text-xs font-medium px-2 py-1 rounded-md ${statusClasses[a.status]}">${a.status}</span>
            </div>`;
        }).join('');
}
function openProfile() {
    byId('pFirst').value = currentUser.first || 'Demo';
    byId('pLast').value = currentUser.last || 'User';
    byId('pEmail').value = currentUser.email || 'demo@example.com';
    byId('pPhone').value = currentUser.phone || '';

    byId('profileForm').onsubmit = e => {
        e.preventDefault();
        currentUser.first = byId('pFirst').value;
        currentUser.last = byId('pLast').value;
        currentUser.email = byId('pEmail').value;
        currentUser.phone = byId('pPhone').value;
        showToast('Profile details saved');
    };

    renderDocs();
    renderMyAppointments();
    navTo('profile');
}

function toggleCompare(id, btnEl) {
    if (compareSet.has(id)) {
        compareSet.delete(id);
        if (btnEl) btnEl.textContent = 'Add to Compare';
    } else {
        if (compareSet.size >= 3) {
            showToast('You can compare up to 3 cars');
            return;
        }
        compareSet.add(id);
        if (btnEl) btnEl.textContent = 'Added';
    }
    updateCompareButton();
}

function updateCompareButton() {
    const count = compareSet.size;
    const btn = byId('compareBtn');
    if (!btn) return;
    btn.textContent = `Compare (${count}/3)`;
    btn.disabled = count === 0;

    const panel = byId('comparePanel');
    panel.classList.toggle('hidden', count === 0);
    if (count > 0) {
        renderComparePanel();
    }
}

function renderComparePanel() {
    const wrap = byId('compareContent');
    wrap.innerHTML = '';
    compareSet.forEach(id => {
        const car = cars.find(c => c.id === id);
        if (!car) return;
        const box = document.createElement('div');
        box.className = 'rounded-xl border border-slate-200 p-3 flex gap-3 items-center';
        const photoUrl = (car.photos || "").split(',')[0];
        box.innerHTML = `<img src="${photoUrl}" class="w-16 h-10 bg-slate-100 rounded object-cover" alt="${car.model}"><div class="flex-1"><div class="text-sm font-medium">${car.brand} ${car.model}</div><div class="text-xs text-slate-600">${car.year} • ${car.type}</div></div><button class="text-slate-500 hover:text-red-600" data-remove="${car.id}">Remove</button>`;
        box.querySelector('[data-remove]').addEventListener('click', () => {
            compareSet.delete(car.id);
            updateCompareButton();
            document.querySelectorAll(`[data-compare="${car.id}"]`).forEach(btn => btn.textContent = 'Add to Compare');
        });
        wrap.appendChild(box);
    });
}

function hideCompare() {
    byId('comparePanel').classList.add('hidden');
}

function openCompareModal() {
    byId('compareModal').classList.remove('hidden');
    buildCompareModal();
}

function closeCompareModal() {
    byId('compareModal').classList.add('hidden');
}

function buildCompareModal() {
    const ids = Array.from(compareSet).slice(0, 3);
    const table = byId('compareTable');
    table.style.gridTemplateColumns = `1fr repeat(${ids.length}, minmax(0, 1fr))`;
    table.innerHTML = '';
    const labels = {
        'Car': c => `${c.brand} ${c.model}`,
        'Price': c => R(c.price),
        'Year': c => c.year,
        'Type': c => c.type,
        'Mileage': c => c.mileage ? `${c.mileage.toLocaleString('en-ZA')} km` : '-',
        'Fuel': c => c.fuelType,
        'Transmission': c => c.transmission,
        'Features': c => (c.features || "").split(',').slice(0, 4).join(', '),
    };
    const labelCol = document.createElement('div');
    labelCol.className = 'space-y-3';
    Object.keys(labels).forEach(label => {
        const cell = document.createElement('div');
        cell.className = 'p-3 rounded-lg bg-slate-50 border border-slate-100 font-medium h-14 flex items-center';
        cell.textContent = label;
        labelCol.appendChild(cell);
    });
    table.appendChild(labelCol);
    ids.forEach(id => {
        const car = cars.find(c => c.id === id);
        if (!car) return;
        const carCol = document.createElement('div');
        carCol.className = 'space-y-3';
        Object.values(labels).forEach(getValue => {
            const cell = document.createElement('div');
            cell.className = 'p-3 rounded-lg border border-slate-200 h-14 flex items-center';
            cell.textContent = getValue(car);
            carCol.appendChild(cell);
        });
        table.appendChild(carCol);
    });
}


// =================================================================
//  6. AUTHENTICATION FLOW
// =================================================================
function doLogin() {
    isLoggedIn = true;
    updateAuthUI();
    showToast('Logged in successfully!');
    if (afterLoginAction) {
        afterLoginAction();
        afterLoginAction = null;
    } else {
        navTo('home');
    }
}

function doLogout() {
    isLoggedIn = false;
    afterLoginAction = null;
    updateAuthUI();
    showToast('Logged out successfully.');
    navTo('home');
}

// =================================================================
//  7. EVENT LISTENER SETUP
// =================================================================
function setupEventListeners() {
    document.querySelectorAll('[data-nav]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const target = el.getAttribute('data-nav');
            const type = el.getAttribute('data-type') || '';
            byId('mobileMenu').classList.add('hidden');
            switch (target) {
                case 'home': navTo('home'); break;
                case 'cars': buildCarsPage({ type: type }); navTo('cars'); break;
                case 'dealers': buildDealersPage({ type: type }); navTo('dealers'); break;
                case 'dealer-dashboard': seedDealerView(); navTo('dealer-dashboard'); break;
                default: navTo(target); break;
            }
        });
    });

    byId('loginBtn').addEventListener('click', () => navTo('auth'));
    byId('loginBtnM').addEventListener('click', () => { navTo('auth'); byId('mobileMenu').classList.add('hidden'); });
    byId('profileBtn').addEventListener('click', openProfile);
    byId('profileBtnM').addEventListener('click', () => { openProfile(); byId('mobileMenu').classList.add('hidden'); });
    byId('logoutBtn').addEventListener('click', doLogout);
    byId('logoutBtnM').addEventListener('click', doLogout);
    byId('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
    byId('registerForm')?.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
    byId('openRegister').addEventListener('click', (e) => { e.preventDefault(); navTo('register'); });
    byId('openLogin').addEventListener('click', (e) => { e.preventDefault(); navTo('auth'); });

    byId('mobileMenuBtn').addEventListener('click', () => byId('mobileMenu').classList.toggle('hidden'));
    const menuDemoButton = byId('menuDemo')?.querySelector('button');
    const menuNewButton = byId('menuNew')?.querySelector('button');
    if (menuDemoButton) menuDemoButton.addEventListener('click', () => toggleMenu('demo'));
    if (menuNewButton) menuNewButton.addEventListener('click', () => toggleMenu('new'));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#menuDemo')) { if (byId('dropdown-demo')) byId('dropdown-demo').classList.add('hidden'); if (byId('arrow-demo')) byId('arrow-demo').textContent = '▾'; }
        if (!e.target.closest('#menuNew')) { if (byId('dropdown-new')) byId('dropdown-new').classList.add('hidden'); if (byId('arrow-new')) byId('arrow-new').textContent = '▾'; }
    });

    byId('homeSearchBtn').addEventListener('click', () => {
        const brand = byId('searchBrand').value.trim();
        const model = byId('searchModel').value.trim();
        const type = byId('searchType').value;
        buildCarsPage({ brand, model, type });
        navTo('cars');
    });
    byId('fApply').addEventListener('click', renderCars);
    byId('clearFilters').addEventListener('click', () => {
        byId('fBrand').value = ''; byId('fModel').value = ''; byId('fType').value = '';
        byId('fPriceMin').value = ''; byId('fPriceMax').value = '';
        renderCars();
    });
    byId('calcBtn').addEventListener('click', () => {
        const M = parseFloat(byId('calcBudget').value) || 0;
        const n = parseInt(byId('calcTerm').value, 10) || 0;
        const d = parseFloat(byId('calcDeposit').value) || 0;
        const r = (parseFloat(byId('calcRate').value) / 100) / 12 || 0;
        const out = byId('calcResult');
        if (M <= 0 || n <= 0 || r <= 0) {
            out.textContent = 'Please enter a valid budget, term, and rate.'; return;
        }
        const PV = M * (1 - Math.pow(1 + r, -n)) / r;
        out.textContent = `Estimated affordable price: ${R(Math.round(PV + d))}`;
    });

    byId('compareBtn').addEventListener('click', openCompareModal);
    byId('openCompareModal').addEventListener('click', openCompareModal);

    byId('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        byId('contactConfirm').classList.remove('hidden');
        byId('contactConfirm').textContent = 'Thanks! We\'ll be in touch soon.';
        e.target.reset();
        showToast('Message sent');
    });
}

// =================================================================
//  8. START THE APPLICATION
// =================================================================
initializeApp();