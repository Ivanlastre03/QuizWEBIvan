from rest_framework import generics
from .models import Libro
from .serializers import LibroSerializer

class ListaCrearLibrosView(generics.ListCreateAPIView):
    """GET lista libros (200), POST crea libro (201 o 400)."""
    queryset = Libro.objects.all().order_by('id')
    serializer_class = LibroSerializer

class EliminarLibroView(generics.DestroyAPIView):
    """DELETE elimina libro (204) o devuelve 404."""
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer
