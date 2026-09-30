// ========================================
// VORTEX NAVIGATION
// ========================================

// All sidebar navigation buttons
const navigationButtons =
    document.querySelectorAll("[data-view]");

// All application views
const applicationViews =
    document.querySelectorAll(".app-view");


// ========================================
// SHOW VIEW
// ========================================

function showView(viewName) {

    // Hide every view
    applicationViews.forEach(function (view) {

        view.style.display = "none";

    });


    // Find the view we want
    const selectedView =
        document.querySelector(
            `[data-view-name="${viewName}"]`
        );


    // Show it
    if (selectedView) {

        selectedView.style.display = "block";

    }


    // Remove active state from sidebar buttons
    navigationButtons.forEach(function (button) {

        button.classList.remove("active");

    });


    // Find the clicked navigation button
    const activeButton =
        document.querySelector(
            `[data-view="${viewName}"]`
        );


    // Give it active styling
    if (activeButton) {

        activeButton.classList.add("active");

    }

}


// ========================================
// SIDEBAR CLICKS
// ========================================

navigationButtons.forEach(function (button) {
    button.addEventListener(
        "click",
        function () {
            const viewName =
                button.dataset.view;

            showView(viewName);

            if (
                viewName === "profile" &&
                typeof loadMyProfile === "function"
            ) {
                loadMyProfile();
            }
        }
    );
});


// ========================================
// CREATE BUTTON
// ========================================

const createPostButton =
    document.getElementById(
        "open-create-post-button"
    );

if (createPostButton) {

    createPostButton.addEventListener(
        "click",
        function () {

            showView("create");

        }
    );

}


// ========================================
// SIDEBAR LOGOUT
// ========================================

const sidebarLogoutButton =
    document.getElementById(
        "sidebar-logout-button"
    );

const originalLogoutButton =
    document.getElementById(
        "logout-button"
    );

if (
    sidebarLogoutButton &&
    originalLogoutButton
) {

    sidebarLogoutButton.addEventListener(
        "click",
        function () {

            originalLogoutButton.click();

        }
    );

}


// ========================================
// AUTHENTICATION STATE
// ========================================

function initializeApp() {

    const savedToken =
        localStorage.getItem("token");

    const sidebar =
        document.querySelector(".sidebar");

    if (savedToken) {

        // User is logged in
        sidebar.style.display = "flex";

        showView("home");

    } else {

        // User is logged out
        sidebar.style.display = "none";

        showView("auth");

    }

}

initializeApp();

// ========================================
// DARK MODE
// ========================================

const themeToggleButton =
    document.getElementById(
        "theme-toggle-button"
    );

function updateThemeButton() {

    if (!themeToggleButton) {
        return;
    }

    const darkModeEnabled =
        document.body.classList.contains(
            "dark-mode"
        );

    themeToggleButton.innerHTML =
        darkModeEnabled
            ? `
                <span class="sidebar-icon">☀</span>
                <span>Light Mode</span>
              `
            : `
                <span class="sidebar-icon">☾</span>
                <span>Dark Mode</span>
              `;
}


// Load saved theme when page starts

const savedTheme =
    localStorage.getItem("vortex-theme");

if (savedTheme === "dark") {
    document.body.classList.add(
        "dark-mode"
    );
}

updateThemeButton();


// Toggle theme

if (themeToggleButton) {

    themeToggleButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );

            const darkModeEnabled =
                document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "vortex-theme",
                darkModeEnabled
                    ? "dark"
                    : "light"
            );

            updateThemeButton();
        }
    );
}

// =========================================
// MOBILE MORE MENU
// =========================================

const mobileMoreButton =
    document.getElementById("mobile-more-button");

const mobileMoreMenu =
    document.getElementById("mobile-more-menu");

const mobileThemeButton =
    document.getElementById("mobile-theme-button");

const mobileLogoutButton =
    document.getElementById("mobile-logout-button");


if (mobileMoreButton && mobileMoreMenu) {

    mobileMoreButton.addEventListener("click", function (event) {
        event.stopPropagation();

        mobileMoreMenu.hidden =
            !mobileMoreMenu.hidden;
    });


    mobileMoreMenu.addEventListener("click", function (event) {
        event.stopPropagation();
    });


    document.addEventListener("click", function () {
        mobileMoreMenu.hidden = true;
    });
}


// Notifications already uses data-view="notifications",
// so our existing navigation system handles it.


// MOBILE DARK MODE
if (mobileThemeButton) {

    mobileThemeButton.addEventListener("click", function () {

        const desktopThemeButton =
            document.getElementById("theme-toggle-button");

        if (desktopThemeButton) {
            desktopThemeButton.click();
        }

        if (mobileMoreMenu) {
            mobileMoreMenu.hidden = true;
        }
    });
}


// MOBILE LOGOUT
if (mobileLogoutButton) {

    mobileLogoutButton.addEventListener("click", function () {

        const originalLogoutButton =
            document.getElementById("logout-button");

        if (originalLogoutButton) {
            originalLogoutButton.click();
        }

    });
}