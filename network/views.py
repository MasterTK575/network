from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib import messages
import json
from django.db.models import Exists, OuterRef

from .forms import *
from .models import *


def index(request):
    # if POST request, new post was submitted
    if request.method == 'POST':
        # make sure user is logged in
        if request.user.is_authenticated:
            form = PostForm(request.POST)
            # commit post if it's valid
            if form.is_valid():
                new_post = form.save(commit=False)
                new_post.user = request.user
                new_post.save()
                messages.success(request, "Post created successfully.")
                return HttpResponseRedirect(reverse('index'))
            else:
                messages.error(request, "Post is too long.")
                return HttpResponseRedirect(reverse('index'))
        else:
            messages.error(request, "Need to be logged in to post.")
            return HttpResponseRedirect(reverse('index'))
            
    # if GET render index page
    else:
        form = PostForm()

    posts = Post.objects.filter(parent__isnull=True).order_by('-created')
    posts = posts.annotate(userHasLiked=Exists(Post.likes.through.objects.filter(post_id=OuterRef('pk'), user_id=request.user.id)))
    return render(request, "network/index.html", {
        'form' : form,
        'posts' : posts
    })


def comment(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You need to be logged in to comment."}, status=400)
    
    # posting a comment must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # get data and commmit
    data = json.loads(request.body)
    content = data.get("content", "")
    postId = data.get("postId", "")
    # error checking
    if content == "":
        return JsonResponse({"error": "Comment can't be empty."}, status=400)
    elif len(content) > 280:
        return JsonResponse({"error": "Comment is too long."}, status=400)
    try:
        parentPost = Post.objects.get(pk=postId)
    except:
        return JsonResponse({"error": "Coulnd't find associated post."}, status=400)
    
    newComment = Post(
        content=content,
        user=request.user,
        parent=parentPost,
    )
    newComment.save()
    return JsonResponse({"message": "Comment posted successfully."}, status=201)

def edit(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You need to be logged in to edit a post."}, status=400)
    
    # posting a comment must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # get data
    data = json.loads(request.body)
    newContent = data.get("newContent", "")
    postId = data.get("postId", "")

    # error checking
    if newContent == "":
        return JsonResponse({"error": "Post can't be empty."}, status=400)
    elif len(newContent) > 280:
        return JsonResponse({"error": "Post is too long."}, status=400)
    try:
        post = Post.objects.get(pk=postId)
    except:
        return JsonResponse({"error": "Post doesn't exist."}, status=400)
    
    # can only edit your own posts
    if not request.user == post.user:
        return JsonResponse({"error": "Can only edit your own posts."}, status=400)
    
    # if all good, commit
    post.content = newContent
    post.save()
    return JsonResponse({"message": "Post edited successfully."}, status=201)



def likePost(request):
    # Ensure the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You need to be logged in to like a post."}, status=400)
    
    # liking a post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # get the post
    data = json.loads(request.body)
    postId = data.get("postId", "")
    try:
        post = Post.objects.get(pk=postId)
    except:
        return JsonResponse({"error": "Coulnd't find associated post."}, status=400)
    
    # like or unlike the post
    user = request.user
    userNowLikes = False
    if post.likes.filter(pk=user.id).exists():
        post.likes.remove(user)
    else:
        post.likes.add(user)
        userNowLikes = True
    # update like count
    likes = post.likes.count()
    return JsonResponse({"message": "Like successfully updated", "likes" : likes, "userNowLikes": userNowLikes}, status=201)



def profile(request, username):
    # try to get the user
    try:
        user_profile = User.objects.get(username=username)
    except User.DoesNotExist:
        messages.error(request, "User does not exist.")
        return HttpResponseRedirect(reverse('index'))
    
    # if POST, follow/unfollow user
    if request.method == "POST":
        user = request.user
        if not user.is_authenticated:
            messages.error(request, "Need to be logged in to follow people.")
            return HttpResponseRedirect(reverse('profile', args=(username,)))
        
        # cannot follow yourself
        if user == user_profile:
            messages.error(request, "You can only follow other people.")
            return HttpResponseRedirect(reverse('profile', args=(username,)))
        
        # if you follow, unfollow. Else follow
        if user_profile.followers.filter(id=user.id).exists():
            user_profile.followers.remove(user)
            user.following.remove(user_profile)
        else:
            user_profile.followers.add(user)
            user.following.add(user_profile)
        
        messages.success(request, "Following updated successfully.")
        return HttpResponseRedirect(reverse('profile', args=(username,)))
        

    # if GET, render profile page
    posts = Post.objects.filter(user=user_profile).order_by('-created')
    posts = posts.annotate(userHasLiked=Exists(Post.likes.through.objects.filter(post_id=OuterRef('pk'), user_id=request.user.id)))
    return render(request, "network/profile.html", {
        'posts' : posts,
        'user_profile': user_profile
    })

def following(request):
    # Get all posts from the users that the current user is following
    current_user = request.user
    posts = Post.objects.filter(user__in=current_user.following.all()).order_by('-created')
    posts = posts.annotate(userHasLiked=Exists(Post.likes.through.objects.filter(post_id=OuterRef('pk'), user_id=request.user.id)))
    return render(request, "network/following.html", {
        'posts' : posts
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
