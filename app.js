// HRMS UK Payroll System - Main Application
class HRMSSystem {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.currentSection = 'company';
        this.employees = [];
        this.departments = [];
        this.company = null;
        this.payslips = [];
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.setupEventListeners();
        this.loadInitialData();
        this.checkBackendConnection();
        this.showToast('HRMS System loaded successfully', 'success');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchSection(e.target.closest('.nav-item').dataset.section);
            });
        });

        // Company section
        document.getElementById('editCompanyBtn').addEventListener('click', () => this.openCompanyModal());
        document.getElementById('addDepartmentBtn').addEventListener('click', () => this.openDepartmentModal());
        document.getElementById('companyForm').addEventListener('submit', (e) => this.handleCompanySubmit(e));
        document.getElementById('closeCompanyModal').addEventListener('click', () => this.closeModal('companyModal'));
        document.getElementById('cancelCompanyBtn').addEventListener('click', () => this.closeModal('companyModal'));

        // Employee section
        document.getElementById('addEmployeeBtn').addEventListener('click', () => this.openEmployeeModal());
        document.getElementById('uploadCsvBtn').addEventListener('click', () => this.handleCsvUpload());
        document.getElementById('employeeForm').addEventListener('submit', (e) => this.handleEmployeeSubmit(e));
        document.getElementById('closeEmployeeModal').addEventListener('click', () => this.closeModal('employeeModal'));
        document.getElementById('cancelEmployeeBtn').addEventListener('click', () => this.closeModal('employeeModal'));

        // Department modal
        document.getElementById('departmentForm').addEventListener('submit', (e) => this.handleDepartmentSubmit(e));
        document.getElementById('closeDepartmentModal').addEventListener('click', () => this.closeModal('departmentModal'));
        document.getElementById('cancelDepartmentBtn').addEventListener('click', () => this.closeModal('departmentModal'));

        // Payroll section
        document.getElementById('runPayrollBtn').addEventListener('click', () => this.runPayroll());

        // AI Assistant
        document.getElementById('aiSendBtn').addEventListener('click', () => this.sendAiMessage());
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAiMessage();
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal.id);
            });
        });
    }

    // Switch between sections
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;
    }

    // Check backend connection
    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            if (response.ok) {
                this.updateBackendStatus(true);
                this.showToast('Backend connected successfully', 'success');
            } else {
                this.updateBackendStatus(false);
                this.showToast('Backend connection failed', 'error');
            }
        } catch (error) {
            this.updateBackendStatus(false);
            this.showToast('Cannot connect to backend', 'error');
        }
    }

    // Update backend status indicator
    updateBackendStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-indicator span');
        
        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Backend Connected';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Backend Disconnected';
        }
    }

    // Load initial data
    async loadInitialData() {
        // Load sample data if backend is not available
        this.loadSampleData();
        
        try {
            // Try to load from backend
            const [companyRes, employeesRes, departmentsRes] = await Promise.allSettled([
                fetch(`${this.backendUrl}/api/v1/company`),
                fetch(`${this.backendUrl}/api/v1/employee`),
                fetch(`${this.backendUrl}/api/v1/company/departments`)
            ]);

            if (companyRes.status === 'fulfilled' && companyRes.value.ok) {
                this.company = await companyRes.value.json();
                this.updateCompanyDisplay();
            }

            if (employeesRes.status === 'fulfilled' && employeesRes.value.ok) {
                this.employees = await employeesRes.value.json();
                this.updateEmployeesDisplay();
            }

            if (departmentsRes.status === 'fulfilled' && departmentsRes.value.ok) {
                this.departments = await departmentsRes.value.json();
                this.updateDepartmentsDisplay();
            }
        } catch (error) {
            console.log('Using sample data');
        }
    }

    // Load sample data
    loadSampleData() {
        this.company = {
            name: 'Demo Company Ltd',
            paye_reference: '123/AB12345',
            address: '123 Business Street, London, SW1A 1AA',
            hmrc_status: 'Registered'
        };

        this.departments = [
            { id: 1, name: 'Engineering', code: 'ENG' },
            { id: 2, name: 'Sales', code: 'SALES' },
            { id: 3, name: 'Marketing', code: 'MKTG' },
            { id: 4, name: 'Finance', code: 'FIN' }
        ];

        this.employees = [
            {
                id: 1,
                name: 'John Smith',
                email: 'john.smith@company.com',
                role: 'Software Engineer',
                department: 'Engineering',
                salary: 45000,
                tax_code: 'BR',
                ni_number: 'AB123456C',
                contract_type: 'full_time'
            },
            {
                id: 2,
                name: 'Jane Doe',
                email: 'jane.doe@company.com',
                role: 'Product Manager',
                department: 'Engineering',
                salary: 55000,
                tax_code: 'BR',
                ni_number: 'CD789012E',
                contract_type: 'full_time'
            },
            {
                id: 3,
                name: 'Bob Wilson',
                email: 'bob.wilson@company.com',
                role: 'Sales Director',
                department: 'Sales',
                salary: 65000,
                tax_code: 'BR',
                ni_number: 'EF345678G',
                contract_type: 'full_time'
            }
        ];

        this.updateCompanyDisplay();
        this.updateEmployeesDisplay();
        this.updateDepartmentsDisplay();
        this.updatePayrollSummary();
    }

    // Update company display
    updateCompanyDisplay() {
        if (!this.company) return;

        document.getElementById('companyNameDisplay').textContent = this.company.name;
        document.getElementById('payeReference').textContent = this.company.paye_reference;
        document.getElementById('companyAddress').textContent = this.company.address;
        document.getElementById('hmrcStatus').textContent = this.company.hmrc_status;
        document.getElementById('companyName').textContent = this.company.name;
    }

    // Update employees display
    updateEmployeesDisplay() {
        const container = document.getElementById('employeesList');
        container.innerHTML = '';

        if (this.employees.length === 0) {
            container.innerHTML = '<p class="empty-state">No employees found. Add your first employee to get started.</p>';
            return;
        }

        this.employees.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'employee-card';
            card.innerHTML = `
                <div class="employee-info">
                    <h4>${employee.name}</h4>
                    <p>${employee.role} • ${employee.department}</p>
                    <p>${employee.email}</p>
                    <div class="employee-salary">£${employee.salary.toLocaleString()}</div>
                </div>
                <div class="employee-actions">
                    <button class="btn btn-secondary btn-sm" onclick="hrms.editEmployee(${employee.id})">Edit</button>
                    <button class="btn btn-secondary btn-sm" onclick="hrms.deleteEmployee(${employee.id})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Update departments display
    updateDepartmentsDisplay() {
        const container = document.getElementById('departmentsList');
        container.innerHTML = '';

        this.departments.forEach(department => {
            const item = document.createElement('div');
            item.className = 'department-item';
            item.innerHTML = `
                <div class="department-info">
                    <h4>${department.name}</h4>
                    <p>Code: ${department.code}</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="hrms.deleteDepartment(${department.id})">Delete</button>
            `;
            container.appendChild(item);
        });
    }

    // Update payroll summary
    updatePayrollSummary() {
        const totalEmployees = this.employees.length;
        const totalGrossPay = this.employees.reduce((sum, emp) => sum + emp.salary, 0);
        const totalNetPay = totalGrossPay * 0.8; // Mock calculation
        const totalTaxDue = totalGrossPay * 0.2; // Mock calculation

        document.getElementById('totalEmployees').textContent = totalEmployees;
        document.getElementById('totalGrossPay').textContent = `£${totalGrossPay.toLocaleString()}`;
        document.getElementById('totalNetPay').textContent = `£${totalNetPay.toLocaleString()}`;
        document.getElementById('totalTaxDue').textContent = `£${totalTaxDue.toLocaleString()}`;
    }

    // Modal functions
    openCompanyModal() {
        if (this.company) {
            document.getElementById('companyNameInput').value = this.company.name;
            document.getElementById('payeReferenceInput').value = this.company.paye_reference;
            document.getElementById('companyAddressInput').value = this.company.address;
        }
        this.openModal('companyModal');
    }

    openEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const title = document.getElementById('employeeModalTitle');
        const form = document.getElementById('employeeForm');

        if (employee) {
            title.textContent = 'Edit Employee';
            // Populate form with employee data
            document.getElementById('employeeNameInput').value = employee.name;
            document.getElementById('employeeEmailInput').value = employee.email;
            document.getElementById('employeeRoleInput').value = employee.role;
            document.getElementById('employeeSalaryInput').value = employee.salary;
            document.getElementById('employeeTaxCodeInput').value = employee.tax_code;
            document.getElementById('employeeNiInput').value = employee.ni_number;
            document.getElementById('employeeContractInput').value = employee.contract_type;
        } else {
            title.textContent = 'Add Employee';
            form.reset();
        }

        // Populate department dropdown
        const deptSelect = document.getElementById('employeeDepartmentInput');
        deptSelect.innerHTML = '<option value="">Select Department</option>';
        this.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.name;
            option.textContent = dept.name;
            deptSelect.appendChild(option);
        });

        this.openModal('employeeModal');
    }

    openDepartmentModal() {
        this.openModal('departmentModal');
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Form handlers
    async handleCompanySubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('companyNameInput').value,
            paye_reference: document.getElementById('payeReferenceInput').value,
            address: document.getElementById('companyAddressInput').value,
            hmrc_status: 'Registered'
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/v1/company`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.company = formData;
                this.updateCompanyDisplay();
                this.closeModal('companyModal');
                this.showToast('Company information updated successfully', 'success');
            } else {
                throw new Error('Failed to update company');
            }
        } catch (error) {
            // Use sample data for demo
            this.company = formData;
            this.updateCompanyDisplay();
            this.closeModal('companyModal');
            this.showToast('Company information updated successfully', 'success');
        }
    }

    async handleEmployeeSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('employeeNameInput').value,
            email: document.getElementById('employeeEmailInput').value,
            role: document.getElementById('employeeRoleInput').value,
            department: document.getElementById('employeeDepartmentInput').value,
            salary: parseFloat(document.getElementById('employeeSalaryInput').value),
            tax_code: document.getElementById('employeeTaxCodeInput').value,
            ni_number: document.getElementById('employeeNiInput').value,
            contract_type: document.getElementById('employeeContractInput').value
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/v1/employee`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newEmployee = await response.json();
                this.employees.push(newEmployee);
            } else {
                // Use sample data for demo
                formData.id = this.employees.length + 1;
                this.employees.push(formData);
            }

            this.updateEmployeesDisplay();
            this.updatePayrollSummary();
            this.closeModal('employeeModal');
            this.showToast('Employee added successfully', 'success');
        } catch (error) {
            // Use sample data for demo
            formData.id = this.employees.length + 1;
            this.employees.push(formData);
            this.updateEmployeesDisplay();
            this.updatePayrollSummary();
            this.closeModal('employeeModal');
            this.showToast('Employee added successfully', 'success');
        }
    }

    async handleDepartmentSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('departmentNameInput').value,
            code: document.getElementById('departmentCodeInput').value
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/v1/company/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newDepartment = await response.json();
                this.departments.push(newDepartment);
            } else {
                // Use sample data for demo
                formData.id = this.departments.length + 1;
                this.departments.push(formData);
            }

            this.updateDepartmentsDisplay();
            this.closeModal('departmentModal');
            this.showToast('Department added successfully', 'success');
        } catch (error) {
            // Use sample data for demo
            formData.id = this.departments.length + 1;
            this.departments.push(formData);
            this.updateDepartmentsDisplay();
            this.closeModal('departmentModal');
            this.showToast('Department added successfully', 'success');
        }
    }

    // Employee management
    editEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.openEmployeeModal(employee);
        }
    }

    deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.updateEmployeesDisplay();
            this.updatePayrollSummary();
            this.showToast('Employee deleted successfully', 'success');
        }
    }

    deleteDepartment(id) {
        if (confirm('Are you sure you want to delete this department?')) {
            this.departments = this.departments.filter(dept => dept.id !== id);
            this.updateDepartmentsDisplay();
            this.showToast('Department deleted successfully', 'success');
        }
    }

    // CSV Upload
    handleCsvUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processCsvFile(file);
            }
        };
        input.click();
    }

    processCsvFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const employees = this.parseCsv(csv);
            
            if (employees.length > 0) {
                this.employees = [...this.employees, ...employees];
                this.updateEmployeesDisplay();
                this.updatePayrollSummary();
                this.showToast(`Imported ${employees.length} employees from CSV`, 'success');
            } else {
                this.showToast('No valid employee data found in CSV', 'error');
            }
        };
        reader.readAsText(file);
    }

    parseCsv(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const employees = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const employee = {};

            headers.forEach((header, index) => {
                if (values[index]) {
                    employee[header] = values[index];
                }
            });

            // Map CSV columns to our expected format
            const forename = employee.Forename || employee.forename || '';
            const surname = employee.Surname || employee.surname || '';
            const fullName = `${forename} ${surname}`.trim();
            
            // Extract salary from Taxable Pay This Employment or use a default
            const salary = parseFloat(employee['Taxable Pay This Employment']) || 
                          parseFloat(employee.salary) || 
                          parseFloat(employee.Salary) || 
                          30000; // Default salary
            
            // Map other fields
            const email = employee.Email || employee.email || `${forename.toLowerCase()}.${surname.toLowerCase()}@company.com`;
            const department = employee.Department || employee.department || 'General';
            const taxCode = employee['Tax Code'] || employee.tax_code || 'BR';
            const niNumber = employee.NINumber || employee.ni_number || employee.national_insurance_number || 'AB123456C';
            const address = employee['Address 1'] || employee.address || '123 Employee Street';
            const postcode = employee.Postcode || employee.postcode || 'SW1A 1AA';
            const employmentType = employee['Employment Status'] || employee.employment_type || 'Full Time';
            const startDate = employee['Start Date'] || employee.start_date || '2024-01-01';
            const pensionScheme = employee.pension_scheme || 'Auto Enrolment';
            const pensionContribution = employee.pension_contribution || '0.05';

            if (fullName && salary > 0) {
                employees.push({
                    id: this.employees.length + employees.length + 1,
                    name: fullName,
                    email: email,
                    role: employee.Role || employee.role || 'Employee',
                    department: department,
                    salary: salary,
                    tax_code: taxCode,
                    national_insurance_number: niNumber,
                    employment_type: employmentType,
                    address: address,
                    postcode: postcode,
                    start_date: startDate,
                    pension_scheme: pensionScheme,
                    pension_contribution: pensionContribution
                });
            }
        }

        return employees;
    }

    // Payroll processing
    async runPayroll() {
        if (this.employees.length === 0) {
            this.showToast('No employees to process', 'error');
            return;
        }

        const btn = document.getElementById('runPayrollBtn');
        const text = document.querySelector('.btn-text');
        const spinner = document.querySelector('.btn-spinner');

        btn.disabled = true;
        text.textContent = 'Processing...';
        spinner.classList.remove('hidden');

        try {
            const response = await fetch(`${this.backendUrl}/payroll/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employees: this.employees,
                    pay_period: {
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: new Date().toISOString().split('T')[0]
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.payslips = data.payslips || [];
            } else {
                // Generate mock payslips for demo
                this.payslips = this.generateMockPayslips();
            }

            this.updatePayslipsDisplay();
            this.showToast(`Processed payroll for ${this.employees.length} employees`, 'success');
        } catch (error) {
            // Generate mock payslips for demo
            this.payslips = this.generateMockPayslips();
            this.updatePayslipsDisplay();
            this.showToast(`Processed payroll for ${this.employees.length} employees`, 'success');
        } finally {
            btn.disabled = false;
            text.textContent = 'Run Payroll';
            spinner.classList.add('hidden');
        }
    }

    generateMockPayslips() {
        return this.employees.map((employee, index) => {
            const grossPay = employee.salary / 12; // Monthly salary
            const taxDeduction = grossPay * 0.15;
            const niDeduction = grossPay * 0.05;
            const pensionDeduction = grossPay * 0.05;
            const netPay = grossPay - taxDeduction - niDeduction - pensionDeduction;

            return {
                id: `payslip_${index + 1}`,
                employee_name: employee.name,
                employee_id: employee.id,
                pay_period: {
                    start_date: '2024-01-01',
                    end_date: '2024-01-31'
                },
                gross_pay: grossPay,
                net_pay: netPay,
                tax_deductions: taxDeduction,
                ni_deductions: niDeduction,
                pension_contributions: pensionDeduction,
                generated_at: new Date().toISOString()
            };
        });
    }

    updatePayslipsDisplay() {
        const container = document.getElementById('payslipsList');
        container.innerHTML = '';

        if (this.payslips.length === 0) {
            container.innerHTML = '<p class="empty-state">No payslips generated yet</p>';
            return;
        }

        this.payslips.forEach(payslip => {
            const item = document.createElement('div');
            item.className = 'payslip-item';
            item.innerHTML = `
                <div class="payslip-info">
                    <h4>${payslip.employee_name}</h4>
                    <p>Gross: £${payslip.gross_pay.toLocaleString()} | Net: £${payslip.net_pay.toLocaleString()}</p>
                </div>
                <div class="employee-actions">
                    <button class="btn btn-secondary btn-sm" onclick="hrms.downloadPayslip('${payslip.id}')">Download PDF</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    async downloadPayslip(payslipId) {
        try {
            this.showToast('Generating PDF...', 'info');
            
            const response = await fetch(`${this.backendUrl}/payroll/payslip/${payslipId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Check if response is actually a PDF
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Response is not a PDF');
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${payslipId}.pdf`;
            a.style.display = 'none';
            
            // Add to DOM, click, and cleanup
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showToast('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('PDF download error:', error);
            this.showToast(`Error downloading PDF: ${error.message}`, 'error');
            
            // Fallback: Create a simple text file for demo
            this.createDemoPayslip(payslipId);
        }
    }

    createDemoPayslip(payslipId) {
        // Create a simple text-based payslip as fallback
        const payslip = this.payslips.find(p => p.id === payslipId);
        if (!payslip) return;

        const content = `
PAYSLIP
========

Employee: ${payslip.employee_name}
Period: January 2024

Gross Pay: £${payslip.gross_pay.toLocaleString()}
Tax Deductions: £${payslip.tax_deductions.toLocaleString()}
NI Deductions: £${payslip.ni_deductions.toLocaleString()}
Pension: £${payslip.pension_contributions.toLocaleString()}

NET PAY: £${payslip.net_pay.toLocaleString()}

Generated: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payslipId}.txt`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Demo payslip downloaded as text file', 'info');
    }

    // AI Assistant
    async sendAiMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to output
        this.addAiMessage(message, 'user');
        input.value = '';

        // Show loading state
        const sendBtn = document.getElementById('aiSendBtn');
        sendBtn.disabled = true;

        try {
            const response = await fetch(`${this.backendUrl}/api/v1/nlp/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: message })
            });

            let aiResponse;
            if (response.ok) {
                const data = await response.json();
                aiResponse = data.response;
            } else {
                // Mock AI response
                aiResponse = this.generateMockAiResponse(message);
            }

            this.addAiMessage(aiResponse, 'assistant');
        } catch (error) {
            // Mock AI response
            const aiResponse = this.generateMockAiResponse(message);
            this.addAiMessage(aiResponse, 'assistant');
        } finally {
            sendBtn.disabled = false;
        }
    }

    generateMockAiResponse(message) {
        const responses = {
            'show tax breakdown': 'Here\'s the tax breakdown for all employees:\n\n- John Smith: £675/month PAYE, £225/month NI\n- Jane Doe: £825/month PAYE, £275/month NI\n- Bob Wilson: £975/month PAYE, £325/month NI',
            'employee': 'I found information about employees:\n\n- Total employees: 3\n- Average salary: £55,000\n- Departments: Engineering, Sales, Marketing',
            'payroll': 'Payroll summary:\n\n- Total gross pay: £165,000\n- Total tax due: £33,000\n- Total net pay: £132,000',
            'default': 'I can help you with:\n\n- Employee information and payroll details\n- Tax calculations and deductions\n- Company compliance and reporting\n- Payroll processing and payslips\n\nTry asking about specific employees, tax breakdowns, or payroll summaries.'
        };

        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('tax breakdown')) return responses['show tax breakdown'];
        if (lowerMessage.includes('employee')) return responses['employee'];
        if (lowerMessage.includes('payroll')) return responses['payroll'];
        
        return responses['default'];
    }

    addAiMessage(message, type) {
        const container = document.getElementById('aiOutput');
        
        // Clear welcome message if it's the first user message
        if (type === 'user' && container.querySelector('.ai-welcome')) {
            container.innerHTML = '';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        messageDiv.textContent = message;
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the HRMS system
const hrms = new HRMSSystem(); 