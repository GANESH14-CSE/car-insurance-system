/* ==========================================================================
   INSUREDRIVE — DATA STORE & LOCALSTORAGE PERSISTENCE
   ========================================================================== */

const InsureDriveData = (() => {
  const STORAGE_KEY = 'insuredrive_store_v1';

  // Seed Dataset
  const defaultData = {
    currentUser: {
      id: 'USR-1002',
      name: 'Rajesh Sharma',
      email: 'customer@insuredrive.demo',
      phone: '+91 98765 43210',
      role: 'customer',
      avatar: 'RS',
      address: '42, Park View Enclave, Adyar, Chennai - 600020',
      drivingLicense: 'TN-01-2018-0094821',
      kycVerified: true
    },
    insurers: [
      {
        id: 'INS-01',
        name: 'SecureDrive Insurance',
        logoText: 'SD',
        brandColor: '#2563EB',
        claimSettlementRatio: '98.4%',
        networkGarages: 4200,
        rating: 4.9,
        basePremium: 12450,
        idv: 750000,
        popular: true,
        recommended: true,
        savingsAmount: 2150,
        features: ['Zero Depreciation Included', '24/7 Roadside Assistance', 'Engine Protection Cover', 'Instant Digital Claim Settlement']
      },
      {
        id: 'INS-02',
        name: 'ShieldSure Insurance',
        logoText: 'SS',
        brandColor: '#10B981',
        claimSettlementRatio: '97.8%',
        networkGarages: 3850,
        rating: 4.8,
        basePremium: 11890,
        idv: 745000,
        popular: false,
        recommended: false,
        savingsAmount: 1800,
        features: ['Cashless Repair Network', 'Personal Accident Cover ₹15L', 'Key Replacement Cover', 'Consumables Cover']
      },
      {
        id: 'INS-03',
        name: 'AutoProtect General',
        logoText: 'AP',
        brandColor: '#6366F1',
        claimSettlementRatio: '96.9%',
        networkGarages: 4500,
        rating: 4.7,
        basePremium: 10950,
        idv: 730000,
        popular: false,
        recommended: false,
        savingsAmount: 2400,
        features: ['24-Hour Roadside Support', 'Zero Paperwork Guarantee', 'NCB Protector', 'Tyre Damage Cover']
      },
      {
        id: 'INS-04',
        name: 'PrimeCover Insurance',
        logoText: 'PC',
        brandColor: '#0F172A',
        claimSettlementRatio: '97.2%',
        networkGarages: 3100,
        rating: 4.8,
        basePremium: 11200,
        idv: 735000,
        popular: false,
        recommended: false,
        savingsAmount: 1950,
        features: ['Dedicated Claims Manager', 'Loss of Belongings Cover', 'Hydrostatic Lock Protection', 'Free Pick-up & Drop']
      },
      {
        id: 'INS-05',
        name: 'SafeRoad Direct',
        logoText: 'SR',
        brandColor: '#F59E0B',
        claimSettlementRatio: '96.5%',
        networkGarages: 3600,
        rating: 4.6,
        basePremium: 10400,
        idv: 720000,
        popular: false,
        recommended: false,
        savingsAmount: 2800,
        features: ['24/7 Helpline', 'Third-Party Legal Cover', 'Quick Claim Payout', 'E-Policy Download']
      }
    ],
    vehicles: [
      {
        id: 'VEH-901',
        regNo: 'TN 01 AB 1234',
        make: 'Hyundai',
        model: 'i20 Asta 1.2 Petrol',
        year: 2023,
        chassisNo: 'MA3EKB21S00192837',
        engineNo: 'G4LA1094812',
        fuelType: 'Petrol',
        idvValue: 750000,
        ownerName: 'Rajesh Sharma'
      }
    ],
    policies: [
      {
        policyNumber: 'INS-2026-45892',
        vehicleReg: 'TN 01 AB 1234',
        vehicleModel: 'Hyundai i20 Asta 1.2 Petrol',
        insurerName: 'SecureDrive Insurance',
        planType: 'Comprehensive Cover + Zero Dep',
        premiumAmount: 14691, // Base 12450 + 18% GST
        idv: 750000,
        startDate: '2025-10-18',
        expiryDate: '2026-10-18',
        status: 'ACTIVE',
        ncbBonus: '25%',
        documentUrl: '#'
      },
      {
        policyNumber: 'INS-2025-99214',
        vehicleReg: 'TN 01 AB 1234',
        vehicleModel: 'Hyundai i20 Asta 1.2 Petrol',
        insurerName: 'StarShield Insurance',
        planType: 'Comprehensive Cover',
        premiumAmount: 13200,
        idv: 820000,
        startDate: '2024-10-18',
        expiryDate: '2025-10-18',
        status: 'EXPIRED',
        ncbBonus: '20%',
        documentUrl: '#'
      }
    ],
    claims: [
      {
        claimId: 'CLM-2026-1024',
        policyNumber: 'INS-2026-45892',
        vehicleReg: 'TN 01 AB 1234',
        vehicleModel: 'Hyundai i20',
        claimType: 'Accidental Damage',
        incidentDate: '2026-08-12',
        incidentLocation: 'Adyar Flyover, Chennai',
        estimatedAmount: 24500,
        settledAmount: null,
        currentStageIndex: 2, // Stage: 0: Submitted, 1: Documents Verified, 2: Survey Completed, 3: Approved, 4: Settled
        stages: ['Submitted', 'Documents Verified', 'Survey Completed', 'Approved', 'Settled'],
        status: 'UNDER REVIEW',
        surveyorName: 'Venkatesh Iyer',
        surveyorContact: '+91 94440 12345',
        assignedGarage: 'Popular Hyundai Authorized Service, Guindy'
      }
    ],
    documents: [
      { id: 'DOC-01', title: 'Policy Schedule & Certificate (INS-2026-45892)', type: 'PDF', date: '18 Oct 2025', category: 'Policy' },
      { id: 'DOC-02', title: 'Premium Tax Invoice & Receipt', type: 'PDF', date: '18 Oct 2025', category: 'Tax' },
      { id: 'DOC-03', title: 'Self-Declaration & Vehicle Survey Report', type: 'PDF', date: '17 Oct 2025', category: 'Survey' },
      { id: 'DOC-04', title: 'Previous Policy Document (INS-2025-99214)', type: 'PDF', date: '18 Oct 2024', category: 'Historical' }
    ],
    reminders: {
      schedule30Days: true,
      schedule15Days: true,
      schedule7Days: true,
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: true
    },
    adminStats: {
      totalCustomers: 14820,
      activePolicies: 12450,
      renewalsThisMonth: 1280,
      pendingClaims: 42,
      totalPremiumCollected: 18450000
    }
  };

  // Initialize
  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
  }

  function getStore() {
    init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;
    } catch (e) {
      return defaultData;
    }
  }

  function saveStore(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return {
    get: getStore,
    set: saveStore,
    getInsurers: () => getStore().insurers,
    getPolicies: () => getStore().policies,
    getClaims: () => getStore().claims,
    getVehicles: () => getStore().vehicles,
    getDocuments: () => getStore().documents,
    getUser: () => getStore().currentUser,
    getReminders: () => getStore().reminders,
    addPolicy: (newPolicy) => {
      const store = getStore();
      store.policies.unshift(newPolicy);
      saveStore(store);
    },
    addClaim: (newClaim) => {
      const store = getStore();
      store.claims.unshift(newClaim);
      saveStore(store);
    },
    updateClaimStage: (claimId, newStageIndex, newStatus) => {
      const store = getStore();
      const claim = store.claims.find(c => c.claimId === claimId);
      if (claim) {
        claim.currentStageIndex = newStageIndex;
        claim.status = newStatus;
        saveStore(store);
      }
    },
    updateReminders: (updatedReminders) => {
      const store = getStore();
      store.reminders = { ...store.reminders, ...updatedReminders };
      saveStore(store);
    }
  };
})();

// Auto initialize on load
InsureDriveData.get();
