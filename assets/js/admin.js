/* ==========================================================================
   INSUREDRIVE — ADMIN OPERATIONS CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  renderAdminOverviewStats();
  renderAnalyticsCharts();
  renderAdminUsersTable();
  renderAdminPoliciesTable();
  renderAdminClaimsTable();
  renderAdminInsurersTable();
}

function renderAdminOverviewStats() {
  const container = document.getElementById('adminStatsContainer');
  if (!container) return;

  const stats = InsureDriveData.get().adminStats;
  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="widget-card">
        <div class="widget-card-header">
          <span class="widget-card-title">Total Customers</span>
          <span class="badge badge-primary">Active</span>
        </div>
        <div class="widget-value">${stats.totalCustomers.toLocaleString()}</div>
        <div class="text-xs text-muted" style="margin-top: 4px;">↑ +12.4% from last month</div>
      </div>
      <div class="widget-card">
        <div class="widget-card-header">
          <span class="widget-card-title">Active Policies</span>
          <span class="badge badge-success">In Force</span>
        </div>
        <div class="widget-value">${stats.activePolicies.toLocaleString()}</div>
        <div class="text-xs text-muted" style="margin-top: 4px;">98.2% Renewal Retention</div>
      </div>
      <div class="widget-card">
        <div class="widget-card-header">
          <span class="widget-card-title">Pending Claims</span>
          <span class="badge badge-warning">Action Req.</span>
        </div>
        <div class="widget-value">${stats.pendingClaims}</div>
        <div class="text-xs text-muted" style="margin-top: 4px;">Avg Resolution: 3.2 Days</div>
      </div>
      <div class="widget-card">
        <div class="widget-card-header">
          <span class="widget-card-title">Total Premium Collected</span>
          <span class="badge badge-success">FY 2025-26</span>
        </div>
        <div class="widget-value">${formatINR(stats.totalPremiumCollected)}</div>
        <div class="text-xs text-muted" style="margin-top: 4px;">Across 4 Insurer Partners</div>
      </div>
    </div>
  `;
}

function renderAnalyticsCharts() {
  const barChart = document.getElementById('renewalsBarChart');
  if (!barChart) return;

  const data = [
    { label: 'Apr', value: 85 },
    { label: 'May', value: 92 },
    { label: 'Jun', value: 78 },
    { label: 'Jul', value: 110 },
    { label: 'Aug', value: 95 },
    { label: 'Sep', value: 130 }
  ];

  barChart.innerHTML = `
    <div class="chart-bar-container">
      ${data.map(d => `
        <div class="chart-bar-group">
          <div class="chart-bar" style="height: ${d.value}px;" title="${d.label}: ${d.value} renewals"></div>
          <span class="chart-label">${d.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  const user = InsureDriveData.getUser();
  tbody.innerHTML = `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div style="width: 36px; height: 36px; border-radius: 9999px; background: var(--secondary-light); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-weight: 700;">
            ${user.avatar}
          </div>
          <div>
            <div style="font-weight: 700;">${user.name}</div>
            <div class="text-xs text-muted">${user.email}</div>
          </div>
        </div>
      </td>
      <td>TN 01 AB 1234 (Hyundai i20)</td>
      <td>INS-2026-45892</td>
      <td><span class="badge badge-success">VERIFIED KYC</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="showToast('User profile opened', 'info')">Edit</button>
      </td>
    </tr>
  `;
}

function renderAdminPoliciesTable() {
  const tbody = document.getElementById('adminPoliciesTableBody');
  if (!tbody) return;

  const policies = InsureDriveData.getPolicies();
  tbody.innerHTML = policies.map(p => `
    <tr>
      <td><strong>${p.policyNumber}</strong></td>
      <td>Rajesh Sharma</td>
      <td>${p.vehicleReg}</td>
      <td>${p.insurerName}</td>
      <td>${formatINR(p.premiumAmount)}</td>
      <td><span class="badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}">${p.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Policy schedule opened for review', 'info')">Manage</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminClaimsTable() {
  const tbody = document.getElementById('adminClaimsTableBody');
  if (!tbody) return;

  const claims = InsureDriveData.getClaims();
  tbody.innerHTML = claims.map(c => `
    <tr>
      <td><strong>${c.claimId}</strong></td>
      <td>${c.vehicleReg} (${c.vehicleModel})</td>
      <td>${c.claimType}</td>
      <td>${formatINR(c.estimatedAmount)}</td>
      <td><span class="badge badge-warning">${c.status}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-accent btn-sm" onclick="advanceClaimStage('${c.claimId}')">Advance Stage →</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminInsurersTable() {
  const container = document.getElementById('adminInsurersContainer');
  if (!container) return;

  const insurers = InsureDriveData.getInsurers();
  container.innerHTML = insurers.map(i => `
    <div class="widget-card" style="margin-bottom: var(--space-4);">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="insurer-logo-badge">${i.logoText}</div>
          <div>
            <h4>${i.name}</h4>
            <p class="text-sm">Claim Settlement: <strong>${i.claimSettlementRatio}</strong> · Network Garages: <strong>${i.networkGarages.toLocaleString()}</strong></p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="showToast('Managing insurer plans', 'info')">Manage Plans</button>
          <span class="badge badge-success">CONNECTED API</span>
        </div>
      </div>
    </div>
  `).join('');
}

function advanceClaimStage(claimId) {
  const claim = InsureDriveData.getClaims().find(c => c.claimId === claimId);
  if (!claim) return;

  const current = claim.currentStageIndex || 0;
  if (current < claim.stages.length - 1) {
    const nextStage = current + 1;
    const nextStatus = claim.stages[nextStage].toUpperCase();
    InsureDriveData.updateClaimStage(claimId, nextStage, nextStatus);
    renderAdminClaimsTable();
    showToast(`Claim ${claimId} advanced to stage: ${claim.stages[nextStage]}`, 'success');
  } else {
    showToast(`Claim ${claimId} is already fully settled.`, 'info');
  }
}
