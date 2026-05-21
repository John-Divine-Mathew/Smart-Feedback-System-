const API_URL = "http://localhost:5000/feedbacks";
const ADMIN_PASSWORD = "HIROTEC123";

const adminLoginModal = document.getElementById("adminLoginModal");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");
const adminContent = document.getElementById("adminContent");
const adminIssueContainer = document.getElementById("adminIssueContainer");
const totalIssuesAdmin = document.getElementById("totalIssuesAdmin");
const pendingIssuesAdmin = document.getElementById("pendingIssuesAdmin");
const resolvedIssuesAdmin = document.getElementById("resolvedIssuesAdmin");
const adminSearchInput = document.getElementById("adminSearchInput");
const filterPriority = document.getElementById("filterPriority");
const notificationBell = document.getElementById("notificationBell");
const notificationPanel = document.getElementById("notificationPanel");
const notificationCount = document.getElementById("notificationCount");
const notificationList = document.getElementById("notificationList");
const clearNotifications = document.getElementById("clearNotifications");
const darkModeToggle = document.getElementById("darkModeToggle");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

let issues = [];
let notifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
let toastTimeout = null;

window.addEventListener("load", function () {
    if (sessionStorage.getItem("adminLoggedIn") === "true") {
        openAdminDashboard();
    } else {
        adminLoginModal.style.display = "grid";
        adminContent.classList.add("hidden");
    }
    renderNotifications();
});

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const password = document.getElementById("adminPassword").value;
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem("adminLoggedIn", "true");
            adminLoginModal.style.display = "none";
            adminContent.classList.remove("hidden");
            adminLoginForm.reset();
            loadAdminIssues();
            showToast("Login successful. Welcome to the admin dashboard.");
        } else {
            adminLoginError.textContent = "Invalid password. Please try again.";
            setTimeout(() => {
                adminLoginError.textContent = "";
            }, 2500);
        }
    });
}

if (notificationBell) {
    notificationBell.addEventListener("click", function () {
        notificationPanel.classList.toggle("active");
    });
}

if (clearNotifications) {
    clearNotifications.addEventListener("click", function () {
        notifications = [];
        localStorage.setItem("adminNotifications", JSON.stringify(notifications));
        renderNotifications();
    });
}

if (adminSearchInput) {
    adminSearchInput.addEventListener("input", renderFilteredIssues);
}

if (filterPriority) {
    filterPriority.addEventListener("change", renderFilteredIssues);
}

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("adminLoggedIn");
        window.location.href = "frontend/index.html";
    });
}

async function openAdminDashboard() {
    adminLoginModal.style.display = "none";
    adminContent.classList.remove("hidden");
    await loadAdminIssues();
}

async function loadAdminIssues() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Could not fetch issues");
        }
        issues = await response.json();
        localStorage.setItem("issues", JSON.stringify(issues));
    } catch (error) {
        issues = JSON.parse(localStorage.getItem("issues")) || [];
    }
    renderIssues(issues);
    updateAdminDashboard();
    saveNotification("Admin dashboard loaded.");
}

function renderIssues(items) {
    if (!adminIssueContainer) {
        return;
    }
    adminIssueContainer.innerHTML = "";
    if (!items.length) {
        adminIssueContainer.innerHTML = `<div class="issue-card"><h3>No feedback records found.</h3><p>Once employees submit feedback, it will appear here.</p></div>`;
        return;
    }
    items.forEach((issue) => {
        const card = document.createElement("div");
        card.className = "issue-card";
        card.dataset.id = issue.id;
        const priorityTag = issue.priority === "High" ? "tag-high" : issue.priority === "Medium" ? "tag-medium" : "tag-low";
        card.innerHTML = `
            <h3>${issue.issueTitle}</h3>
            <div class="tag-row">
                <span class="tag ${priorityTag}">${issue.priority}</span>
                <span class="tag tag-low">${issue.department}</span>
                <span class="tag tag-low">${issue.status}</span>
            </div>
            <p><strong>Employee ID:</strong> ${issue.employeeId}</p>
            <p><strong>Name:</strong> ${issue.employeeName}</p>
            <p><strong>Description:</strong> ${issue.issueDescription}</p>
            <p><strong>Submitted:</strong> ${new Date(issue.timestamp).toLocaleString()}</p>
            <div class="card-actions">
                <button class="resolve-btn">Resolve</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        adminIssueContainer.appendChild(card);
    });
}

function updateAdminDashboard() {
    const total = issues.length;
    const resolved = issues.filter((item) => item.status === "Resolved").length;
    const pending = total - resolved;
    if (totalIssuesAdmin) totalIssuesAdmin.textContent = total;
    if (pendingIssuesAdmin) pendingIssuesAdmin.textContent = pending;
    if (resolvedIssuesAdmin) resolvedIssuesAdmin.textContent = resolved;
}

function renderFilteredIssues() {
    const searchValue = adminSearchInput ? adminSearchInput.value.toLowerCase() : "";
    const priorityValue = filterPriority ? filterPriority.value : "All";
    const filtered = issues.filter((issue) => {
        const matchesSearch = [
            issue.employeeId,
            issue.employeeName,
            issue.issueTitle,
            issue.issueDescription,
            issue.category
        ].some((field) => field && field.toLowerCase().includes(searchValue));
        const matchesPriority = priorityValue === "All" || issue.priority === priorityValue;
        return matchesSearch && matchesPriority;
    });
    renderIssues(filtered);
}

function findIssue(id) {
    return issues.find((item) => String(item.id) === String(id));
}

async function markResolved(id) {
    const issue = findIssue(id);
    if (!issue || issue.status === "Resolved") {
        return;
    }
    issue.status = "Resolved";
    await updateServerIssue(id, { status: "Resolved" });
    syncIssues();
    showToast("Feedback marked resolved.");
}

async function deleteIssue(id) {
    issues = issues.filter((item) => String(item.id) !== String(id));
    await removeServerIssue(id);
    syncIssues();
    showToast("Feedback deleted from the dashboard.");
}

async function updateServerIssue(id, updates) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });
    } catch (error) {
        console.error("Failed to update server issue", error);
    }
}

async function removeServerIssue(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
    } catch (error) {
        console.error("Failed to delete server issue", error);
    }
}

function syncIssues() {
    localStorage.setItem("issues", JSON.stringify(issues));
    renderFilteredIssues();
    updateAdminDashboard();
}

function saveNotification(message) {
    const notification = {
        id: Date.now(),
        message,
        timestamp: new Date().toISOString()
    };
    notifications.unshift(notification);
    if (notifications.length > 10) {
        notifications = notifications.slice(0, 10);
    }
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    if (!notificationList || !notificationCount) {
        return;
    }
    notificationList.innerHTML = "";
    if (!notifications.length) {
        notificationList.innerHTML = `<p class="notification-empty">No notifications yet.</p>`;
    } else {
        notifications.forEach((item) => {
            const entry = document.createElement("div");
            entry.className = "notification-item";
            entry.innerHTML = `
                <p>${item.message}</p>
                <small>${new Date(item.timestamp).toLocaleString()}</small>
            `;
            notificationList.appendChild(entry);
        });
    }
    notificationCount.textContent = String(notifications.length);
}

function showToast(message) {
    if (!toast) {
        return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4500);
}

document.addEventListener("click", function (event) {
    const resolveButton = event.target.closest(".resolve-btn");
    const deleteButton = event.target.closest(".delete-btn");
    if (resolveButton) {
        const card = resolveButton.closest(".issue-card");
        if (card && card.dataset.id) {
            markResolved(card.dataset.id);
        }
    }
    if (deleteButton) {
        const card = deleteButton.closest(".issue-card");
        if (card && card.dataset.id) {
            deleteIssue(card.dataset.id);
        }
    }
});
