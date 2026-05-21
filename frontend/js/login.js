const loginForm =
document.getElementById(
    "loginForm"
);

const errorMessage =
document.getElementById(
    "errorMessage"
);

loginForm.addEventListener(
    "submit",
    function(event){

        event.preventDefault();

        const email =
        document.getElementById(
            "email"
        ).value;

        const password =
        document.getElementById(
            "password"
        ).value;

        if(
            email ===
            "mathewdivine95@gmail.com"

            &&

            password ===
            "1234"
        ){

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            window.location.href =
            "index.html";

        }
        else{

            errorMessage.style.display =
            "block";

        }

    }
);