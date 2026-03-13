from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'phone_number', 'address')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    is_verified = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'phone_number', 'address', 'is_staff', 'is_verified')
    
    def get_is_verified(self, obj):
        return obj.is_active
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Aceptar tanto 'email' como 'username'
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Si viene email, lo usamos como username
        if email and not username:
            attrs['username'] = email
            
        return super().validate(attrs)
