const API = {
  async request(url, options = {}) {
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    if (options.body && !(options.body instanceof FormData)) {
      options.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      delete defaults.headers['Content-Type'];
    }

    const config = { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  get(url) { return this.request(url); },
  post(url, body) { return this.request(url, { method: 'POST', body }); },
  put(url, body) { return this.request(url, { method: 'PUT', body }); },
  patch(url, body) { return this.request(url, { method: 'PATCH', body }); },
  delete(url) { return this.request(url, { method: 'DELETE' }); },

  async upload(url, formData, method = 'POST') {
    return this.request(url, { method, body: formData, headers: {} });
  }
};

const Auth = {
  user: null,

  async check() {
    try {
      const data = await API.get('/api/auth/me');
      this.user = data.user;
      return data.user;
    } catch {
      this.user = null;
      return null;
    }
  },

  async login(email, password) {
    const data = await API.post('/api/auth/login', { email, password });
    this.user = data.user;
    return data.user;
  },

  async signup(userData) {
    const data = await API.post('/api/auth/signup', userData);
    this.user = data.user;
    return data.user;
  },

  async logout() {
    await API.post('/api/auth/logout');
    this.user = null;
    window.location.href = '/';
  },

  getRole() {
    return this.user ? this.user.role : null;
  }
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';
  toast.className = `fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getBadgeClass(type) {
  return `badge badge-${type}`;
}

function renderPagination(pagination, onPageClick) {
  if (!pagination || pagination.pages <= 1) return '';
  let html = '<div class="flex justify-center gap-2 mt-6">';
  for (let i = 1; i <= pagination.pages; i++) {
    const active = i === pagination.page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border';
    html += `<button onclick="${onPageClick}(${i})" class="px-3 py-1 rounded-lg ${active} hover:bg-blue-500 hover:text-white transition" aria-label="Page ${i}">${i}</button>`;
  }
  html += '</div>';
  return html;
}

function showModal(title, content, actions) {
  const existing = document.getElementById('modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 animate-fade-in">
      <h2 class="text-xl font-bold mb-4">${title}</h2>
      <div class="mb-6">${content}</div>
      <div class="flex justify-end gap-3">
        <button onclick="document.getElementById('modal-overlay').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg">Close</button>
        ${actions || ''}
      </div>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function renderNavbar() {
  const user = Auth.user;
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  let html = '';

  if (!user) {
    html = `
      <a href="/opportunities.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Browse Opportunities</a>
      <a href="#" onclick="showLoginModal()" class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition">Log In</a>
      <a href="#" onclick="showSignupModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Sign Up</a>
    `;
  } else {
    html = `<a href="/opportunities.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Browse</a>`;

    if (user.role === 'user') {
      html += `<a href="/dashboard.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</a>`;
      html += `<a href="/my-applications.html" class="text-gray-600 hover:text-blue-600 font-medium transition">My Applications</a>`;
    } else if (user.role === 'organizer') {
      html += `<a href="/organizer-dashboard.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</a>`;
      html += `<a href="/manage-opportunities.html" class="text-gray-600 hover:text-blue-600 font-medium transition">My Opportunities</a>`;
      html += `<a href="/create-opportunity.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Post Opportunity</a>`;
    } else if (user.role === 'admin') {
      html += `<a href="/admin-dashboard.html" class="text-gray-600 hover:text-blue-600 font-medium transition">Admin Panel</a>`;
    }

    html += `
      <div class="relative">
        <button onclick="toggleUserMenu(event)" class="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition" aria-expanded="false" aria-haspopup="true">
          <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">${user.name.charAt(0).toUpperCase()}</span>
          ${user.name.split(' ')[0]}
        </button>
        <div id="user-menu" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border hidden z-50">
          <div class="p-3 border-b">
            <p class="text-sm font-semibold">${user.name}</p>
            <p class="text-xs text-gray-500">${user.email}</p>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">${user.role}</span>
          </div>
          <button onclick="Auth.logout()" class="w-full text-left p-3 text-red-600 hover:bg-red-50 text-sm font-medium">Log Out</button>
        </div>
      </div>
    `;
  }

  navLinks.innerHTML = html;
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (menu && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

function showLoginModal() {
  showModal('Log In', `
    <form id="login-form" onsubmit="handleLogin(event)">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="login-email">Email</label>
          <input type="email" id="login-email" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="you@example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="login-password">Password</label>
          <input type="password" id="login-password" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••">
        </div>
      </div>
    </form>
  `, `
    <button onclick="document.getElementById('login-form').dispatchEvent(new Event('submit', {cancelable:true}))" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Log In</button>
  `);
}

function showSignupModal() {
  showModal('Create Account', `
    <form id="signup-form" onsubmit="handleSignup(event)">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-name">Full Name</label>
          <input type="text" id="signup-name" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-email">Email</label>
          <input type="email" id="signup-email" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-password">Password</label>
          <input type="password" id="signup-password" required minlength="6" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-role">I am a</label>
          <select id="signup-role" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" onchange="toggleOrgFields()">
            <option value="user">Job Seeker</option>
            <option value="organizer">Employer / NGO</option>
          </select>
        </div>
        <div id="org-fields" class="hidden space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-org">Organization Name</label>
            <input type="text" id="signup-org" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-contact">Contact Person</label>
            <input type="text" id="signup-contact" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="signup-disability">Accessibility Notes (Optional)</label>
          <input type="text" id="signup-disability" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Screen reader user">
        </div>
      </div>
    </form>
  `, `
    <button onclick="document.getElementById('signup-form').dispatchEvent(new Event('submit', {cancelable:true}))" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Create Account</button>
  `);
}

function toggleOrgFields() {
  const role = document.getElementById('signup-role').value;
  document.getElementById('org-fields').classList.toggle('hidden', role !== 'organizer');
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    await Auth.login(
      document.getElementById('login-email').value,
      document.getElementById('login-password').value
    );
    document.getElementById('modal-overlay')?.remove();
    showToast('Logged in successfully!', 'success');
    renderNavbar();
    if (typeof initPage === 'function') initPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const role = document.getElementById('signup-role').value;
  const userData = {
    name: document.getElementById('signup-name').value,
    email: document.getElementById('signup-email').value,
    password: document.getElementById('signup-password').value,
    role,
    disability_text: document.getElementById('signup-disability').value
  };

  if (role === 'organizer') {
    userData.org_name = document.getElementById('signup-org').value;
    userData.contact_person = document.getElementById('signup-contact').value;
  }

  try {
    await Auth.signup(userData);
    document.getElementById('modal-overlay')?.remove();
    showToast('Account created successfully!', 'success');
    renderNavbar();
    if (typeof initPage === 'function') initPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function initApp() {
  await Auth.check();
  renderNavbar();
  if (typeof initPage === 'function') initPage();
}
