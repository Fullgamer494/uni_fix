document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:7070';

    // --- FUNCIÓN AUXILIAR PARA MANEJAR LA TECLA "ENTER" ---
    const handleEnterKeySubmission = (formId, submitButtonSelector) => {
        const form = document.getElementById(formId);
        if (!form) return;
        const submitButton = form.querySelector(submitButtonSelector);
        if (!submitButton) return;
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    submitButton.click();
                }
            });
        });
    };

    const populateDropdowns = () => {
        const reportTypeSelect = document.getElementById('report-type');
        const buildingSelect = document.getElementById('report-building');
        if (!reportTypeSelect || !buildingSelect) return;
        const reportTypes = ['Inmobiliario', 'Baños', 'Aire Acondicionados', 'Infraestructura'];
        const buildings = ['UD1', 'UD3', 'UD2', 'UD4', 'Biblioteca', 'Cidter', 'LT2', 'Cafeteria'];
        reportTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        reportTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase().replace(/ /g, '-');
            option.textContent = type;
            reportTypeSelect.appendChild(option);
        });
        buildingSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building;
            option.textContent = building;
            buildingSelect.appendChild(option);
        });
    };

    const setMaxDateToToday = () => {
        const dateInput = document.getElementById('report-date');
        if (!dateInput) return;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const maxDate = `${year}-${month}-${day}`;
        dateInput.max = maxDate;
        dateInput.value = maxDate;
    };

    const roleSelectView = document.getElementById('view-role-select');
    if (roleSelectView) {
        roleSelectView.querySelectorAll('.role-card[data-role]').forEach(button => {
            button.addEventListener('click', () => {
                const role = button.dataset.role;
                localStorage.setItem('currentUserType', role);
                window.location.href = '../pages/inciosesion.html';
            });
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const savedEmail = localStorage.getItem('savedUserEmail');
        if (savedEmail) {
            document.getElementById('login-email').value = savedEmail;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem('savedUserEmail', email);
                    localStorage.setItem('currentUserName', result.name + ' ' + result.lastname);
                    localStorage.setItem('currentUserId', result.id); 

                    if (result.type === 'admin') {
                        localStorage.setItem('currentUserType', 'admin');
                        window.location.href = '../pages/tableroinfraestructura.html';
                    } else if (result.type === 'estudiante' || result.type === 'docente') {
                        localStorage.setItem('currentUserType', 'estudiante');
                        window.location.href = '../pages/eleccionusuario.html';
                    }
                } else {
                    alert(result.error || 'Credenciales inválidas.');
                }
            } catch (error) {
                alert('Error al conectar con el servidor.');
            }
        });
        handleEnterKeySubmission('login-form', 'button[type="submit"]');
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const lastname = document.getElementById('register-lastname').value;
            const email = document.getElementById('register-email').value;
            const matricula = document.getElementById('register-matricula').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }
            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, lastname, email, matricula, password })
                });
                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem('currentUserName', `${name} ${lastname}`);
                    alert('Registro exitoso. Serás redirigido al inicio de sesión.');
                    window.location.href = '../pages/inciosesion.html';
                } else {
                    alert(result.error || 'No se pudo registrar.');
                }
            } catch (error) {
                alert('Error al conectar con el servidor.');
                console.error("Error de red:", error);
            }
        });
        handleEnterKeySubmission('register-form', 'button[type="submit"]');
    }

    const userReportsView = document.getElementById('view-user-reports-status');
    if (userReportsView) {
        const userId = localStorage.getItem('currentUserId');
        const tableBody = document.getElementById('user-reports-table-body');
        const getStatusClass = (status) => {
            const sanitizedStatus = (status || '').toLowerCase().replace(' ', '-');
            if (sanitizedStatus === 'resuelto') return 'status-resuelto';
            if (sanitizedStatus === 'en-proceso') return 'status-en-proceso';
            if (sanitizedStatus === 'pendiente') return 'status-pendiente';
            return '';
        };
        const loadUserReports = async () => {
            if (!userId) {
                tableBody.innerHTML = `<tr><td colspan="4">No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.</td></tr>`;
                return;
            }
            tableBody.innerHTML = `<tr><td colspan="4">Cargando reportes...</td></tr>`;
            try {
                const response = await fetch(`${API_BASE}/api/reports/user/${userId}`);
                const reports = await response.json();
                tableBody.innerHTML = '';
                if (reports.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">Aún no has creado ningún reporte.</td></tr>`;
                    return;
                }
                reports.forEach(report => {
                    const row = document.createElement('tr');
                    const statusClass = getStatusClass(report.status);
                    row.innerHTML = `
                        <td>${report.name}</td>
                        <td>${new Date(report.date).toLocaleDateString()}</td>
                        <td>${report.location}</td>
                        <td><span class="status-tag ${statusClass}">${report.status}</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error al cargar los reportes del usuario:', error);
                tableBody.innerHTML = `<tr><td colspan="4">No se pudieron cargar tus reportes. Intenta de nuevo más tarde.</td></tr>`;
            }
        };
        loadUserReports();
    }

    const userChoiceView = document.getElementById('view-user-choice');
    if (userChoiceView) {
        const userName = localStorage.getItem('currentUserName') || 'Usuario';
        document.getElementById('user-choice-welcome').textContent = `Bienvenido, ${userName}`;
    }

    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        populateDropdowns();
        setMaxDateToToday();
        const userName = localStorage.getItem('currentUserName') || '';
        document.getElementById('report-user').value = userName;
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // ✅ CORRECCIÓN FINAL RESTAURADA: Se obtiene y se envía el userId.
            const userId = localStorage.getItem('currentUserId');
            if (!userId) {
                alert('Error: No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.');
                return;
            }
            const formData = {
                name: document.getElementById('report-name').value,
                description: document.getElementById('report-description').value,
                category: document.getElementById('report-type').value,
                building: document.getElementById('report-building').value,
                location: document.getElementById('report-location').value,
                date: document.getElementById('report-date').value,
                userName: userName,
                userId: userId // Se envía el ID del usuario
            };
            try {
                const response = await fetch(`${API_BASE}/api/reports`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok) {
                    window.location.href = '../pages/reporteexitoso.html';
                } else {
                    alert(result.message || result.error || 'No se pudo enviar el reporte.');
                }
            } catch (error) {
                console.error("Error al enviar reporte:", error);
                alert('Error de conexión al enviar el reporte.');
            }
        });
    }

    const successView = document.getElementById('view-report-success');
    if (successView) {
        setTimeout(() => {
            window.location.href = '../pages/eleccionusuario.html';
        }, 4000);
    }
    
    // ✅ --- BLOQUE DE GESTIÓN DE REPORTES COMPLETAMENTE NUEVO Y FUNCIONAL ---
    const infraManageView = document.getElementById('view-infra-manage-reports');
    if (infraManageView) {
        const tableBody = document.getElementById('infra-reports-table-body');
        const searchInput = document.getElementById('infra-search-input');
        const columnFilterMenu = document.getElementById('column-filter-menu');

        const updateReportStatus = async (reportId, newStatus) => {
            try {
                const response = await fetch(`${API_BASE}/api/reports/${reportId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) throw new Error('El servidor no pudo actualizar el estatus.');
                return true;
            } catch (error) {
                console.error("Error al actualizar estatus:", error);
                alert("No se pudo actualizar el estatus del reporte.");
                return false;
            }
        };

        const loadAllReports = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/reports`);
                const reports = await response.json();
                tableBody.innerHTML = '';
                if (reports.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay reportes para mostrar.</td></tr>`;
                    return;
                }
                reports.forEach(report => {
                    const row = document.createElement('tr');
                    const statusOptions = ['Pendiente', 'En Proceso', 'Resuelto'];
                    const statusSelect = statusOptions.map(option => 
                        `<option value="${option}" ${report.status === option ? 'selected' : ''}>${option}</option>`
                    ).join('');
                    row.innerHTML = `
                        <td>${report.id}</td>
                        <td>${report.name}</td>
                        <td>${report.userName}</td>
                        <td>${report.location}</td>
                        <td>${new Date(report.date).toLocaleDateString()}</td>
                        <td>${report.description}</td>
                        <td><select class="status-select" data-report-id="${report.id}">${statusSelect}</select></td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (err) {
                console.error('Error al cargar reportes:', err);
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Error al cargar los reportes.</td></tr>`;
            }
        };

        tableBody.addEventListener('change', async (e) => {
            if (e.target.classList.contains('status-select')) {
                const selectElement = e.target;
                const reportId = selectElement.dataset.reportId;
                const newStatus = selectElement.value;
                const success = await updateReportStatus(reportId, newStatus);
                if (success) {
                    selectElement.classList.add('changed');
                    setTimeout(() => selectElement.classList.remove('changed'), 1500);
                } else {
                    loadAllReports(); // Recarga si falla para revertir el cambio
                }
            }
        });

        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            tableBody.querySelectorAll('tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        });

        columnFilterMenu.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const column = e.target.dataset.column;
                const isVisible = e.target.checked;
                const table = document.getElementById('infra-reports-table');
                table.querySelectorAll(`th:nth-child(${parseInt(column) + 1}), td:nth-child(${parseInt(column) + 1})`).forEach(cell => {
                    cell.style.display = isVisible ? '' : 'none';
                });
            }
        });
        
        loadAllReports();
    }
    
    const infraStatsView = document.getElementById('view-infra-stats');
    if (infraStatsView) {
        // ... (código de estadísticas sin cambios) ...
    }

    document.querySelectorAll('.logout-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUserType');
            localStorage.removeItem('currentUserName');
            localStorage.removeItem('currentUserId');
            window.location.href = '../pages/Despedida.html';
        });
    });
});