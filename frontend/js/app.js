const API_URL = "http://localhost:5000/feedbacks";

if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const complaintForm = document.getElementById("complaintForm");
const issueContainer = document.getElementById("issueContainer");
const toast = document.getElementById("toast");
const darkModeToggle = document.getElementById("darkModeToggle");
const adminBtn = document.getElementById("adminBtn");
const logoutBtn = document.getElementById("logoutBtn");
const issueDescription = document.getElementById("issueDescription");
const charCount = document.getElementById("charCount");

let toastTimeout;

window.addEventListener("DOMContentLoaded", () => {

    const darkMode = localStorage.getItem("darkMode");

    if(darkMode === "true"){
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = "Light Mode";
    }

    issueContainer.innerHTML = `
        <div style="text-align:center;">
            <h3>No Feedback Preview</h3>
            <p>Submit feedback to preview the complaint here.</p>
        </div>
    `;
});

issueDescription.addEventListener("input", () => {
    charCount.textContent = issueDescription.value.length;
});

darkModeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const enabled =
    document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", enabled);

    darkModeToggle.textContent =
    enabled ? "Light Mode" : "Dark Mode";
});

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("isLoggedIn");

    window.location.href = "login.html";
});

adminBtn.addEventListener("click", () => {

    window.location.href = "../admin.html";
});

complaintForm.addEventListener("submit", handleSubmit);

async function handleSubmit(event){

    event.preventDefault();

    const issue = {
        id: Date.now(),
        employeeId: employeeId.value,
        employeeName: employeeName.value,
        employeeEmail: employeeEmail.value,
        employeePhone: employeePhone.value,
        department: department.value,
        category: category.value,
        issueTitle: issueTitle.value,
        issueDescription: issueDescription.value,
        priority: priority.value,
        status: "Pending",
        timestamp: new Date().toISOString()
    };

    displayIssue(issue);

    saveIssue(issue);

    await sendToServer(issue);

    showToast(
        "Feedback submitted successfully!"
    );

    complaintForm.reset();

    charCount.textContent = "0";
}

function displayIssue(issue){

    const priorityClass =
    issue.priority === "High"
    ? "tag-high"
    : issue.priority === "Medium"
    ? "tag-medium"
    : "tag-low";

    issueContainer.innerHTML = `
        <div class="issue-card">
            <h3>${issue.issueTitle}</h3>

            <div class="tag-row">
                <span class="tag ${priorityClass}">
                    ${issue.priority}
                </span>

                <span class="tag tag-low">
                    ${issue.department}
                </span>
            </div>

            <p>
                <strong>Employee:</strong>
                ${issue.employeeName}
            </p>

            <p>
                <strong>Email:</strong>
                ${issue.employeeEmail}
            </p>

            <p>
                <strong>Description:</strong>
                ${issue.issueDescription}
            </p>

            <p>
                <strong>Status:</strong>
                ${issue.status}
            </p>
        </div>
    `;

    setTimeout(() => {

        issueContainer.innerHTML = `
            <div style="text-align:center;">
                <h3>No Feedback Preview</h3>
                <p>Submit feedback to preview the complaint here.</p>
            </div>
        `;

    },5000);
}

function saveIssue(issue){

    const issues =
    JSON.parse(
        localStorage.getItem("issues")
    ) || [];

    issues.push(issue);

    localStorage.setItem(
        "issues",
        JSON.stringify(issues)
    );
}

async function sendToServer(issue){

    try{

        await fetch(API_URL,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(issue)
        });

    }
    catch(error){

        console.log(error);

        showToast(
            "Saved locally. Server not connected."
        );
    }
}

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    },4000);
}
/* ================= SUPPORT MODAL ================= */

const supportBtn =
document.getElementById("supportBtn");

const supportModal =
document.getElementById("supportModal");

const closeSupport =
document.getElementById("closeSupport");

if(supportBtn){

    supportBtn.addEventListener(
        "click",
        function(){

            supportModal.classList.remove(
                "hidden"
            );

        }
    );

}

if(closeSupport){

    closeSupport.addEventListener(
        "click",
        function(){

            supportModal.classList.add(
                "hidden"
            );

        }
    );

}

window.addEventListener(
    "click",
    function(event){

        if(event.target === supportModal){

            supportModal.classList.add(
                "hidden"
            );

        }

    }
);