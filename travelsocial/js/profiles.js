// ========================================
// USER SEARCH
// ========================================

const userSearchForm =
    document.getElementById(
        "user-search-form"
    );


userSearchForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const query =
        document.getElementById(
            "user-search-input"
        ).value;


    fetch(
        `${API_URL}/users/search?query=${encodeURIComponent(query)}`,
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

        .then(function (users) {


            const results =
                document.getElementById(
                    "user-search-results"
                );


            results.innerHTML = "";


            users.forEach(function (user) {

                results.innerHTML += `

                    <div class="user-search-result">

                        <strong>
                            ${user.username || "No username"}
                        </strong>

                        <button
                            class="view-profile-button"
                            data-user-id="${user.id}">
                            View Profile
                        </button>

                    </div>
                `;

            });


            if (users.length === 0) {

                results.innerHTML =
                    "<p>No users found.</p>";

            }

        });

});


// ========================================
// VIEW PROFILE
// ========================================

document.addEventListener("click", function (event) {

    if (
        !event.target.classList.contains(
            "view-profile-button"
        )
    ) {
        return;
    }


    const userId =
        event.target.dataset.userId;


    loadProfile(userId);
    showView("profile");

});


// ========================================
// LOAD PROFILE
// ========================================

function loadProfile(userId) {

    const myProfileSection =
        document.getElementById(
            "my-profile-section"
        );

    const travelerProfileSection =
        document.getElementById(
            "traveler-profile-section"
        );

    myProfileSection.hidden = true;
    travelerProfileSection.hidden = false;


    fetch(
        `${API_URL}/users/${userId}/profile`,
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

        .then(function (profile) {


            const profileContainer =
                document.getElementById(
                    "profile-container"
                );


            profileContainer.innerHTML = `

                <div class="profile-card">

                    ${profile.profile_picture
                    ? `
                            <img
                                class="traveler-profile-picture"
                                src="${profile.profile_picture}"
                                alt="Profile picture"
                            >
                        `
                    : `
                            <div class="traveler-profile-picture-fallback">
                                ${(profile.username || "V")
                        .charAt(0)
                        .toUpperCase()}
                            </div>
                        `
                }


                    <h3>
                        ${profile.username || "No username"}
                    </h3>


                    <p>
                        ${profile.bio || "No bio yet."}
                    </p>


                    <p>
                        Home:
                        ${profile.home_country || "Not set"}
                    </p>


                    <p>
                        Followers:
                        <strong>
                            ${profile.followers_count}
                        </strong>
                    </p>


                    <p>
                        Following:
                        <strong>
                            ${profile.following_count}
                        </strong>
                    </p>


                    <button
                        class="follow-button"
                        data-user-id="${profile.id}"
                        data-following="${profile.is_following}"
                        type="button"
                    >
                        ${profile.is_following
                    ? "Unfollow"
                    : "Follow"
                }
                    </button>


                    <button
                        class="message-user-button"
                        data-user-id="${profile.id}"
                        data-username="${profile.username || "User"}"
                        type="button"
                    >
                        Message
                    </button>

                </div>
            `;


            loadProfileTrips(userId);

        });

}

// ========================================
// LOAD PROFILE TRIPS
// ========================================

function loadProfileTrips(userId) {

    const tripsSection =
        document.getElementById(
            "profile-trips-section"
        );

    const tripsContainer =
        document.getElementById(
            "profile-trips-container"
        );

    tripsSection.hidden = false;

    tripsContainer.innerHTML =
        "<p>Loading trips...</p>";

    fetch(`${API_URL}/posts/?user_id=${userId}`, {

        method: "GET",

        headers: {
            "Authorization":
                `Bearer ${token}`
        }

    })
        .then(function (response) {

            return response.json();

        })
        .then(function (posts) {


            tripsContainer.innerHTML = "";

            if (posts.length === 0) {

                tripsContainer.innerHTML = `
                    <div class="profile-trips-empty">
                        <p>
                            This traveler hasn't shared any trips yet.
                        </p>
                    </div>
                `;

                return;
            }

            posts.forEach(function (item) {

                const post = item.Post;

                tripsContainer.innerHTML += `

                    <div
                        class="profile-trip-card"
                        data-post-id="${post.id}"
                    >

                        <div class="profile-trip-image">

                            ${post.image_urls && post.image_urls.length > 0
                        ? `
        <img
            src="${post.image_urls[0]}"
            alt="${post.title || "Trip"}"
        >
    `
                        : post.image_url
                            ? `
            <img
                src="${post.image_url}"
                alt="${post.title || "Trip"}"
            >
        `
                            : `
            <div class="profile-trip-no-image">
                No image
            </div>
        `
                    }

                        </div>

                        <div class="profile-trip-info">

                            <h4>
                                ${post.title || "Untitled trip"}
                            </h4>

                            <p>
                                ${post.city || ""}
                                ${post.city && post.country
                        ? ", "
                        : ""
                    }
                                ${post.country || ""}
                            </p>

                        </div>

                    </div>
                `;

            });

        });

}


// ========================================
// FOLLOW / UNFOLLOW
// ========================================

document.addEventListener("click", function (event) {

    if (
        !event.target.classList.contains(
            "follow-button"
        )
    ) {
        return;
    }


    const button =
        event.target;


    const userId =
        button.dataset.userId;


    const isFollowing =
        button.dataset.following === "true";


    // UNFOLLOW

    if (isFollowing) {

        fetch(
            `${API_URL}/users/${userId}/follow`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        )

            .then(function (response) {

                if (!response.ok) {

                    console.log(
                        "Could not unfollow:",
                        response.status
                    );

                    return;
                }


                console.log(
                    "User unfollowed"
                );


                loadProfile(userId);

            });


        // FOLLOW

    } else {

        fetch(
            `${API_URL}/users/${userId}/follow`,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        )

            .then(function (response) {

                return response
                    .json()
                    .then(function (data) {

                        return {

                            ok: response.ok,

                            data: data

                        };

                    });

            })

            .then(function (result) {

                console.log(
                    "Follow:",
                    result.data
                );


                if (!result.ok) {

                    return;

                }


                loadProfile(userId);

            });

    }

});



// ========================================
// MY PROFILE
// ========================================

const myProfileContainer =
    document.getElementById("my-profile-container");


// ========================================
// EDIT PROFILE ELEMENTS
// ========================================

const editProfileForm =
    document.getElementById("edit-profile-form");

const editProfileMessage =
    document.getElementById("edit-profile-message");

const profilePictureInput =
    document.getElementById("edit-profile-picture");

const profilePicturePreview =
    document.getElementById("profile-picture-preview");

const profilePicturePlaceholder =
    document.getElementById("profile-picture-placeholder");

const removeProfilePictureButton =
    document.getElementById("remove-profile-picture-button");


// ========================================
// PROFILE PICTURE STATE
// ========================================

let selectedProfilePicture = null;

let currentProfilePictureUrl = null;

let removeCurrentProfilePicture = false;


// ========================================
// LOAD MY PROFILE
// ========================================

function loadMyProfile() {

    if (!token) {
        return;
    }


    const myProfileSection =
        document.getElementById(
            "my-profile-section"
        );

    const travelerProfileSection =
        document.getElementById(
            "traveler-profile-section"
        );


    if (myProfileSection) {
        myProfileSection.hidden = false;
    }

    if (travelerProfileSection) {
        travelerProfileSection.hidden = true;
    }


    fetch(`${API_URL}/users/me`, {

        method: "GET",

        headers: {
            "Authorization":
                `Bearer ${token}`
        }

    })

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Could not load profile."
                );
            }

            return response.json();

        })

        .then(function (user) {

            // ========================================
            // DISPLAY PROFILE
            // ========================================

            const profilePictureHtml =
                user.profile_picture
                    ? `
                        <img
                            src="${user.profile_picture}"
                            alt="${user.username || "User"}"
                            class="my-profile-picture"
                        >
                    `
                    : `
                        <div class="my-profile-picture-fallback">
                            ${(
                        user.username ||
                        "V"
                    )
                        .charAt(0)
                        .toUpperCase()
                    }
                        </div>
                    `;


            myProfileContainer.innerHTML = `

                <div class="my-profile-display">

                    <div class="my-profile-avatar">
                        ${profilePictureHtml}
                    </div>

                    <div class="my-profile-info">

                        <h3>
                            ${user.username || "User"}
                        </h3>

                        <p>
                            ${user.email}
                        </p>

                        <p>
                            Bio:
                            ${user.bio || "No bio yet"}
                        </p>

                        <p>
                            Home country:
                            ${user.home_country || "Not set"}
                        </p>

                    </div>

                </div>

            `;


            // ========================================
            // LOAD MY TRIPS
            // ========================================

            loadProfileTrips(user.id);


            // ========================================
            // FILL EDIT FORM
            // ========================================

            document.getElementById(
                "edit-username"
            ).value =
                user.username || "";


            document.getElementById(
                "edit-bio"
            ).value =
                user.bio || "";


            document.getElementById(
                "edit-home-country"
            ).value =
                user.home_country || "";


            // ========================================
            // RESET PROFILE PICTURE STATE
            // ========================================

            currentProfilePictureUrl =
                user.profile_picture || null;

            selectedProfilePicture = null;

            removeCurrentProfilePicture = false;

            profilePictureInput.value = "";


            // ========================================
            // SHOW CURRENT PICTURE IN EDIT PREVIEW
            // ========================================

            if (currentProfilePictureUrl) {

                profilePicturePreview.src =
                    currentProfilePictureUrl;

                profilePicturePreview.hidden =
                    false;

                profilePicturePlaceholder.hidden =
                    true;

                removeProfilePictureButton.hidden =
                    false;

            } else {

                profilePicturePreview.src = "";

                profilePicturePreview.hidden =
                    true;

                profilePicturePlaceholder.hidden =
                    false;

                removeProfilePictureButton.hidden =
                    true;

            }

        })

        .catch(function (error) {

            console.log(
                "Load profile error:",
                error
            );

        });

}


// ========================================
// PROFILE PICTURE PREVIEW
// ========================================

profilePictureInput.addEventListener(
    "change",
    function () {

        const file =
            profilePictureInput.files[0];


        if (!file) {
            return;
        }


        // Only allow image files

        if (!file.type.startsWith("image/")) {

            editProfileMessage.textContent =
                "Please choose an image file.";

            profilePictureInput.value = "";

            return;
        }


        selectedProfilePicture = file;

        removeCurrentProfilePicture = false;


        const previewUrl =
            URL.createObjectURL(file);


        profilePicturePreview.src =
            previewUrl;

        profilePicturePreview.hidden =
            false;

        profilePicturePlaceholder.hidden =
            true;

        removeProfilePictureButton.hidden =
            false;


        profilePicturePreview.onload =
            function () {

                URL.revokeObjectURL(
                    previewUrl
                );

            };

    }
);


// ========================================
// REMOVE PROFILE PICTURE
// ========================================

removeProfilePictureButton.addEventListener(
    "click",
    function () {

        selectedProfilePicture = null;

        currentProfilePictureUrl = null;

        removeCurrentProfilePicture = true;

        profilePictureInput.value = "";

        profilePicturePreview.src = "";

        profilePicturePreview.hidden = true;

        profilePicturePlaceholder.hidden = false;

        removeProfilePictureButton.hidden = true;

    }
);


// ========================================
// UPLOAD PROFILE PICTURE TO CLOUDINARY
// ========================================

function uploadProfilePicture(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        "vortex_upload"
    );


    return fetch(
        "https://api.cloudinary.com/v1_1/x1x2g1sa/image/upload",
        {
            method: "POST",
            body: formData
        }
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Profile picture upload failed."
                );

            }

            return response.json();

        })

        .then(function (data) {

            if (!data.secure_url) {

                throw new Error(
                    "Cloudinary did not return an image URL."
                );

            }


            return data.secure_url;

        });

}


// ========================================
// SAVE PROFILE
// ========================================

editProfileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const username =
            document.getElementById(
                "edit-username"
            ).value.trim();


        const bio =
            document.getElementById(
                "edit-bio"
            ).value.trim();


        const homeCountry =
            document.getElementById(
                "edit-home-country"
            ).value.trim();


        editProfileMessage.textContent =
            "Saving profile...";


        // ========================================
        // DETERMINE PROFILE PICTURE URL
        // ========================================

        let picturePromise;


        if (selectedProfilePicture) {

            // Upload new image

            picturePromise =
                uploadProfilePicture(
                    selectedProfilePicture
                );

        } else if (removeCurrentProfilePicture) {

            // User clicked Remove

            picturePromise =
                Promise.resolve(null);

        } else {

            // Keep existing image

            picturePromise =
                Promise.resolve(
                    currentProfilePictureUrl
                );

        }


        // ========================================
        // UPDATE PROFILE
        // ========================================

        picturePromise

            .then(function (profilePictureUrl) {

                return fetch(
                    `${API_URL}/users/profile`,
                    {

                        method: "PUT",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            username: username,

                            bio: bio,

                            profile_picture:
                                profilePictureUrl,

                            home_country:
                                homeCountry

                        })

                    }
                );

            })

            .then(function (response) {

                return response
                    .json()
                    .then(function (data) {

                        return {

                            ok: response.ok,

                            data: data

                        };

                    });

            })

            .then(function (result) {

                if (!result.ok) {

                    console.log(
                        "Profile update failed:",
                        result.data
                    );


                    editProfileMessage.textContent =
                        result.data.detail ||
                        "Could not update profile.";

                    return;
                }


                console.log(
                    "Profile updated:",
                    result.data
                );


                editProfileMessage.textContent =
                    "Profile updated successfully!";


                // Reset temporary image state

                selectedProfilePicture = null;

                removeCurrentProfilePicture = false;


                // Reload profile with saved data

                loadMyProfile();

            })

            .catch(function (error) {

                console.log(
                    "Profile update error:",
                    error
                );


                editProfileMessage.textContent =
                    "Could not save profile. Please try again.";

            });

    }
);

// ========================================
// MESSAGE USER
// ========================================

document.addEventListener("click", function (event) {

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

    // Open Messages page
    showView("messages");

    // Open conversation with this user
    openConversation(
        Number(userId),
        username
    );

});

// ========================================
// OPEN / CLOSE EDIT PROFILE
// ========================================

const openEditProfileButton =
    document.getElementById("open-edit-profile-button");

const profileEditCard =
    document.getElementById("profile-edit-card");


openEditProfileButton.addEventListener(
    "click",
    function () {

        profileEditCard.hidden = false;

    }
);

// ========================================
// CANCEL EDIT PROFILE
// ========================================

const cancelEditProfileButton =
    document.getElementById("cancel-edit-profile-button");

cancelEditProfileButton.addEventListener(
    "click",
    function () {

        profileEditCard.hidden = true;

    }
);

// ========================================
// PROFILE POST MODAL
// ========================================

const profilePostModal =
    document.getElementById("profile-post-modal");

const profilePostModalImage =
    document.getElementById("profile-post-modal-image");

const profilePostModalPrev =
    document.getElementById("profile-post-modal-prev");

const profilePostModalNext =
    document.getElementById("profile-post-modal-next");

const profilePostModalCounter =
    document.getElementById("profile-post-modal-counter");

const profilePostModalUsername =
    document.getElementById("profile-post-modal-username");

const profilePostModalLocation =
    document.getElementById("profile-post-modal-location");

const profilePostModalTitle =
    document.getElementById("profile-post-modal-title");

const profilePostModalStory =
    document.getElementById("profile-post-modal-story");

const profilePostModalTags =
    document.getElementById("profile-post-modal-tags");

const closeProfilePostModalButton =
    document.getElementById("close-profile-post-modal");


let profileModalImages = [];
let profileModalImageIndex = 0;


// ========================================
// UPDATE MODAL IMAGE
// ========================================

function updateProfileModalImage() {

    if (profileModalImages.length === 0) {
        return;
    }

    profilePostModalImage.src =
        profileModalImages[profileModalImageIndex];

    profilePostModalCounter.textContent =
        `${profileModalImageIndex + 1} / ${profileModalImages.length}`;


    if (profileModalImages.length <= 1) {

        profilePostModalPrev.style.display = "none";
        profilePostModalNext.style.display = "none";
        profilePostModalCounter.style.display = "none";

    } else {

        profilePostModalPrev.style.display = "flex";
        profilePostModalNext.style.display = "flex";
        profilePostModalCounter.style.display = "block";

    }
}


// ========================================
// OPEN PROFILE POST
// ========================================

function openProfilePost(postId) {

    fetch(`${API_URL}/posts/${postId}`, {

        method: "GET",

        headers: {
            "Authorization": `Bearer ${token}`
        }

    })
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Could not load post.");
            }

            return response.json();

        })
        .then(function (data) {

            const post = data.Post || data;


            // Get every available image for this post
            // Get every available image for this post

            profileModalImages = [];

            // Add image_urls if the backend provides them
            if (
                Array.isArray(post.image_urls) &&
                post.image_urls.length > 0
            ) {
                post.image_urls.forEach(function (imageUrl) {

                    if (
                        imageUrl &&
                        !profileModalImages.includes(imageUrl)
                    ) {
                        profileModalImages.push(imageUrl);
                    }

                });
            }

            // Add main image
            if (
                post.image_url &&
                !profileModalImages.includes(post.image_url)
            ) {
                profileModalImages.push(post.image_url);
            }

            // Add carousel images
            if (
                Array.isArray(post.images) &&
                post.images.length > 0
            ) {
                post.images.forEach(function (image) {

                    if (
                        image.image_url &&
                        !profileModalImages.includes(image.image_url)
                    ) {
                        profileModalImages.push(
                            image.image_url
                        );
                    }

                });
            }

            profileModalImageIndex = 0;


            profilePostModalUsername.textContent =
                post.owner?.username || "Traveler";


            const locationParts = [];

            if (post.city) {
                locationParts.push(post.city);
            }

            if (post.country) {
                locationParts.push(post.country);
            }

            profilePostModalLocation.textContent =
                locationParts.join(", ");


            profilePostModalTitle.textContent =
                post.title || "Untitled trip";


            profilePostModalStory.textContent =
                post.content || "";


            profilePostModalTags.innerHTML = "";

            if (post.tags && post.tags.length > 0) {

                post.tags.forEach(function (tag) {

                    const tagElement =
                        document.createElement("span");

                    tagElement.textContent =
                        `#${tag.name || tag}`;

                    profilePostModalTags.appendChild(
                        tagElement
                    );

                });

            }


            if (profileModalImages.length > 0) {

                profilePostModalImage.style.display =
                    "block";

                updateProfileModalImage();

            } else {

                profilePostModalImage.style.display =
                    "none";

                profilePostModalPrev.style.display =
                    "none";

                profilePostModalNext.style.display =
                    "none";

                profilePostModalCounter.style.display =
                    "none";

            }


            profilePostModal.hidden = false;

            document.body.style.overflow = "hidden";

        })
        .catch(function (error) {

            console.error(
                "Profile post modal error:",
                error
            );

        });
}


// ========================================
// PROFILE TRIP CLICK
// ========================================

document.addEventListener("click", function (event) {

    const tripCard =
        event.target.closest(".profile-trip-card");

    if (!tripCard) {
        return;
    }

    const postId =
        tripCard.dataset.postId;

    if (postId) {
        openProfilePost(postId);
    }

});


// ========================================
// CAROUSEL BUTTONS
// ========================================

profilePostModalNext.addEventListener(
    "click",
    function () {

        if (profileModalImages.length <= 1) {
            return;
        }

        profileModalImageIndex++;

        if (
            profileModalImageIndex >=
            profileModalImages.length
        ) {
            profileModalImageIndex = 0;
        }

        updateProfileModalImage();

    }
);


profilePostModalPrev.addEventListener(
    "click",
    function () {

        if (profileModalImages.length <= 1) {
            return;
        }

        profileModalImageIndex--;

        if (profileModalImageIndex < 0) {
            profileModalImageIndex =
                profileModalImages.length - 1;
        }

        updateProfileModalImage();

    }
);


// ========================================
// CLOSE MODAL
// ========================================

function closeProfilePostModal() {

    profilePostModal.hidden = true;

    document.body.style.overflow = "";

}


closeProfilePostModalButton.addEventListener(
    "click",
    closeProfilePostModal
);


document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "profile-post-modal-backdrop"
            )
        ) {
            closeProfilePostModal();
        }

    }
);
