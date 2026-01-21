from django.contrib import admin

# Register your models here.

from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = (
        'username',
        'email',
        'phone_number',
        'is_staff',
        'is_active',
    )

    list_filter = (
        'is_staff',
        'is_active',
    )

    search_fields = (
        'username',
        'email',
        'phone_number',
    )

    ordering = ('username',)

    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': (
                'first_name',
                'last_name',
                'email',
                'phone_number',
                'address',
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        ('Important dates', {
            'fields': (
                'last_login',
                'date_joined',
            )
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'phone_number',
                'password1',
                'password2',
            ),
        }),
    )
