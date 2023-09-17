
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
    commentForm.classList.add('m-2');
    commentForm.setAttribute('id', 'commentForm');
    commentForm.innerHTML = `
        <div class="form-group">
            <textarea rows=3 placeholder="Your comment..." id="commentInput" class="form-control"></textarea>
        </div>
        <input type="submit" id="submitComment" value="Comment" class="btn btn-primary">
        <button id="cancelComment" type="button" class="btn btn-outline-secondary">Cancel</button>
    `;

    // Append comment form to the post container
    postContainer.appendChild(commentForm);

    let submitComment = document.getElementById('submitComment');
    let commentInput = document.getElementById('commentInput');

    // Back button to close the comment form
    let cancelComment = document.getElementById('cancelComment');
    cancelComment.addEventListener('click', () => {
        commentButton.style.visibility = 'visible';
        commentForm.remove();  // Instead of hiding, you remove the form so it can be recreated afresh
    });

    // TODO!!!!
    // Handle the submission of the comment
    submitComment.addEventListener('click', function(e) {
        e.preventDefault();
        
        let content = commentInput.value;
        let post_id = postContainer.getAttribute('data-post-id'); 

        // Make AJAX call
        fetch('/add_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include CSRF token, if your setup needs it
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                post_id: post_id,
                content: content
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                // For simplicity, you can refresh the page to see the new comment
                location.reload();
                // Alternatively, append the comment to the DOM using JS
            } else {
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