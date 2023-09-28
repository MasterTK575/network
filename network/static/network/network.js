
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
                commentButton.style.visibility = 'visible';
                commentForm.remove();
                // update comment count
                const commentCountContainer = postContainer.querySelector('.commentCount');
                if (result.commentCount === 1) {
                    commentCountContainer.textContent = "1 Comment";
                } else {
                    commentCountContainer.textContent = `${result.commentCount} Comments`;
                }

                // TODO!! add the new comment the DOM to see the result
                


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

// when an edit link is clicked
document.body.addEventListener('click', e => {
    if (e.target.matches('.edit')) {
        e.preventDefault();
        let editButton = e.target;
        let postContainer = editButton.closest('.card');
        editPostForm(editButton, postContainer);
    }
});

function editPostForm(editButton, postContainer) {
    // if other edit form already open, use it's "cancel-button" to replace it with the content again
    let oldEditForm = document.querySelector('#editForm');
    if (oldEditForm) {
        const cancelEditEvent = new Event('click');
        const cancelEdit = document.getElementById('cancelEdit');
        cancelEdit.dispatchEvent(cancelEditEvent);
    }

    // remove the edit button
    editButton.style.visibility = 'hidden';

    // get the post content
    let postContentContainer = postContainer.querySelector('.postContent');
    let postContent = postContentContainer.textContent;

    // Create the new edit form
    let editForm = document.createElement('form');
    editForm.classList.add('mb-2');
    editForm.setAttribute('id', 'editForm');
    editForm.innerHTML = `
        <div class="mb-2">
            <textarea rows=5 required maxlength="280" id="editInput" class="form-control">${postContent}</textarea>
        </div>
        <input type="submit" id="submitEdit" value="Save" class="btn btn-primary">
        <button id="cancelEdit" type="button" class="btn btn-outline-secondary">Cancel</button>
    `;

    // replace container for post content with edit Form
    postContentContainer.replaceWith(editForm);
    let editInput = document.getElementById('editInput');
    editInput.focus();
    editInput.selectionStart = editInput.value.length;
    editInput.selectionEnd = editInput.value.length;

    // Back button to close the edit form
    let cancelEdit = document.getElementById('cancelEdit');
    cancelEdit.addEventListener('click', () => {
        editButton.style.visibility = 'visible';
        editForm.replaceWith(postContentContainer);
    });

    // handle submission of the edit form
    editForm.addEventListener('submit', event => {
        event.preventDefault();

        // get the data
        const newContent = editInput.value;
        const postId = postContainer.getAttribute('data-postId');

        // Make AJAX call
        fetch('/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include CSRF token (for example form the search form)
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                postId: postId,
                newContent: newContent
            })
        })
        .then(response => response.json())
        .then(result => {
            if(result.error) {
                // if there was an error, show the message
                showAlert(result.error, "danger");
            } else {
                // if success, remove form and replace with updated content
                showAlert(result.message, "success");
                editButton.style.visibility = 'visible';
                postContentContainer.textContent = newContent;
                editForm.replaceWith(postContentContainer);
            }
        });
    })
}

// when a like button is clicked
document.body.addEventListener('click', e => {
    let target = e.target;
    // If the clicked element is not the likeButton but a child (like <svg> or <path>)
    if (!target.matches('.likeButton')) {
        target = target.closest('.likeButton');
    }
    if (target) {
        e.preventDefault();
        const postContainer = target.closest('.card');
        const postId = postContainer.getAttribute('data-postId');
        likePost(postId, postContainer);
    }
});

function likePost(postId, postContainer) {
    fetch('/likePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include CSRF token (for example form the search form)
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
            postId: postId
        })
    })
    .then(response => response.json())
    .then(result => {
        if(result.error) {
            // if there was an error, show the error
            showAlert(result.error, "danger");
        } else if (result.message) {
            // if success, udpate like count and svg
            const likeCount = postContainer.querySelector('.likeCount');
            likeCount.innerHTML = result.likes;
            const likeButton = postContainer.querySelector('.likeButton');
            if(result.userNowLikes === true) {
                likeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-heart-fill" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/></svg>'
            } else {
                likeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-heart" viewBox="0 0 16 16"> <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/> </svg>'
            }
        }
    });
}


// TODO!! show alerts next to user and not top of page
// TODO!! enable users to remove an alert by clicking an X
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


// when a showComments link is clicked
document.body.addEventListener('click', e => {
    if (e.target.matches('.commentCount')) {
        e.preventDefault();
        let showCommentsButton = e.target;
        let postContainer = showCommentsButton.closest('.card');

        // if comments are already shown, remove them instead
        let oldCommentContainer = postContainer.querySelector('.renderComments');
        if (oldCommentContainer) {
            oldCommentContainer.remove();
        }
        else {
            showComments(postContainer);
        }
    }
});

function showComments(postContainer) {
    const postId = postContainer.getAttribute('data-postId');
    fetch('/showComments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include CSRF token (for example form the search form)
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
            postId: postId
        })
    })
    .then(response => response.json())
    .then(result => {
        if(result.error) {
            // if there was an error, show the error
            showAlert(result.error, "danger");
        } else if (result.message) {
            // meaning SUCCESS
            // make new Container to render the comments in
            const renderCommentsContainer = document.createElement('div');
            renderCommentsContainer.classList.add('renderComments');
            postContainer.querySelector('.commentCount').insertAdjacentElement('afterend', renderCommentsContainer);

            const comments = result.comments
            console.log(comments);
            // loop through comments, create one element for each
            comments.forEach(comment => {
                const commentContainer = document.createElement('div');
                renderCommentsContainer.appendChild(commentContainer);
                ReactDOM.render(<DynamicComment comment={comment} />, commentContainer);
            });
        }
    });
}

// TODO!! add check for edit and comment link!
function DynamicComment(props) {
    const { comment } = props;
    return (
        <div className="card m-2" data-postid={comment.pk}>
            <div className="card-body">
                <h5 className="card-title">
                    <a href={`/user/${comment.username}`} className="text-decoration-none">
                        {comment.username}
                    </a>
                </h5>
                <p className="card-text postContent">{comment.content}</p>
                <p className="card-subtitle text-body-secondary mb-2">{formatDate(comment.created)}</p>
                <div className="d-flex mb-1">
                <a href="#" className="likeButton">
                        {comment.userHasLiked ?
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-heart-fill" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                            </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-heart" viewBox="0 0 16 16">
                                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                            </svg>
                        }
                    </a>
                    <p className="card-subtitle text-body-secondary ms-1 pt-1 likeCount">{comment.likeCount}</p>
                </div>
                <a href="#" className="card-link edit">Edit</a>
                <a href="" className="card-link comment">Comment</a>
            </div>
            <a className="card-footer text-body-secondary text-decoration-none commentCount" href="">
                {comment.commentCount === 1 ? '1 Comment' : `${comment.commentCount} Comments`}
            </a>
        </div>
    )
}

function formatDate(isoString) {
    const dateObj = new Date(isoString);

    // Extract the desired components
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hour = dateObj.getHours() > 12 ? dateObj.getHours() - 12 : dateObj.getHours();
    const minute = dateObj.getMinutes().toString().padStart(2, '0'); // Ensure minute is 2 digits
    const ampm = dateObj.getHours() >= 12 ? 'p.m.' : 'a.m.';

    // Construct the formatted string
    return `${month}. ${day}, ${year}, ${hour}:${minute} ${ampm}`;
}



function DynamicCommentOld(props) {
    const { comment } = props;
    return (
        <div className="card m-2" data-postId={comment.id}>
            <div className="card-body">
                <h5 className="card-title">
                    <a href={`/profile/${comment.user.username}`} className="text-decoration-none">
                        {comment.user.username}
                    </a>
                </h5>
                <p className="card-text postContent">{comment.content}</p>
                <p className="card-subtitle text-body-secondary mb-2">{new Date(comment.created).toLocaleDateString()}</p>
                <div className="d-flex mb-1">
                    <a href="#" className="likeButton">
                        {comment.userHasLiked ?
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-heart-fill" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                            </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-heart" viewBox="0 0 16 16">
                                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                            </svg>
                        }
                    </a>
                    <p className="card-subtitle text-body-secondary ms-1 pt-1 likeCount">{comment.likesCount}</p>
                </div>
                
                {props.user && props.user.id === comment.user.id &&
                    <a href="#" className="card-link edit">Edit</a>
                }
                {props.user && 
                    <a href="" className="card-link comment">Comment</a>
                }
            </div>
            <a className="card-footer text-body-secondary text-decoration-none commentCount" href="">
                {comment.commentsCount === 1 ? '1 Comment' : `${comment.commentsCount} Comments`}
            </a>
        </div>
    );
}



// TODO!! show if there is a parent comment and enable users to see it

// TODO!! search bar
document.querySelector('#searchBar').addEventListener('submit', e => {
    e.preventDefault();
});