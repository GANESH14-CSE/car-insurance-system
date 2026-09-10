/* ==========================================================================
   INSUREDRIVE — USER DASHBOARD CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardViews();
  initClaimModal();
  initReminderToggles();
});

function initDashboardViews() {
  renderActivePolicyHero();
  renderPoliciesTable();
  renderClaimsList();
  renderDocumentsList();
}

/* Primary Active Policy Countdown Widget */
function renderActivePolicyHero() {
  const container = document.getElementById('activePolicyHeroContainer');
  if (!container) return;

  const policies = InsureDriveData.getPolicies();
  const activePolicy = policies.find(p => p.status === 'ACTIVE') || policies[0];

  if (!activePolicy) return;

  // Calculate days remaining
  const expiry = new Date(activePolicy.expiryDate);
  const now = new Date();
  const diffTime = expiry - now;
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(5, Math.round((daysLeft / 365) * 100)));

  const compareLink = window.location.pathname.includes('/dashboard/') ? '../pages/compare.html' : 'pages/compare.html';

  container.innerHTML = `
    <div class="policy-hero-card">
      <div style="flex: 1;">
        <span class="badge badge-success" style="margin-bottom: var(--space-3);">● ${activePolicy.status} COVERAGE</span>
        <h2 style="font-size: 1.85rem; margin-bottom: 4px;">${activePolicy.vehicleModel}</h2>
        <p style="font-size: 0.95rem; opacity: 0.9;">
          Registration: <strong>${activePolicy.vehicleReg}</strong> · Insurer: <strong>${activePolicy.insurerName}</strong>
        </p>
        <p style="font-size: 0.85rem; opacity: 0.75; margin-top: 4px;">
          Policy No: ${activePolicy.policyNumber} · Expiry Date: ${activePolicy.expiryDate}
        </p>
        <div style="margin-top: var(--space-4); max-width: 420px;">
          <div class="flex justify-between text-xs" style="opacity: 0.85; margin-bottom: 4px;">
            <span>Coverage Validity Bar</span>
            <span>${daysLeft} Days Remaining</span>
          </div>
          <div class="policy-progress-container">
            <div class="policy-progress-bar" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
        <div class="flex gap-3" style="margin-top: var(--space-6);">
          <button class="btn btn-accent btn-sm" onclick="downloadSampleDocument('${activePolicy.policyNumber}')">
            ↓ Download Policy Schedule
          </button>
          <a href="${compareLink}" class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3);">
            Renew Early & Save
          </a>
        </div>
      </div>
      <div class="countdown-gauge">
        <span class="countdown-days">${daysLeft}</span>
        <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Days Left</span>
      </div>
    </div>
  `;
}

/* Policies List Table */
function renderPoliciesTable(tab = 'ACTIVE') {
  const tbody = document.getElementById('policiesTableBody');
  if (!tbody) return;

  const policies = InsureDriveData.getPolicies().filter(p => tab === 'ALL' || p.status === tab);

  if (policies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No ${tab.toLowerCase()} policies found.</td></tr>`;
    return;
  }

  tbody.innerHTML = policies.map(p => `
    <tr>
      <td>
        <div style="font-weight: 700; color: var(--primary);">${p.vehicleModel}</div>
        <div style="font-size: 0.775rem; color: var(--text-muted);">${p.vehicleReg}</div>
      </td>
      <td><strong>${p.policyNumber}</strong></td>
      <td>${p.insurerName}</td>
      <td>${formatINR(p.premiumAmount)}</td>
      <td>${p.expiryDate}</td>
      <td>
        <span class="badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}">${p.status}</span>
      </td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="downloadSampleDocument('${p.policyNumber}')">↓ Download PDF</button>
      </td>
    </tr>
  `).join('');
}

/* Claims List & Timeline Visualizer */
function renderClaimsList() {
  const container = document.getElementById('claimsContainer');
  if (!container) return;

  const claims = InsureDriveData.getClaims();
  if (claims.length === 0) {
    container.innerHTML = `<div class="text-center text-muted" style="padding: 3rem;">No active claims found.</div>`;
    return;
  }

  container.innerHTML = claims.map(claim => {
    const stageIndex = claim.currentStageIndex || 0;

    return `
      <div class="widget-card" style="margin-bottom: var(--space-6);">
        <div class="widget-card-header">
          <div>
            <span class="badge badge-warning" style="margin-bottom: 4px;">${claim.status}</span>
            <h4>Claim #${claim.claimId} — ${claim.vehicleModel} (${claim.vehicleReg})</h4>
            <p class="text-sm">Type: ${claim.claimType} · Date: ${claim.incidentDate} · Location: ${claim.incidentLocation}</p>
          </div>
          <div class="text-right">
            <div class="price-tag">${formatINR(claim.estimatedAmount)}</div>
            <div class="price-sub">Estimated Damage</div>
          </div>
        </div>

        <div class="claim-timeline" style="margin-top: var(--space-4);">
          ${claim.stages.map((stage, idx) => `
            <div class="claim-stage ${idx < stageIndex ? 'done' : (idx === stageIndex ? 'current' : '')}">
              <div class="claim-dot"></div>
              <div class="claim-stage-name">${stage}</div>
            </div>
          `).join('')}
        </div>

        <div style="background: var(--surface-alt); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); font-size: 0.85rem; margin-top: var(--space-4);">
          <strong>Assigned Surveyor:</strong> ${claim.surveyorName} (${claim.surveyorContact}) · <strong>Garage:</strong> ${claim.assignedGarage}
        </div>
      </div>
    `;
  }).join('');
}

/* Documents Repository List */
function renderDocumentsList() {
  const container = document.getElementById('documentsContainer');
  if (!container) return;

  const docs = InsureDriveData.getDocuments();
  container.innerHTML = docs.map(doc => `
    <div class="widget-card flex items-center justify-between" style="margin-bottom: var(--space-3);">
      <div class="flex items-center gap-3">
        <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--secondary-light); color: var(--secondary); display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div style="font-weight: 600;">${doc.title}</div>
          <div class="text-xs text-muted">Uploaded on ${doc.date} · Format: ${doc.type}</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="downloadSampleDocument('${doc.id}')">Download Document ↓</button>
    </div>
  `).join('');
}

/* Simulated Document Download (Blob Creation) */
function downloadSampleDocument(docRef) {
  const content = `INSUREDRIVE OFFICIAL POLICY DOCUMENT\nReference ID: ${docRef}\nIssued Date: 18 Oct 2025\nStatus: VERIFIED & ACTIVE\n----------------------------------------\nThis is an officially generated policy document receipt from InsureDrive Advisory Platform.`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `InsureDrive_Document_${docRef}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloading InsureDrive_Document_${docRef}.txt`, 'success');
}

/* File New Claim Modal Form */
function initClaimModal() {
  const form = document.getElementById('newClaimForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('claimTypeInput').value;
    const date = document.getElementById('claimDateInput').value;
    const location = document.getElementById('claimLocationInput').value;

    const newClaim = {
      claimId: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      policyNumber: 'INS-2026-45892',
      vehicleReg: 'TN 01 AB 1234',
      vehicleModel: 'Hyundai i20',
      claimType: type,
      incidentDate: date || new Date().toISOString().split('T')[0],
      incidentLocation: location || 'Chennai Central',
      estimatedAmount: 18500,
      currentStageIndex: 0,
      stages: ['Submitted', 'Documents Verified', 'Survey Completed', 'Approved', 'Settled'],
      status: 'SUBMITTED',
      surveyorName: 'Assigned Upon Review',
      surveyorContact: 'TBD',
      assignedGarage: 'Nearest Network Workshop'
    };

    InsureDriveData.addClaim(newClaim);
    closeModal('newClaimModal');
    renderClaimsList();
    showToast('Claim ticket filed successfully! Intimation sent to insurer.', 'success');
  });
}

/* Renewal Reminder Toggles */
function initReminderToggles() {
  const switches = document.querySelectorAll('.reminder-switch');
  switches.forEach(sw => {
    sw.addEventListener('change', () => {
      showToast('Renewal reminder preferences updated!', 'info');
    });
  });
}
