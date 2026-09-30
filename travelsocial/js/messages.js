// ========================================
// MESSAGING
// ========================================

const conversationsContainer =
    document.getElementById(
        "conversations-container"
    );

const conversationTitle =
    document.getElementById(
        "conversation-title"
    );

const messagesContainer =
    document.getElementById(
        "messages-container"
    );

const messageForm =
    document.getElementById(
        "message-form"
    );

const messageInput =
    document.getElementById(
        "message-input"
    );

const conversationProfileLink =
    document.getElementById(
        "conversation-profile-link"
    );


// Stores the ID of the person
// whose conversation is currently open
let activeConversationUserId = null;
let activeConversationUsername = null;
let activeConversationProfilePicture = null;


// ========================================
// LOAD CONVERSATIONS
// ========================================

function loadConversations() {

    if (!token) {
        return;
    }


    fetch(
        `${API_URL}/messages/conversations`,
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

        .then(function (conversations) {


            conversationsContainer.innerHTML =
                "";


            if (conversations.length === 0) {

                conversationsContainer.innerHTML =
                    "<p>No conversations yet.</p>";

                return;

            }


            conversations.forEach(
                function (conversation) {

                    const username =
                        conversation.user.username || "User";

                    const initial =
                        username.charAt(0).toUpperCase();

                    const lastMessageTime =
                        new Date(
                            conversation.last_message_at
                        ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit"
                        });


                    conversationsContainer.innerHTML += `

            <button
                class="conversation open-conversation-button"
                data-user-id="${conversation.user.id}"
                data-username="${username}"
                data-profile-picture="${conversation.user.profile_picture || ""}"
                type="button">

                <div class="conversation-avatar">

    ${conversation.user.profile_picture
                            ? `
                <img
                    src="${conversation.user.profile_picture}"
                    alt="${username}">
            `
                            : initial
                        }

</div>


                <div class="conversation-info">

                    <div class="conversation-top-row">

                        <strong>
                            ${username}
                        </strong>

                        <span class="conversation-time">
                            ${lastMessageTime}
                        </span>

                    </div>


                    <div class="conversation-bottom-row">

                        <span class="conversation-preview">
                            ${conversation.last_message}
                        </span>

                        ${conversation.unread_count > 0
                            ? `
                                    <span class="conversation-unread">
                                        ${conversation.unread_count}
                                    </span>
                                `
                            : ""
                        }

                    </div>

                </div>

            </button>

        `;

                }
            );

        });

}




// ========================================
// OPEN CONVERSATION
// ========================================

function openConversation(
    userId,
    username,
    profilePicture = null
) {

    conversationProfileLink.dataset.userId =
        userId;

    activeConversationUserId =
        Number(userId);

    activeConversationUsername =
        username;

    activeConversationProfilePicture =
        profilePicture || null;


    conversationTitle.textContent =
        username;


    // Update conversation header avatar
    const conversationHeaderAvatar =
        document.getElementById(
            "conversation-header-avatar"
        );

    if (activeConversationProfilePicture) {

        conversationHeaderAvatar.innerHTML = `
            <img
                src="${activeConversationProfilePicture}"
                alt="${username}">
        `;

    } else {

        conversationHeaderAvatar.textContent =
            username.charAt(0).toUpperCase();

    }


    // Update status
    const conversationStatus =
        document.getElementById(
            "conversation-status"
        );

    conversationStatus.textContent =
        "View traveler profile";


    // Load messages with this user
    loadConversation(
        activeConversationUserId
    );


    // Open conversation panel on mobile
    openMobileConversation();
}


// ========================================
// CONVERSATION LIST CLICK
// ========================================

document.addEventListener(
    "click",
    function (event) {

        const conversationButton =
            event.target.closest(
                ".open-conversation-button"
            );

        if (!conversationButton) {
            return;
        }


        const userId =
            conversationButton.dataset.userId;

        const username =
            conversationButton.dataset.username;

        const profilePicture =
            conversationButton.dataset.profilePicture;


        openConversation(
            Number(userId),
            username,
            profilePicture
        );

    }
);


// ========================================
// LOAD MESSAGE HISTORY
// ========================================

function loadConversation(userId) {

    fetch(
        `${API_URL}/messages/${userId}`,
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

        .then(function (conversationHistory) {

            const messages =
                conversationHistory.messages;

            const firstUnreadMessageId =
                conversationHistory.first_unread_message_id;

            messagesContainer.innerHTML = "";

            if (messages.length === 0) {

                messagesContainer.innerHTML =
                    "<p>No messages yet.</p>";

                return;
            }

            messages.forEach(
                function (message) {

                    const isSent =
                        message.sender_id !==
                        activeConversationUserId;

                    const messageClass =
                        isSent ? "sent" : "received";


                    // Add the New Messages divider
                    // directly before the first unread message
                    if (
                        firstUnreadMessageId &&
                        message.id === firstUnreadMessageId
                    ) {

                        messagesContainer.innerHTML += `
                            <div class="new-messages-divider">
                                <span>New Messages</span>
                            </div>
                        `;
                    }


                    messagesContainer.innerHTML += `

                        <div class="message-row ${messageClass}">

                            ${!isSent
                                ? `
                                    <div class="message-avatar">

                                        ${activeConversationProfilePicture
                                            ? `
                                                <img
                                                    src="${activeConversationProfilePicture}"
                                                    alt="${activeConversationUsername || "User"}">
                                            `
                                            : (
                                                activeConversationUsername
                                                    ? activeConversationUsername.charAt(0).toUpperCase()
                                                    : "U"
                                            )
                                        }

                                    </div>
                                `
                                : ""
                            }

                            <div class="message-bubble">

                                <span class="message-text">
                                    ${message.content}
                                </span>

                                <small class="message-time">
                                    ${new Date(
                                        message.created_at
                                    ).toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit"
                                    })}
                                </small>

                            </div>

                        </div>
                    `;
                }
            );


            // If there are unread messages,
            // start the conversation at the divider.
            // Otherwise open at the newest message.
            const newMessagesDivider =
                messagesContainer.querySelector(
                    ".new-messages-divider"
                );

            if (newMessagesDivider) {

                newMessagesDivider.scrollIntoView({
                    block: "start"
                });

            } else {

                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;
            }


            // Opening the conversation marks
            // incoming messages as read.
            loadConversations();

        });

}


// ========================================
// SEND MESSAGE
// ========================================

messageForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (!activeConversationUserId) {

            console.log(
                "Open a conversation first"
            );

            return;

        }


        const content =
            messageInput.value.trim();


        if (!content) {

            return;

        }


        fetch(
            `${API_URL}/messages/`,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        receiver_id:
                            activeConversationUserId,

                        content:
                            content

                    })

            }
        )

            .then(function (response) {

                return response
                    .json()
                    .then(function (data) {

                        return {

                            ok:
                                response.ok,

                            data:
                                data

                        };

                    });

            })

            .then(function (result) {

                console.log(
                    "Message:",
                    result.data
                );


                if (!result.ok) {

                    console.log(
                        "Could not send message"
                    );

                    return;

                }


                messageInput.value =
                    "";


                loadConversation(
                    activeConversationUserId
                );

            });

    }
);

// ========================================
// MESSAGE USER FROM PROFILE
// ========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.classList.contains(
                "message-user-button"
            )
        ) {
            return;
        }


        const userId =
            event.target.dataset.userId;

        const username =
            event.target.dataset.username;


        activeConversationUserId =
            Number(userId);


        conversationTitle.textContent =
            `Conversation with ${username}`;


        loadConversation(
            activeConversationUserId
        );


        console.log(
            "Opened conversation with:",
            username
        );

    }
);

// ========================================
// OPEN PROFILE FROM CHAT HEADER
// ========================================

conversationProfileLink.addEventListener(
    "click",
    function () {

        const userId =
            conversationProfileLink.dataset.userId;

        if (!userId) {
            return;
        }

        loadProfile(userId);

        showView("profile");

    }
);

// ========================================
// MOBILE MESSAGES NAVIGATION
// ========================================

function openMobileConversation() {
    if (window.innerWidth > 768) {
        return;
    }

    const messagesLayout =
        document.querySelector(".messages-layout");

    if (messagesLayout) {
        messagesLayout.classList.add(
            "mobile-conversation-open"
        );
    }
}


function closeMobileConversation() {
    const messagesLayout =
        document.querySelector(".messages-layout");

    if (messagesLayout) {
        messagesLayout.classList.remove(
            "mobile-conversation-open"
        );
    }
}


// When a conversation is selected,
// switch from the conversation list to the chat.

document.addEventListener(
    "click",
    function (event) {

        const conversationButton =
            event.target.closest(
                ".open-conversation-button"
            );

        if (!conversationButton) {
            return;
        }

        openMobileConversation();
    }
);


// Mobile back button

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                "#mobile-messages-back-button"
            )
        ) {
            return;
        }

        closeMobileConversation();
    }
);


// Reset mobile message state when returning
// to desktop.

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 768) {
            closeMobileConversation();
        }
    }
);

// ========================================
// INITIAL LOAD
// ========================================

loadConversations();