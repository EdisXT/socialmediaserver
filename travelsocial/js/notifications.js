// ========================================
// NOTIFICATIONS
// ========================================

const notificationCount =
    document.getElementById(
        "sidebar-notification-count"
    );

const pageNotificationCount =
    document.getElementById("notification-count");

const loadNotificationsButton =
    document.getElementById(
        "load-notifications-button"
    );

const markAllReadButton =
    document.getElementById(
        "mark-all-read-button"
    );

const notificationsContainer =
    document.getElementById(
        "notifications-container"
    );


// ========================================
// GET UNREAD COUNT
// ========================================

function loadUnreadCount() {

    if (!token) {
        return;
    }


    fetch(
        `${API_URL}/notifications/unread-count`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    `Bearer ${token}`

            }

        }
    )

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {


            notificationCount.textContent =
                data.unread_count;

            if (pageNotificationCount) {
                pageNotificationCount.textContent =
                data.unread_count;
            }

        });

}


// ========================================
// LOAD NOTIFICATIONS
// ========================================

function loadNotifications() {

    fetch(
        `${API_URL}/notifications/`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    `Bearer ${token}`

            }

        }
    )

        .then(function (response) {

            return response.json();

        })

        .then(function (notifications) {


            notificationsContainer.innerHTML =
                "";


            if (notifications.length === 0) {

                notificationsContainer.innerHTML = `
        <div class="notifications-empty-state">

            <div class="notifications-empty-icon">
                ♡
            </div>

            <h3>No notifications yet</h3>

            <p>
                When someone likes, comments on, or follows you,
                you'll see it here.
            </p>

        </div>
    `;

                return;
            }

            notifications.forEach(function (notification) {

                const actorName =
                    notification.actor.username || "Traveler";

                const actorInitial =
                    actorName.charAt(0).toUpperCase();

                const actorPicture =
                    notification.actor.profile_picture;

                let message = "";

                if (notification.type === "follow") {
                    message = "followed you";
                }

                else if (notification.type === "like") {
                    message = "liked your post";
                }

                else if (notification.type === "comment") {
                    message = "commented on your post";
                }

                else if (notification.type === "message") {
                    message = "sent you a message";
                }

                else {
                    message = "sent you a notification";
                }


                // Profile picture or first-letter fallback
                const avatarHTML = actorPicture
                    ? `
            <img
                src="${actorPicture}"
                alt="${actorName}"
                class="notification-avatar-image"
            >
        `
                    : `
            <div class="notification-avatar-fallback">
                ${actorInitial}
            </div>
        `;


                const notificationDate =
                    new Date(notification.created_at);

                const formattedTime =
                    notificationDate.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    });


                notificationsContainer.innerHTML += `

        <div
            class="notification-item ${notification.is_read ? "notification-read" : "notification-unread"}"
            data-notification-id="${notification.id}"
        >

            <div class="notification-avatar">
                ${avatarHTML}
            </div>


            <div class="notification-content">

                <p class="notification-message">
                    <strong>${actorName}</strong>
                    ${message}
                </p>

                <span class="notification-time">
                    ${formattedTime}
                </span>

            </div>


            <div class="notification-right">

                ${notification.is_read
                        ? `
                            <span
                                class="notification-read-indicator"
                                title="Read"
                            >
                                ✓
                            </span>
                        `
                        : `
                            <span
                                class="notification-unread-dot"
                                title="Unread"
                            ></span>

                            <button
                                class="mark-read-button"
                                data-notification-id="${notification.id}"
                                type="button"
                            >
                                Mark read
                            </button>
                        `
                    }

            </div>

        </div>
    `;

            });

        });

}


// ========================================
// LOAD NOTIFICATIONS BUTTON
// ========================================

loadNotificationsButton.addEventListener(
    "click",
    function () {

        loadNotifications();

        loadUnreadCount();

    }
);


// ========================================
// MARK ONE NOTIFICATION READ
// ========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.classList.contains(
                "mark-read-button"
            )
        ) {
            return;
        }


        const notificationId =
            event.target.dataset.notificationId;


        fetch(
            `${API_URL}/notifications/${notificationId}/read`,
            {

                method: "PATCH",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        )

            .then(function (response) {

                if (!response.ok) {

                    console.log(
                        "Could not mark notification read:",
                        response.status
                    );

                    return;

                }


                console.log(
                    "Notification marked read"
                );


                loadNotifications();

                loadUnreadCount();

            });

    }
);


// ========================================
// MARK ALL NOTIFICATIONS READ
// ========================================

markAllReadButton.addEventListener(
    "click",
    function () {

        fetch(
            `${API_URL}/notifications/read-all`,
            {

                method: "PATCH",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        )

            .then(function (response) {

                if (!response.ok) {

                    console.log(
                        "Could not mark all notifications read:",
                        response.status
                    );

                    return;

                }


                console.log(
                    "All notifications marked read"
                );


                loadNotifications();

                loadUnreadCount();

            });

    }
);

// ========================================
// SIDEBAR NOTIFICATIONS
// ========================================

const notificationsNavButton =
    document.querySelector(
        '[data-view="notifications"]'
    );


if (notificationsNavButton) {

    notificationsNavButton.addEventListener(
        "click",
        function () {

            loadNotifications();

            loadUnreadCount();

        }
    );

}

// ========================================
// LOAD COUNT WHEN PAGE OPENS
// ========================================

loadUnreadCount();

setInterval(function () {

    loadUnreadCount();

}, 10000);