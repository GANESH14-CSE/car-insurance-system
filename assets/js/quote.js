/* ==========================================================================
   INSUREDRIVE — QUOTE & VEHICLE LOOKUP CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRegLookupForm();
  initPolicyUploadDropzone();
  initTabSwitchers();
});

/* Tab Switching (Enter Reg vs Upload Policy) */
function initTabSwitchers() {
  const tabs = document.querySelectorAll('.quote-tab-btn');
  const panels = document.querySelectorAll('.quote-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
}

/* Vehicle Registration Number Validation & Lookup */
function initRegLookupForm() {
  const form = document.getElementById('regLookupForm');
  const input = document.getElementById('vehicleRegInput');
  const errorMsg = document.getElementById('regInputError');

  if (!form || !input) return;

  // Indian Reg Format Regex (e.g., TN 01 AB 1234 or TN01AB1234)
  const regPattern = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{4}$/i;

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase();
    if (errorMsg) errorMsg.classList.remove('visible');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();

    if (!val) {
      showError('Please enter your vehicle registration number.');
      return;
    }

    if (!regPattern.test(val)) {
      showError('Format error — enter valid registration (e.g., TN 01 AB 1234).');
      return;
    }

    // Save temporary quote search context
    const quoteContext = {
      regNo: val,
      make: 'Hyundai',
      model: 'i20 Asta 1.2 Petrol',
      year: 2023,
      idv: 750000,
      ncb: '25%',
      source: 'reg_lookup'
    };
    sessionStorage.setItem('insuredrive_active_quote', JSON.stringify(quoteContext));

    showToast('Vehicle details verified! Generating renewal quotes...', 'success');
    setTimeout(() => {
      window.location.href = 'pages/compare.html';
    }, 800);
  });

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.add('visible');
    } else {
      showToast(msg, 'danger');
    }
  }
}

/* Simulated OCR Policy Document Upload Dropzone */
function initPolicyUploadDropzone() {
  const dropzone = document.getElementById('policyDropzone');
  const fileInput = document.getElementById('policyFileInput');
  const uploadStatus = document.getElementById('uploadStatus');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (uploadStatus) {
      uploadStatus.innerHTML = `<div style="color: var(--secondary); font-weight: 600;">Scanning document: ${file.name}...</div>`;
    }
    
    // Simulate OCR Extraction
    setTimeout(() => {
      const parsedContext = {
        regNo: 'TN 01 AB 1234',
        make: 'Hyundai',
        model: 'i20 Asta 1.2 Petrol',
        year: 2023,
        idv: 750000,
        ncb: '25%',
        source: 'ocr_upload',
        fileName: file.name
      };
      sessionStorage.setItem('insuredrive_active_quote', JSON.stringify(parsedContext));
      
      showToast('Policy details parsed successfully! Found: Hyundai i20 (TN 01 AB 1234)', 'success');
      setTimeout(() => {
        window.location.href = 'pages/compare.html';
      }, 1000);
    }, 1200);
  }
}
