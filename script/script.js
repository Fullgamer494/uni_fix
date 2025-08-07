document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:7070';

    const handleApiResponse = async (response) => {
        const contentType = response.headers.get('content-type');
        
        try {
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                
                // Si el backend devuelve la nueva estructura JSON
                if (result.hasOwnProperty('success')) {
                    return {
                        success: result.success,
                        data: result.data,
                        message: result.message
                    };
                }
                
                // Compatibilidad con respuestas JSON simples (sin estructura)
                return { 
                    success: response.ok, 
                    data: result,
                    message: response.ok ? 'Operación exitosa' : 'Error en la operación'
                };
            } else {
                const text = await response.text();
                console.error('Respuesta no-JSON recibida:', text);
                return { 
                    success: false, 
                    data: null,
                    message: `Error del servidor (${response.status}): ${text}`
                };
            }
        } catch (e) {
            console.error('Error al procesar respuesta:', e);
            return {
                success: false,
                data: null,
                message: `Error al procesar respuesta: ${e.message}`
            };
        }
    };

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
        
        // Estructura de edificios categorizada
        const buildingCategories = [
            {
                category: 'Edificios académicos',
                buildings: [
                    { value: 'UD1', label: 'UD1' },
                    { value: 'UD2', label: 'UD2' },
                    { value: 'UD3', label: 'UD3' },
                    { value: 'UD4', label: 'UD4' }
                ]
            },
            {
                category: 'Servicios Académicos',
                buildings: [
                    { value: 'BIBLIOTECA', label: 'Biblioteca' },
                    { value: 'Cidter', label: 'Cidter' }
                ]
            },
            {
                category: 'Laboratorios',
                buildings: [
                    { value: 'lt2', label: 'LT2' }
                ]
            },
            {
                category: 'Servicios Generales',
                buildings: [
                    { value: 'Cafeteria', label: 'Cafetería' }
                ]
            }
        ];
        
        // Poblar tipos de reporte
        reportTypeSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        reportTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase().replace(/ /g, '-');
            option.textContent = type;
            reportTypeSelect.appendChild(option);
        });
        
        // Poblar edificios con categorías
        buildingSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        
        buildingCategories.forEach(categoryData => {
            // Crear grupo de opciones (optgroup)
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoryData.category;
            
            // Agregar edificios al grupo
            categoryData.buildings.forEach(building => {
                const option = document.createElement('option');
                option.value = building.value;
                option.textContent = building.label;
                optgroup.appendChild(option);
            });
            
            buildingSelect.appendChild(optgroup);
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

    // Selección de rol
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

    // Proceso de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const savedEmail = localStorage.getItem('savedUserEmail');
        if (savedEmail) {
            document.getElementById('login-email').value = savedEmail;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('Email y contraseña son requeridos');
                return;
            }
            
            console.log('Iniciando proceso de autenticación para:', email);

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('Respuesta del servidor:', response.status, response.statusText);
                
                const { success, data, message } = await handleApiResponse(response);
                
                if (success && data) {
                    localStorage.setItem('savedUserEmail', email);
                    localStorage.setItem('currentUserName', `${data.name} ${data.lastname}`);
                    localStorage.setItem('currentUserId', data.id);

                    if (data.type === 'Infraestructura' || data.type === 'Administrativo') {
                        localStorage.setItem('currentUserType', 'admin');
                        window.location.href = '../pages/tableroinfraestructura.html';
                    } else if (data.type === 'Estudiante' || data.type === 'Profesor') {
                        localStorage.setItem('currentUserType', 'estudiante');
                        window.location.href = '../pages/eleccionusuario.html';
                    } else {
                        localStorage.setItem('currentUserType', 'estudiante');
                        window.location.href = '../pages/eleccionusuario.html';
                    }
                } else {
                    alert(`Error: ${message || 'Credenciales inválidas'}`);
                }
            } catch (error) {
                console.error('Error durante el proceso de login:', error);
                alert('Error al conectar con el servidor.');
            }
        });
        handleEnterKeySubmission('login-form', 'button[type="submit"]');
    }

    // Proceso de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value.trim();
            const lastname = document.getElementById('register-lastname').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const matricula = document.getElementById('register-matricula').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (!name || !lastname || !email || !matricula || !password) {
                alert('Todos los campos son requeridos');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            if (password.length < 8) {
                alert('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            const userData = {
                name: name,
                lastname: lastname,
                email: email,
                matricula: matricula,
                password: password,
                type: "Estudiante"
            };
            
            console.log('Enviando datos de registro:', userData);
            
            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                console.log('Respuesta del registro:', {
                    status: response.status,
                    statusText: response.statusText
                });
                
                const { success, data, message } = await handleApiResponse(response);
                
                if (success) {
                    localStorage.setItem('currentUserName', `${name} ${lastname}`);
                    alert('Registro exitoso. Será redirigido al inicio de sesión.');
                    window.location.href = '../pages/inciosesion.html';
                } else {
                    alert(`Error: ${message || 'No se pudo registrar el usuario'}`);
                    console.error('Error de registro:', data);
                }
                
            } catch (error) {
                console.error('Error de conexión:', error);
                alert('Error al conectar con el servidor. Verifique que la API esté funcionando.');
            }
        });
        handleEnterKeySubmission('register-form', 'button[type="submit"]');
    }

    // Vista de reportes del usuario
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
                tableBody.innerHTML = `<tr><td colspan="4">No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.</td></tr>`;
                return;
            }
            
            tableBody.innerHTML = `<tr><td colspan="4">Cargando reportes...</td></tr>`;
            
            try {
                const response = await fetch(`${API_BASE}/api/reports/user/${userId}`);
                const { success, data } = await handleApiResponse(response);
                
                tableBody.innerHTML = '';
                
                if (!success || !data || data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4">Aún no has creado ningún reporte.</td></tr>`;
                    return;
                }
                
                const reports = Array.isArray(data) ? data : data.data || [];
                
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
                tableBody.innerHTML = `<tr><td colspan="4">No se pudieron cargar los reportes. Intente nuevamente.</td></tr>`;
            }
        };
        loadUserReports();
    }

    // Vista de selección de usuario
    const userChoiceView = document.getElementById('view-user-choice');
    if (userChoiceView) {
        const userName = localStorage.getItem('currentUserName') || 'Usuario';
        document.getElementById('user-choice-welcome').textContent = `Bienvenido, ${userName}`;
    }

    // Formulario de reportes
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        populateDropdowns();
        setMaxDateToToday();
        
        const userName = localStorage.getItem('currentUserName') || '';
        document.getElementById('report-user').value = userName;
        
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = localStorage.getItem('currentUserId');
            if (!userId) {
                alert('Error: No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
                return;
            }
            
            // Estructura del reporte ajustada para coincidir con el modelo backend
            const formData = {
                name: document.getElementById('report-name').value,
                description: document.getElementById('report-description').value,
                category: document.getElementById('report-type').value,
                building: document.getElementById('report-building').value,
                location: document.getElementById('report-location').value,
                date: document.getElementById('report-date').value,
                // Usar 'user' en lugar de 'userName' para coincidir con el modelo
                user: userName,
                userId: parseInt(userId),
                status: "Pendiente"
            };
            
            console.log('Enviando reporte:', formData);
            
            try {
                const response = await fetch(`${API_BASE}/api/reports`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Respuesta del servidor:', response.status, response.statusText);
                
                const { success, data, message } = await handleApiResponse(response);
                
                if (success) {
                    console.log('Reporte enviado exitosamente:', data);
                    window.location.href = '../pages/reporteexitoso.html';
                } else {
                    alert(`Error: ${message || 'No se pudo enviar el reporte'}`);
                    console.error('Error al enviar reporte:', data);
                }
            } catch (error) {
                console.error("Error al enviar reporte:", error);
                alert('Error de conexión al enviar el reporte.');
            }
        });
    }

    // Vista de éxito del reporte
    const successView = document.getElementById('view-report-success');
    if (successView) {
        setTimeout(() => {
            window.location.href = '../pages/eleccionusuario.html';
        }, 4000);
    }
    
    // Gestión de reportes para infraestructura
    const infraManageView = document.getElementById('view-infra-manage-reports');
    if (infraManageView) {
        const tableBody = document.getElementById('infra-reports-table-body');
        const searchInput = document.getElementById('infra-search-input');
        const columnFilterMenu = document.getElementById('column-filter-menu');

        const updateReportStatus = async (reportId, newStatus) => {
            try {
                const response = await fetch(`${API_BASE}/api/reports/${reportId}/status?status=${encodeURIComponent(newStatus)}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                const { success, message } = await handleApiResponse(response);
                
                if (!success) {
                    console.error('Error al actualizar estado:', message);
                    alert(`No se pudo actualizar el estado del reporte: ${message}`);
                    return false;
                }
                return true;
            } catch (error) {
                console.error("Error al actualizar estado:", error);
                alert("No se pudo actualizar el estado del reporte.");
                return false;
            }
        };

        const loadAllReports = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/reports`);
                const { success, data } = await handleApiResponse(response);
                
                tableBody.innerHTML = '';
                
                if (!success || !data) {
                    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Error al cargar los reportes.</td></tr>`;
                    return;
                }
                
                const reports = Array.isArray(data) ? data : data.data || [];
                
                if (reports.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay reportes disponibles.</td></tr>`;
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
                        <td>${report.user || report.userName || 'N/A'}</td>
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
                    loadAllReports();
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

    // Botones de logout
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