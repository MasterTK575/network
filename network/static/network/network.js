
// animate the new Post button
let showNewPost = document.querySelector('#showNewPost');
if (showNewPost) {
    showNewPost.addEventListener('click', function() {
        document.querySelector('#showNewPost').classList.add('hide-button');
        document.querySelector('#newPost').classList.add('show-post');
        document.querySelector('#newPostTextfield').focus();
    });
}
let closeNewPost = document.querySelector('#closeNewPost');
if(closeNewPost) {
    closeNewPost.addEventListener('click', function() {
        document.querySelector('#showNewPost').classList.remove('hide-button');
        document.querySelector('#newPost').classList.remove('show-post');
    });
}


// create the comment form and handle its submission
function handleCommentForm(commentButton, postContainer) {

    // remove other comment form if there is one and make comment link visible again
    let oldCommentForm = document.querySelector('#commentForm');
    if (oldCommentForm) {
        oldCommentForm.closest('.card').querySelector('.card-body .comment').style.visibility = 'visible';
        oldCommentForm.remove();
    }
    // remove the comment button
    commentButton.style.visibility = 'hidden';

    // Create the new comment form
    let commentForm = document.createElement('form');
    commentForm.classList.add('m-3');
    commentForm.setAttribute('id', 'commentForm');
    commentForm.innerHTML = `
        <div class="mb-2">
            <textarea rows=3 required placeholder="Your comment..." id="commentInput" class="form-control"></textarea>
        </div>
        <input type="submit" id="submitComment" value="Comment" class="btn btn-primary">
        <button id="cancelComment" type="button" class="btn btn-outline-secondary">Cancel</button>
    `;

    // Append comment form to the post container
    postContainer.appendChild(commentForm);

    let commentInput = document.getElementById('commentInput');
    commentInput.focus();

    // Back button to close the comment form
    let cancelComment = document.getElementById('cancelComment');
    cancelComment.addEventListener('click', () => {
        commentButton.style.visibility = 'visible';
        commentForm.remove();  // Instead of hiding, you remove the form so it can be recreated afresh
    });


    // Handle the submission of the comment
    commentForm.addEventListener('submit', event => {
        event.preventDefault();
        // get important data
        let content = commentInput.value;
        let postId = postContainer.getAttribute('data-postId');

        // if comment is empty, stop
        if (content === "") {
            console.log("Error, comment can't be empty!")
            return;
        }


        // Make AJAX call
        fetch('/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include CSRF token (for example form the search form)
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                postId: postId,
                content: content
            })
        })
        .then(response => response.json())
        .then(result => {
            if(result.success) {
                // For simplicity, you can refresh the page to see the new comment
                // location.reload();
                console.log(result.message);
                // Alternatively, append the comment to the DOM using JS
            } else {
                console.log(result.message);
                // Handle error, e.g., display an error message
            }
        });
    });
}

// when a comment link is clicked
document.body.addEventListener('click', function(event) {
    if (event.target.matches('.comment')) {
        event.preventDefault();
        let commentButton = event.target;
        let postContainer = commentButton.closest('.card');
        handleCommentForm(commentButton, postContainer);
    }
});

// maybe for later
function loadPosts (type) {
    fetch(`/posts/${type}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
    })
}