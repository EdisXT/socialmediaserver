// ========================================
// LOGIN
// ========================================

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");

const resendVerificationButton =
    document.getElementById("resend-verification-button");


// ========================================
// LOGIN SUBMIT
// ========================================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    const formData =
        new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);


    // Clear previous message
    loginMessage.textContent = "";

    // Hide resend button until we know
    // the account actually needs verification
    resendVerificationButton.hidden = true;


    fetch(`${API_URL}/login`, {

        method: "POST",

        body: formData

    })

        .then(function (response) {

            return response.json().then(function (data) {

                return {
                    ok: response.ok,
                    status: response.status,
                    data: data
                };

            });

        })

        .then(function (result) {


            // ========================================
            // LOGIN FAILED
            // ========================================

            if (!result.ok) {

                console.log(
                    "Login failed:",
                    result.data
                );


                // Email has not been verified
                if (
                    result.status === 403 &&
                    result.data.detail ===
                    "Please verify your email before logging in"
                ) {

                    loginMessage.textContent =
                        "Please verify your email before logging in. Check your inbox for the verification email.";

                    resendVerificationButton.hidden = false;

                    return;
                }


                // Other login errors
                loginMessage.textContent =
                    result.data.detail ||
                    "Email or password is incorrect.";

                return;
            }


            // ========================================
            // LOGIN SUCCESSFUL
            // ========================================

            if (!result.data.access_token) {

                loginMessage.textContent =
                    "Unable to log in. Please try again.";

                return;
            }


            localStorage.setItem(
                "token",
                result.data.access_token
            );


            console.log("Logged in!");


            window.location.reload();

        })

        .catch(function (error) {

            console.log(
                "Login error:",
                error
            );


            loginMessage.textContent =
                "Something went wrong. Please try again.";

        });

});


// ========================================
// RESEND VERIFICATION EMAIL
// ========================================

resendVerificationButton.addEventListener(
    "click",
    function () {

        const email =
            document.getElementById("email").value;


        // Make sure an email was entered
        if (!email) {

            loginMessage.textContent =
                "Enter your email address first.";

            return;
        }


        // Prevent repeated clicks while sending
        resendVerificationButton.disabled = true;

        resendVerificationButton.textContent =
            "Sending...";


        fetch(`${API_URL}/resend-verification`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })

        })

            .then(function (response) {

                return response.json().then(function (data) {

                    return {
                        ok: response.ok,
                        data: data
                    };

                });

            })

            .then(function (result) {

                if (!result.ok) {

                    console.log(
                        "Resend verification failed:",
                        result.data
                    );


                    loginMessage.textContent =
                        result.data.detail ||
                        "Could not resend verification email.";

                    return;
                }


                console.log(
                    "Verification email resent:",
                    result.data
                );


                loginMessage.textContent =
                    result.data.message ||
                    "Verification email sent. Check your inbox.";

            })

            .catch(function (error) {

                console.log(
                    "Resend verification error:",
                    error
                );


                loginMessage.textContent =
                    "Something went wrong. Please try again.";

            })

            .finally(function () {

                resendVerificationButton.disabled = false;

                resendVerificationButton.textContent =
                    "Resend verification email";

            });

    }
);


// ========================================
// REGISTER USER
// ========================================

const registerForm =
    document.getElementById("register-form");

const registerMessage =
    document.getElementById("register-message");


registerForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const email =
        document.getElementById("register-email").value;

    const username =
        document.getElementById("register-username").value;

    const password =
        document.getElementById("register-password").value;


    // Clear previous message
    registerMessage.textContent = "";


    fetch(`${API_URL}/users/`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            username: username,
            password: password
        })

    })

        .then(function (response) {

            return response.json().then(function (data) {

                return {
                    ok: response.ok,
                    status: response.status,
                    data: data
                };

            });

        })

        .then(function (result) {


            // ========================================
            // REGISTRATION FAILED
            // ========================================

            if (!result.ok) {

                console.log(
                    "Registration failed:",
                    result.data
                );


                registerMessage.textContent =
                    result.data.detail ||
                    "Could not create account.";

                return;
            }


            // ========================================
            // REGISTRATION SUCCESSFUL
            // ========================================


            registerMessage.textContent =
                "Account created! Check your email to verify your account before logging in.";


            registerForm.reset();

        })

        .catch(function (error) {

            console.log(
                "Registration error:",
                error
            );


            registerMessage.textContent =
                "Something went wrong. Please try again.";

        });

});


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logout-button");


logoutButton.addEventListener("click", function () {

    localStorage.removeItem("token");

    window.location.reload();

});