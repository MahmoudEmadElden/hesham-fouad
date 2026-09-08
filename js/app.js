/**
 * Hesham Fouad — King of Crepe (هشام فؤاد — ملك الكريب)
 * Main Application Logic (Zero Crepe Photos - Pure Luxury Bistro)
 */
document.addEventListener('DOMContentLoaded', () => {
  const data = window.HeshamFouadData;
  if (!data) return;

  const { restaurantInfo, categories, menuItems, extraAddons, extraSauces, sweetSauces } = data;

  // Application State
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    currentModalItem: null,
    modalQty: 1,
    selectedAddons: [],
    selectedSauces: [],
    chefNotes: ''
  };

  // DOM Elements
  const menuGrid = document.getElementById('menuItemsGrid');
  const itemsCounterText = document.getElementById('itemsCounterText');
  const searchInput = document.getElementById('menuSearchInput');
  const searchClearBtn = document.getElementById('menuSearchClear');
  const zeroResultsBox = document.getElementById('zeroResultsBox');
  const categoryNavBar = document.getElementById('categoryNavBar');
  const btnResetSearch = document.getElementById('btnResetSearch');

  // Modal Elements
  const modal = document.getElementById('itemCustomizerModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalItemCat = document.getElementById('modalItemCat');
  const modalItemName = document.getElementById('modalItemName');
  const modalItemDesc = document.getElementById('modalItemDesc');
  const modalAddonsSection = document.getElementById('modalAddonsSection');
  const modalAddonsList = document.getElementById('modalAddonsList');
  const modalSaucesSection = document.getElementById('modalSaucesSection');
  const modalSaucesList = document.getElementById('modalSaucesList');
  const modalChefNotes = document.getElementById('modalChefNotes');
  const modalQtyDigit = document.getElementById('modalQtyDigit');
  const modalTotalSum = document.getElementById('modalTotalSum');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const btnConfirmAddToCart = document.getElementById('btnConfirmAddToCart');

  // Initialize
  initVideoReels();
  renderMenuItems();
  setupEventListeners();

  /* ==========================================================================
     1. Live Video Reels (3 Side-by-Side Videos at top of Menu)
     ========================================================================== */
  function initVideoReels() {
    const reelCards = document.querySelectorAll('.reel-item-card');
    reelCards.forEach(card => {
      const video = card.querySelector('video');
      const audioBtn = card.querySelector('.btn-reel-audio-toggle');
      const playBtn = card.querySelector('.btn-reel-play-pause');
      if (!video) return;

      // Autoplay muted loop on visible/hover
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });

      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (video.paused) {
            video.play().catch(() => {});
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
          } else {
            video.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
          }
        });
      }

      if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Mute all other videos
          document.querySelectorAll('.reel-item-card video').forEach(v => {
            if (v !== video) {
              v.muted = true;
              const b = v.parentElement.querySelector('.btn-reel-audio-toggle');
              if (b) b.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
          });

          video.muted = !video.muted;
          if (!video.muted) {
            video.play().catch(() => {});
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            audioBtn.classList.add('active');
          } else {
            audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            audioBtn.classList.remove('active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     2. Render Menu Items Grid (NO FOOD PHOTOS - PURE LUXURY TYPOGRAPHY)
     ========================================================================== */
  function renderMenuItems() {
    if (!menuGrid) return;

    let filtered = menuItems;

    // 1. Filter by category
    if (state.activeCategory && state.activeCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === state.activeCategory);
    }

    // 2. Filter by search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const tagsMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
        return nameMatch || descMatch || tagsMatch;
      });
    }

    // Update Counter
    if (itemsCounterText) {
      const catName = categories.find(c => c.id === state.activeCategory)?.name || 'الأصناف';
      itemsCounterText.textContent = `عرض ${catName} (${filtered.length} صنف)`;
    }

    // Handle Zero Results
    if (filtered.length === 0) {
      menuGrid.innerHTML = '';
      if (zeroResultsBox) zeroResultsBox.style.display = 'block';
      return;
    } else {
      if (zeroResultsBox) zeroResultsBox.style.display = 'none';
    }

    // Category dictionary for badges
    const catMap = {
      signature: { name: 'ميكس الوحش', icon: 'fa-crown', color: '#F59E0B' },
      chicken: { name: 'دجاج بلدي', icon: 'fa-drumstick-bite', color: '#10B981' },
      meat: { name: 'لحوم بلدي', icon: 'fa-bacon', color: '#EF4444' },
      fries: { name: 'بطاطس وجبن', icon: 'fa-cheese', color: '#F59E0B' },
      sweet: { name: 'كريب حلو', icon: 'fa-cookie-bite', color: '#EC4899' },
      sauces: { name: 'صوصات وإكسترا', icon: 'fa-pepper-hot', color: '#8B5CF6' }
    };

    // Render Cards
    menuGrid.innerHTML = filtered.map(item => {
      const catInfo = catMap[item.categoryId] || { name: 'كريب فاخر', icon: 'fa-utensils', color: '#0A748A' };
      const isSignature = item.isSignature || item.popular;

      return `
        <div class="menu-bistro-card ${isSignature ? 'is-signature-card' : ''}" data-item-id="${item.id}">
          
          <!-- Card Header & Badge -->
          <div class="bistro-card-header">
            <span class="bistro-card-badge" style="border-color: ${catInfo.color}; color: ${catInfo.color};">
              <i class="fas ${catInfo.icon}"></i> ${catInfo.name}
            </span>
            ${item.tags && item.tags.length > 0 ? `<span class="bistro-mini-tag">${item.tags[0]}</span>` : ''}
          </div>

          <!-- Title & Description -->
          <div class="bistro-card-body">
            <h3 class="bistro-card-title">${item.name}</h3>
            <p class="bistro-card-desc">${item.description}</p>
          </div>

          <!-- Footer: Price & Add Button -->
          <div class="bistro-card-footer">
            <div class="bistro-price-wrap">
              <span class="bistro-price-val">${item.price}</span>
              <span class="bistro-price-curr">ج.م</span>
            </div>

            <button type="button" class="btn-bistro-add" onclick="window.HeshamFouadApp.openCustomizer('${item.id}')" title="أضف للطلب">
              <i class="fas fa-shopping-bag"></i>
              <span>أضف للطلب</span>
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     3. Item Customization Modal (Addons, Sauces, Chef Notes, Quantity)
     ========================================================================== */
  function openCustomizer(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    state.currentModalItem = item;
    state.modalQty = 1;
    state.selectedAddons = [];
    state.selectedSauces = [];
    state.chefNotes = '';

    if (modalItemName) modalItemName.textContent = item.name;
    if (modalItemDesc) modalItemDesc.textContent = item.description;
    if (modalQtyDigit) modalQtyDigit.textContent = '1';
    if (modalChefNotes) modalChefNotes.value = '';

    const catObj = categories.find(c => c.id === item.categoryId);
    if (modalItemCat) modalItemCat.textContent = catObj ? catObj.name : 'كريب فاخر';

    const isSweet = item.categoryId === 'sweet';

    // 1. Extra Cheese & Addons
    if (modalAddonsSection && modalAddonsList) {
      if (isSweet) {
        modalAddonsSection.style.display = 'none';
      } else {
        modalAddonsSection.style.display = 'block';
        modalAddonsList.innerHTML = extraAddons.map(addon => `
          <label class="modal-addon-checkbox-row">
            <input type="checkbox" value="${addon.id}" data-type="addon" data-price="${addon.price}" data-name="${addon.name}" onchange="window.HeshamFouadApp.onAddonCheck(this)">
            <span class="modal-addon-name">${addon.name}</span>
            <span class="modal-addon-price">+${addon.price} ج</span>
          </label>
        `).join('');
      }
    }

    // 2. Extra Sauces
    if (modalSaucesSection && modalSaucesList) {
      const relevantSauces = isSweet ? sweetSauces : extraSauces;
      modalSaucesSection.style.display = 'block';
      modalSaucesList.innerHTML = relevantSauces.map(sauce => `
        <label class="modal-addon-checkbox-row">
          <input type="checkbox" value="${sauce.id}" data-type="sauce" data-price="${sauce.price}" data-name="${sauce.name}" onchange="window.HeshamFouadApp.onSauceCheck(this)">
          <span class="modal-addon-name">${sauce.name}</span>
          <span class="modal-addon-price">+${sauce.price} ج</span>
        </label>
      `).join('');
    }

    updateModalTotal();
    if (modal) modal.style.display = 'flex';
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
    state.currentModalItem = null;
  }

  function updateModalTotal() {
    if (!state.currentModalItem) return;
    const base = Number(state.currentModalItem.price) || 0;
    const addonsSum = state.selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const saucesSum = state.selectedSauces.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const unitPrice = base + addonsSum + saucesSum;
    const finalTotal = unitPrice * state.modalQty;

    if (modalTotalSum) modalTotalSum.textContent = finalTotal;
  }

  function onAddonCheck(checkbox) {
    const addon = {
      id: checkbox.value,
      name: checkbox.dataset.name,
      price: Number(checkbox.dataset.price)
    };
    if (checkbox.checked) {
      state.selectedAddons.push(addon);
    } else {
      state.selectedAddons = state.selectedAddons.filter(a => a.id !== addon.id);
    }
    updateModalTotal();
  }

  function onSauceCheck(checkbox) {
    const sauce = {
      id: checkbox.value,
      name: checkbox.dataset.name,
      price: Number(checkbox.dataset.price)
    };
    if (checkbox.checked) {
      state.selectedSauces.push(sauce);
    } else {
      state.selectedSauces = state.selectedSauces.filter(s => s.id !== sauce.id);
    }
    updateModalTotal();
  }

  function confirmAddToCart() {
    if (!state.currentModalItem) return;

    const notes = modalChefNotes ? modalChefNotes.value.trim() : '';

    if (window.HeshamFouadCart) {
      window.HeshamFouadCart.addToCart(
        state.currentModalItem,
        state.modalQty,
        state.selectedAddons,
        state.selectedSauces,
        notes
      );
    }

    closeModal();
  }

  /* ==========================================================================
     4. Event Listeners Setup
     ========================================================================== */
  function setupEventListeners() {
    // Category pills click
    if (categoryNavBar) {
      categoryNavBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.cat-pill');
        if (!pill) return;

        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        state.activeCategory = pill.dataset.cat || 'all';
        renderMenuItems();
      });
    }

    // Live search input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchInput.value ? 'inline-flex' : 'none';
        }
        renderMenuItems();
      });
    }

    // Clear search button
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderMenuItems();
        searchInput.focus();
      });
    }

    // Reset search from empty state
    if (btnResetSearch) {
      btnResetSearch.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.searchQuery = '';
        state.activeCategory = 'all';
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        document.querySelector('.cat-pill[data-cat="all"]')?.classList.add('active');
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        renderMenuItems();
      });
    }

    // Modal close handlers
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
        closeModal();
      }
    });

    // Quantity buttons
    if (btnQtyMinus) {
      btnQtyMinus.addEventListener('click', () => {
        if (state.modalQty > 1) {
          state.modalQty--;
          if (modalQtyDigit) modalQtyDigit.textContent = state.modalQty;
          updateModalTotal();
        }
      });
    }

    if (btnQtyPlus) {
      btnQtyPlus.addEventListener('click', () => {
        if (state.modalQty < 20) {
          state.modalQty++;
          if (modalQtyDigit) modalQtyDigit.textContent = state.modalQty;
          updateModalTotal();
        }
      });
    }

    // Confirm add to cart
    if (btnConfirmAddToCart) {
      btnConfirmAddToCart.addEventListener('click', confirmAddToCart);
    }
  }

  // Export to Global Window
  window.HeshamFouadApp = {
    openCustomizer,
    closeModal,
    onAddonCheck,
    onSauceCheck,
    confirmAddToCart,
    renderMenuItems
  };
});
