// ========================================
// VORTEX
// ========================================

const API_URL = "http://127.0.0.1:8000";

const token =
    localStorage.getItem("token");

console.log("Saved token:", token);


// ========================================
// LOGIN
// ========================================

const loginForm =
    document.getElementById("login-form");


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


    fetch(`${API_URL}/login`, {

        method: "POST",

        body: formData

    })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            if (!data.access_token) {

                console.log(
                    "Login failed:",
                    data
                );

                return;
            }


            localStorage.setItem(
                "token",
                data.access_token
            );


            console.log("Logged in!");


            window.location.reload();

        });

});

// ========================================
// COMPRESS IMAGE
// ========================================

function compressImage(file) {

    return new Promise(function (resolve, reject) {

        // Small images do not need compression
        if (file.size <= 8 * 1024 * 1024) {
            resolve(file);
            return;
        }

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = function (event) {

            const image = new Image();

            image.src = event.target.result;

            image.onload = function () {

                const canvas =
                    document.createElement("canvas");

                const maxWidth = 2000;
                const maxHeight = 2000;

                let width = image.width;
                let height = image.height;

                // Keep the image's original proportions
                if (width > height) {

                    if (width > maxWidth) {
                        height =
                            height * (maxWidth / width);

                        width = maxWidth;
                    }

                } else {

                    if (height > maxHeight) {
                        width =
                            width * (maxHeight / height);

                        height = maxHeight;
                    }

                }

                canvas.width = width;
                canvas.height = height;

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob(
                    function (blob) {

                        if (!blob) {
                            reject(
                                new Error(
                                    "Image compression failed"
                                )
                            );

                            return;
                        }

                        const compressedFile =
                            new File(
                                [blob],
                                file.name,
                                {
                                    type: "image/jpeg"
                                }
                            );

                        console.log(
                            "Original size:",
                            file.size
                        );

                        console.log(
                            "Compressed size:",
                            compressedFile.size
                        );

                        resolve(compressedFile);

                    },

                    "image/jpeg",

                    0.8
                );

            };

            image.onerror = function () {
                reject(
                    new Error(
                        "Could not read image"
                    )
                );
            };

        };

        reader.onerror = function () {
            reject(
                new Error(
                    "Could not read file"
                )
            );
        };

    });

}


// ========================================
// CREATE POST
// ========================================


const createPostForm =
    document.getElementById("create-post-form");


createPostForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const title =
        document.getElementById("post-title").value;

    const tagsInput =
        document.getElementById("post-tags").value;

    const tagNames =
    tagsInput
        .split(",")
        .map(function (tag) {
            return tag.trim();
        })
        .filter(function (tag) {
            return tag !== "";
        });

    const country =
        document.getElementById("post-country").value;

    const city =
        document.getElementById("post-city").value;

    const tripType =
        document.getElementById("post-trip-type").value;

    const content =
        document.getElementById("post-content").value;

    const startDate =
        document.getElementById("post-start-date").value;

    const endDate =
        document.getElementById("post-end-date").value;

    const imageInput =
        document.getElementById("post-image");


    // Turn the selected files into a normal JavaScript array
    const selectedImages =
        Array.from(imageInput.files);


    // ========================================
    // NO IMAGES SELECTED
    // ========================================

    if (selectedImages.length === 0) {

        createVortexPost([]);

        return;

    }


    // ========================================
// UPLOAD ALL IMAGES TO CLOUDINARY
// ========================================

const uploadPromises =
    selectedImages.map(function (image) {

        // Compress the image first if necessary
        return compressImage(image)

            .then(function (processedImage) {

                const imageFormData =
                    new FormData();


                imageFormData.append(
                    "file",
                    processedImage
                );


                imageFormData.append(
                    "upload_preset",
                    "vortex_upload"
                );


                // Upload compressed image to Cloudinary
                return fetch(
                    "https://api.cloudinary.com/v1_1/x1x2g1sa/image/upload",
                    {
                        method: "POST",
                        body: imageFormData
                    }
                );

            })


            .then(function (response) {

                return response.json();

            })


            .then(function (imageData) {

                console.log(
                    "Cloudinary upload:",
                    imageData
                );


                // Make sure Cloudinary returned a URL
                if (!imageData.secure_url) {

                    console.log(
                        "Cloudinary error:",
                        imageData
                    );


                    throw new Error(
                        "Cloudinary image upload failed"
                    );

                }


                // Give Promise.all() the uploaded image URL
                return imageData.secure_url;

            });

    });


// ========================================
// WAIT FOR ALL IMAGE UPLOADS
// ========================================

Promise.all(uploadPromises)

    .then(function (imageUrls) {

        console.log(
            "All image URLs:",
            imageUrls
        );


        // Now create the post
        createVortexPost(
            imageUrls
        );

    })

    .catch(function (error) {

        console.log(
            "Image upload error:",
            error
        );

    });

    // Wait for EVERY Cloudinary upload
    Promise.all(uploadPromises)

        .then(function (imageUrls) {

            console.log(
                "All image URLs:",
                imageUrls
            );


            createVortexPost(
                imageUrls
            );

        })

        .catch(function (error) {

            console.log(
                "Image upload error:",
                error
            );

        });


    // ========================================
    // CREATE POST IN FASTAPI
    // ========================================

    function createVortexPost(imageUrls) {

        const mainImageUrl =
            imageUrls.length > 0
                ? imageUrls[0]
                : null;


        fetch(`${API_URL}/posts/`, {

            method: "POST",

            headers: {

                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                title: title,

                content: content,

                country:
                    country || null,

                city:
                    city || null,

                trip_type:
                    tripType || null,

                start_date:
                    startDate || null,

                end_date:
                    endDate || null,

                image_url:
                    mainImageUrl,

                published: true

            })

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

                console.log(
                    "Created post:",
                    result.data
                );


                if (!result.ok) {

                    throw new Error(
                        "Could not create post"
                    );

                }


                const postId =
                    result.data.id;
// ========================================
// CREATE AND ATTACH TAGS
// ========================================

const tagPromises =
    tagNames.map(function (tagName) {

        return fetch(
            `${API_URL}/tags/?name=${encodeURIComponent(tagName)}`,
            {
                method: "POST",
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )

            .then(function (response) {

                if (!response.ok) {
                    throw new Error(
                        "Could not create or find tag"
                    );
                }

                return response.json();

            })

            .then(function (tag) {

                return fetch(
                    `${API_URL}/tags/attach`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            post_id: postId,
                            tag_id: tag.id
                        })
                    }
                );

            })

            .then(function (response) {

                if (!response.ok) {
                    throw new Error(
                        "Could not attach tag to post"
                    );
                }

                return response.json();

            });

    });

                // ========================================
                // ATTACH ALL IMAGES TO THE POST
                // ========================================

                const saveImagePromises =
                    imageUrls.map(function (imageUrl) {

                        return fetch(
                            `${API_URL}/posts/${postId}/images`,
                            {

                                method: "POST",

                                headers: {

                                    "Authorization":
                                        `Bearer ${token}`,

                                    "Content-Type":
                                        "application/json"

                                },

                                body: JSON.stringify({

                                    image_url:
                                        imageUrl

                                })

                            }
                        )

                            .then(function (response) {

                                if (!response.ok) {

                                    throw new Error(
                                        "Could not attach image to post"
                                    );

                                }


                                return response.json();

                            });

                    });


                return Promise.all([
                    ...saveImagePromises,
                    ...tagPromises
                ]);

            })

            .then(function () {

                console.log(
                    "All images and tags attached to post!"
                );


                createPostForm.reset();


                window.location.reload();

            })

            .catch(function (error) {

                console.log(
                    "Create post error:",
                    error
                );

            });

    }

});

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

            console.log(
                "Search results:",
                users
            );


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

});


// ========================================
// LOAD PROFILE
// ========================================

function loadProfile(userId) {

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

            console.log(
                "Profile:",
                profile
            );


            const profileContainer =
                document.getElementById(
                    "profile-container"
                );


            profileContainer.innerHTML = `

                <div class="profile-card">

                    ${
                        profile.profile_picture
                            ? `
                                <img
                                    src="${profile.profile_picture}"
                                    alt="Profile picture"
                                    width="100"
                                >
                            `
                            : ""
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
                        data-following="${profile.is_following}">

                        ${
                            profile.is_following
                                ? "Unfollow"
                                : "Follow"
                        }

                    </button>
                    <button
                        class="message-user-button"
                        data-user-id="${profile.id}"
                        data-username="${profile.username || "User"}"
                        >

                        Message


                </div>
            `;

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
// LOAD FEED
// ========================================

if (token) {

    fetch(
        `${API_URL}/posts/feed`,
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

            console.log(
                "Feed:",
                data
            );


            const feed =
                document.getElementById(
                    "feed"
                );


            feed.innerHTML = "";


            // ========================================
            // DISPLAY POSTS
            // ========================================

            data.forEach(function (post) {

                feed.innerHTML += `

                    <article
                        data-post-id="${post.Post.id}">


                        <button
                            class="view-profile-button"
                            data-user-id="${post.Post.owner.id}">

                            ${post.Post.owner.username || "User"}

                        </button>


                        <h3>
                            ${post.Post.title}
                        </h3>

                        ${
    post.Post.images &&
    post.Post.images.length > 0

        ? `
            <div
    class="post-carousel"
    data-post-id="${post.Post.id}"
    data-current-image="0"
    data-images='${JSON.stringify(
        post.Post.images.map(function (image) {
            return image.image_url;
        })
    )}'>

                <div class="carousel-image-container">

                    <img
                        class="carousel-image"
                        src="${post.Post.images[0].image_url}"
                        alt="${post.Post.title}"
                    >

                    ${
                        post.Post.images.length > 1
                            ? `
                                <button
                                    class="carousel-left"
                                    data-post-id="${post.Post.id}">
                                    ❮
                                </button>

                                <button
                                    class="carousel-right"
                                    data-post-id="${post.Post.id}">
                                    ❯
                                </button>

                                <div class="carousel-counter">
                                    1 / ${post.Post.images.length}
                                </div>
                            `
                            : ""
                    }

                </div>

            </div>
        `

        : (
            post.Post.image_url
                ? `
                    <img
                        class="carousel-image"
                        src="${post.Post.image_url}"
                        alt="${post.Post.title}"
                    >
                `
                : ""
        )
}


                        <p>
                            ${post.Post.city || ""}
                            ${
                                post.Post.city &&
                                post.Post.country
                                    ? ","
                                    : ""
                            }
                            ${post.Post.country || ""}
                        </p>


                        <p>
                            ${post.Post.content}
                        </p>

                    ${
                        post.Post.tags &&
                        post.Post.tags.length > 0
                            ? `
                                <div class="post-tags">
                                    ${post.Post.tags
                                        .map(function (tag) {
                                            return `
                                            <span class="post-tag">
                                                #${tag.name}
                                            </span>
                                        `;
                                    })
                                    .join("")}
                            </div>
                        `
                        : ""
                }


                        <p
                            class="like-count"
                            data-post-id="${post.Post.id}">

                            ${post.votes} likes

                        </p>


                        <button
                            class="like-button"
                            data-post-id="${post.Post.id}">

                            ${
                                post.is_liked
                                    ? "Liked ❤️"
                                    : "Like"
                            }

                        </button>


                        <button
                            class="bookmark-button"
                            data-post-id="${post.Post.id}">

                            ${
                                post.is_bookmarked
                                    ? "Bookmarked 🔖"
                                    : "Bookmark"
                            }

                        </button>


                        <button
                            class="edit-post-button"
                            data-post-id="${post.Post.id}">

                            Edit Post

                        </button>


                        <button
                            class="delete-post-button"
                            data-post-id="${post.Post.id}">

                            Delete Post

                        </button>


                        <button
                            class="comments-button"
                            data-post-id="${post.Post.id}">

                            Comments (${post.comments_count})

                        </button>


                        <div
                            class="comments-container"
                            data-post-id="${post.Post.id}">
                        </div>


                        <form
                            class="comment-form"
                            data-post-id="${post.Post.id}">

                            <input
                                class="comment-input"
                                type="text"
                                placeholder="Write a comment..."
                                required
                            >

                            <button type="submit">
                                Comment
                            </button>

                        </form>

                    </article>
                `;

            });


            // ========================================
            // LIKES
            // ========================================

            const likeButtons =
                document.querySelectorAll(
                    ".like-button"
                );


            likeButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        button.dataset.postId;


                    const likeCount =
                        document.querySelector(
                            `.like-count[data-post-id="${postId}"]`
                        );


                    let direction = 1;


                    if (
                        button.textContent.trim()
                        === "Liked ❤️"
                    ) {

                        direction = 0;

                    }


                    fetch(
                        `${API_URL}/likes/`,
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

                                    post_id:
                                        Number(postId),

                                    dir:
                                        direction

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
                                "Like:",
                                result.data
                            );


                            if (!result.ok) {

                                return;

                            }


                            let currentLikes =
                                parseInt(
                                    likeCount.textContent
                                );


                            if (direction === 1) {

                                currentLikes++;

                                button.textContent =
                                    "Liked ❤️";

                            } else {

                                currentLikes--;

                                button.textContent =
                                    "Like";

                            }


                            likeCount.textContent =
                                `${currentLikes} likes`;

                        });

                });

            });


            // ========================================
            // BOOKMARKS
            // ========================================

            const bookmarkButtons =
                document.querySelectorAll(
                    ".bookmark-button"
                );


            bookmarkButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        button.dataset.postId;


                    const isBookmarked =
                        button
                            .textContent
                            .trim()
                        === "Bookmarked 🔖";


                    // REMOVE BOOKMARK

                    if (isBookmarked) {

                        fetch(
                            `${API_URL}/bookmarks/${postId}`,
                            {

                                method:
                                    "DELETE",

                                headers: {

                                    "Authorization":
                                        `Bearer ${token}`

                                }

                            }
                        )

                            .then(function (response) {

                                if (!response.ok) {

                                    console.log(
                                        "Could not remove bookmark:",
                                        response.status
                                    );

                                    return;

                                }


                                button.textContent =
                                    "Bookmark";

                            });


                    // ADD BOOKMARK

                    } else {

                        fetch(
                            `${API_URL}/bookmarks/`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Authorization":
                                        `Bearer ${token}`,

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        post_id:
                                            Number(postId)

                                    })

                            }
                        )

                            .then(function (response) {

                                if (!response.ok) {

                                    console.log(
                                        "Could not add bookmark:",
                                        response.status
                                    );

                                    return;

                                }


                                button.textContent =
                                    "Bookmarked 🔖";

                            });

                    }

                });

            });


            // ========================================
            // EDIT POSTS
            // ========================================

            const editPostButtons =
                document.querySelectorAll(
                    ".edit-post-button"
                );


            editPostButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        Number(
                            button.dataset.postId
                        );


                    const postData =
                        data.find(
                            function (item) {

                                return (
                                    item.Post.id ===
                                    postId
                                );

                            }
                        );


                    if (!postData) {

                        console.log(
                            "Post not found"
                        );

                        return;

                    }


                    const post =
                        postData.Post;


                    const newTitle =
                        prompt(
                            "Edit title:",
                            post.title
                        );


                    if (newTitle === null) {
                        return;
                    }


                    const newContent =
                        prompt(
                            "Edit description:",
                            post.content
                        );


                    if (newContent === null) {
                        return;
                    }


                    const newCountry =
                        prompt(
                            "Edit country:",
                            post.country || ""
                        );


                    if (newCountry === null) {
                        return;
                    }


                    const newCity =
                        prompt(
                            "Edit city:",
                            post.city || ""
                        );


                    if (newCity === null) {
                        return;
                    }


                    fetch(
                        `${API_URL}/posts/${postId}`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    title:
                                        newTitle,

                                    content:
                                        newContent,

                                    country:
                                        newCountry || null,

                                    city:
                                        newCity || null,

                                    trip_type:
                                        post.trip_type || null,

                                    start_date:
                                        post.start_date || null,

                                    end_date:
                                        post.end_date || null,

                                    image_url:
                                        post.image_url || null,

                                    published:
                                        post.published

                                })

                        }
                    )

                        .then(function (response) {

                            if (!response.ok) {

                                console.log(
                                    "Could not edit post:",
                                    response.status
                                );

                                return;

                            }


                            window.location.reload();

                        });

                });

            });


            // ========================================
            // DELETE POSTS
            // ========================================

            const deletePostButtons =
                document.querySelectorAll(
                    ".delete-post-button"
                );


            deletePostButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        button.dataset.postId;


                    fetch(
                        `${API_URL}/posts/${postId}`,
                        {

                            method:
                                "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            }

                        }
                    )

                        .then(function (response) {

                            if (!response.ok) {

                                console.log(
                                    "Could not delete post:",
                                    response.status
                                );

                                return;

                            }


                            button
                                .closest("article")
                                .remove();


                            console.log(
                                "Post deleted"
                            );

                        });

                });

            });


            // ========================================
            // LOAD COMMENTS
            // ========================================

            const commentsButtons =
                document.querySelectorAll(
                    ".comments-button"
                );


            commentsButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        button.dataset.postId;


                    const container =
                        document.querySelector(
                            `.comments-container[data-post-id="${postId}"]`
                        );


                    fetch(
                        `${API_URL}/comments/post/${postId}`,
                        {

                            method:
                                "GET",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            }

                        }
                    )

                        .then(function (response) {

                            return response.json();

                        })

                        .then(function (comments) {

                            console.log(
                                "Comments:",
                                comments
                            );


                            container.innerHTML =
                                "";


                            comments.forEach(function (comment) {

                                container.innerHTML += `

                                    <div
                                        class="comment"
                                        data-comment-id="${comment.id}">


                                        <button
                                            class="view-profile-button"
                                            data-user-id="${comment.owner.id}">

                                            ${comment.owner.username || "User"}

                                        </button>


                                        <p>
                                            ${comment.content}
                                        </p>


                                        <button
                                            class="delete-comment-button"
                                            data-comment-id="${comment.id}">

                                            Delete

                                        </button>

                                    </div>
                                `;

                            });


                            if (comments.length === 0) {

                                container.innerHTML =
                                    "<p>No comments yet.</p>";

                            }

                        });

                });

            });


            // ========================================
            // CREATE COMMENTS
            // ========================================

            const commentForms =
                document.querySelectorAll(
                    ".comment-form"
                );


            commentForms.forEach(function (form) {

                form.addEventListener("submit", function (event) {

                    event.preventDefault();


                    const postId =
                        form.dataset.postId;


                    const input =
                        form.querySelector(
                                     ".comment-input"
                        );


                    const content =
                        input.value;


                    fetch(
                        `${API_URL}/comments/`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    post_id:
                                        Number(postId),

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
                                "New comment:",
                                result.data
                            );


                            if (!result.ok) {

                                return;

                            }


                            const container =
                                document.querySelector(
                                    `.comments-container[data-post-id="${postId}"]`
                                );


                            container.innerHTML += `

                                <div
                                    class="comment"
                                    data-comment-id="${result.data.id}">


                                    <button
                                        class="view-profile-button"
                                        data-user-id="${result.data.owner.id}">

                                        ${result.data.owner.username || "User"}

                                    </button>


                                    <p>
                                        ${result.data.content}
                                    </p>


                                    <button
                                        class="delete-comment-button"
                                        data-comment-id="${result.data.id}">

                                        Delete

                                    </button>

                                </div>
                            `;


                            input.value = "";


                            const commentsButton =
                                document.querySelector(
                                    `.comments-button[data-post-id="${postId}"]`
                                );


                            const match =
                                commentsButton
                                    .textContent
                                    .match(/\d+/);


                            let commentCount = 0;


                            if (match) {

                                commentCount =
                                    Number(match[0]);

                            }


                            commentCount++;


                            commentsButton.textContent =
                                `Comments (${commentCount})`;

                        });

                });

            });

        });

}


// ========================================
// DELETE COMMENTS
// ========================================

document.addEventListener("click", function (event) {

    if (
        !event.target.classList.contains(
            "delete-comment-button"
        )
    ) {

        return;

    }


    const button =
        event.target;


    const commentId =
        button.dataset.commentId;


    fetch(
        `${API_URL}/comments/${commentId}`,
        {

            method:
                "DELETE",

            headers: {

                "Authorization":
                    `Bearer ${token}`

            }

        }
    )

        .then(function (response) {

            if (!response.ok) {

                console.log(
                    "Could not delete comment:",
                    response.status
                );

                return;

            }


            button
                .closest(".comment")
                .remove();


            console.log(
                "Comment deleted"
            );

        });

});

// ========================================
// NOTIFICATIONS
// ========================================

const notificationCount =
    document.getElementById(
        "notification-count"
    );

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

            console.log(
                "Unread notifications:",
                data
            );


            notificationCount.textContent =
                data.unread_count;

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

            console.log(
                "Notifications:",
                notifications
            );


            notificationsContainer.innerHTML =
                "";


            if (notifications.length === 0) {

                notificationsContainer.innerHTML =
                    "<p>No notifications.</p>";

                return;

            }


            notifications.forEach(
                function (notification) {

                    let message = "";


                    if (
                        notification.type ===
                        "follow"
                    ) {

                        message =
                            `${notification.actor.username} followed you`;

                    }

                    else if (
                        notification.type ===
                        "like"
                    ) {

                        message =
                            `${notification.actor.username} liked your post`;

                    }

                    else if (
                        notification.type ===
                        "comment"
                    ) {

                        message =
                            `${notification.actor.username} commented on your post`;

                    }

                    else {

                        message =
                            `${notification.actor.username} sent you a notification`;

                    }


                    notificationsContainer.innerHTML += `

                        <div
                            class="notification"
                            data-notification-id="${notification.id}">

                            <p>

                                ${
                                    notification.is_read
                                        ? "✓"
                                        : "🔴"
                                }

                                ${message}

                            </p>


                            <small>
                                ${new Date(
                                    notification.created_at
                                ).toLocaleString()}
                            </small>


                            ${
                                notification.is_read

                                    ? ""

                                    : `
                                        <button
                                            class="mark-read-button"
                                            data-notification-id="${notification.id}">

                                            Mark Read

                                        </button>
                                    `
                            }

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
// LOAD COUNT WHEN PAGE OPENS
// ========================================

loadUnreadCount();


// ========================================
// MESSAGING
// ========================================

const loadConversationsButton =
    document.getElementById(
        "load-conversations-button"
    );

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


// Stores the ID of the person
// whose conversation is currently open
let activeConversationUserId = null;


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

            console.log(
                "Conversations:",
                conversations
            );


            conversationsContainer.innerHTML =
                "";


            if (conversations.length === 0) {

                conversationsContainer.innerHTML =
                    "<p>No conversations yet.</p>";

                return;

            }


            conversations.forEach(
                function (conversation) {

                    conversationsContainer.innerHTML += `

                        <div class="conversation">

                            <strong>
                                ${
                                    conversation.user.username
                                    || "User"
                                }
                            </strong>

                            <p>
                                ${conversation.last_message}
                            </p>

                            <small>
                                ${
                                    new Date(
                                        conversation.last_message_at
                                    ).toLocaleString()
                                }
                            </small>

                            <p>
                                Unread:
                                ${conversation.unread_count}
                            </p>

                            <button
                                class="open-conversation-button"
                                data-user-id="${conversation.user.id}"
                                data-username="${conversation.user.username || "User"}">

                                Open Conversation

                            </button>

                        </div>

                    `;

                }
            );

        });

}


// ========================================
// LOAD CONVERSATIONS BUTTON
// ========================================

loadConversationsButton.addEventListener(
    "click",
    function () {

        loadConversations();

    }
);


// ========================================
// OPEN CONVERSATION
// ========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.classList.contains(
                "open-conversation-button"
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

        .then(function (messages) {

            console.log(
                "Messages:",
                messages
            );


            messagesContainer.innerHTML =
                "";


            if (messages.length === 0) {

                messagesContainer.innerHTML =
                    "<p>No messages yet.</p>";

                return;

            }


            messages.forEach(
                function (message) {

                    let senderLabel =
                        "Them";


                    if (
                        message.sender_id !==
                        activeConversationUserId
                    ) {

                        senderLabel =
                            "You";

                    }


                    messagesContainer.innerHTML += `

                        <div class="message">

                            <strong>
                                ${senderLabel}:
                            </strong>

                            <span>
                                ${message.content}
                            </span>

                            <br>

                            <small>
                                ${
                                    new Date(
                                        message.created_at
                                    ).toLocaleString()
                                }
                            </small>

                        </div>

                    `;

                }
            );


            // Reload conversation list because
            // opening messages marks them as read
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
// EXPLORE POSTS
// ========================================

const exploreForm =
    document.getElementById("explore-form");

const exploreResults =
    document.getElementById("explore-results");


exploreForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const search =
        document.getElementById("explore-search").value;

    const country =
        document.getElementById("explore-country").value;

    const city =
        document.getElementById("explore-city").value;

    const tripType =
        document.getElementById("explore-trip-type").value;

    const sort =
        document.getElementById("explore-sort").value;


    const params =
        new URLSearchParams();


    if (search) {
        params.append("search", search);
    }

    if (country) {
        params.append("country", country);
    }

    if (city) {
        params.append("city", city);
    }

    if (tripType) {
        params.append("trip_type", tripType);
    }

    params.append("sort", sort);


    fetch(
        `${API_URL}/posts/?${params.toString()}`,
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

        .then(function (posts) {

            console.log(
                "Explore results:",
                posts
            );


            exploreResults.innerHTML = "";


            if (posts.length === 0) {

                exploreResults.innerHTML =
                    "<p>No trips found.</p>";

                return;

            }


            posts.forEach(function (post) {

                exploreResults.innerHTML += `

                    <article>

                        <button
                            class="view-profile-button"
                            data-user-id="${post.Post.owner.id}">

                            ${
                                post.Post.owner.username
                                || "User"
                            }

                        </button>


                        <h3>
                            ${post.Post.title}
                        </h3>

                        ${
                    post.Post.image_url
                        ? `
                        <img
                        src="${post.Post.image_url}"
                        alt="${post.Post.title}"
                        style="max-width: 400px; width: 100%; height: auto;"
                        >
                        `
                        : ""
}


                        <p>
                            ${post.Post.city || ""}

                            ${
                                post.Post.city &&
                                post.Post.country
                                    ? ","
                                    : ""
                            }

                            ${post.Post.country || ""}
                        </p>


                        <p>
                            ${post.Post.content}
                        </p>


                        ${
                            post.Post.trip_type
                                ? `
                                    <p>
                                        Trip type:
                                        ${post.Post.trip_type}
                                    </p>
                                `
                                : ""
                        }


                        <p>
                            ${post.votes} likes
                        </p>


                        <p>
                            ${post.comments_count} comments
                        </p>

                    </article>

                `;

            });

        });

});

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
                    data: data
                };

            });

        })

        .then(function (result) {

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


            console.log(
                "Account created:",
                result.data
            );


            registerMessage.textContent =
                "Account created! You can now log in.";


            registerForm.reset();

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

// ========================================
// MY PROFILE
// ========================================

const loadMyProfileButton =
    document.getElementById("load-my-profile-button");

const myProfileContainer =
    document.getElementById("my-profile-container");


loadMyProfileButton.addEventListener("click", function () {

    fetch(`${API_URL}/users/me`, {

        method: "GET",

        headers: {
            "Authorization": `Bearer ${token}`
        }

    })

        .then(function (response) {

            return response.json();

        })

        .then(function (user) {

            console.log("My profile:", user);


            myProfileContainer.innerHTML = `

                <h3>${user.username || "User"}</h3>

                <p>
                    ${user.email}
                </p>

                <p>
                    Bio: ${user.bio || "No bio yet"}
                </p>

                <p>
                    Home country:
                    ${user.home_country || "Not set"}
                </p>

            `;


            // Fill the edit form with current information

            document.getElementById(
                "edit-username"
            ).value = user.username || "";

            document.getElementById(
                "edit-bio"
            ).value = user.bio || "";

            document.getElementById(
                "edit-profile-picture"
            ).value = user.profile_picture || "";

            document.getElementById(
                "edit-home-country"
            ).value = user.home_country || "";

        });

});

// ========================================
// EDIT MY PROFILE
// ========================================

const editProfileForm =
    document.getElementById("edit-profile-form");

const editProfileMessage =
    document.getElementById("edit-profile-message");


editProfileForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const username =
        document.getElementById("edit-username").value;

    const bio =
        document.getElementById("edit-bio").value;

    const profilePicture =
        document.getElementById("edit-profile-picture").value;

    const homeCountry =
        document.getElementById("edit-home-country").value;


    fetch(`${API_URL}/users/profile`, {

        method: "PUT",

        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            bio: bio,
            profile_picture: profilePicture,
            home_country: homeCountry
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


            // Reload the displayed profile
            loadMyProfileButton.click();

        });

});

// ========================================
// IMAGE CAROUSEL CONTROLS
// ========================================

document.addEventListener("click", function (event) {

    // Only run when a carousel arrow is clicked
    if (
        !event.target.classList.contains("carousel-left") &&
        !event.target.classList.contains("carousel-right")
    ) {
        return;
    }


    const button = event.target;


    // Find the carousel this button belongs to
    const carousel =
        button.closest(".post-carousel");


    if (!carousel) {
        return;
    }


    // Read this post's image URLs
    const images =
        JSON.parse(
            carousel.getAttribute("data-images")
        );


    if (!images || images.length === 0) {
        return;
    }


    // Get current image position
    let currentImage =
        Number(
            carousel.getAttribute(
                "data-current-image"
            )
        );


    // ========================================
    // RIGHT ARROW
    // ========================================

    if (
        button.classList.contains(
            "carousel-right"
        )
    ) {

        currentImage++;

        if (currentImage >= images.length) {
            currentImage = 0;
        }

    }


    // ========================================
    // LEFT ARROW
    // ========================================

    if (
        button.classList.contains(
            "carousel-left"
        )
    ) {

        currentImage--;

        if (currentImage < 0) {
            currentImage =
                images.length - 1;
        }

    }


    // Save new image position
    carousel.setAttribute(
        "data-current-image",
        currentImage
    );


    // Find displayed image
    const carouselImage =
        carousel.querySelector(
            ".carousel-image"
        );


    // Change image
    carouselImage.src =
        images[currentImage];


    // Find counter
    const counter =
        carousel.querySelector(
            ".carousel-counter"
        );


    // Update counter
    if (counter) {

        counter.textContent =
            `${currentImage + 1} / ${images.length}`;

    }

});