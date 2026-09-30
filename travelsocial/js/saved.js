// =========================================
// SAVED / BOOKMARKED POSTS
// =========================================

const savedPostsContainer =
    document.getElementById("saved-posts-container");


// =========================================
// LOAD SAVED POSTS
// =========================================

async function loadSavedPosts() {

    if (!savedPostsContainer) {
        return;
    }

    savedPostsContainer.innerHTML =
        "<p>Loading saved trips...</p>";

    try {

        const response = await fetch(
            `${API_URL}/bookmarks/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Could not load saved posts."
            );
        }

        const posts = await response.json();

        renderSavedPosts(posts);

    } catch (error) {

        console.error(
            "Saved posts error:",
            error
        );

        savedPostsContainer.innerHTML =
            "<p>Could not load your saved trips.</p>";
    }
}


// =========================================
// RENDER SAVED POSTS
// =========================================

function renderSavedPosts(posts) {

    savedPostsContainer.innerHTML = "";

    if (!posts || posts.length === 0) {

        savedPostsContainer.innerHTML = `
            <div class="saved-empty-state">
                <h3>No saved trips yet</h3>

                <p>
                    Bookmark trips you want to come
                    back to and they will appear here.
                </p>
            </div>
        `;

        return;
    }

    posts.forEach(function (post) {

        const savedCard =
            document.createElement("article");

        savedCard.className = "saved-post-card";

        savedCard.dataset.postId = post.id;


        // -----------------------------
        // IMAGE
        // -----------------------------

        let imageUrl = "";

        if (post.image_url) {
            imageUrl = post.image_url;
        }

        if (
            !imageUrl &&
            Array.isArray(post.images) &&
            post.images.length > 0
        ) {
            imageUrl =
                post.images[0].image_url;
        }


        // -----------------------------
        // LOCATION
        // -----------------------------

        const locationParts = [];

        if (post.city) {
            locationParts.push(post.city);
        }

        if (post.country) {
            locationParts.push(post.country);
        }

        const location =
            locationParts.join(", ");


        // -----------------------------
        // CARD
        // -----------------------------

        savedCard.innerHTML = `

            ${
                imageUrl
                    ? `
                        <div class="saved-post-image-wrapper">
                            <img
                                src="${imageUrl}"
                                alt="${post.title || "Saved trip"}"
                                class="saved-post-image"
                            >
                        </div>
                    `
                    : `
                        <div class="saved-post-no-image">
                            No photo
                        </div>
                    `
            }

            <div class="saved-post-content">

                <div class="saved-post-top">

                    <div>

                        <h3>
                            ${post.title || "Untitled trip"}
                        </h3>

                        ${
                            location
                                ? `
                                    <p class="saved-post-location">
                                        ${location}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <button
                        class="saved-remove-button"
                        type="button"
                        data-post-id="${post.id}"
                        aria-label="Remove bookmark"
                        title="Remove from saved">
                        ▰
                    </button>

                </div>

                ${
                    post.content
                        ? `
                            <p class="saved-post-story">
                                ${post.content}
                            </p>
                        `
                        : ""
                }

            </div>
        `;

        savedPostsContainer.appendChild(
            savedCard
        );
    });
}


// =========================================
// REMOVE BOOKMARK FROM SAVED PAGE
// =========================================

document.addEventListener(
    "click",
    async function (event) {

        const removeButton =
            event.target.closest(
                ".saved-remove-button"
            );

        if (!removeButton) {
            return;
        }

        const postId =
            removeButton.dataset.postId;

        try {

            const response = await fetch(
                `${API_URL}/bookmarks/${postId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Could not remove bookmark."
                );
            }

            await loadSavedPosts();

        } catch (error) {

            console.error(
                "Remove saved post error:",
                error
            );
        }
    }
);


// =========================================
// LOAD SAVED POSTS WHEN SAVED VIEW OPENS
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const savedButton =
            event.target.closest(
                '[data-view="saved"]'
            );

        if (!savedButton) {
            return;
        }

        loadSavedPosts();
    }
);

// =========================================
// OPEN SAVED POST
// =========================================

document.addEventListener("click", function (event) {

    // Do not open the post when clicking
    // the remove-bookmark button.
    if (event.target.closest(".saved-remove-button")) {
        return;
    }

    const savedPost =
        event.target.closest(".saved-post-card");

    if (!savedPost) {
        return;
    }

    const postId =
        savedPost.dataset.postId;

    if (postId) {
        openProfilePost(postId);
    }
});