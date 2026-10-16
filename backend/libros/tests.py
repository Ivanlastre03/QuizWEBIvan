from django.test import TestCase
from rest_framework.test import APIClient
from .models import Libro

class BibliotecaAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_listar_libros(self):
        r = self.client.get('/api/libros')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), [])

    def test_crear_libro(self):
        r = self.client.post('/api/libros', {'titulo': 'Cien años de soledad', 'autor': 'Gabriel García Márquez'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Libro.objects.count(), 1)
        self.assertEqual(r.json()['titulo'], 'Cien años de soledad')

    def test_campos_obligatorios(self):
        for data in ({'titulo': 'Libro'}, {'autor': 'Autor'}, {'titulo': ' ', 'autor': 'Autor'}):
            with self.subTest(data=data):
                r = self.client.post('/api/libros', data, format='json')
                self.assertEqual(r.status_code, 400)

    def test_eliminar_existente(self):
        libro = Libro.objects.create(titulo='Ejemplo', autor='Autor')
        r = self.client.delete(f'/api/libros/{libro.pk}')
        self.assertEqual(r.status_code, 204)
        self.assertFalse(Libro.objects.filter(pk=libro.pk).exists())

    def test_eliminar_inexistente(self):
        self.assertEqual(self.client.delete('/api/libros/99999').status_code, 404)

    def test_schema(self):
        r = self.client.get('/api/schema/?format=json')
        self.assertEqual(r.status_code, 200)
        paths = r.json()['paths']
        self.assertIn('/api/libros', paths)
        self.assertIn('/api/libros/{id}', paths)
        self.assertIn('get', paths['/api/libros'])
        self.assertIn('post', paths['/api/libros'])
        self.assertIn('delete', paths['/api/libros/{id}'])
