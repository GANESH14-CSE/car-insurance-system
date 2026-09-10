/* ==========================================================================
   INSUREDRIVE — QUOTE COMPARISON CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderVehicleSummary();
  renderComparisonTable();
  initFiltersAndSort();
});

function getActiveQuoteContext() {
  const stored = sessionStorage.getItem('insuredrive_active_quote');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {
    regNo: 'TN 01 AB 1234',
    make: 'Hyundai',
    model: 'i20 Asta 1.2 Petrol',
    year: 2023,
    idv: 750000,
    ncb: '25%'
  };
}

function renderVehicleSummary() {
  const container = document.getElementById('vehicleSummaryContainer');
  if (!container) return;

  const ctx = getActiveQuoteContext();
  container.innerHTML = `
    <div class="vehicle-summary-bar">
      <div>
        <div class="item-label">Vehicle & Model</div>
        <div class="item-value">${ctx.make} ${ctx.model} (${ctx.year})</div>
      </div>
      <div>
        <div class="item-label">Registration</div>
        <div class="item-value">${ctx.regNo}</div>
      </div>
      <div>
        <div class="item-label">Declared IDV Value</div>
        <div class="item-value">${formatINR(ctx.idv)}</div>
      </div>
      <div>
        <div class="item-label">NCB Bonus</div>
        <div class="item-value" style="color: var(--accent);">${ctx.ncb} Discount Applied</div>
      </div>
    </div>
  `;
}

function renderComparisonTable(filterZeroDep = false, sortBy = 'price_asc') {
  const tbody = document.getElementById('comparisonTableBody');
  if (!tbody) return;

  let insurers = InsureDriveData.getInsurers();

  if (filterZeroDep) {
    insurers = insurers.filter(i => i.features.some(f => f.toLowerCase().includes('zero dep')));
  }

  if (sortBy === 'price_asc') {
    insurers.sort((a, b) => a.basePremium - b.basePremium);
  } else if (sortBy === 'price_desc') {
    insurers.sort((a, b) => b.basePremium - a.basePremium);
  } else if (sortBy === 'rating') {
    insurers.sort((a, b) => b.rating - a.rating);
  }

  tbody.innerHTML = insurers.map(insurer => {
    const gst = Math.round(insurer.basePremium * 0.18);
    const total = insurer.basePremium + gst;
    const isRecommended = insurer.recommended || insurer.id === 'INS-01';

    return `
      <tr class="${isRecommended ? 'quote-card-recommended' : ''}">
        <td>
          <div class="insurer-cell">
            <div class="insurer-logo-svg" style="background: ${insurer.brandColor || '#2563EB'};">${insurer.logoText}</div>
            <div>
              <div style="font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                ${insurer.name}
                ${isRecommended ? '<span class="badge badge-success" style="font-size: 0.65rem;">Recommended</span>' : ''}
              </div>
              <div style="font-size: 0.775rem; color: var(--text-secondary);">
                ⭐ ${insurer.rating} / 5.0 · ${insurer.claimSettlementRatio} Settlement Ratio
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600;">${formatINR(insurer.idv)}</div>
          <div class="price-sub">Current Market Valuation</div>
        </td>
        <td>
          <span class="badge badge-success">Included</span>
        </td>
        <td>
          <span class="badge badge-success">Included</span>
        </td>
        <td>
          <span class="badge ${insurer.features.some(f => f.includes('Zero Dep')) ? 'badge-primary' : 'badge-neutral'}">
            ${insurer.features.some(f => f.includes('Zero Dep')) ? 'Available' : 'Optional (+₹950)'}
          </span>
        </td>
        <td>
          <div class="price-tag">${formatINR(total)}</div>
          <div class="price-sub">Base ${formatINR(insurer.basePremium)} + GST ${formatINR(gst)}</div>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="showPlanDetails('${insurer.id}')">View Details</button>
            <button class="btn btn-primary btn-sm" onclick="selectPlanAndCheckout('${insurer.id}')">Select Plan →</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initFiltersAndSort() {
  const zeroDepCheck = document.getElementById('filterZeroDep');
  const sortSelect = document.getElementById('sortSelect');

  if (zeroDepCheck) {
    zeroDepCheck.addEventListener('change', () => {
      renderComparisonTable(zeroDepCheck.checked, sortSelect ? sortSelect.value : 'price_asc');
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      renderComparisonTable(zeroDepCheck ? zeroDepCheck.checked : false, sortSelect.value);
    });
  }
}

function showPlanDetails(insurerId) {
  const insurer = InsureDriveData.getInsurers().find(i => i.id === insurerId);
  if (!insurer) return;

  const content = document.getElementById('planDetailsModalContent');
  if (!content) return;

  const base = insurer.basePremium;
  const gst = Math.round(base * 0.18);
  const zeroDepAddon = 950;
  const total = base + gst + zeroDepAddon;

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <div class="flex items-center gap-3 margin-bottom: var(--space-2);">
        <div class="insurer-logo-badge" style="width: 48px; height: 48px; font-size: 1.25rem;">${insurer.logoText}</div>
        <div>
          <h3>${insurer.name} — Comprehensive Plan</h3>
          <p class="text-sm">Claim Settlement Score: <strong>${insurer.claimSettlementRatio}</strong> · Network Garages: <strong>${insurer.networkGarages.toLocaleString()}</strong></p>
        </div>
      </div>
    </div>

    <div style="background: var(--surface-alt); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-6);">
      <h5 style="margin-bottom: var(--space-2);">Plan Highlights & Coverage</h5>
      <ul style="list-style: disc; padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-secondary);">
        ${insurer.features.map(f => `<li>${f}</li>`).join('')}
        <li>Third-party property damage coverage up to ₹7.5 Lakhs</li>
        <li>Personal accident cover for owner-driver up to ₹15 Lakhs</li>
      </ul>
    </div>

    <div style="border-top: 1px solid var(--border); padding-top: var(--space-4); margin-bottom: var(--space-6);">
      <h5 style="margin-bottom: var(--space-3);">Premium Breakdown</h5>
      <div class="flex justify-between text-sm" style="margin-bottom: 6px;">
        <span>Own Damage + Third-Party Base Premium:</span>
        <strong>${formatINR(base)}</strong>
      </div>
      <div class="flex justify-between text-sm" style="margin-bottom: 6px;">
        <span>Zero Depreciation Add-on:</span>
        <strong>${formatINR(zeroDepAddon)}</strong>
      </div>
      <div class="flex justify-between text-sm" style="margin-bottom: 6px; color: var(--text-secondary);">
        <span>GST (18% Statutory Tax):</span>
        <strong>${formatINR(gst)}</strong>
      </div>
      <div class="flex justify-between" style="font-size: 1.1rem; font-weight: 800; border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 8px;">
        <span>Total Payable Premium:</span>
        <span style="color: var(--secondary);">${formatINR(total)}</span>
      </div>
    </div>

    <div class="flex justify-between gap-4">
      <button class="btn btn-secondary w-full" onclick="closeModal('planDetailsModal')">Close</button>
      <button class="btn btn-primary w-full" onclick="selectPlanAndCheckout('${insurer.id}')">Proceed with Plan →</button>
    </div>
  `;

  openModal('planDetailsModal');
}

function selectPlanAndCheckout(insurerId) {
  const insurer = InsureDriveData.getInsurers().find(i => i.id === insurerId);
  if (!insurer) return;

  const quoteCtx = getActiveQuoteContext();
  const selectedContext = {
    ...quoteCtx,
    insurerId: insurer.id,
    insurerName: insurer.name,
    basePremium: insurer.basePremium,
    zeroDep: true,
    engineProtect: true,
    roadsideAssist: true,
    gst: Math.round(insurer.basePremium * 0.18),
    totalPremium: Math.round(insurer.basePremium * 1.18) + 1200 // base + GST + add-ons
  };

  sessionStorage.setItem('insuredrive_selected_plan', JSON.stringify(selectedContext));
  showToast(`Selected ${insurer.name}. Redirecting to Checkout...`, 'success');
  setTimeout(() => {
    // Check path context for relative routing
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.href = isInPages ? 'checkout.html' : 'pages/checkout.html';
  }, 600);
}
