// ========================================
// CURRENT LOGGED-IN USER
// ========================================

let currentUser = null;

if (token) {

    fetch(`${API_URL}/users/me`, {

        method: "GET",

        headers: {
            "Authorization":
                `Bearer ${token}`
        }

    })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            currentUser = data;


        });

}

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


            const feed =
                document.getElementById(
                    "feed"
                );


            feed.innerHTML = "";



            // ========================================
            // DISPLAY POSTS
            // ========================================

            data.forEach(function (post) {

                const isOwner =
                    currentUser &&
                    currentUser.id ===
                    post.Post.owner.id;

                const username =
                    post.Post.owner.username || "User";

                const location = [
                    post.Post.city,
                    post.Post.country
                ]
                    .filter(Boolean)
                    .join(", ");


                feed.innerHTML += `

        <article
            class="vortex-post"
            data-post-id="${post.Post.id}"
        >

            <!-- POST HEADER -->

            <div class="post-header">

                <div class="post-user">

                    <div class="post-avatar">
                        ${username
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div class="post-user-info">

                        <button
                            class="view-profile-button post-username"
                            data-user-id="${post.Post.owner.id}"
                        >
                            ${username}
                        </button>

                        ${location
                        ? `
                                    <span class="post-location">
                                        ${location}
                                    </span>
                                `
                        : ""
                    }

                    </div>

                </div>


                ${isOwner
                        ? `
        <div class="post-menu-wrapper">

            <button
                class="post-menu-button"
                type="button"
                aria-label="Post options"
                aria-expanded="false"
            >
                •••
            </button>

            <div
                class="post-menu-dropdown"
                hidden
            >

                <button
                    class="post-menu-edit"
                    type="button"
                >
                    Edit post
                </button>

                <button
                    class="post-menu-delete"
                    type="button"
                >
                    Delete post
                </button>

            </div>

        </div>
    `
                        : ""
                    }

            </div>


            <!-- POST IMAGE / CAROUSEL -->

            ${post.Post.images &&
                        post.Post.images.length > 0

                        ? `
                        <div
                            class="post-carousel"
                            data-post-id="${post.Post.id}"
                            data-current-image="0"
                            data-images='${JSON.stringify(
                            post.Post.images.map(
                                function (image) {
                                    return image.image_url;
                                }
                            )
                        )}'
                        >

                            <div class="carousel-image-container">

                                <img
                                    class="carousel-image"
                                    src="${post.Post.images[0].image_url}"
                                    alt="${post.Post.title}"
                                >

                                ${post.Post.images.length > 1
                            ? `
                                            <button
                                                class="carousel-left"
                                                data-post-id="${post.Post.id}"
                                                type="button"
                                            >
                                                ❮
                                            </button>

                                            <button
                                                class="carousel-right"
                                                data-post-id="${post.Post.id}"
                                                type="button"
                                            >
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
                                <div class="post-single-image">

                                    <img
                                        class="carousel-image"
                                        src="${post.Post.image_url}"
                                        alt="${post.Post.title}"
                                    >

                                </div>
                            `
                                : ""
                        )
                    }


            <!-- POST ACTIONS -->

            <div class="post-actions">

                <div class="post-actions-left">

                    <button
                        class="like-button post-action-button"
                        data-post-id="${post.Post.id}"
                        type="button"
                        aria-label="Like post"
                    >
                        ${post.is_liked
                        ? "♥"
                        : "♡"
                    }
                    </button>


                    <button
                        class="comments-button post-action-button"
                        data-post-id="${post.Post.id}"
                        type="button"
                        aria-label="View comments"
                    >
                        ◯
                    </button>

                </div>


                <button
                    class="bookmark-button post-action-button"
                    data-post-id="${post.Post.id}"
                    type="button"
                    aria-label="Bookmark post"
                >
                    ${post.is_bookmarked
                        ? "▰"
                        : "▱"
                    }
                </button>

            </div>


            <!-- POST INFORMATION -->

            <div class="post-body">

                <p
                    class="like-count"
                    data-post-id="${post.Post.id}"
                >
                    ${post.votes} likes
                </p>


                <div class="post-caption">

                    <button
                        class="view-profile-button caption-username"
                        data-user-id="${post.Post.owner.id}"
                    >
                        ${username}
                    </button>

                    <span>
                        ${post.Post.content}
                    </span>

                </div>


                <h3 class="post-title">
                    ${post.Post.title}
                </h3>


                ${post.Post.tags &&
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


                <button
    class="comments-button view-comments-button"
    data-post-id="${post.Post.id}"
    data-comment-count="${post.comments_count}"
    type="button"
>
    View all ${post.comments_count} ${post.comments_count === 1
                        ? "comment"
                        : "comments"
                    }
</button>


                <div
                    class="comments-container"
                    data-post-id="${post.Post.id}"
                ></div>


                <!-- OWNER CONTROLS -->

${isOwner
                        ? `
        <div class="post-owner-controls">

            <button
                class="edit-post-button"
                data-post-id="${post.Post.id}"
                type="button"
            >
                Edit
            </button>

            <button
                class="delete-post-button"
                data-post-id="${post.Post.id}"
                type="button"
            >
                Delete
            </button>

        </div>
    `
                        : ""
                    }

            </div>


            <!-- COMMENT INPUT -->

            <form
                class="comment-form"
                data-post-id="${post.Post.id}"
            >

                <input
                    class="comment-input"
                    type="text"
                    placeholder="Add a comment..."
                    required
                >

                <button type="submit">
                    Post
                </button>

            </form>

        </article>
    `;

            });


            // ========================================
            // LIKES
            // ========================================

            const likeButtons =
                document.querySelectorAll(".like-button");


            likeButtons.forEach(function (button) {

                button.addEventListener("click", function () {

                    const postId =
                        button.dataset.postId;


                    const likeCount =
                        document.querySelector(
                            `.like-count[data-post-id="${postId}"]`
                        );


                    // ♥ means currently liked
                    const isLiked =
                        button.textContent.trim() === "♥";


                    // If already liked → remove like
                    // If not liked → add like
                    const direction =
                        isLiked ? 0 : 1;


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

                            body: JSON.stringify({

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
                                    "♥";

                                button.classList.add(
                                    "liked"
                                );

                            } else {

                                currentLikes--;

                                button.textContent =
                                    "♡";

                                button.classList.remove(
                                    "liked"
                                );

                            }


                            likeCount.textContent =
                                `${currentLikes} ${currentLikes === 1
                                    ? "like"
                                    : "likes"
                                }`;

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
                        button.textContent.trim() === "▰";


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
                                    "▱";
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
                                    "▰";

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
            // POST OPTIONS MENU
            // ========================================

            document.addEventListener("click", function (event) {

                const menuButton =
                    event.target.closest(".post-menu-button");

                const editMenuButton =
                    event.target.closest(".post-menu-edit");

                const deleteMenuButton =
                    event.target.closest(".post-menu-delete");


                // OPEN / CLOSE MENU

                if (menuButton) {

                    event.stopPropagation();

                    const wrapper =
                        menuButton.closest(".post-menu-wrapper");

                    const dropdown =
                        wrapper.querySelector(".post-menu-dropdown");

                    document
                        .querySelectorAll(".post-menu-dropdown")
                        .forEach(function (menu) {

                            if (menu !== dropdown) {
                                menu.hidden = true;
                            }

                        });

                    dropdown.hidden = !dropdown.hidden;

                    menuButton.setAttribute(
                        "aria-expanded",
                        String(!dropdown.hidden)
                    );

                    return;
                }


                // EDIT POST

                if (editMenuButton) {

                    const article =
                        editMenuButton.closest(".vortex-post");

                    const editButton =
                        article.querySelector(".edit-post-button");

                    if (editButton) {
                        editButton.click();
                    }

                    return;
                }


                // DELETE POST

                if (deleteMenuButton) {

                    const article =
                        deleteMenuButton.closest(".vortex-post");

                    const deleteButton =
                        article.querySelector(".delete-post-button");

                    if (
                        deleteButton &&
                        confirm("Delete this post?")
                    ) {
                        deleteButton.click();
                    }

                    return;
                }


                // CLICKING OUTSIDE CLOSES MENUS

                document
                    .querySelectorAll(".post-menu-dropdown")
                    .forEach(function (menu) {

                        menu.hidden = true;

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

                        .then(function (comments) {

                            console.log(
                                "Comments:",
                                comments
                            );


                            container.innerHTML = "";


                            comments.forEach(function (comment) {

                                container.innerHTML += `

                        <div
                            class="comment"
                            data-comment-id="${comment.id}"
                            data-post-id="${postId}"
                        >

                            <div class="comment-content">

                                <button
                                    class="view-profile-button comment-username"
                                    data-user-id="${comment.owner.id}"
                                >
                                    ${comment.owner.username || "User"}
                                </button>

                                <span class="comment-text">
                                    ${comment.content}
                                </span>

                            </div>


                            <button
                                class="delete-comment-button"
                                data-comment-id="${comment.id}"
                                data-post-id="${postId}"
                                type="button"
                                aria-label="Delete comment"
                            >
                                ×
                            </button>

                        </div>
                    `;

                            });


                            if (comments.length === 0) {

                                container.innerHTML = `
                        <p class="no-comments">
                            No comments yet.
                        </p>
                    `;

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
                        input.value.trim();


                    if (!content) {

                        return;

                    }


                    fetch(
                        `${API_URL}/comments/`,
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


                            const noComments =
                                container.querySelector(
                                    ".no-comments"
                                );


                            if (noComments) {

                                noComments.remove();

                            }


                            container.innerHTML += `

                    <div
                        class="comment"
                        data-comment-id="${result.data.id}"
                        data-post-id="${postId}"
                    >

                        <div class="comment-content">

                            <button
                                class="view-profile-button comment-username"
                                data-user-id="${result.data.owner.id}"
                            >
                                ${result.data.owner.username || "User"}
                            </button>

                            <span class="comment-text">
                                ${result.data.content}
                            </span>

                        </div>


                        <button
                            class="delete-comment-button"
                            data-comment-id="${result.data.id}"
                            data-post-id="${postId}"
                            type="button"
                            aria-label="Delete comment"
                        >
                            ×
                        </button>

                    </div>
                `;


                            input.value = "";


                            const commentsButton =
                                document.querySelector(
                                    `.view-comments-button[data-post-id="${postId}"]`
                                );


                            let commentCount =
                                Number(
                                    commentsButton.dataset.commentCount
                                );


                            commentCount++;


                            commentsButton.dataset.commentCount =
                                commentCount;


                            commentsButton.textContent =
                                `View all ${commentCount} ${commentCount === 1
                                    ? "comment"
                                    : "comments"
                                }`;

                        });

                });

            });


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


                const postId =
                    button.dataset.postId;


                fetch(
                    `${API_URL}/comments/${commentId}`,
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
                                "Could not delete comment:",
                                response.status
                            );

                            return;

                        }


                        button
                            .closest(".comment")
                            .remove();


                        const commentsButton =
                            document.querySelector(
                                `.view-comments-button[data-post-id="${postId}"]`
                            );


                        let commentCount =
                            Number(
                                commentsButton.dataset.commentCount
                            );


                        commentCount =
                            Math.max(
                                0,
                                commentCount - 1
                            );


                        commentsButton.dataset.commentCount =
                            commentCount;


                        commentsButton.textContent =
                            `View all ${commentCount} ${commentCount === 1
                                ? "comment"
                                : "comments"
                            }`;


                        console.log(
                            "Comment deleted"
                        );

                    });

            });
        });

}
