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
// CREATE POST IMAGE PREVIEW
// ========================================

const postImageInput =
    document.getElementById("post-image");

const imagePreviewSection =
    document.getElementById("image-preview-section");

const imagePreviewContainer =
    document.getElementById("image-preview-container");

const imagePreviewCount =
    document.getElementById("image-preview-count");

const clearImagesButton =
    document.getElementById("clear-images-button");


let currentPreviewIndex = 0;
let previewImageUrls = [];


function renderImagePreviews() {

    const selectedImages =
        Array.from(postImageInput.files);


    imagePreviewContainer.innerHTML = "";

    previewImageUrls.forEach(function (url) {
        URL.revokeObjectURL(url);
    });

    previewImageUrls = [];


    if (selectedImages.length === 0) {

        imagePreviewSection.hidden = true;

        return;
    }


    imagePreviewSection.hidden = false;

    currentPreviewIndex = 0;


    imagePreviewCount.textContent =
        `${selectedImages.length} ${
            selectedImages.length === 1
                ? "photo"
                : "photos"
        } ready`;


    previewImageUrls =
        selectedImages.map(function (file) {
            return URL.createObjectURL(file);
        });


    const carousel =
        document.createElement("div");

    carousel.className =
        "create-preview-carousel";


    const image =
        document.createElement("img");

    image.className =
        "create-preview-carousel-image";

    image.alt =
        "Selected trip photo";


    const previousButton =
        document.createElement("button");

    previousButton.type = "button";

    previousButton.className =
        "create-preview-arrow create-preview-arrow-left";

    previousButton.textContent = "‹";


    const nextButton =
        document.createElement("button");

    nextButton.type = "button";

    nextButton.className =
        "create-preview-arrow create-preview-arrow-right";

    nextButton.textContent = "›";


    const counter =
        document.createElement("div");

    counter.className =
        "create-preview-carousel-counter";


    function updateCarousel() {

        image.src =
            previewImageUrls[currentPreviewIndex];


        counter.textContent =
            `${currentPreviewIndex + 1} / ${previewImageUrls.length}`;


        const hasMultipleImages =
            previewImageUrls.length > 1;


        previousButton.hidden =
            !hasMultipleImages;

        nextButton.hidden =
            !hasMultipleImages;

        counter.hidden =
            !hasMultipleImages;
    }


    previousButton.addEventListener(
        "click",
        function () {

            currentPreviewIndex--;

            if (currentPreviewIndex < 0) {
                currentPreviewIndex =
                    previewImageUrls.length - 1;
            }

            updateCarousel();
        }
    );


    nextButton.addEventListener(
        "click",
        function () {

            currentPreviewIndex++;

            if (
                currentPreviewIndex >=
                previewImageUrls.length
            ) {
                currentPreviewIndex = 0;
            }

            updateCarousel();
        }
    );


    carousel.appendChild(image);
    carousel.appendChild(previousButton);
    carousel.appendChild(nextButton);
    carousel.appendChild(counter);

    imagePreviewContainer.appendChild(
        carousel
    );


    updateCarousel();
}

postImageInput.addEventListener(
    "change",
    function () {
        renderImagePreviews();
    }
);


clearImagesButton.addEventListener(
    "click",
    function () {

        postImageInput.value = "";

        previewImageUrls.forEach(function (url) {
            URL.revokeObjectURL(url);
        });

        previewImageUrls = [];

        imagePreviewContainer.innerHTML = "";

        imagePreviewCount.textContent = "";

        imagePreviewSection.hidden = true;

        currentPreviewIndex = 0;
    }
);

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

    const sort =
        document.getElementById("explore-sort").value;


    const params =
        new URLSearchParams();


    if (search) {
        params.append("search", search);
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
