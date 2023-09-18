from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField('self', related_name='following', symmetrical=False, blank=True)

class Post(models.Model):
    content = models.CharField(max_length=280)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    # to see who liked what! count() to get the amount
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    # comments are posts too! if a post has a parent, it's a comment
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} said: {self.content}"

