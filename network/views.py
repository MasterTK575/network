from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib import messages

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
            messages.error(request, "Need to be logged in to post.")
            return HttpResponseRedirect(reverse('index'))
            
    # if GET render index page
    else:
        form = PostForm()

    posts = Post.objects.all().order_by('-created')
    return render(request, "network/index.html", {
        'form' : form,
        'posts' : posts
    })


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
    posts = Post.objects.all().filter(user=user_profile).order_by('-created')
    return render(request, "network/profile.html", {
        'posts' : posts,
        'user_profile': user_profile
    })

def following(request):
    # TODO!!!
    posts = Post.objects.all().order_by('-created')
    return render(request, "network/profile.html", {
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
