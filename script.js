document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // App Config & Session Simulation
    // ==========================================
    
    // Key used for localStorage
    const SESSION_KEY = 'cmcs_sim_user_role';

    // Role-to-Dashboard mapping
    const DASHBOARDS = {
        student: 'student_dashboard.html',
        lecturer: 'lecturer_hub.html',
        admin: 'admin_console.html'
    };

    // Current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'login.html';

    // Hides login screen content if already "logged in" and on login page
    function checkSessionOnLogin() {
        const savedRole = localStorage.getItem(SESSION_KEY);
        if (currentPage === 'login.html' && savedRole && DASHBOARDS[savedRole]) {
            // Redirect directly to their dashboard
            window.location.href = DASHBOARDS[savedRole];
        }
    }

    // Protects role-specific pages - very basic simulation
    function checkPageAccess() {
        const savedRole = localStorage.getItem(SESSION_KEY);
        if (currentPage === 'login.html') return; // login is always accessible

        // If not logged in at all, force redirect to login
        if (!savedRole) {
            console.warn("Unauthorized access simulation. Redirecting to login.");
            window.location.href = 'login.html';
            return;
        }

        // Basic check: is this a student page and are they a student? etc.
        // This prototype just checks dashboards for simplicity.
        // A full app would have proper route guarding.
        if (DASHBOARDS[savedRole] !== currentPage && !document.querySelector('.app-container').classList.contains('sub-screen-container')) {
            console.log(`Checking dashboard access for role: ${savedRole}. Current: ${currentPage}. Expected: ${DASHBOARDS[savedRole]}`);
            // If they are on a dashboard that doesn't match their role, redirect them
            if(Object.values(DASHBOARDS).includes(currentPage)) {
                 window.location.href = DASHBOARDS[savedRole];
            }
        }
    }

    // ==========================================
    // UI COMPONENT INJECTORS & HIGHLIGHTS
    // ==========================================

    // HTML templates for bottom navigation bars (Icons reuse Bootstrap Icons)
    const navTemplates = {
        student: [
            { id: 'student_dashboard.html', icon: 'bi-grid-1x2', label: 'Home' },
            { id: 'attendance_records.html', icon: 'bi-clipboard-check', label: 'Attendance' },
            { id: '#', icon: 'bi-calendar3', label: 'Schedule' }, // Stub
            { id: '#', icon: 'bi-bell', label: 'Alerts', badge: 8 }, // Stub
            { id: '#', icon: 'bi-person', label: 'Profile' } // Stub
        ],
        lecturer: [
            { id: 'lecturer_hub.html', icon: 'bi-grid-1x2', label: 'Home' },
            { id: 'mark_attendance.html', icon: 'bi-calendar3', label: 'Schedule' }, // Simulated connection
            { id: '#', icon: 'bi-clipboard-check', label: 'Marking' }, // Stub
            { id: '#', icon: 'bi-megaphone', label: 'Broadcast' } // Stub
        ]
    };

    // Injects the specified nav template and highlights active item
    function injectAndHighlightNav() {
        const studentNavs = document.querySelectorAll('.bottom-nav.student-nav');
        const lecturerNavs = document.querySelectorAll('.bottom-nav.lecturer-nav');

        function generateNavHtml(items) {
            return items.map(item => {
                let badgeHtml = item.badge ? `<div class="alert-icon-wrapper has-badge"><i class="bi ${item.icon}"></i><span class="badge">${item.badge}</span></div>` : `<i class="bi ${item.icon}"></i>`;
                let activeClass = item.id === currentPage ? 'active' : '';
                return `
                    <a href="${item.id}" class="nav-item ${activeClass}">
                        ${badgeHtml}
                        <span>${item.label}</span>
                    </a>
                `;
            }).join('');
        }

        studentNavs.forEach(nav => {
            if(currentPage === DASHBOARDS.student || currentPage === 'attendance_records.html') {
                 nav.innerHTML = generateNavHtml(navTemplates.student);
            }
        });

        lecturerNavs.forEach(nav => {
             if(currentPage === DASHBOARDS.lecturer || currentPage === 'mark_attendance.html') {
                nav.innerHTML = generateNavHtml(navTemplates.lecturer);
             }
        });
    }

    // ==========================================
    // EVENT LISTENERS & INTERACTIONS
    // ==========================================

    function attachListeners() {
        // 1. Password Toggle
        const passToggles = document.querySelectorAll('.password-toggle');
        passToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('bi-eye');
                    this.classList.add('bi-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('bi-eye-slash');
                    this.classList.add('bi-eye');
                }
            });
        });

        // 2. Role Selector (Login Screen)
        const roleBtns = document.querySelectorAll('.role-btn');
        const emailInput = document.getElementById('email');
        if(emailInput) {
            roleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // UI update
                    roleBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Simulate pre-filling data from image_1.png
                    emailInput.value = this.dataset.email;
                });
            });
        }

        // 3. Login Action (Simulated)
        const loginForm = document.querySelector('.login-form');
        if(loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault(); // Don't reload
                
                // Find active simulated role
                const activeRoleBtn = document.querySelector('.role-btn.active');
                const role = activeRoleBtn ? activeRoleBtn.dataset.role : null;

                if (role && DASHBOARDS[role]) {
                    // Persist session simulation
                    localStorage.setItem(SESSION_KEY, role);
                    // Perform redirection
                    window.location.href = DASHBOARDS[role];
                } else {
                    console.error("No valid role selected for login simulation.");
                }
            });
        }

        // 4. Logout Action (Simulated)
        const logoutTriggers = document.querySelectorAll('.logout-trigger');
        logoutTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                // Clear simulated session
                localStorage.removeItem(SESSION_KEY);
                // Go back to login
                window.location.href = 'login.html';
            });
        });

        // 5. Roster Status Buttons (Mark Attendance Page)
        const studentItems = document.querySelectorAll('.student-item');
        studentItems.forEach(item => {
            const presentBtn = item.querySelector('.status-btn.present');
            const absentBtn = item.querySelector('.status-btn.absent');
            const studDetails = item.querySelector('.stud-details');

            // Reset status-specific classes
            function clearMarkedState() {
                item.classList.remove('present-marked', 'absent-marked');
                presentBtn.classList.remove('active');
                absentBtn.classList.remove('active');
                studDetails.querySelectorAll('.marked-tag').forEach(tag => tag.remove());
            }

            presentBtn.addEventListener('click', function() {
                clearMarkedState();
                item.classList.add('present-marked');
                this.classList.add('active');
                studDetails.insertAdjacentHTML('beforeend', '<span class="marked-tag present"><i class="bi bi-check"></i> Present</span>');
            });

            absentBtn.addEventListener('click', function() {
                clearMarkedState();
                item.classList.add('absent-marked');
                this.classList.add('active');
                studDetails.insertAdjacentHTML('beforeend', '<span class="marked-tag absent"><i class="bi bi-x"></i> Absent</span>');
            });
        });

        // 6. Generic Interactivity: Stub buttons show console log
        const allStubs = document.querySelectorAll('.qa-btnStub, .view-all, .filter-btn, .btn-secondary, .load-more, .close-alert');
        allStubs.forEach(stub => {
            stub.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent standard behavior
                console.log(`Prototype Note: "${this.textContent.trim() || 'Icon Button'}" interaction not yet implemented in simulation.`);
                
                // If it's the close-alert button, hide the overlap alert box
                if(this.classList.contains('close-alert')) {
                    this.closest('.alert-box').style.display = 'none';
                }
            });
        });

        // Add visual click effect to buttons for native mobile feel
        const allButtons = document.querySelectorAll('button, .qa-btn, .qa-block-btn, .pill, .nav-item');
        allButtons.forEach(btn => {
            btn.addEventListener('mousedown', function() { this.style.opacity = '0.7'; });
            btn.addEventListener('mouseup', function() { this.style.opacity = '1'; });
            btn.addEventListener('mouseleave', function() { this.style.opacity = '1'; });
        });
    }

    // ==========================================
    // INITIALIZATION RUN
    // ==========================================
    checkSessionOnLogin();    // 1. Skip login if already "logged in"
    checkPageAccess();       // 2. basic route guarding simulation
    injectAndHighlightNav(); // 3. Build & update bottom navigation
    attachListeners();        // 4. Attach interactions
});