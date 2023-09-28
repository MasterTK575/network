
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),

    #API Routes
    path("comment", views.comment, name="comment"),
    path("edit", views.edit, name="edit"),
    path("likePost", views.likePost, name="likePost"),
    path("showComments", views.showComments, name="showComments")
]
