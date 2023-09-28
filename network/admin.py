from django.contrib import admin
from .models import User, Post

# Define custom UserAdmin to show and edit all fields for the User model
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login', 'is_active', 'is_staff']
    list_display_links = ['id', 'username']
    search_fields = ['username', 'email']
    list_per_page = 50

    filter_horizontal = ('followers',)  # Display many-to-many fields horizontally.
    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        (None, {'fields': ('username', 'password', 'email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Followers', {'fields': ('followers',)}),
    )

class CommentInline(admin.TabularInline):  # You can also use `StackedInline` if you prefer that format.
    model = Post
    fk_name = 'parent'
    extra = 0  # This determines how many empty inline forms are shown for new data.
    show_change_link = True  # Makes the related comment clickable in admin.
    fields = ['content', 'user', 'likes', 'created', 'modified']
    readonly_fields = ['created', 'modified']

class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'user', 'parent', 'created', 'modified']
    list_display_links = ['id', 'content']
    search_fields = ['content', 'user__username']
    list_filter = ['created', 'modified', 'user']
    list_per_page = 50

    readonly_fields = ['created', 'modified']

    filter_horizontal = ('likes',)
    inlines = [CommentInline]

    fieldsets = (
        (None, {'fields': ('content', 'user', 'likes', 'parent')}),
        ('Timestamps', {'fields': readonly_fields}),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
