import { useCallback, useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function request(path, options) {
  const response = await fetch(`${API}${path}`, options);
  if (!response.ok) {
    const info = await response.json().catch(() => ({}));
    const detalles = Object.entries(info).map(([campo, valor]) => `${campo}: ${Array.isArray(valor) ? valor.join(', ') : valor}`).join(' | ');
    throw new Error(detalles || `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export default function App() {
  const [libros, setLibros] = useState([]);
  const [form, setForm] = useState({ titulo: '', autor: '' });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await request('/api/libros');
      setLibros(resultado);
      setError('');
    } catch (err) {
      setError(`No se pudo cargar la biblioteca. Verifica que Django esté encendido. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function agregar(event) {
    event.preventDefault();
    setError(''); setMensaje('');
    if (!form.titulo.trim() || !form.autor.trim()) {
      setError('Completa el título y el autor.'); return;
    }
    setGuardando(true);
    try {
      const nuevo = await request('/api/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: form.titulo.trim(), autor: form.autor.trim() }),
      });
      setLibros(actuales => [...actuales, nuevo]);
      setForm({ titulo: '', autor: '' });
      setMensaje('¡Libro agregado correctamente!');
    } catch (err) { setError(`No se pudo guardar: ${err.message}`); }
    finally { setGuardando(false); }
  }

  async function eliminar(libro) {
    if (!window.confirm(`¿Eliminar “${libro.titulo}”?`)) return;
    setError(''); setMensaje(''); setEliminando(libro.id);
    try {
      await request(`/api/libros/${libro.id}`, { method: 'DELETE' });
      setLibros(actuales => actuales.filter(item => item.id !== libro.id));
      setMensaje('Libro eliminado correctamente.');
    } catch (err) { setError(`No se pudo eliminar: ${err.message}`); }
    finally { setEliminando(null); }
  }

  return <>
    <header className="hero py-5 mb-5"><div className="container">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div><span className="small text-uppercase fw-semibold letter-space">Desarrollo de Aplicaciones Web</span>
          <h1 className="display-5 fw-bold mb-2">📚 Mi Biblioteca</h1>
          <p className="lead mb-0 opacity-75">Gestiona tus libros con React + Django REST Framework.</p>
        </div>
        <a className="btn btn-outline-light" href={`${API}/api/docs/`} target="_blank" rel="noreferrer">Ver API en Swagger ↗</a>
      </div>
    </div></header>
    <main className="container pb-5">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      <div className="row g-4">
        <section className="col-12 col-lg-4" aria-labelledby="form-title">
          <div className="card h-100 border-0 shadow-sm"><div className="card-body p-4">
            <h2 id="form-title" className="h4 fw-bold mb-1">Agregar libro</h2>
            <p className="text-secondary mb-4">Registra un nuevo título en la biblioteca.</p>
            <form onSubmit={agregar}>
              <label htmlFor="titulo" className="form-label fw-semibold">Título</label>
              <input id="titulo" className="form-control mb-3" maxLength="200" required placeholder="Ej. El principito" value={form.titulo} onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}/>
              <label htmlFor="autor" className="form-label fw-semibold">Autor</label>
              <input id="autor" className="form-control mb-4" maxLength="200" required placeholder="Ej. Antoine de Saint-Exupéry" value={form.autor} onChange={e => setForm(prev => ({ ...prev, autor: e.target.value }))}/>
              <button className="btn btn-primary w-100 py-2" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : '＋ Agregar libro'}</button>
            </form>
          </div></div>
        </section>
        <section className="col-12 col-lg-8" aria-labelledby="lista-title">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div><h2 id="lista-title" className="h4 fw-bold mb-1">Libros registrados <span className="badge rounded-pill text-bg-light ms-1">{libros.length}</span></h2><p className="text-secondary mb-0">Consulta y administra tu colección.</p></div>
            <button className="btn btn-outline-secondary btn-sm" onClick={cargar} disabled={loading}>↻ Actualizar</button>
          </div>
          {loading ? <p className="text-secondary">Cargando libros…</p> : libros.length === 0 ?
            <div className="empty rounded-4 text-center p-5"><div className="display-4 mb-2">📖</div><h3 className="h5">Tu biblioteca está vacía</h3><p className="text-secondary mb-0">Agrega el primer libro con el formulario.</p></div> :
            <div className="row row-cols-1 row-cols-md-2 g-3">{libros.map(libro =>
              <div className="col" key={libro.id}><article className="card border-0 shadow-sm h-100"><div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3"><span className="book-icon">📘</span><span className="badge text-bg-light">ID: {libro.id}</span></div>
                <h3 className="h5 fw-bold text-break">{libro.titulo}</h3><p className="text-secondary text-break mb-4">Por {libro.autor}</p>
                <button className="btn btn-outline-danger mt-auto" disabled={eliminando === libro.id} onClick={() => eliminar(libro)}>{eliminando === libro.id ? 'Eliminando…' : 'Eliminar libro'}</button>
              </div></article></div>)}</div>}
        </section>
      </div>
    </main>
    <footer className="text-center text-secondary py-4 small">Quiz Servicios Web y Frontend · React · Bootstrap · Django</footer>
  </>;
}
