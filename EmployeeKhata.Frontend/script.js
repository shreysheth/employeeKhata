// script.js

// Base URL for your .NET Core Web API
// IMPORTANT: Replace this with the actual URL of your API
const BASE_API_URL = 'https://localhost:7164'; // Example: 'https://yourapi.com/api'

// DOM Elements
const globalLoader = document.getElementById('globalLoader');
const toastContainer = document.querySelector('.toast-container');

const employeePage = document.getElementById('employeePage');
const titlePage = document.getElementById('titlePage');

const navEmployee = document.getElementById('navEmployee');
const navTitle = document.getElementById('navTitle');

const employeeTableBody = document.getElementById('employeeTableBody');
const employeePagination = document.getElementById('employeePagination');
const employeeSearchInput = document.getElementById('employeeSearchInput');

const titleTableBody = document.getElementById('titleTableBody');
const titlePagination = document.getElementById('titlePagination');
const titleSearchInput = document.getElementById('titleSearchInput');

const addEmployeeModal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
const addEmployeeForm = document.getElementById('addEmployeeForm');
const addEmployeeSubmitBtn = document.getElementById('addEmployeeSubmitBtn');
// --- START MODIFICATION: Fix typo in assignment ---
const addEmployeeSubmitBtnText = document.getElementById('addEmployeeSubmitBtnText');
// --- END MODIFICATION ---
const addEmployeeSubmitBtnSpinner = document.getElementById('addEmployeeSubmitBtnSpinner');

// Form fields for Add Employee modal
const employeeNameInput = document.getElementById('employeeName');
const employeeTitleSelect = document.getElementById('employeeTitle');
const employeeOtherTitleInputContainer = document.createElement('div');
employeeOtherTitleInputContainer.className = 'mb-3';
employeeOtherTitleInputContainer.innerHTML = `
    <label for="employeeOtherTitle" class="form-label">Other Title <span class="text-danger">*</span></label>
    <input type="text" class="form-control" id="employeeOtherTitle">
    <div class="invalid-feedback">Please enter a title.</div>
`;
let employeeOtherTitleInput; // Will be assigned when appended
const employeeSalaryInput = document.getElementById('employeeSalary');
const employeeSSNInput = document.getElementById('employeeSSN');
const employeeDOBInput = document.getElementById('employeeDOB');
const employeeAddressInput = document.getElementById('employeeAddress');
const employeeCityInput = document.getElementById('employeeCity');
const employeeStateInput = document.getElementById('employeeState');
const employeeZipInput = document.getElementById('employeeZip');
const employeePhoneInput = document.getElementById('employeePhone');
const employeeJoinDateInput = document.getElementById('employeeJoinDate');
const employeeEmailInput = document.getElementById('employeeEmail');


// --- Global State Variables ---
let allEmployees = []; // Stores the full, unfiltered list of employees
let filteredEmployees = []; // Stores the currently filtered list of employees
let allTitles = []; // Stores the full, unfiltered list of titles
let filteredTitles = []; // Stores the currently filtered list of titles

const employeesPerPage = 10;
const titlesPerPage = 10;
let currentEmployeePage = 1;
let currentTitlePage = 1;

// --- Utility Functions ---

/**
 * Displays a Bootstrap toast message.
 * @param {string} message - The message to display.
 * @param {'success'|'danger'|'warning'|'info'} type - The type of toast (determines color).
 */
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    const toastElement = document.createElement('div');
    toastElement.innerHTML = toastHtml;
    // --- START MODIFICATION: Append the element before creating Bootstrap Toast instance ---
    // This ensures the element is part of the DOM when Bootstrap tries to initialize it.
    toastContainer.appendChild(toastElement.firstElementChild);
    const liveToast = new bootstrap.Toast(toastContainer.lastElementChild, {
        autohide: true,
        delay: 5000
    });
    liveToast.show();
    // --- END MODIFICATION ---
}

/**
 * Shows the global loading spinner.
 */
function showGlobalLoader() {
    globalLoader.style.display = 'flex';
}

/**
 * Hides the global loading spinner.
 */
function hideGlobalLoader() {
    globalLoader.style.display = 'none';
}

/**
 * Shows the submit button loader and disables the button.
 */
function showSubmitButtonLoader() {
    addEmployeeSubmitBtnText.classList.add('d-none');
    addEmployeeSubmitBtnSpinner.classList.remove('d-none');
    addEmployeeSubmitBtn.disabled = true;
}

/**
 * Hides the submit button loader and enables the button.
 */
function hideSubmitButtonLoader() {
    addEmployeeSubmitBtnText.classList.remove('d-none');
    addEmployeeSubmitBtnSpinner.classList.add('d-none');
    addEmployeeSubmitBtn.disabled = false;
}

/**
 * Generic function to make API calls.
 * @param {string} endpoint - The API endpoint (e.g., '/employees').
 * @param {object} options - Fetch API options (method, headers, body).
 * @returns {Promise<object|null>} - Parsed JSON response or null on error.
 */
async function callApi(endpoint, options = {}) {
    showGlobalLoader();
    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`, options);
        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        }

        if (response.ok) {
            // For successful POST, show success toast
            if (options.method === 'POST') {
                showToast(data?.message || 'Operation successful!', 'success');
            }
            return data;
        } else {
            // Handle specific HTTP error codes and display toast
            if (response.status === 400) { // Bad Request
                showToast(data?.message || 'Bad Request: Please check your input.', 'danger');
            } else if (response.status === 404) { // Not Found
                showToast(data?.message || 'Resource not found.', 'warning');
            } else if (response.status === 405) { // Method Not Allowed
                showToast(data?.message || `Error 405: Method Not Allowed. Check your API endpoint and HTTP method.`, 'danger');
            }
            else { // Other errors (500, etc.)
                showToast(data?.message || `Error: ${response.statusText}`, 'danger');
            }
            return null; // Indicate failure
        }
    } catch (error) {
        console.error('API call failed:', error);
        showToast('Network error or server unreachable. Please try again later.', 'danger');
        return null;
    } finally {
        hideGlobalLoader();
    }
}

// --- Pagination Logic ---

/**
 * Renders pagination controls for a given dataset.
 * @param {HTMLElement} paginationElement - The UL element for pagination.
 * @param {number} totalItems - Total number of items.
 * @param {number} itemsPerPage - Number of items per page.
 * @param {number} currentPage - The current active page.
 * @param {function} onPageChange - Callback function when a page is clicked.
 */
function renderPagination(paginationElement, totalItems, itemsPerPage, currentPage, onPageChange) {
    paginationElement.innerHTML = ''; // Clear existing pagination
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return; // No pagination needed for 1 or fewer pages

    const maxPagesToShow = 5; // Number of page numbers to show directly (e.g., 1 2 3 4 5)
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
        // Less than maxPagesToShow total pages, show all
        startPage = 1;
        endPage = totalPages;
    } else {
        // More than maxPagesToShow total pages, calculate start and end
        if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - Math.floor(maxPagesToShow / 2);
            endPage = currentPage + Math.floor(maxPagesToShow / 2);
        }
    }

    // Previous button (always present if not on first page)
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    paginationElement.appendChild(prevItem);

    // First page (always show if not in direct range)
    if (startPage > 1) {
        const firstPageItem = document.createElement('li');
        firstPageItem.className = `page-item`;
        firstPageItem.innerHTML = `<a class="page-link" href="#">1</a>`;
        firstPageItem.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(1);
        });
        paginationElement.appendChild(firstPageItem);

        if (startPage > 2) { // Add ellipsis if there's a gap
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = `page-item disabled`;
            ellipsisItem.innerHTML = `<span class="page-link">...</span>`;
            paginationElement.appendChild(ellipsisItem);
        }
    }

    // Page numbers in the active range
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(i);
        });
        paginationElement.appendChild(pageItem);
    }

    // Last page (always show if not in direct range)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) { // Add ellipsis if there's a gap
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = `page-item disabled`;
            ellipsisItem.innerHTML = `<span class="page-link">...</span>`;
            paginationElement.appendChild(ellipsisItem);
        }

        const lastPageItem = document.createElement('li');
        lastPageItem.className = `page-item`;
        lastPageItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
        lastPageItem.addEventListener('click', (e) => {
            e.preventDefault();
            onPageChange(totalPages);
        });
        paginationElement.appendChild(lastPageItem);
    }

    // Next button (always present if not on last page)
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    paginationElement.appendChild(nextItem);
}

// --- Employee Page Logic ---

/**
 * Fetches employees from the API and renders the table.
 */
async function fetchEmployees() {
    const data = await callApi('/employees');
    if (data) {
        allEmployees = data.data; // Store all employees for frontend pagination and filtering
        filterEmployees(); // Apply any existing filter or show all
    } else {
        employeeTableBody.innerHTML = '<tr><td colspan="12" class="text-center text-muted">Failed to load employees.</td></tr>';
    }
}

/**
 * Filters employees based on search input and renders the table.
 */
function filterEmployees() {
    const searchTerm = employeeSearchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredEmployees = allEmployees.filter(emp =>
            (emp.employeeName && emp.employeeName.toLowerCase().includes(searchTerm)) ||
            (emp.title && emp.title.toLowerCase().includes(searchTerm))
        );
    } else {
        filteredEmployees = [...allEmployees]; // If no search term, show all
    }
    currentEmployeePage = 1; // Reset to first page on new filter
    renderEmployeeTable(currentEmployeePage);
    renderPagination(employeePagination, filteredEmployees.length, employeesPerPage, currentEmployeePage, (page) => {
        currentEmployeePage = page;
        renderEmployeeTable(currentEmployeePage);
    });
}

/**
 * Renders the employee table for the current page.
 * @param {number} page - The page number to render.
 */
function renderEmployeeTable(page) {
    employeeTableBody.innerHTML = ''; // Clear existing rows

    const startIndex = (page - 1) * employeesPerPage;
    const endIndex = startIndex + employeesPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    if (paginatedEmployees.length === 0) {
        employeeTableBody.innerHTML = '<tr><td colspan="12" class="text-center text-muted">No employees found.</td></tr>';
        return;
    }

    paginatedEmployees.forEach(emp => {
        const row = document.createElement('tr');
        // Removed the <td> for emp.id as requested
        row.innerHTML = `
            <td>${emp.employeeName || 'N/A'}</td>
            <td>${emp.title || 'N/A'}</td>
            <td>${emp.salaryAmount ? `${emp.salaryAmount.toLocaleString()}` : 'N/A'}</td>
            <td>${emp.ssn || 'N/A'}</td>
            <td>${emp.dob ? new Date(emp.dob).toLocaleDateString() : 'N/A'}</td>
            <td>${emp.address || 'N/A'}</td>
            <td>${emp.city || 'N/A'}</td>
            <td>${emp.state || 'N/A'}</td>
            <td>${emp.zip || 'N/A'}</td>
            <td>${emp.phone || 'N/A'}</td>
            <td>${emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A'}</td>
            <td>${emp.exitDate ? new Date(emp.exitDate).toLocaleDateString() : '-'}</td>
        `;
        employeeTableBody.appendChild(row);
    });
}

/**
 * Fetches titles and populates the dropdown in the Add Employee modal.
 */
async function populateTitlesForDropdown() {
    const data = await callApi('/titles');
    if (data) {
        allTitles = data.data; // Store all titles
        employeeTitleSelect.innerHTML = '<option value="">Select a Title</option>'; // Reset dropdown
        allTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title.title; // Assuming title.name is what you want to send
            option.textContent = title.title;
            employeeTitleSelect.appendChild(option);
        });
        const otherOption = document.createElement('option');
        otherOption.value = 'Other';
        otherOption.textContent = 'Other (Please specify)';
        employeeTitleSelect.appendChild(otherOption);
    } else {
        employeeTitleSelect.innerHTML = '<option value="">Failed to load titles</option>';
        employeeTitleSelect.disabled = true;
    }
}

/**
 * Handles the submission of the Add Employee form.
 * @param {Event} event - The form submission event.
 */
async function handleAddEmployeeSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Clear previous validation feedback
    addEmployeeForm.querySelectorAll('.form-control, .form-select').forEach(input => {
        input.classList.remove('is-invalid');
    });

    // Client-side validation
    let isValid = true;

    // Check all required fields
    const requiredInputs = [
        employeeNameInput, employeeSalaryInput, employeeSSNInput,
        employeeDOBInput, employeeAddressInput, employeeCityInput, employeeStateInput,
        employeeZipInput, employeePhoneInput, employeeJoinDateInput
    ];

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    let selectedTitle = employeeTitleSelect.value;
    if (!selectedTitle) {
        employeeTitleSelect.classList.add('is-invalid');
        isValid = false;
    } else if (selectedTitle === 'Other') {
        if (!employeeOtherTitleInput || !employeeOtherTitleInput.value.trim()) {
            employeeOtherTitleInput.classList.add('is-invalid');
            isValid = false;
        }else {
            selectedTitle = employeeOtherTitleInput.value.trim();
        }
    }

    if (employeeDOBInput.value) {
        const dob = new Date(employeeDOBInput.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--; // Adjust age if birthday hasn't occurred yet this year
        }

        if (age < 22 || age > 64) {
            employeeDOBInput.classList.add('is-invalid');
            employeeDOBInput.nextElementSibling.textContent = 'Employee must be between 22 and 64 years old.';
            isValid = false;
        }
    }

    // Specific format validations
    if (employeeSSNInput.value.trim() && !/^\d{3}-\d{2}-\d{4}$/.test(employeeSSNInput.value.trim())) {
        employeeSSNInput.classList.add('is-invalid');
        isValid = false;
    }
    // if (employeeZipInput.value.trim()) {
    //     employeeZipInput.classList.add('is-invalid');
    //     isValid = false;
    // }
    if (employeeJoinDateInput.value) {
        const joinDate = new Date(employeeJoinDateInput.value);
        const minJoinDate = new Date('2015-01-01'); // January 1, 2015
        if (joinDate < minJoinDate) {
            employeeJoinDateInput.classList.add('is-invalid');
            employeeJoinDateInput.nextElementSibling.textContent = 'Join Date cannot be before January 1, 2015.';
            isValid = false;
        }
    }

    if (!isValid) {
        showToast('Please fill in all required fields correctly and check formats.', 'warning');
        return;
    }

    showSubmitButtonLoader();

    const newEmployee = {
        employeeName: employeeNameInput.value.trim(),
        title: selectedTitle, // Use selectedTitle (either from dropdown or 'Other' input)
        salaryAmount: parseFloat(employeeSalaryInput.value),
        ssn: employeeSSNInput.value.trim(),
        dob: employeeDOBInput.value, // YYYY-MM-DD format
        address: employeeAddressInput.value.trim(),
        city: employeeCityInput.value.trim(),
        state: employeeStateInput.value.trim(),
        zip: employeeZipInput.value.trim(),
        phone: employeePhoneInput.value.trim(),
        joinDate: employeeJoinDateInput.value, // YYYY-MM-DD format
        // ExitDate is not part of the add form, so it's omitted
        // If your API expects 'email', ensure employeeEmailInput is present in HTML and add it here.
        // email: employeeEmailInput.value.trim(), // Keeping email as it was previously for consistency
    };

    const response = await callApi('/add-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
    });

    hideSubmitButtonLoader();

    if (response) {
        // Success: Close modal, reset form, refresh employee list
        addEmployeeModal.hide();
        addEmployeeForm.reset();
        addEmployeeForm.querySelectorAll('.form-control, .form-select').forEach(input => {
            input.classList.remove('is-invalid'); // Clear validation states
        });
        // --- START MODIFICATION: Hide 'Other Title' input on success/reset ---
        if (employeeOtherTitleInputContainer.parentNode) {
            employeeOtherTitleInputContainer.remove();
        }
        // --- END MODIFICATION ---
        fetchEmployees(); // Refresh the list to show the new employee
    } else {
        // Error: Modal remains open, form fields are reset but validation messages remain
        // The `callApi` function already shows the toast message for the error.
        addEmployeeForm.reset();
        // Do not hide employeeOtherTitleInputContainer here, as modal remains open
    }
}

// --- Title Page Logic ---

/**
 * Fetches titles from the API and renders the table.
 */
async function fetchTitles() {
    const data = await callApi('/titles');
    if (data) {
        allTitles = data.data; // Store all titles for frontend pagination and filtering
        filterTitles(); // Apply any existing filter or show all
    } else {
        titleTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Failed to load titles.</td></tr>';
    }
}

/**
 * Filters titles based on search input and renders the table.
 */
function filterTitles() {
    const searchTerm = titleSearchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredTitles = allTitles.filter(title =>
            (title.title && title.title.toLowerCase().includes(searchTerm))
        );
    } else {
        filteredTitles = [...allTitles]; // If no search term, show all
    }
    currentTitlePage = 1; // Reset to first page on new filter
    renderTitleTable(currentTitlePage);
    renderPagination(titlePagination, filteredTitles.length, titlesPerPage, currentTitlePage, (page) => {
        currentTitlePage = page;
        renderTitleTable(currentTitlePage);
    });
}

/**
 * Renders the title table for the current page.
 * @param {number} page - The page number to render.
 */
function renderTitleTable(page) {
    titleTableBody.innerHTML = ''; // Clear existing rows

    const startIndex = (page - 1) * titlesPerPage;
    const endIndex = startIndex + titlesPerPage;
    const paginatedTitles = filteredTitles.slice(startIndex, endIndex);

    if (paginatedTitles.length === 0) {
        titleTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No titles found.</td></tr>';
        return;
    }

    paginatedTitles.forEach(title => {
        const row = document.createElement('tr');
        // Assuming your API returns fields like id, name.
        // Adding placeholder data for the new 'Description' column.
        row.innerHTML = `
            <td>${title.title || 'N/A'}</td>
            <td>${title.minSalaryAmount.toLocaleString() || 'N/A'}</td>
            <td>${title.maxSalaryAmount.toLocaleString() || 'General description for ' + (title.title || 'this title')}</td> <!-- Placeholder for Description -->
        `;
        titleTableBody.appendChild(row);
    });
}

// --- Page Navigation ---

/**
 * Shows a specific page section and hides others.
 * @param {HTMLElement} pageToShow - The page element to display.
 * @param {HTMLElement} activeNav - The navigation link to set as active.
 */
function showPage(pageToShow, activeNav) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
    });
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show the selected page
    pageToShow.style.display = 'block';
    // Set active class on the selected nav link
    activeNav.classList.add('active');
}

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial page load: show Employee page
    showPage(employeePage, navEmployee);
    fetchEmployees();

    // Event listeners for navigation
    navEmployee.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(employeePage, navEmployee);
        fetchEmployees(); // Refresh data when navigating
    });

    navTitle.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(titlePage, navTitle);
        fetchTitles(); // Refresh data when navigating
    });

    // Event listeners for search inputs (on 'input' event)
    employeeSearchInput.addEventListener('input', filterEmployees);
    titleSearchInput.addEventListener('input', filterTitles);

    // Event listener for Add Employee modal opening
    // This ensures titles are loaded just before the modal is shown
    document.getElementById('addEmployeeModal').addEventListener('show.bs.modal', () => {
        populateTitlesForDropdown();
        // Ensure "Other Title" input is hidden when modal opens
        if (employeeOtherTitleInputContainer.parentNode) {
            employeeOtherTitleInputContainer.remove();
        }
    });

    employeeTitleSelect.addEventListener('change', () => {
        if (employeeTitleSelect.value === 'Other') {
            const titleSelectParent = employeeTitleSelect.closest('.mb-3');
            if (titleSelectParent) {
                // Insert the new input container after the title select's parent
                titleSelectParent.parentNode.insertBefore(employeeOtherTitleInputContainer, titleSelectParent.nextSibling);
                employeeOtherTitleInput = document.getElementById('employeeOtherTitle'); // Assign the element
                employeeOtherTitleInput.setAttribute('required', 'true'); // Make it required
                employeeOtherTitleInput.focus(); // Focus on the new input
            }
        } else {
            // Remove the 'Other Title' input if 'Other' is not selected
            if (employeeOtherTitleInputContainer.parentNode) {
                employeeOtherTitleInputContainer.remove();
                if (employeeOtherTitleInput) {
                    employeeOtherTitleInput.removeAttribute('required');
                    employeeOtherTitleInput.classList.remove('is-invalid');
                }
            }
        }
    });

    // Event listener for Add Employee form submission
    addEmployeeForm.addEventListener('submit', handleAddEmployeeSubmit);

    // Event listener to clear validation on modal close
    document.getElementById('addEmployeeModal').addEventListener('hidden.bs.modal', () => {
        addEmployeeForm.reset();
        addEmployeeForm.querySelectorAll('.form-control, .form-select').forEach(input => {
            input.classList.remove('is-invalid');
        });
        // Ensure "Other Title" input is hidden when modal closes
        if (employeeOtherTitleInputContainer.parentNode) {
            employeeOtherTitleInputContainer.remove();
        }
    });
});
