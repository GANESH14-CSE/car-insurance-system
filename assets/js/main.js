/* ==========================================================================
   INSUREDRIVE — MAIN UI & CONTROLLER HELPERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Theme Manager
  initTheme();
  // Mobile Nav Toggle
  initMobileNav();
  // Active Link Highlight
  highlightActiveLink();
  // FAQ Accordion
  initFaqAccordion();
  // Footer Mobile Accordion
  initFooterAccordion();
  // Responsive Tables Auto-Wrapper
  initResponsiveTables();
  // Search Modal Trigger
  initSearchModal();
  // Blog Category & Search Filter
  initBlogFilter();
  // Portals Popover Menu (Image 2)
  initPortalDropdown();
  // RTL Language Direction Switcher
  initRtlToggle();
  // Blog Horizontal Carousel Controls
  initBlogCarousels();
});

/* Footer Mobile Accordion Controller */
function initFooterAccordion() {
  const footerHeaders = document.querySelectorAll('.footer-column h4, .footer-col h4, .footer-widget h4');
  footerHeaders.forEach(header => {
    header.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const parent = header.closest('.footer-column, .footer-col, .footer-widget');
        if (parent) {
          parent.classList.toggle('active');
        }
      }
    });
  });
}

/* Auto Wrap Tables in Responsive Scroll Container */
function initResponsiveTables() {
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    const parent = table.parentElement;
    if (!parent.classList.contains('comparison-table-wrapper') && 
        !parent.classList.contains('quote-table-wrapper') && 
        !parent.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

/* FAQ Accordion Controller */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* Quick Search Trigger Modal */
function initSearchModal() {
  const searchBtns = document.querySelectorAll('.search-trigger-btn');
  searchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('globalSearchModal');
    });
  });
}

/* Theme Manager */
function initTheme() {
  const savedTheme = localStorage.getItem('insuredrive_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('insuredrive_theme', newTheme);
      updateThemeIcons(newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  });
}

function updateThemeIcons(theme) {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(btn => {
    btn.innerHTML = theme === 'dark' 
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
  });
}

/* Mobile Navigation Drawer & Sidebar Controller */
function initMobileNav() {
  const toggleBtns = document.querySelectorAll('.mobile-nav-toggle');
  let navLinks = document.querySelector('.nav-links, .mobile-drawer-menu');
  const sidebar = document.querySelector('.sidebar');
  const desktopNav = document.querySelector('.desktop-nav, .nav-links-lux');

  // If mobile drawer menu doesn't exist yet, dynamically build it from desktopNav
  if (!navLinks && desktopNav) {
    navLinks = document.createElement('ul');
    navLinks.className = 'nav-links mobile-drawer-menu';
    
    // Copy links from desktop nav
    const links = desktopNav.querySelectorAll('a');
    links.forEach(a => {
      const li = document.createElement('li');
      const clone = a.cloneNode(true);
      li.appendChild(clone);
      navLinks.appendChild(li);
    });

    // Add CTAs
    const ctaLi = document.createElement('li');
    ctaLi.className = 'mobile-drawer-ctas';
    ctaLi.style.cssText = 'margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border, #E2E8F0); display: flex; flex-direction: column; gap: 10px;';
    
    // Resolve relative path for login/quote links
    const isInPages = window.location.pathname.includes('/pages/');
    const loginUrl = isInPages ? 'login.html' : 'pages/login.html';
    const quoteUrl = isInPages ? 'quote.html' : 'pages/quote.html';

    ctaLi.innerHTML = `
      <a href="${loginUrl}" class="btn btn-secondary w-full text-center" style="border-radius:10px; padding:10px;">Login</a>
      <a href="${quoteUrl}" class="btn btn-accent w-full text-center" style="border-radius:10px; padding:10px; background:#2563EB; color:#fff;">Get a Quote</a>
    `;
    navLinks.appendChild(ctaLi);
    document.body.appendChild(navLinks);
  }
  
  if (!navLinks && !sidebar) return;

  // Create backdrop overlay if missing
  let overlay = document.querySelector('.mobile-nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
  }

  // Ensure header inside nav-links if present
  if (navLinks && !navLinks.querySelector('.mobile-drawer-header')) {
    const headerLi = document.createElement('li');
    headerLi.className = 'mobile-drawer-header';
    headerLi.innerHTML = `
      <div class="brand-logo" style="font-size:1.05rem; gap:6px; font-weight:800; display:flex; align-items:center; color:var(--text-primary, #0F172A);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z"></path>
          <path d="M12 8v8M8 12h8" stroke-linecap="round"></path>
        </svg>
        Insure<span class="accent" style="color:#2563EB">Drive</span>
      </div>
      <button class="mobile-nav-close" aria-label="Close menu">✕</button>
    `;
    navLinks.insertBefore(headerLi, navLinks.firstChild);
  }

  // Ensure header inside sidebar if present
  if (sidebar && !sidebar.querySelector('.mobile-drawer-header')) {
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'mobile-drawer-header';
    sidebarHeader.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border, #E2E8F0); width: 100%;';
    sidebarHeader.innerHTML = `
      <div class="brand-logo" style="font-size:1.05rem; gap:6px; font-weight:700; display:flex; align-items:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z"></path>
          <path d="M12 8v8M8 12h8" stroke-linecap="round"></path>
        </svg>
        Insure<span class="accent" style="color:#2563EB">Drive</span>
      </div>
      <button class="mobile-nav-close" aria-label="Close sidebar">✕</button>
    `;
    sidebar.insertBefore(sidebarHeader, sidebar.firstChild);
  }

  function isAnyOpen() {
    return (navLinks && navLinks.classList.contains('active')) || (sidebar && sidebar.classList.contains('active'));
  }

  function openMenu() {
    if (navLinks) navLinks.classList.add('active');
    if (sidebar) sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAnyOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  });

  overlay.addEventListener('click', closeMenu);

  document.addEventListener('click', (e) => {
    if (isAnyOpen()) {
      const insideNav = navLinks && navLinks.contains(e.target);
      const insideSidebar = sidebar && sidebar.contains(e.target);
      const insideToggle = Array.from(toggleBtns).some(b => b.contains(e.target));
      if (!insideNav && !insideSidebar && !insideToggle) {
        closeMenu();
      }
    }
  });

  const closeBtns = document.querySelectorAll('.mobile-nav-close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeMenu);
  });

  const allDrawerLinks = document.querySelectorAll('.nav-links a, .sidebar a, .mobile-drawer-menu a');
  allDrawerLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* Highlight Active Page in Navbar & Sidebar */
function highlightActiveLink() {
  const fullPath = window.location.pathname.replace(/\/$/, '');
  let fileName = fullPath.split('/').pop() || 'index.html';
  if (!fileName || fileName === '') fileName = 'index.html';

  const isInDashboard = fullPath.includes('/dashboard/') || fullPath.includes('/admin/');

  const links = document.querySelectorAll('.nav-links a, .nav-links-lux a, .sidebar-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const cleanHref = href.split('#')[0].split('?')[0];
    const hrefFileName = cleanHref.split('/').pop() || 'index.html';

    if (isInDashboard) {
      if (link.classList.contains('sidebar-link') || href.includes('dashboard/') || href.includes('admin/')) {
        if (hrefFileName === fileName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    } else {
      if (hrefFileName === fileName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

/* Global Toast Notification System */
function showToast(message, type = 'success', duration = 3500) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'danger') icon = '✕';
  if (type === 'warning') icon = '⚠';
  if (type === 'info') icon = 'ℹ';

  toast.innerHTML = `<span style="font-weight: 800;">${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* Global Modal Dialog Handlers */
function openModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (backdrop) {
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const backdrop = modalId ? document.getElementById(modalId) : document.querySelector('.modal-backdrop.active');
  if (backdrop) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* Currency Formatter */
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/* Blog Interactive Category & Search Filter */
function initBlogFilter() {
  const catBtns = document.querySelectorAll('#blogCategoryTabs .blog-cat-btn');
  const articles = document.querySelectorAll('.blog-article-card');
  const featuredArticle = document.getElementById('featuredArticle');
  const searchInput = document.getElementById('blogSearchInput');
  const searchBtn = document.getElementById('blogSearchBtn');

  if (!catBtns.length && !articles.length) return;

  function filterArticles(category, searchQuery = '') {
    const query = searchQuery.toLowerCase().trim();

    articles.forEach(card => {
      const cardCategories = (card.getAttribute('data-category') || '').toLowerCase();
      const cardText = card.textContent.toLowerCase();

      const matchesCat = (category === 'all' || cardCategories.includes(category));
      const matchesSearch = (!query || cardText.includes(query));

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    if (featuredArticle) {
      if (category !== 'all' && category !== 'renewal') {
        featuredArticle.style.display = 'none';
      } else {
        const featText = featuredArticle.textContent.toLowerCase();
        if (!query || featText.includes(query)) {
          featuredArticle.style.display = 'grid';
        } else {
          featuredArticle.style.display = 'none';
        }
      }
    }
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => {
        b.classList.remove('active', 'btn-accent');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-accent');

      const cat = btn.getAttribute('data-category') || 'all';
      const query = searchInput ? searchInput.value : '';
      filterArticles(cat, query);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeBtn = document.querySelector('#blogCategoryTabs .blog-cat-btn.active');
      const cat = activeBtn ? (activeBtn.getAttribute('data-category') || 'all') : 'all';
      filterArticles(cat, searchInput.value);
    });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeBtn = document.querySelector('#blogCategoryTabs .blog-cat-btn.active');
      const cat = activeBtn ? (activeBtn.getAttribute('data-category') || 'all') : 'all';
      filterArticles(cat, searchInput.value);
    });
  }
}

/* Portals Popover Menu Controller (Image 2) */
function initPortalDropdown() {
  updatePortalMenu();

  const profileBtns = document.querySelectorAll('.profile-menu-toggle, [data-portal-toggle]');
  
  profileBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = btn.closest('.portal-dropdown-wrapper') || btn.parentElement;
      const dropdown = wrapper ? wrapper.querySelector('.portal-dropdown') : document.querySelector('.portal-dropdown');
      
      if (dropdown) {
        const isActive = dropdown.classList.contains('active');
        // Close any other open dropdowns
        document.querySelectorAll('.portal-dropdown.active').forEach(d => d.classList.remove('active'));
        if (!isActive) {
          dropdown.classList.add('active');
        }
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.portal-dropdown-wrapper') && !e.target.closest('.profile-menu-toggle')) {
      document.querySelectorAll('.portal-dropdown.active').forEach(d => d.classList.remove('active'));
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.portal-dropdown.active').forEach(d => d.classList.remove('active'));
    }
  });
}

function updatePortalMenu() {
  const currentUserStr = localStorage.getItem('insuredrive_user');
  let currentUser = null;
  try {
    if (currentUserStr) {
      currentUser = JSON.parse(currentUserStr);
    }
  } catch (e) {}

  const isLoggedIn = !!(currentUser && (currentUser.email || currentUser.name));
  const isAdmin = currentUser && currentUser.role === 'admin';

  const isPagesDir = window.location.pathname.includes('/pages/');
  const isDashboardDir = window.location.pathname.includes('/dashboard/');
  const isAdminDir = window.location.pathname.includes('/admin/');

  let loginPath = isPagesDir ? 'login.html' : 'pages/login.html';
  let signupPath = isPagesDir ? 'quote.html' : 'pages/quote.html';
  let userDashboardPath = isPagesDir ? '../dashboard/index.html' : 'dashboard/index.html';
  let adminDashboardPath = isPagesDir ? '../admin/index.html' : 'admin/index.html';

  if (isDashboardDir || isAdminDir) {
    loginPath = '../pages/login.html';
    signupPath = '../pages/quote.html';
    userDashboardPath = '../dashboard/index.html';
    adminDashboardPath = '../admin/index.html';
  }

  const dropdownHeaders = document.querySelectorAll('.portal-dropdown-header');
  dropdownHeaders.forEach(header => {
    const subtitle = header.querySelector('.portal-dropdown-subtitle');
    if (subtitle) {
      subtitle.textContent = isLoggedIn 
        ? `Logged in: ${currentUser.name || currentUser.email || 'Customer'}` 
        : 'Customer & Management Access';
    }
  });

  const dropdowns = document.querySelectorAll('.portal-dropdown');
  dropdowns.forEach(dropdown => {
    const menuList = dropdown.querySelector('.portal-menu-list');
    if (!menuList) return;

    if (isLoggedIn) {
      let menuHTML = `
        <li class="portal-menu-item">
          <a href="${userDashboardPath}">
            <span class="portal-menu-icon">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            User Dashboard
          </a>
        </li>
      `;

      if (isAdmin) {
        menuHTML += `
          <li class="portal-menu-item">
            <a href="${adminDashboardPath}">
              <span class="portal-menu-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              Admin Dashboard
            </a>
          </li>
        `;
      }

      menuHTML += `
        <li class="portal-menu-item">
          <a href="#" class="logout-link" onclick="event.preventDefault(); window.logoutPortal();">
            <span class="portal-menu-icon">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            Logout
          </a>
        </li>
      `;

      menuList.innerHTML = menuHTML;
    } else {
      menuList.innerHTML = `
        <li class="portal-menu-item">
          <a href="${loginPath}">
            <span class="portal-menu-icon">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            </span>
            Login
          </a>
        </li>
        <li class="portal-menu-item">
          <a href="${signupPath}">
            <span class="portal-menu-icon">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
            </span>
            Signup
          </a>
        </li>
      `;
    }
  });
}

window.logoutPortal = function logoutPortal() {
  localStorage.removeItem('insuredrive_user');
  if (typeof showToast === 'function') {
    showToast('Logged out successfully!', 'info');
  }
  setTimeout(() => {
    const isPagesDir = window.location.pathname.includes('/pages/');
    const isSubDir = window.location.pathname.includes('/dashboard/') || window.location.pathname.includes('/admin/');
    window.location.href = isPagesDir ? 'login.html' : (isSubDir ? '../pages/login.html' : 'pages/login.html');
  }, 400);
};

/* RTL Toggle Controller */
function initRtlToggle() {
  const rtlBtns = document.querySelectorAll('.btn-rtl-pill, .rtl-toggle');
  const isRtl = localStorage.getItem('insuredrive_rtl') === 'true';

  if (isRtl) {
    document.documentElement.setAttribute('dir', 'rtl');
    rtlBtns.forEach(b => b.classList.add('active'));
  }

  rtlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir');
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      
      if (newDir === 'rtl') {
        document.documentElement.setAttribute('dir', 'rtl');
        localStorage.setItem('insuredrive_rtl', 'true');
        rtlBtns.forEach(b => b.classList.add('active'));
        showToast('Switched to RTL mode', 'info');
      } else {
        document.documentElement.removeAttribute('dir');
        localStorage.setItem('insuredrive_rtl', 'false');
        rtlBtns.forEach(b => b.classList.remove('active'));
        showToast('Switched to LTR mode', 'info');
      }
    });
  });
}

/* Blog Horizontal Carousel Controller */
function initBlogCarousels() {
  const prevBtns = document.querySelectorAll('.carousel-arrow-btn.prev-btn');
  const nextBtns = document.querySelectorAll('.carousel-arrow-btn.next-btn');

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      if (section) {
        const track = section.querySelector('.blog-carousel-track, .blog-grid, #blogArticlesGrid');
        if (track) {
          const scrollAmount = window.innerWidth <= 768 ? 290 : 360;
          track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      if (section) {
        const track = section.querySelector('.blog-carousel-track, .blog-grid, #blogArticlesGrid');
        if (track) {
          const scrollAmount = window.innerWidth <= 768 ? 290 : 360;
          track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    });
  });
}


