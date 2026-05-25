const API_URL =
"http://localhost:5000/feedbacks";

/* =========================
   LOGIN CHECK
========================= */

if (
    localStorage.getItem("isLoggedIn")
    !== "true"
) {

    window.location.href =
    "login.html";
}

/* =========================
   ELEMENTS
========================= */

const complaintForm =
document.getElementById(
    "complaintForm"
);

const issueContainer =
document.getElementById(
    "issueContainer"
);

const darkModeToggle =
document.getElementById(
    "darkModeToggle"
);

const adminBtn =
document.getElementById(
    "adminBtn"
);

const logoutBtn =
document.getElementById(
    "logoutBtn"
);

const supportBtn =
document.getElementById(
    "supportBtn"
);

const supportModal =
document.getElementById(
    "supportModal"
);

const closeSupport =
document.getElementById(
    "closeSupport"
);

const issueDescription =
document.getElementById(
    "issueDescription"
);

const charCount =
document.getElementById(
    "charCount"
);

const toast =
document.getElementById(
    "toast"
);

let toastTimeout;

/* =========================
   PAGE LOAD
========================= */

window.addEventListener(
    "DOMContentLoaded",
    function () {

        const darkMode =
        localStorage.getItem(
            "darkMode"
        );

        if (darkMode === "true") {

            document.body.classList.add(
                "dark-mode"
            );

            if(darkModeToggle){

                darkModeToggle.textContent =
                "Light Mode";
            }
        }

        if(issueContainer){

            issueContainer.innerHTML = `
                <div style="text-align:center;">
                    <h3>No Feedback Preview</h3>
                    <p>
                        Submit feedback to preview here.
                    </p>
                </div>
            `;
        }
    }
);

/* =========================
   CHARACTER COUNT
========================= */

if(issueDescription){

    issueDescription.addEventListener(
        "input",
        function(){

            charCount.textContent =
            issueDescription.value.length;
        }
    );
}

/* =========================
   DARK MODE
========================= */

if(darkModeToggle){

    darkModeToggle.addEventListener(
        "click",
        function(){

            document.body.classList.toggle(
                "dark-mode"
            );

            const enabled =
            document.body.classList.contains(
                "dark-mode"
            );

            localStorage.setItem(
                "darkMode",
                enabled
            );

            darkModeToggle.textContent =
            enabled
            ? "Light Mode"
            : "Dark Mode";
        }
    );
}

/* =========================
   LOGOUT
========================= */

if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        function(){

            localStorage.removeItem(
                "isLoggedIn"
            );

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            window.location.href =
            "login.html";
        }
    );
}

/* =========================
   ADMIN BUTTON
========================= */

if(adminBtn){

    adminBtn.addEventListener(
        "click",
        function(){

            window.location.href =
            "../admin.html";
        }
    );
}

/* =========================
   SUPPORT MODAL OPEN
========================= */

if(
    supportBtn &&
    supportModal
){

    supportBtn.addEventListener(
        "click",
        function(){

            supportModal.classList.remove(
                "hidden"
            );
        }
    );
}

/* =========================
   SUPPORT MODAL CLOSE
========================= */

if(
    closeSupport &&
    supportModal
){

    closeSupport.addEventListener(
        "click",
        function(){

            supportModal.classList.add(
                "hidden"
            );
        }
    );
}

/* =========================
   CLOSE OUTSIDE MODAL
========================= */

window.addEventListener(
    "click",
    function(event){

        if(
            supportModal &&
            event.target === supportModal
        ){

            supportModal.classList.add(
                "hidden"
            );
        }
    }
);

/* =========================
   FORM SUBMIT
========================= */

if(complaintForm){

    complaintForm.addEventListener(
        "submit",
        handleSubmit
    );
}

async function handleSubmit(event){

    event.preventDefault();

    const issue = {

        id: Date.now(),

        employeeId:
        document.getElementById(
            "employeeId"
        ).value,

        employeeName:
        document.getElementById(
            "employeeName"
        ).value,

        employeeEmail:
        document.getElementById(
            "employeeEmail"
        ).value,

        employeePhone:
        document.getElementById(
            "employeePhone"
        ).value,

        department:
        document.getElementById(
            "department"
        ).value,

        category:
        document.getElementById(
            "category"
        ).value,

        issueTitle:
        document.getElementById(
            "issueTitle"
        ).value,

        issueDescription:
        document.getElementById(
            "issueDescription"
        ).value,

        priority:
        document.getElementById(
            "priority"
        ).value,

        status: "Pending",

        timestamp:
        new Date().toISOString()
    };

    displayIssue(issue);

    saveIssue(issue);

    await sendToServer(issue);

    showToast(
        "Feedback submitted successfully"
    );

    complaintForm.reset();

    if(charCount){

        charCount.textContent = "0";
    }
}

/* =========================
   DISPLAY ISSUE
========================= */

function displayIssue(issue){

    let priorityClass = "tag-low";

    if(issue.priority === "High"){

        priorityClass = "tag-high";
    }
    else if(
        issue.priority === "Medium"
    ){

        priorityClass = "tag-medium";
    }

    issueContainer.innerHTML = `

        <div class="issue-card">

            <h3>
                ${issue.issueTitle}
            </h3>

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

    setTimeout(function(){

        issueContainer.innerHTML = `
            <div style="text-align:center;">
                <h3>No Feedback Preview</h3>
                <p>
                    Submit feedback to preview here.
                </p>
            </div>
        `;

    }, 5000);
}

/* =========================
   SAVE LOCAL
========================= */

function saveIssue(issue){

    const issues =
    JSON.parse(
        localStorage.getItem(
            "issues"
        )
    ) || [];

    issues.push(issue);

    localStorage.setItem(
        "issues",
        JSON.stringify(issues)
    );
}

/* =========================
   SEND SERVER
========================= */

async function sendToServer(issue){

    try{

        await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(issue)
        });

    }
    catch(error){

        console.log(error);

        showToast(
            "Saved locally. Server offline."
        );
    }
}

/* =========================
   TOAST
========================= */

function showToast(message){

    if(!toast){

        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(
        function(){

            toast.classList.remove(
                "show"
            );

        },
        4000
    );
}