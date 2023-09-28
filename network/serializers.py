from rest_framework import serializers
from .models import Post

class ExtendedPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    commentCount = serializers.IntegerField()
    likeCount = serializers.IntegerField()
    userHasLiked = serializers.BooleanField()


    class Meta:
        model = Post
        fields = ('commentCount', 'content', 'created', 'likeCount', 'modified', 'parent', 'pk', 'user', 'username', 'userHasLiked')
