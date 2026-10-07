(function() {
  const DEFAULT_VEHICLE = {
    year: '2018',
    make: 'Toyota',
    model: 'Corolla',
    engine: '1.8L L4 Gas DOHC',
    vin: 'JT2BURHE9JC284910'
  };

  const VEHICLE_CATALOG = {
    'Toyota': {
      'Corolla': ['1.8L L4 Gas DOHC', '2.0L Dynamic Force'],
      'Camry': ['2.5L 4-Cyl Gas', '3.5L V6 Gas'],
      'RAV4': ['2.5L Dynamic Force', '2.5L Hybrid']
    },
    'Honda': {
      'Civic': ['1.5L Turbo L4', '2.0L L4 DOHC'],
      'Accord': ['1.5L Turbo', '2.0L Turbo']
    },
    'Ford': {
      'F-150': ['3.5L EcoBoost V6', '5.0L V8 Coyote'],
      'Mustang': ['2.3L EcoBoost', '5.0L V8']
    },
    'BMW': {
      '330i': ['2.0L Turbo B48', '3.0L Turbo B58'],
      'M3': ['3.0L Twin-Turbo S58']
    }
  };

  function getActiveVehicle() {
    try {
      const stored = localStorage.getItem('autoparts_active_vehicle');
      return stored ? JSON.parse(stored) : DEFAULT_VEHICLE;
    } catch (e) {
      return DEFAULT_VEHICLE;
    }
  }

  function setActiveVehicle(vehicle) {
    try {
      localStorage.setItem('autoparts_active_vehicle', JSON.stringify(vehicle));
      updateVehicleUI(vehicle);
      showToast(`Active Vehicle Updated: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    } catch (e) {
      console.error(e);
    }
  }

  function updateVehicleUI(v) {
    const textElements = document.querySelectorAll('[data-bind-vehicle-name]');
    textElements.forEach(el => {
      el.textContent = `${v.year} ${v.make} ${v.model} ${v.engine}`;
    });

    const vinElements = document.querySelectorAll('[data-bind-vehicle-vin]');
    vinElements.forEach(el => {
      el.textContent = `VIN: ${v.vin}`;
    });
  }

  const PATH_MAP = {
    'home': 'index.html',
    'catalog': 'parts_search.html',
    'search': 'parts_search.html',
    'product-detail': 'product_detail.html',
    'cart': 'checkout.html',
    'checkout': 'checkout.html',
    'order-status': 'order_status.html',
    'order-tracker': 'order_status.html',
    'vendor-portal': 'dashboard_supply.html',
    'vendor-dashboard': 'dashboard_supply.html',
    'admin-catalog': 'dashboard.html',
    'garage': 'index.html'
  };

  function wireNavigation() {
    document.querySelectorAll('a[data-path], button[data-path]').forEach(el => {
      const pathKey = el.getAttribute('data-path');
      if (PATH_MAP[pathKey]) {
        el.setAttribute('href', PATH_MAP[pathKey]);
      }
    });

    document.querySelectorAll('.js-cart-link').forEach(el => {
      el.setAttribute('href', 'checkout.html');
    });

    // Make all tracking numbers clickable to copy
    document.querySelectorAll('.select-all, [data-copy]').forEach(el => {
      el.classList.add('cursor-pointer', 'hover:text-primary', 'transition-colors');
      el.setAttribute('title', 'Click to copy');
      el.addEventListener('click', () => {
        const text = el.getAttribute('data-copy') || el.innerText.trim();
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard: ${text}`);
        });
      });
    });
  }

  // Toast Notification System
  function showToast(message, type = 'success') {
    let container = document.getElementById('ap-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ap-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto bg-[#0b1c30] text-white px-4 py-2.5 rounded-lg shadow-xl border border-primary-container/40 flex items-center gap-2.5 font-label-md text-label-md transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] text-tertiary-fixed">verified</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Universal Vehicle Selector Modal Injector
  function injectVehicleModal() {
    if (document.getElementById('ap-vehicle-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ap-vehicle-modal';
    modal.className = 'fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4 transition-opacity duration-300';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden flex flex-col transform scale-95 transition-transform duration-200" id="ap-vehicle-modal-card">
        <div class="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/30">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">directions_car</span>
            </div>
            <div>
              <h3 class="font-title-lg text-title-lg text-on-surface">Select Active Vehicle</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Calibrate fitment filters for your chassis</p>
            </div>
          </div>
          <button class="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors" id="ap-close-modal-btn">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <!-- 17-digit fast VIN -->
          <div class="space-y-1.5">
            <label class="font-label-sm text-label-sm text-on-surface-variant">FAST VIN DECODE</label>
            <div class="flex gap-2">
              <input type="text" id="ap-modal-vin-input" maxlength="17" placeholder="Enter 17-digit VIN..." class="flex-1 h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-data-mono-sm text-data-mono-sm uppercase outline-none focus:ring-2 focus:ring-primary-container"/>
              <button id="ap-modal-vin-btn" class="px-4 h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors flex items-center gap-1">
                <span>Decode</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2 my-2">
            <div class="h-px bg-outline-variant/40 flex-1"></div>
            <span class="font-label-sm text-label-sm text-outline uppercase">Or Choose Year / Make / Model</span>
            <div class="h-px bg-outline-variant/40 flex-1"></div>
          </div>
          <!-- YMM Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant">Year</label>
              <select id="ap-modal-year" class="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018" selected>2018</option>
                <option value="2017">2017</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant">Make</label>
              <select id="ap-modal-make" class="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none">
                <option value="Toyota" selected>Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="BMW">BMW</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant">Model</label>
              <select id="ap-modal-model" class="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none">
                <option value="Corolla" selected>Corolla</option>
                <option value="Camry">Camry</option>
                <option value="RAV4">RAV4</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant">Engine</label>
              <select id="ap-modal-engine" class="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md outline-none">
                <option value="1.8L L4 Gas DOHC" selected>1.8L L4 Gas DOHC</option>
                <option value="2.0L Dynamic Force">2.0L Dynamic Force</option>
              </select>
            </div>
          </div>
        </div>
        <div class="bg-surface-container-low px-6 py-3 flex items-center justify-end gap-2 border-t border-outline-variant/30">
          <button class="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors" id="ap-cancel-modal-btn">Cancel</button>
          <button class="px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm flex items-center gap-1.5" id="ap-save-modal-btn">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Confirm & Calibrate</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const openModal = () => {
      const current = getActiveVehicle();
      document.getElementById('ap-modal-year').value = current.year;
      document.getElementById('ap-modal-make').value = current.make;
      updateModalModels(current.make);
      document.getElementById('ap-modal-model').value = current.model;
      updateModalEngines(current.make, current.model);
      document.getElementById('ap-modal-engine').value = current.engine;
      document.getElementById('ap-modal-vin-input').value = current.vin;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      requestAnimationFrame(() => {
        document.getElementById('ap-vehicle-modal-card').classList.remove('scale-95');
        document.getElementById('ap-vehicle-modal-card').classList.add('scale-100');
      });
    };

    const closeModal = () => {
      document.getElementById('ap-vehicle-modal-card').classList.remove('scale-100');
      document.getElementById('ap-vehicle-modal-card').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }, 150);
    };

    function updateModalModels(make) {
      const modelSelect = document.getElementById('ap-modal-model');
      modelSelect.innerHTML = '';
      const models = VEHICLE_CATALOG[make] ? Object.keys(VEHICLE_CATALOG[make]) : ['Base Model'];
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
      });
    }

    function updateModalEngines(make, model) {
      const engineSelect = document.getElementById('ap-modal-engine');
      engineSelect.innerHTML = '';
      const engines = (VEHICLE_CATALOG[make] && VEHICLE_CATALOG[make][model]) || ['Standard Engine'];
      engines.forEach(eng => {
        const opt = document.createElement('option');
        opt.value = eng;
        opt.textContent = eng;
        engineSelect.appendChild(opt);
      });
    }

    document.getElementById('ap-modal-make').addEventListener('change', (e) => {
      updateModalModels(e.target.value);
      updateModalEngines(e.target.value, document.getElementById('ap-modal-model').value);
    });

    document.getElementById('ap-modal-model').addEventListener('change', (e) => {
      updateModalEngines(document.getElementById('ap-modal-make').value, e.target.value);
    });

    document.getElementById('ap-modal-vin-btn').addEventListener('click', () => {
      const vinVal = document.getElementById('ap-modal-vin-input').value.trim();
      if (vinVal.length >= 10) {
        document.getElementById('ap-modal-year').value = '2021';
        document.getElementById('ap-modal-make').value = 'Toyota';
        updateModalModels('Toyota');
        document.getElementById('ap-modal-model').value = 'Corolla';
        updateModalEngines('Toyota', 'Corolla');
        document.getElementById('ap-modal-engine').value = '2.0L Dynamic Force';
        showToast('VIN decoded: 2021 Toyota Corolla 2.0L Dynamic Force');
      } else {
        alert('Please enter at least 10 characters of the VIN.');
      }
    });

    document.getElementById('ap-close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('ap-cancel-modal-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.getElementById('ap-save-modal-btn').addEventListener('click', () => {
      const updated = {
        year: document.getElementById('ap-modal-year').value,
        make: document.getElementById('ap-modal-make').value,
        model: document.getElementById('ap-modal-model').value,
        engine: document.getElementById('ap-modal-engine').value,
        vin: document.getElementById('ap-modal-vin-input').value.trim() || 'JT2BURHE9JC284910'
      };
      setActiveVehicle(updated);
      closeModal();
    });

    // Wire all elements that should open this modal
    document.querySelectorAll('#toggleSelectorModal, .js-change-vehicle, button:has(.material-symbols-outlined:contains("sync")), button:has(span:contains("Change Vehicle"))').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Also header vehicle capsule
    document.querySelectorAll('.cursor-pointer:has([data-bind-vehicle-name]), .cursor-pointer:has(.font-label-md:contains("Corolla"))').forEach(el => {
      el.addEventListener('click', openModal);
    });
  }

  function initVehicleSync() {
    const v = getActiveVehicle();
    updateVehicleUI(v);

    const yearSelect = document.getElementById('year-select');
    const makeSelect = document.getElementById('make-select');
    const modelSelect = document.getElementById('model-select');
    const engineSelect = document.getElementById('engine-select');

    if (yearSelect && makeSelect && modelSelect) {
      yearSelect.value = v.year;
      makeSelect.value = v.make;
      modelSelect.value = v.model;
      if (engineSelect) engineSelect.value = v.engine;

      const saveHandler = () => {
        const updated = {
          year: yearSelect.value,
          make: makeSelect.value,
          model: modelSelect.value,
          engine: engineSelect ? engineSelect.value : v.engine,
          vin: v.vin
        };
        setActiveVehicle(updated);
      };

      [yearSelect, makeSelect, modelSelect, engineSelect].forEach(select => {
        if (select) select.addEventListener('change', saveHandler);
      });
    }

    const vinInput = document.querySelector('input[placeholder*="17-digit VIN"]');
    const vinBtn = vinInput ? (vinInput.parentElement.querySelector('button') || vinInput.nextElementSibling) : null;
    if (vinInput && vinBtn) {
      vinBtn.addEventListener('click', () => {
        if (vinInput.value.trim().length >= 10) {
          const updated = {
            year: '2021',
            make: 'Toyota',
            model: 'Corolla',
            engine: '2.0L Dynamic Force',
            vin: vinInput.value.trim().toUpperCase()
          };
          setActiveVehicle(updated);
        }
      });
    }

    injectVehicleModal();
  }

  window.AutoPartsApp = {
    getActiveVehicle,
    setActiveVehicle,
    showToast,
    PATH_MAP
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      wireNavigation();
      initVehicleSync();
    });
  } else {
    wireNavigation();
    initVehicleSync();
  }
})();
