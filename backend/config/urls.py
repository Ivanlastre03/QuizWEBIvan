from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from libros.views import ListaCrearLibrosView, EliminarLibroView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/libros', ListaCrearLibrosView.as_view(), name='lista-crear-libros'),
    path('api/libros/<int:pk>', EliminarLibroView.as_view(), name='eliminar-libro'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
