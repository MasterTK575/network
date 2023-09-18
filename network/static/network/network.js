
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
            <textarea rows=3 required maxlength="280" placeholder="Your comment..." id="commentInput" class="form-control"></textarea>
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
            showAlert("Comment can't be empty.", "danger");
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
            if(result.error) {
                // if there was an error, show the message
                showAlert(result.error, "danger");
            } else {
                // if success, show message and remove form
                showAlert(result.message, "success");
                commentForm.remove();

                // TODO!! add the new comment the DOM and update comment count!

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


// TODO!! show alerts next to user and not top of page
function showAlert(message, type) {
    // remove all other alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    // create new alert
    const alert = document.createElement('div');
    alert.classList.add(`alert-${type}`, "alert", "mt-2", "mb-0");
    alert.innerHTML = message;
    document.querySelector('#showMessage').append(alert)
}

// TODO!! add functionality to dynamically show comments of a post