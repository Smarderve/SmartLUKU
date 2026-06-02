// Sidebar Navigation Component

document.addEventListener('DOMContentLoaded', function() {
    // Setup sidebar if it exists
    const sidebar = document.getElementById('mainSidebar');
    if (!sidebar) return;

    // Highlight current page
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('[data-page]').forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active', 'bg-gray-800', 'text-white', 'border-l-4', 'border-primary');
            item.classList.remove('text-gray-300', 'hover:bg-gray-800');
        }
    });

    // Mobile menu toggle (if needed in future)
    const toggleBtn = document.getElementById('mobileMenuToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-hidden');
        });
    }
});

// Helper function to create sidebar HTML
function createSidebar(userFullName, userMeterNumber, userInitial) {
    return `
        <div id="mainSidebar" class="sidebar fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto z-30">
            <!-- Logo Section -->
            <div class="bg-primary p-6 border-b border-gray-800">
                <a href="dashboard.html" class="flex items-center gap-3 hover:opacity-80 transition">
                    <i class="fas fa-bolt text-accent text-2xl"></i>
                    <div>
                        <div class="text-lg font-bold">SmartLUKU</div>
                        <div class="text-xs text-gray-400">TANESCO Portal</div>
                    </div>
                </a>
            </div>

            <!-- User Info Section -->
            <div class="bg-gray-800 p-4 border-b border-gray-700">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold">
                        <span>${userInitial}</span>
                    </div>
                    <div class="text-xs">
                        <p class="font-semibold text-sm">${userFullName}</p>
                        <p class="text-gray-400 font-mono">${userMeterNumber}</p>
                    </div>
                </div>
            </div>

            <!-- Main Navigation Menu -->
            <nav class="p-4 space-y-2">
                <a href="dashboard.html" data-page="dashboard.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-home w-5"></i>
                    <span>Dashboard</span>
                </a>

                <a href="payment.html" data-page="payment.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-credit-card w-5"></i>
                    <span>Buy Units</span>
                </a>

                <a href="monitoring.html" data-page="monitoring.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-chart-line w-5"></i>
                    <span>Monitor Usage</span>
                </a>

                <a href="history.html" data-page="history.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-receipt w-5"></i>
                    <span>Transactions</span>
                </a>

                <a href="analytics.html" data-page="analytics.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-chart-bar w-5"></i>
                    <span>Analytics</span>
                </a>

                <!-- Divider -->
                <div class="border-t border-gray-700 my-4"></div>

                <a href="settings.html" data-page="settings.html" class="menu-item flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition">
                    <i class="fas fa-cog w-5"></i>
                    <span>Settings</span>
                </a>

                <button id="sidebarLogoutBtn" class="menu-item w-full text-left flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:text-white hover:bg-red-900 transition">
                    <i class="fas fa-sign-out-alt w-5"></i>
                    <span>Logout</span>
                </button>
            </nav>

            <!-- Footer -->
            <div class="absolute bottom-0 left-0 right-0 bg-gray-800 p-4 border-t border-gray-700 text-xs text-gray-400">
                <p>© 2026 SmartLUKU</p>
                <p>TANESCO Official Platform</p>
            </div>
        </div>
    `;
}

window.createSidebar = createSidebar;
