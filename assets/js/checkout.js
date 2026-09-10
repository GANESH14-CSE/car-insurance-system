/* ==========================================================================
   INSUREDRIVE — CHECKOUT WIZARD CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutWizard();
});

function initCheckoutWizard() {
  let currentStep = 1;
  
  // Load selected plan context or use default fallback
  const planDataRaw = sessionStorage.getItem('insuredrive_selected_plan');
  const planContext = planDataRaw ? JSON.parse(planDataRaw) : {
    insurerName: 'SecureDrive Insurance',
    basePremium: 12450,
    regNo: 'TN 01 AB 1234',
    make: 'Hyundai',
    model: 'i20 Asta 1.2 Petrol',
    year: 2023,
    idv: 750000
  };

  renderStep(currentStep);
  updatePriceBreakdown();

  // Navigation handlers
  const nextBtn = document.getElementById('wizardNextBtn');
  const prevBtn = document.getElementById('wizardPrevBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        if (currentStep === 4) {
          // Process Simulated Payment
          processPayment();
        } else if (currentStep < 5) {
          currentStep++;
          renderStep(currentStep);
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1 && currentStep < 5) {
        currentStep--;
        renderStep(currentStep);
      }
    });
  }

  // Add-on checkboxes dynamic re-calculation
  const addonChecks = document.querySelectorAll('.addon-checkbox');
  addonChecks.forEach(chk => {
    chk.addEventListener('change', updatePriceBreakdown);
  });
}

function renderStep(step) {
  const stepPanels = document.querySelectorAll('.wizard-panel');
  const stepIndicators = document.querySelectorAll('.wizard-step');
  const nextBtn = document.getElementById('wizardNextBtn');
  const prevBtn = document.getElementById('wizardPrevBtn');

  stepPanels.forEach((panel, idx) => {
    panel.style.display = (idx + 1 === step) ? 'block' : 'none';
  });

  stepIndicators.forEach((ind, idx) => {
    const stepNum = idx + 1;
    ind.classList.remove('active', 'completed');
    if (stepNum === step) {
      ind.classList.add('active');
    } else if (stepNum < step) {
      ind.classList.add('completed');
    }
  });

  if (prevBtn) {
    prevBtn.style.display = (step > 1 && step < 5) ? 'inline-flex' : 'none';
  }

  if (nextBtn) {
    if (step === 4) {
      nextBtn.innerHTML = 'Complete Renewal & Pay Now →';
      nextBtn.className = 'btn btn-accent btn-lg';
    } else if (step === 5) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.innerHTML = 'Continue to Next Step →';
      nextBtn.className = 'btn btn-primary';
    }
  }
}

function updatePriceBreakdown() {
  const basePrice = 12450;
  let addonTotal = 0;

  const zeroDep = document.getElementById('addonZeroDep');
  const engineProt = document.getElementById('addonEngineProt');
  const rsa = document.getElementById('addonRSA');

  if (zeroDep && zeroDep.checked) addonTotal += 950;
  if (engineProt && engineProt.checked) addonTotal += 650;
  if (rsa && rsa.checked) addonTotal += 400;

  const subtotal = basePrice + addonTotal;
  const gst = Math.round(subtotal * 0.18);
  const finalTotal = subtotal + gst;

  const subtotalEl = document.getElementById('summarySubtotal');
  const gstEl = document.getElementById('summaryGST');
  const totalEl = document.getElementById('summaryFinalTotal');

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (gstEl) gstEl.textContent = formatINR(gst);
  if (totalEl) totalEl.textContent = formatINR(finalTotal);

  return finalTotal;
}

function validateCurrentStep(step) {
  if (step === 1) {
    const reg = document.getElementById('checkoutRegNo');
    if (reg && !reg.value.trim()) {
      showToast('Please verify vehicle registration number.', 'danger');
      return false;
    }
  } else if (step === 2) {
    const name = document.getElementById('checkoutName');
    const email = document.getElementById('checkoutEmail');
    if (!name.value.trim() || !email.value.trim()) {
      showToast('Please fill in your full name and email address.', 'danger');
      return false;
    }
  }
  return true;
}

function processPayment() {
  const nextBtn = document.getElementById('wizardNextBtn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<span class="loading-spinner"></span> Securing Payment...';
  }

  setTimeout(() => {
    // Generate new policy in data store
    const newPolicy = {
      policyNumber: 'INS-2026-45892',
      vehicleReg: 'TN 01 AB 1234',
      vehicleModel: 'Hyundai i20 Asta 1.2 Petrol',
      insurerName: 'SecureDrive Insurance',
      planType: 'Comprehensive Cover + Zero Dep',
      premiumAmount: updatePriceBreakdown(),
      idv: 750000,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-10-18',
      status: 'ACTIVE',
      ncbBonus: '25%',
      documentUrl: '#'
    };

    InsureDriveData.addPolicy(newPolicy);

    showToast('Payment Authorized! Policy INS-2026-45892 Issued.', 'success');
    renderStep(5);
  }, 1500);
}
