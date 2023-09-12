from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    content = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 5, 'placeholder': "What's on your mind?", 'class': 'form-control'}),
        error_messages={
            'required': 'Please write something before posting!',
            'max_length': 'Your post is too long!'
        },
        label='',
    )
    class Meta:
        model = Post
        fields = ['content']
