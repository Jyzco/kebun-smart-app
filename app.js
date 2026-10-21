/**
 * KebunSmart - Logic & Interactive Management Engine
 * Features:
 *  - Responsive tab switching
 *  - Precision Seed & Fertilizer Calculator
 *  - Fruit Yield Tracker with LocalStorage Persistence
 *  - 5-6 Month Seasonal Transition Engine & Early Warning Alert System
 *  - Real-Time Soil Moisture Telemetry Gauge & 24h Trend Canvas Chart
 *  - Adaptive Seasonal To-Do List
 *  - Plant Catalog & Resistance Database
 */

// =============================================================================
// 1. DATA STATE & CONFIGURATION
// =============================================================================

const APP_STATE = {
  activeSection: 'section-dashboard',
  currentDate: new Date(2026, 8, 13), // 13 Sept 2026
  simulatedMonth: 8, // September (0-indexed: 8 = Sep)
  isSimulatedMonth: false,
  
  // Soil Telemetry State
  soilMoisture: 58, // Initial 58%
  soilTemp: 26.4,
  soilPh: 6.4,
  sensorSimRunning: true,
  sensorInterval: null,
  
  // 24-hour Trend Data (Hourly 00:00 to 23:00)
  hourlyTrend: [
    62, 61, 60, 60, 59, 63, 62, 60, 57, 54, 52, 50,
    49, 51, 55, 58, 59, 60, 61, 62, 62, 61, 60, 58
  ],

  // Harvest Records
  harvestRecords: [],

  // Adaptive Tasks
  tasks: []
};

// Crop Presets for Calculator
const CROP_PRESETS = {
  alpukat: {
    name: 'Alpukat Unggul (Miki/Aligator)',
    spacingX: 8,
    spacingY: 8,
    price: 45000,
    avgYield: 50,
    avgPrice: 25000
  },
  durian: {
    name: 'Durian Unggul (Bawor/Musang King)',
    spacingX: 10,
    spacingY: 10,
    price: 65000,
    avgYield: 40,
    avgPrice: 50000
  },
  mangga: {
    name: 'Mangga Arumanis / Garifta',
    spacingX: 8,
    spacingY: 8,
    price: 35000,
    avgYield: 70,
    avgPrice: 18000
  },
  jeruk: {
    name: 'Jeruk Siam / Keprok 55',
    spacingX: 5,
    spacingY: 5,
    price: 25000,
    avgYield: 30,
    avgPrice: 15000
  },
  kelengkeng: {
    name: 'Kelengkeng Kateki / New Kristal',
    spacingX: 7,
    spacingY: 7,
    price: 40000,
    avgYield: 40,
    avgPrice: 30000
  },
  pisang: {
    name: 'Pisang Cavendish / Barangan',
    spacingX: 2.5,
    spacingY: 2.5,
    price: 15000,
    avgYield: 20,
    avgPrice: 10000
  },
  kopi: {
    name: 'Kopi Robusta / Arabika',
    spacingX: 2.5,
    spacingY: 2.5,
    price: 12000,
    avgYield: 3,
    avgPrice: 45000
  },
  custom: {
    name: 'Kustom Mandiri',
    spacingX: 8,
    spacingY: 8,
    price: 40000,
    avgYield: 40,
    avgPrice: 20000
  }
};

// Plant Catalog Database
const PLANT_CATALOG = [
  {
    id: 'durian',
    name: 'Durian',
    variety: 'Bawor, Musang King, Duri Hitam (Ochee)',
    avatar: '👑',
    categories: ['butuh-air', 'rentan-jamur'],
    dryTolerance: 'Sedang (Butuh Mulsa & Air Berkala)',
    wetTolerance: 'Rentan Busuk Akar (Phytophthora)',
    waterNeed: '60 - 100 Liter/hari (Pohon Dewasa)',
    soilPh: '6.0 - 6.5 (Gembur Berdrainase Baik)',
    spacing: '10 x 10 m (100 pohon / Ha)',
    tips: 'Sangat sensitif terhadap genangan air. Wajib buat gundukan/busut setinggi 40-50 cm saat menanam untuk mencegah mati pucuk dan kanker batang di musim hujan.'
  },
  {
    id: 'alpukat',
    name: 'Alpukat',
    variety: 'Miki, Aligator, Kendil, Hass',
    avatar: '🥑',
    categories: ['tahan-kemarau', 'butuh-air'],
    dryTolerance: 'Tinggi (Toleran jika perakaran dalam)',
    wetTolerance: 'Sedang (Perlu drainase bebas genangan)',
    waterNeed: '40 - 70 Liter/hari',
    soilPh: '5.5 - 6.8 (Kaya bahan organik)',
    spacing: '8 x 8 m (156 pohon / Ha)',
    tips: 'Pohon alpukat memerlukan pemicu stres air ringan (3-4 minggu kemarau) untuk merangsang bunga serempak, namun segera cukupi air saat fase pembesaran buah.'
  },
  {
    id: 'mangga',
    name: 'Mangga',
    variety: 'Arumanis 143, Gedong Gincu, Garifta Merah',
    avatar: '🥭',
    categories: ['tahan-kemarau'],
    dryTolerance: 'Sangat Tinggi (Butuh Kemarau untuk Berbunga)',
    wetTolerance: 'Rentan Lalat Buah & Antraknosa di Musim Hujan',
    waterNeed: '30 - 50 Liter/hari',
    soilPh: '5.5 - 7.0 (Lempung berpasir)',
    spacing: '8 x 8 m atau 7 x 7 m',
    tips: 'Musim kemarau adalah musim emas bagi pohon mangga untuk induksi bunga. Pada musim hujan, lakukan pembungkusan (brongsong) buah saat berukuran telur bebek.'
  },
  {
    id: 'jeruk',
    name: 'Jeruk',
    variety: 'Jeruk Siam Madu, Keprok 55, Lemon California',
    avatar: '🍊',
    categories: ['butuh-air', 'rentan-jamur'],
    dryTolerance: 'Sedang (Daun mudah menggulung jika kering)',
    wetTolerance: 'Sedang (Waspada blendok/Diplodia)',
    waterNeed: '20 - 40 Liter/hari',
    soilPh: '5.5 - 6.5',
    spacing: '5 x 5 m (400 pohon / Ha)',
    tips: 'Lakukan sanitasi gulma di sekitar batang secara rutin. Pada musim hujan, berikan kapur dolomit dan hindari luka mekanis pada kulit pangkal batang.'
  },
  {
    id: 'pisang',
    name: 'Pisang',
    variety: 'Cavendish, Barangan, Raja Bulu',
    avatar: '🍌',
    categories: ['butuh-air', 'rentan-jamur'],
    dryTolerance: 'Rendah (Batang mengandung 90% air)',
    wetTolerance: 'Tinggi (Asalkan drainase mengalir)',
    waterNeed: '25 - 35 Liter/hari per rumpun',
    soilPh: '5.8 - 6.5',
    spacing: '2.5 x 2.5 m (1.600 rumpun / Ha)',
    tips: 'Pertahankan maksimal 3 anakan per rumpun (1 induk berbuah, 1 anakan dara, 1 anakan tunas). Berikan pemupukan kalium tinggi menjelang keluarnya jantung pisang.'
  },
  {
    id: 'kopi',
    name: 'Kopi',
    variety: 'Robusta & Arabika Multi-Klon',
    avatar: '☕',
    categories: ['tahan-kemarau'],
    dryTolerance: 'Tinggi (Robusta lebih tahan panas)',
    wetTolerance: 'Sedang (Rentan gugur bunga jika hujan lebat)',
    waterNeed: '15 - 25 Liter/hari',
    soilPh: '5.5 - 6.5 (Butuh naungan parsial 20-30%)',
    spacing: '2.5 x 2.5 m (1.600 pohon / Ha)',
    tips: 'Kopi membutuhkan 2-3 bulan kering untuk pematangan primordia bunga, diikuti hujan pertama untuk memecah kuncup bunga serentak (mekar seragam).'
  }
];

// Default Tasks for Seasons
const DEFAULT_SEASON_TASKS = {
  kemarau: [
    { id: 1, text: 'Periksa & bersihkan filter drip irigasi tetes blok utama', completed: true, category: 'kemarau' },
    { id: 2, text: 'Aplikasi mulsa jerami padi tebal 8 cm di piringan pohon', completed: true, category: 'kemarau' },
    { id: 3, text: 'Jadwalkan penyiraman intensif pada pukul 06.00 dan 16.30 WIB', completed: false, category: 'kemarau' },
    { id: 4, text: 'Semprot pupuk daun Kalium Silika untuk mempertebal kutikula daun', completed: false, category: 'kemarau' },
    { id: 5, text: 'Monitoring populasi hama tungau merah (red spider mite)', completed: false, category: 'kemarau' },
    { id: 6, text: 'Pemasangan jaring peneduh (paranet 50%) pada bibit tanaman muda', completed: false, category: 'kemarau' }
  ],
  hujan: [
    { id: 101, text: 'Pembersihan endapan lumpur & sampah di parit drainase utama', completed: true, category: 'hujan' },
    { id: 102, text: 'Pemangkasan tunas air (wiwil) dan cabang tumpang tindih', completed: false, category: 'hujan' },
    { id: 103, text: 'Aplikasi agen hayati Trichoderma harzianum di pangkal batang', completed: false, category: 'hujan' },
    { id: 104, text: 'Tabur dolomit pertanian 1 kg/pohon untuk menstabilkan pH tanah asam', completed: false, category: 'hujan' },
    { id: 105, text: 'Kurangi debit dan frekuensi irigasi otomatis (sensor cut-off)', completed: true, category: 'hujan' },
    { id: 106, text: 'Brongsong (bungkus) buah muda untuk hindari sengatan lalat buah', completed: false, category: 'hujan' }
  ]
};

// Initial Seed Harvest History
const INITIAL_HARVEST_RECORDS = [
  {
    id: 1,
    date: '2026-08-28',
    crop: 'Alpukat Miki',
    grade: 'Grade Super / Premium',
    weight: 420,
    revenue: 12600000,
    notes: 'Panen pohon blok utara (kualitas kulit mulus, bebas ulat)'
  },
  {
    id: 2,
    date: '2026-09-05',
    crop: 'Durian Bawor',
    grade: 'Grade Super / Premium',
    weight: 350,
    revenue: 21000000,
    notes: 'Rasa sangat manis legit, laku cepat ke pelanggan ritel'
  }
];

// Months metadata
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

// =============================================================================
// 2. INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLocalStorageData();
  initSeasonModule();
  initSeedCalculator();
  initHarvestTracker();
  initSoilMoistureSensor();
  initAdaptiveTasks();
  initPlantCatalog();
  updateDashboardOverview();
});

// Navigation Tab Handling
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      switchTab(targetId);
    });
  });
}

function switchTab(targetId) {
  // Update nav buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-target') === targetId);
  });

  // Update content sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === targetId);
  });

  APP_STATE.activeSection = targetId;

  // If opening soil moisture, re-render chart to ensure correct canvas sizing
  if (targetId === 'section-soil') {
    setTimeout(renderSoilChart, 50);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// LocalStorage Hydration
function initLocalStorageData() {
  const savedHarvest = localStorage.getItem('kebunsmart_harvest_records');
  if (savedHarvest) {
    try {
      APP_STATE.harvestRecords = JSON.parse(savedHarvest);
    } catch (e) {
      APP_STATE.harvestRecords = [...INITIAL_HARVEST_RECORDS];
    }
  } else {
    APP_STATE.harvestRecords = [...INITIAL_HARVEST_RECORDS];
    localStorage.setItem('kebunsmart_harvest_records', JSON.stringify(APP_STATE.harvestRecords));
  }

  const savedTasks = localStorage.getItem('kebunsmart_adaptive_tasks');
  if (savedTasks) {
    try {
      APP_STATE.tasks = JSON.parse(savedTasks);
    } catch (e) {
      APP_STATE.tasks = [];
    }
  }
}

// =============================================================================
// 3. SEASON CYCLE & EARLY WARNING ENGINE (5-6 Bulanan)
// =============================================================================

function isDrySeason(monthIdx) {
  // Tropical Indonesia 6-month cycle:
  // April (3) to September (8) -> Musim Kemarau
  // Oktober (9) to Maret (2) -> Musim Hujan
  return monthIdx >= 3 && monthIdx <= 8;
}

function initSeasonModule() {
  renderMonthsStrip();
  updateSeasonDisplay();
}

function renderMonthsStrip() {
  const container = document.getElementById('months-strip-container');
  if (!container) return;

  container.innerHTML = '';
  MONTH_SHORT.forEach((name, idx) => {
    const isKemarau = isDrySeason(idx);
    const item = document.createElement('div');
    item.className = `month-item ${isKemarau ? 'is-kemarau' : 'is-hujan'} ${idx === APP_STATE.simulatedMonth ? 'active' : ''}`;
    item.innerHTML = `
      <span class="month-name">${name}</span>
      <span class="month-type">${isKemarau ? 'Kemarau' : 'Hujan'}</span>
    `;
    item.onclick = () => setSimulatedMonth(idx);
    container.appendChild(item);
  });
}

function setSimulatedMonth(monthIdx) {
  APP_STATE.simulatedMonth = monthIdx;
  APP_STATE.isSimulatedMonth = true;
  renderMonthsStrip();
  updateSeasonDisplay();
  refreshAdaptiveTasksBySeason();
  updateDashboardOverview();
}

function resetToRealMonth() {
  APP_STATE.simulatedMonth = 8; // September
  APP_STATE.isSimulatedMonth = false;
  renderMonthsStrip();
  updateSeasonDisplay();
  refreshAdaptiveTasksBySeason();
  updateDashboardOverview();
}

function updateSeasonDisplay() {
  const m = APP_STATE.simulatedMonth;
  const isKemarau = isDrySeason(m);
  const seasonName = isKemarau ? 'Musim Kemarau' : 'Musim Hujan';
  const monthName = MONTH_NAMES[m];

  // Header quick badge
  const headerBadge = document.getElementById('header-season-badge');
  const headerIcon = document.getElementById('header-season-icon');
  const headerText = document.getElementById('header-season-text');
  if (headerBadge) {
    headerBadge.className = `quick-pill season-pill ${isKemarau ? '' : 'is-hujan'}`;
    headerIcon.textContent = isKemarau ? '☀️' : '🌧️';
    headerText.textContent = `${seasonName} (${MONTH_SHORT[m]})`;
  }

  // Season Cycle Summary Details
  const cycleName = document.getElementById('cycle-season-name');
  const cyclePeriod = document.getElementById('cycle-period');
  const cycleProgress = document.getElementById('cycle-progress-text');
  const cycleNext = document.getElementById('cycle-next-transition');

  let cycleIndex = 1;
  if (isKemarau) {
    cycleIndex = (m - 3) + 1; // Apr = 1, Mei = 2, Jun = 3, Jul = 4, Agu = 5, Sep = 6
    if (cyclePeriod) cyclePeriod.textContent = 'April s/d September (Siklus 6 Bulan)';
    if (cycleNext) cycleNext.textContent = 'Bulan Oktober (Transisi Menuju Musim Hujan)';
  } else {
    // Okt = 9, Nov = 10, Des = 11, Jan = 0, Feb = 1, Mar = 2
    if (m >= 9) cycleIndex = (m - 9) + 1;
    else cycleIndex = m + 4;
    if (cyclePeriod) cyclePeriod.textContent = 'Oktober s/d Maret (Siklus 6 Bulan)';
    if (cycleNext) cycleNext.textContent = 'Bulan April (Transisi Menuju Musim Kemarau)';
  }

  if (cycleName) cycleName.textContent = seasonName;
  if (cycleProgress) cycleProgress.textContent = `Bulan ke-${cycleIndex} dari 6 Bulan (${monthName})`;

  // Render Early Warning Container
  renderEarlyWarningBanner(isKemarau, cycleIndex, monthName);
}

function renderEarlyWarningBanner(isKemarau, cycleIndex, monthName) {
  const container = document.getElementById('season-alert-container');
  if (!container) return;

  if (isKemarau) {
    container.className = 'card early-warning-card warning-kemarau';
    container.innerHTML = `
      <div class="warning-hero-flex">
        <div class="warning-badge-icon">☀️</div>
        <div class="warning-hero-text">
          <div class="alert-tag">SISTEM PERINGATAN DINI: DEFISIT AIR & EVAPORASI</div>
          <h3>Peringatan Musim Kemarau Aktif — Bulan ke-${cycleIndex} (${monthName})</h3>
          <p>Potensi defisit lengas tanah dan sengatan panas daun tinggi. Lakukan efisiensi tata kelola air dan lindungi perakaran tanaman dari kekeringan ekstrem.</p>
        </div>
      </div>

      <div class="action-checklist-grid">
        <div class="action-item-card">
          <h4><span>💧</span> Optimalkan Sistem Irigasi Tetes</h4>
          <p>Pastikan debit air dripper merata (4-6 liter/jam/titik). Jalankan irigasi pada fajar hari (05.30-07.00) atau senja (16.30-18.00) untuk menekan evaporasi hingga 40%.</p>
        </div>
        <div class="action-item-card">
          <h4><span>🌾</span> Pasang Mulsa Organik / Jerami</h4>
          <p>Tutup piringan tajuk pohon dengan mulsa jerami padi atau serasah daun setebal 5-10 cm. Menjaga suhu mikroklimat tanah tetap sejuk dan mempertahankan kelembapan.</p>
        </div>
        <div class="action-item-card">
          <h4><span>🛡️</span> Antisipasi Hama Tungau & Trips</h4>
          <p>Kondisi udara kering dan panas memicu ledakan populasi tungau merah (red spider mite). Aplikasikan semprotan sulfur atau ekstrak mimba preventif tiap 10-14 hari.</p>
        </div>
        <div class="action-item-card">
          <h4><span>🌱</span> Kurangi Pemangkasan Berat</h4>
          <p>Hindari pemangkasan tajuk besar saat kemarau puncak agar batang pohon tidak terkena 'sunburn' (terbakar sinar matahari langsung).</p>
        </div>
      </div>
    `;
  } else {
    container.className = 'card early-warning-card warning-hujan';
    container.innerHTML = `
      <div class="warning-hero-flex">
        <div class="warning-badge-icon">🌧️</div>
        <div class="warning-hero-text">
          <div class="alert-tag">SISTEM PERINGATAN DINI: GENANGAN AIR & JAMUR PATOGEN</div>
          <h3>Peringatan Musim Hujan Aktif — Bulan ke-${cycleIndex} (${monthName})</h3>
          <p>Curah hujan tinggi meningkatkan kelembapan udara mikro dan kejenuhan air tanah. Waspadai infeksi cendawan akar, antraknosa, dan busuk buah.</p>
        </div>
      </div>

      <div class="action-checklist-grid">
        <div class="action-item-card">
          <h4><span>🚜</span> Normalisasi Parit & Drainase Lahan</h4>
          <p>Pastikan tidak ada air yang menggenang lebih dari 2 jam di dekat batang pohon. Perdalam parit pembuangan keliling sedalam minimal 50-60 cm.</p>
        </div>
        <div class="action-item-card">
          <h4><span>🍄</span> Aplikasi Bio-Fungisida Trichoderma</h4>
          <p>Taburkan jamur antagonis <em>Trichoderma harzianum</em> pada media perakaran setiap 3 minggu sekali untuk mematikan spora <em>Phytophthora palmivora</em>.</p>
        </div>
        <div class="action-item-card">
          <h4><span>✂️</span> Pemangkasan Tunas Air (Sanitasi Tajuk)</h4>
          <p>Pangkas tunas liar dan cabang yang rimbun rapat agar sinar matahari pagi dapat menembus ke lantai kebun dan kelembapan tajuk cepat mengering.</p>
        </div>
        <div class="action-item-card">
          <h4><span>🧪</span> Kurangi Dosis Pupuk Urea / Nitrogen</h4>
          <p>Air hujan sudah kaya ion nitrogen terlarut. Terlalu banyak pupuk N akan membuat sel tanaman sukulen, rapuh, dan sangat rentan busuk daun.</p>
        </div>
      </div>
    `;
  }
}

// =============================================================================
// 4. SEED & FERTILIZER CALCULATOR
// =============================================================================

function initSeedCalculator() {
  calculateSeeds();
}

function applyCropPreset() {
  const presetKey = document.getElementById('crop-preset').value;
  const preset = CROP_PRESETS[presetKey];
  if (!preset) return;

  if (presetKey !== 'custom') {
    document.getElementById('spacing-x').value = preset.spacingX;
    document.getElementById('spacing-y').value = preset.spacingY;
    document.getElementById('seed-price').value = preset.price;
  }
  calculateSeeds();
}

function calculateSeeds() {
  const landArea = parseFloat(document.getElementById('land-area').value) || 0;
  const spacingX = parseFloat(document.getElementById('spacing-x').value) || 1;
  const spacingY = parseFloat(document.getElementById('spacing-y').value) || 1;
  const seedPrice = parseFloat(document.getElementById('seed-price').value) || 0;
  const roadAllowance = parseFloat(document.getElementById('road-allowance').value) || 0.90;

  // Effective Land Area after path/drainage allowance
  const effectiveArea = landArea * roadAllowance;
  const areaPerPlant = spacingX * spacingY;

  let totalSeeds = 0;
  if (areaPerPlant > 0) {
    totalSeeds = Math.floor(effectiveArea / areaPerPlant);
  }

  const cadangan = Math.ceil(totalSeeds * 0.10); // 10% reserve for mortality replacement
  const totalCost = totalSeeds * seedPrice;
  const costPerM2 = landArea > 0 ? Math.round(totalCost / landArea) : 0;

  // Fertilizer Formulas per hole (lubang tanam):
  // Kompos: 15 - 20 kg
  const komposMin = Math.round(totalSeeds * 15);
  const komposMax = Math.round(totalSeeds * 20);

  // Dolomit: 0.5 - 1.0 kg
  const dolomitMin = (totalSeeds * 0.5).toFixed(1);
  const dolomitMax = (totalSeeds * 1.0).toFixed(1);

  // SP-36 / Phosphate: 0.25 - 0.3 kg
  const sp36Min = (totalSeeds * 0.25).toFixed(1);
  const sp36Max = (totalSeeds * 0.30).toFixed(1);

  // Update Result UI
  document.getElementById('res-seed-count').textContent = formatNumber(totalSeeds);
  document.getElementById('res-seed-cadangan').textContent = `+ ${cadangan} pohon cadangan sulaman disarankan`;
  document.getElementById('res-total-cost').textContent = formatRupiah(totalCost);
  document.getElementById('res-cost-per-m2').textContent = `Rp ${formatNumber(costPerM2)} per m² lahan`;

  document.getElementById('fert-kompos-total').textContent = `${formatNumber(komposMin)} - ${formatNumber(komposMax)} kg`;
  document.getElementById('fert-dolomit-total').textContent = `${dolomitMin} - ${dolomitMax} kg`;
  document.getElementById('fert-sp36-total').textContent = `${sp36Min} - ${sp36Max} kg`;

  return totalSeeds;
}

function applySeedsToHarvestTracker() {
  const seeds = calculateSeeds();
  if (seeds <= 0) {
    alert('Hitung kebutuhan bibit terlebih dahulu!');
    return;
  }
  document.getElementById('yield-trees').value = seeds;
  calculateYield();
  switchTab('section-harvest');
  showNotificationToast(`✅ ${seeds} pohon diterapkan ke Proyeksi Hasil Panen!`);
}

// =============================================================================
// 5. FRUIT YIELD TRACKER & HARVEST LOG
// =============================================================================

function initHarvestTracker() {
  // Set default today's date for harvest log form
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('log-date');
  if (dateInput) dateInput.value = todayStr;

  calculateYield();
  renderHarvestTable();
}

function calculateYield() {
  const trees = parseFloat(document.getElementById('yield-trees').value) || 0;
  const yieldPerTree = parseFloat(document.getElementById('yield-per-tree').value) || 0;
  const pricePerKg = parseFloat(document.getElementById('yield-price').value) || 0;

  const totalKg = trees * yieldPerTree;
  const totalTon = (totalKg / 1000).toFixed(2);
  const totalOmzet = totalKg * pricePerKg;

  document.getElementById('proj-weight-kg').textContent = `${formatNumber(Math.round(totalKg))} kg`;
  document.getElementById('proj-weight-ton').textContent = `(${totalTon.replace('.', ',')} Ton)`;
  document.getElementById('proj-total-omzet').textContent = formatRupiah(totalOmzet);

  updateDashboardOverview();
}

function addHarvestRecord() {
  const date = document.getElementById('log-date').value;
  const crop = document.getElementById('log-crop').value.trim();
  const weight = parseFloat(document.getElementById('log-weight').value) || 0;
  const grade = document.getElementById('log-grade').value;
  const revenue = parseFloat(document.getElementById('log-revenue').value) || 0;
  const notes = document.getElementById('log-notes').value.trim();

  if (!date || !crop || weight <= 0 || revenue <= 0) {
    alert('Harap isi data tanggal, komoditas, berat, dan pendapatan dengan valid.');
    return;
  }

  const newRecord = {
    id: Date.now(),
    date,
    crop,
    grade,
    weight,
    revenue,
    notes: notes || '-'
  };

  APP_STATE.harvestRecords.unshift(newRecord);
  localStorage.setItem('kebunsmart_harvest_records', JSON.stringify(APP_STATE.harvestRecords));

  renderHarvestTable();
  updateDashboardOverview();

  // Reset inputs
  document.getElementById('log-crop').value = '';
  document.getElementById('log-weight').value = '';
  document.getElementById('log-revenue').value = '';
  document.getElementById('log-notes').value = '';

  showNotificationToast('✅ Catatan panen berhasil disimpan!');
}

function deleteHarvestRecord(id) {
  if (!confirm('Hapus catatan panen ini?')) return;
  APP_STATE.harvestRecords = APP_STATE.harvestRecords.filter(r => r.id !== id);
  localStorage.setItem('kebunsmart_harvest_records', JSON.stringify(APP_STATE.harvestRecords));
  renderHarvestTable();
  updateDashboardOverview();
}

function clearHarvestRecords() {
  if (!confirm('Apakah Anda yakin ingin menghapus seluruh riwayat panen?')) return;
  APP_STATE.harvestRecords = [];
  localStorage.removeItem('kebunsmart_harvest_records');
  renderHarvestTable();
  updateDashboardOverview();
  showNotificationToast('🗑️ Semua riwayat panen telah dibersihkan.');
}

function renderHarvestTable() {
  const tbody = document.getElementById('harvest-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  let sumWeight = 0;
  let sumRevenue = 0;

  if (APP_STATE.harvestRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
          Belum ada riwayat catatan panen. Tambahkan hasil panen aktual Anda di atas.
        </td>
      </tr>
    `;
  } else {
    APP_STATE.harvestRecords.forEach(rec => {
      sumWeight += rec.weight;
      sumRevenue += rec.revenue;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatDisplayDate(rec.date)}</strong></td>
        <td>${rec.crop}</td>
        <td><span class="status-pill ${rec.grade.includes('Super') ? 'status-ideal' : 'status-dry'}">${rec.grade}</span></td>
        <td><strong>${formatNumber(rec.weight)} kg</strong></td>
        <td style="color: var(--primary-700); font-weight: 700;">${formatRupiah(rec.revenue)}</td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${rec.notes}</td>
        <td>
          <button class="btn-del-row" onclick="deleteHarvestRecord(${rec.id})" title="Hapus catatan">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('table-total-weight').innerHTML = `<strong>${formatNumber(sumWeight)} kg</strong>`;
  document.getElementById('table-total-revenue').innerHTML = `<strong>${formatRupiah(sumRevenue)}</strong>`;
}

// =============================================================================
// 6. SOIL MOISTURE TELEMETRY & 24H TREND CHART
// =============================================================================

function initSoilMoistureSensor() {
  updateMoistureUI(APP_STATE.soilMoisture);
  startSensorSimulation();
  renderSoilChart();

  window.addEventListener('resize', () => {
    if (APP_STATE.activeSection === 'section-soil') {
      renderSoilChart();
    }
  });
}

function updateMoistureFromSlider(val) {
  APP_STATE.soilMoisture = parseInt(val, 10);
  document.getElementById('slider-val-preview').textContent = `${val}%`;
  updateMoistureUI(APP_STATE.soilMoisture);
}

function toggleSensorSimulation(isRunning) {
  APP_STATE.sensorSimRunning = isRunning;
  if (isRunning) {
    startSensorSimulation();
  } else {
    clearInterval(APP_STATE.sensorInterval);
  }
}

function startSensorSimulation() {
  clearInterval(APP_STATE.sensorInterval);
  APP_STATE.sensorInterval = setInterval(() => {
    if (!APP_STATE.sensorSimRunning) return;

    // Small realistic drift: -1, 0, or +1%
    const change = (Math.random() * 2 - 1) * 1.2;
    let newMoisture = Math.round(APP_STATE.soilMoisture + change);
    newMoisture = Math.max(20, Math.min(92, newMoisture)); // clamp 20 - 92%

    APP_STATE.soilMoisture = newMoisture;

    // Synchronize slider
    const slider = document.getElementById('manual-moisture-slider');
    if (slider) slider.value = newMoisture;
    const preview = document.getElementById('slider-val-preview');
    if (preview) preview.textContent = `${newMoisture}%`;

    // Slightly fluctuate temp
    APP_STATE.soilTemp = (26.0 + (Math.random() * 1.5)).toFixed(1);
    const tempEl = document.getElementById('soil-temp');
    if (tempEl) tempEl.textContent = `${APP_STATE.soilTemp} °C`;

    updateMoistureUI(newMoisture);

    // Update the last reading in the hourly trend
    APP_STATE.hourlyTrend[APP_STATE.hourlyTrend.length - 1] = newMoisture;
    if (APP_STATE.activeSection === 'section-soil') {
      renderSoilChart();
    }
  }, 3500);
}

function updateMoistureUI(moistureVal) {
  // 1. Arc Dashoffset & Needle calculation
  // Total circumference for r=80 semi-circle is PI * 80 ≈ 251.3
  const totalLength = 251.3;
  const progressRatio = Math.max(0, Math.min(100, moistureVal)) / 100;
  const dashOffset = totalLength * (1 - progressRatio);

  const arcEl = document.getElementById('gauge-progress-arc');
  if (arcEl) {
    arcEl.style.strokeDashoffset = dashOffset;
    if (moistureVal < 40) arcEl.style.stroke = '#F59E0B'; // Dry Amber
    else if (moistureVal > 70) arcEl.style.stroke = '#0284C7'; // Wet Sky
    else arcEl.style.stroke = '#2D6A4F'; // Ideal Green
  }

  // Needle angle: 0% = -90deg, 50% = 0deg, 100% = 90deg
  const needleAngle = -90 + (progressRatio * 180);
  const needleEl = document.getElementById('gauge-needle');
  if (needleEl) {
    needleEl.setAttribute('transform', `rotate(${needleAngle.toFixed(1)} 100 110)`);
  }

  // Value text
  const valText = document.getElementById('gauge-val-text');
  if (valText) valText.innerHTML = `${moistureVal}<span>%</span>`;

  // Status & Recommendations
  let statusText = 'Ideal (Optimal)';
  let statusClass = 'status-ideal';
  let captionText = 'Kadar Lengas Tanah Optimal';
  let iconLead = '✅';
  let titleLead = 'Kondisi Lengas Tanah Sangat Baik';
  let descLead = 'Kapasitas lapang perakaran dalam kondisi prima (40% - 70%). Penyerapan unsur hara fosfat dan kalium berjalan maksimal tanpa risiko pembusukan.';

  if (moistureVal < 40) {
    statusText = 'Kering (Kurang Air)';
    statusClass = 'status-dry';
    captionText = 'Perlu Irigasi Segera';
    iconLead = '⚠️';
    titleLead = 'Peringatan Lengas Tanah Rendah';
    descLead = 'Tanah mendekati titik layu sementara (stress defisit air). Segera nyalakan pompa irigasi tetes 30-45 menit agar fotosintesis tanaman tidak terhambat.';
  } else if (moistureVal > 70) {
    statusText = 'Terlalu Basah (Jenuh Air)';
    statusClass = 'status-wet';
    captionText = 'Risiko Kejenuhan Air & Jamur';
    iconLead = '💧';
    titleLead = 'Tanah Jenuh Air (Potensi Anaerob)';
    descLead = 'Pori-pori tanah terisi penuh air sehingga pasokan oksigen ke akar tercekik. Periksa parit pembuangan, buka penutup mulsa jika basah berlebih, dan tunda jadwal penyiraman.';
  }

  const badgeEl = document.getElementById('soil-status-badge');
  if (badgeEl) {
    badgeEl.textContent = statusText;
    badgeEl.className = `status-pill ${statusClass}`;
  }

  const captionEl = document.getElementById('gauge-caption-text');
  if (captionEl) captionEl.textContent = captionText;

  const leadIcon = document.getElementById('soil-lead-icon');
  const leadTitle = document.getElementById('soil-lead-title');
  const leadDesc = document.getElementById('soil-lead-desc');
  if (leadIcon) leadIcon.textContent = iconLead;
  if (leadTitle) leadTitle.textContent = titleLead;
  if (leadDesc) leadDesc.textContent = descLead;

  // Sync to Header & Dashboard
  const headVal = document.getElementById('header-moisture-val');
  if (headVal) headVal.textContent = `${moistureVal}%`;

  const dashVal = document.getElementById('dash-stat-moisture');
  if (dashVal) dashVal.textContent = `${moistureVal}%`;

  const dashPill = document.getElementById('dash-stat-moisture-pill');
  if (dashPill) {
    dashPill.textContent = statusText;
    dashPill.className = `status-pill ${statusClass}`;
  }

  const dashMiniVal = document.getElementById('dash-mini-val');
  if (dashMiniVal) dashMiniVal.textContent = `${moistureVal}%`;

  const dashCircle = document.getElementById('dash-circle-progress');
  if (dashCircle) {
    const circleColor = moistureVal < 40 ? '#F59E0B' : (moistureVal > 70 ? '#0284C7' : '#40916C');
    dashCircle.style.background = `conic-gradient(${circleColor} calc(${moistureVal} * 1%), #e2e8e3 0)`;
  }

  const dashAdviceTitle = document.getElementById('dash-advice-title');
  const dashAdviceDesc = document.getElementById('dash-advice-desc');
  if (dashAdviceTitle) dashAdviceTitle.textContent = titleLead;
  if (dashAdviceDesc) dashAdviceDesc.textContent = descLead;
}

// Canvas-based 24h Trend Chart
function renderSoilChart() {
  const canvas = document.getElementById('soil-trend-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  if (rect.width === 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  ctx.clearRect(0, 0, w, h);

  // Y-axis Scale: 0 to 100%
  const getY = (val) => padding.top + chartH - (val / 100) * chartH;
  const getX = (idx) => padding.left + (idx / (APP_STATE.hourlyTrend.length - 1)) * chartW;

  // 1. Draw Safe Zone Band (40% to 70%)
  const y70 = getY(70);
  const y40 = getY(40);
  ctx.fillStyle = 'rgba(82, 183, 136, 0.12)';
  ctx.fillRect(padding.left, y70, chartW, y40 - y70);

  ctx.strokeStyle = 'rgba(82, 183, 136, 0.4)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padding.left, y70);
  ctx.lineTo(padding.left + chartW, y70);
  ctx.moveTo(padding.left, y40);
  ctx.lineTo(padding.left + chartW, y40);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label Safe Zone
  ctx.font = '10px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#2D6A4F';
  ctx.fillText('Zona Ideal (40% - 70%)', padding.left + 8, y70 + 14);

  // 2. Draw Horizontal Grid Lines (20%, 40%, 60%, 80%, 100%)
  [20, 40, 60, 80, 100].forEach(val => {
    const y = getY(val);
    ctx.strokeStyle = '#e2e8e3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#88988b';
    ctx.textAlign = 'right';
    ctx.fillText(`${val}%`, padding.left - 8, y + 3);
  });

  // 3. Draw X-axis labels (Every 4 hours)
  ctx.textAlign = 'center';
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'];
  const stepIndices = [0, 4, 8, 12, 16, 20, 23];
  stepIndices.forEach((idx, i) => {
    const x = getX(idx);
    ctx.fillStyle = '#526356';
    ctx.fillText(hours[i], x, h - 14);
  });

  // 4. Draw Smooth Trend Line
  ctx.beginPath();
  APP_STATE.hourlyTrend.forEach((val, idx) => {
    const x = getX(idx);
    const y = getY(val);
    if (idx === 0) ctx.moveTo(x, y);
    else {
      const prevX = getX(idx - 1);
      const prevY = getY(APP_STATE.hourlyTrend[idx - 1]);
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
  ctx.strokeStyle = '#2D6A4F';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 5. Fill Gradient Under Trend Line
  ctx.lineTo(getX(APP_STATE.hourlyTrend.length - 1), getY(0));
  ctx.lineTo(getX(0), getY(0));
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padding.top, 0, getY(0));
  grad.addColorStop(0, 'rgba(45, 106, 79, 0.25)');
  grad.addColorStop(1, 'rgba(45, 106, 79, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // 6. Draw Dots on specific intervals
  APP_STATE.hourlyTrend.forEach((val, idx) => {
    if (idx % 3 === 0 || idx === APP_STATE.hourlyTrend.length - 1) {
      const x = getX(idx);
      const y = getY(val);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#2D6A4F';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  });

  // Current Live Dot (Last point)
  const lastX = getX(APP_STATE.hourlyTrend.length - 1);
  const lastY = getY(APP_STATE.hourlyTrend[APP_STATE.hourlyTrend.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function generateRandomTrend() {
  const base = APP_STATE.soilMoisture;
  APP_STATE.hourlyTrend = Array.from({ length: 24 }, (_, i) => {
    // Diurnal variation: lower in afternoon, higher at night/morning
    const hourFactor = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) * 8;
    const noise = (Math.random() * 4 - 2);
    const val = Math.round(base + hourFactor + noise);
    return Math.max(25, Math.min(90, val));
  });
  renderSoilChart();
  showNotificationToast('🔄 Data tren kelembapan 24 jam berhasil disimulasi ulang!');
}

// =============================================================================
// 7. ADAPTIVE SEASONAL TO-DO LIST
// =============================================================================

function initAdaptiveTasks() {
  if (APP_STATE.tasks.length === 0) {
    refreshAdaptiveTasksBySeason();
  } else {
    renderTasksList();
  }
}

function refreshAdaptiveTasksBySeason() {
  const isKemarau = isDrySeason(APP_STATE.simulatedMonth);
  const seasonKey = isKemarau ? 'kemarau' : 'hujan';
  
  // Keep custom user tasks if any, and replace default season tasks
  const customTasks = APP_STATE.tasks.filter(t => t.category === 'custom');
  const seasonDefaults = DEFAULT_SEASON_TASKS[seasonKey].map(t => ({ ...t }));
  
  APP_STATE.tasks = [...seasonDefaults, ...customTasks];
  localStorage.setItem('kebunsmart_adaptive_tasks', JSON.stringify(APP_STATE.tasks));
  renderTasksList();
}

function renderTasksList() {
  const container = document.getElementById('tasks-container');
  if (!container) return;

  const isKemarau = isDrySeason(APP_STATE.simulatedMonth);
  const seasonName = isKemarau ? 'Musim Kemarau' : 'Musim Hujan';

  // Update Section Header Texts
  const titleEl = document.getElementById('task-card-title');
  const subEl = document.getElementById('task-card-subtitle');
  const iconEl = document.getElementById('task-season-icon');
  if (titleEl) titleEl.textContent = `Checklist Perawatan: ${seasonName}`;
  if (subEl) {
    subEl.textContent = isKemarau
      ? 'Prioritas: Manajemen penghematan air, mulsa perakaran, dan pencegahan stress daun'
      : 'Prioritas: Drainase bebas genangan, pemangkasan tunas air, dan proteksi fungisida';
  }
  if (iconEl) iconEl.textContent = isKemarau ? '☀️' : '🌧️';

  container.innerHTML = '';
  let completedCount = 0;

  APP_STATE.tasks.forEach(task => {
    if (task.completed) completedCount++;

    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    let badgeClass = 'task-badge-cat';
    let badgeLabel = 'Musim Kemarau';
    if (task.category === 'hujan') {
      badgeClass += ' cat-hujan';
      badgeLabel = 'Musim Hujan';
    } else if (task.category === 'kemarau') {
      badgeClass += ' cat-kemarau';
      badgeLabel = 'Musim Kemarau';
    } else {
      badgeLabel = 'Tugas Kustom';
    }

    item.innerHTML = `
      <div class="task-item-left">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
        <span class="task-label" onclick="toggleTask(${task.id})">${task.text}</span>
      </div>
      <div class="task-item-right">
        <span class="${badgeClass}">${badgeLabel}</span>
        <button class="task-del-btn" onclick="deleteTask(${task.id})" title="Hapus tugas">✕</button>
      </div>
    `;
    container.appendChild(item);
  });

  // Counter
  document.getElementById('task-completed-count').textContent = completedCount;
  document.getElementById('task-total-count').textContent = APP_STATE.tasks.length;

  // Render on Dashboard Preview Widget
  renderDashboardTaskPreview();
}

function toggleTask(taskId) {
  APP_STATE.tasks = APP_STATE.tasks.map(t => {
    if (t.id === taskId) return { ...t, completed: !t.completed };
    return t;
  });
  localStorage.setItem('kebunsmart_adaptive_tasks', JSON.stringify(APP_STATE.tasks));
  renderTasksList();
}

function addNewTask() {
  const input = document.getElementById('new-task-input');
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    category: 'custom'
  };

  APP_STATE.tasks.unshift(newTask);
  localStorage.setItem('kebunsmart_adaptive_tasks', JSON.stringify(APP_STATE.tasks));
  input.value = '';
  renderTasksList();
  showNotificationToast('✅ Tugas baru berhasil ditambahkan!');
}

function deleteTask(taskId) {
  APP_STATE.tasks = APP_STATE.tasks.filter(t => t.id !== taskId);
  localStorage.setItem('kebunsmart_adaptive_tasks', JSON.stringify(APP_STATE.tasks));
  renderTasksList();
}

function clearCompletedTasks() {
  APP_STATE.tasks = APP_STATE.tasks.filter(t => !t.completed);
  localStorage.setItem('kebunsmart_adaptive_tasks', JSON.stringify(APP_STATE.tasks));
  renderTasksList();
  showNotificationToast('🧹 Tugas yang selesai telah dibersihkan.');
}

function resetDefaultSeasonTasks() {
  refreshAdaptiveTasksBySeason();
  showNotificationToast('🔄 Tugas standar musim dipulihkan.');
}

function renderDashboardTaskPreview() {
  const container = document.getElementById('dash-task-preview-list');
  if (!container) return;

  container.innerHTML = '';
  const topTasks = APP_STATE.tasks.slice(0, 3);

  if (topTasks.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Tidak ada tugas terjadwal.</p>';
    return;
  }

  topTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `preview-task-item ${task.completed ? 'is-done' : ''}`;
    div.innerHTML = `
      <span>${task.text}</span>
      <span class="task-tag">${task.completed ? 'Selesai' : 'Perlu Aksi'}</span>
    `;
    container.appendChild(div);
  });
}

// =============================================================================
// 8. PLANT CATALOG & RESISTANCE DATABASE
// =============================================================================

let activeCatalogFilter = 'all';

function initPlantCatalog() {
  renderPlantCards(PLANT_CATALOG);
}

function renderPlantCards(plants) {
  const grid = document.getElementById('plant-cards-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (plants.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">Tidak ada tanaman yang cocok dengan pencarian.</p>';
    return;
  }

  plants.forEach(plant => {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.innerHTML = `
      <div class="plant-card-header">
        <div class="plant-avatar">${plant.avatar}</div>
        <div class="plant-title-group">
          <h3>${plant.name}</h3>
          <span>${plant.variety}</span>
        </div>
      </div>
      <div class="plant-card-body">
        <div class="plant-resistance-row">
          <div class="res-tag tag-dry">☀️ Kemarau: ${plant.dryTolerance.split(' ')[0]}</div>
          <div class="res-tag tag-wet">🌧️ Hujan: ${plant.wetTolerance.split(' ')[0]}</div>
        </div>

        <div class="plant-specs">
          <div class="spec-item">
            <strong>Kebutuhan Air:</strong>
            <span>${plant.waterNeed}</span>
          </div>
          <div class="spec-item">
            <strong>pH Tanah Ideal:</strong>
            <span>${plant.soilPh}</span>
          </div>
          <div class="spec-item" style="grid-column: 1 / -1;">
            <strong>Jarak Tanam Rekomendasi:</strong>
            <span>${plant.spacing}</span>
          </div>
        </div>

        <div class="plant-tips">
          <strong>💡 Tips Pengelolaan Iklim:</strong>
          <p>${plant.tips}</p>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterPlantCatalog() {
  const query = document.getElementById('catalog-search').value.toLowerCase().trim();
  
  const filtered = PLANT_CATALOG.filter(plant => {
    const matchQuery = plant.name.toLowerCase().includes(query) || 
                       plant.variety.toLowerCase().includes(query) ||
                       plant.tips.toLowerCase().includes(query);

    const matchCategory = activeCatalogFilter === 'all' || plant.categories.includes(activeCatalogFilter);
    return matchQuery && matchCategory;
  });

  renderPlantCards(filtered);
}

function setCatalogFilter(category) {
  activeCatalogFilter = category;
  document.querySelectorAll('.filter-chips .chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-filter') === category);
  });
  filterPlantCatalog();
}

// =============================================================================
// 9. DASHBOARD OVERVIEW SYNC
// =============================================================================

function updateDashboardOverview() {
  // 1. Total productive trees from Harvest Tracker
  const trees = document.getElementById('yield-trees').value || 120;
  const statTrees = document.getElementById('dash-stat-trees');
  if (statTrees) statTrees.innerHTML = `${formatNumber(trees)} <small>Pohon</small>`;

  // 2. Projected Harvest & Revenue
  const weightTon = document.getElementById('proj-weight-ton').textContent;
  const statWeight = document.getElementById('dash-stat-weight');
  if (statWeight) {
    const cleanTon = weightTon.replace('(', '').replace(')', '').trim();
    statWeight.innerHTML = `${cleanTon}`;
  }

  const omzet = document.getElementById('proj-total-omzet').textContent;
  const statRev = document.getElementById('dash-stat-revenue');
  if (statRev) statRev.textContent = `Potensi: ${omzet}`;

  // 3. Season Overview
  const isKemarau = isDrySeason(APP_STATE.simulatedMonth);
  const statSeasonName = document.getElementById('dash-stat-season-name');
  const statSeasonProgress = document.getElementById('dash-stat-season-progress');
  const dashBanner = document.getElementById('dash-season-alert');
  const dashAlertTitle = document.getElementById('dash-alert-title');
  const dashAlertDesc = document.getElementById('dash-alert-desc');
  const dashAlertIcon = document.getElementById('dash-alert-icon');

  if (statSeasonName) statSeasonName.textContent = isKemarau ? 'Kemarau' : 'Hujan';
  if (statSeasonProgress) {
    const monthName = MONTH_SHORT[APP_STATE.simulatedMonth];
    statSeasonProgress.textContent = isKemarau ? `Bulan ${monthName} / Transisi Okt` : `Bulan ${monthName} / Transisi Apr`;
  }

  if (dashBanner) {
    dashBanner.className = `season-alert-banner ${isKemarau ? '' : 'is-hujan'}`;
    if (isKemarau) {
      dashAlertIcon.textContent = '☀️';
      dashAlertTitle.textContent = 'Peringatan Musim Kemarau Sedang Berlangsung';
      dashAlertDesc.textContent = 'Optimalkan irigasi tetes, pasang mulsa organik di piringan pohon, dan atur jadwal penyiraman ekstra pada fajar/senja hari.';
    } else {
      dashAlertIcon.textContent = '🌧️';
      dashAlertTitle.textContent = 'Peringatan Musim Hujan Sedang Berlangsung';
      dashAlertDesc.textContent = 'Musim hujan tiba! Periksa kelancaran drainase lahan, waspadai jamur/hama kelembapan, dan kurangi frekuensi penyiraman harian.';
    }
  }

  renderDashboardTaskPreview();
}

// =============================================================================
// 10. UTILITY & FORMATTING FUNCTIONS
// =============================================================================

function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

function formatRupiah(num) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(num));
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = parts[2];
    const m = MONTH_SHORT[parseInt(parts[1], 10) - 1];
    const y = parts[0];
    return `${d} ${m} ${y}`;
  }
  return dateStr;
}

function showNotificationToast(msg) {
  // Simple toast pop-up
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1B4332;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      z-index: 9999;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 3000);
}
