from rest_framework import serializers
from .models import Libro

class LibroSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(max_length=200, allow_blank=False, trim_whitespace=True)
    autor = serializers.CharField(max_length=200, allow_blank=False, trim_whitespace=True)

    class Meta:
        model = Libro
        fields = ['id', 'titulo', 'autor']
        read_only_fields = ['id']
