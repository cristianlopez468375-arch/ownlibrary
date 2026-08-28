import React, { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, Boxes, CalendarDays, CheckCircle2, ChevronDown, CircleUserRound, Clock3, FileText, LayoutDashboard, LibraryBig, LogOut, Menu, Moon, Pencil, Plus, Search, Settings, Sun, Trash2, TrendingUp, Users, X } from 'lucide-react'

const initialBooks = [
  { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Novela', year: 1967, isbn: '978-0307474728', status: 'Disponible', location: 'A-01' },
  { id: 2, title: 'El nombre de la rosa', author: 'Umberto Eco', category: 'Misterio', year: 1980, isbn: '978-0156001311', status: 'Prestado', location: 'A-02' },
  { id: 3, title: 'Rayuela', author: 'Julio Cortázar', category: 'Novela', year: 1963, isbn: '978-8437604572', status: 'Disponible', location: 'B-04' },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Historia', year: 2011, isbn: '978-0062316097', status: 'Mantenimiento', location: 'C-12' }
]
const initialUsers = [
  { id: 1, name: 'María González', email: 'maria@ownlibrary.local', role: 'Bibliotecaria', status: 'Activo', password: 'biblioteca123' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@ownlibrary.local', role: 'Lector', status: 'Activo', password: 'biblioteca123' },
  { id: 3, name: 'Ana Torres', email: 'ana@ownlibrary.local', role: 'Lector', status: 'Inactivo', password: 'biblioteca123' },
  { id: 4, name: 'Lucía Fernández', email: 'lucia@ownlibrary.local', role: 'Lector', status: 'Activo', password: 'lucia123' }
]
const emptyBook = { title: '', author: '', category: 'Novela', year: new Date().getFullYear(), isbn: '', status: 'Disponible', location: '' }
const emptyUser = { name: '', email: '', role: 'Lector', status: 'Activo', password: '' }

function App() {
  const [currentUser, setCurrentUser] = useState(() => { const saved = localStorage.getItem('ownlibrary-session'); return saved ? JSON.parse(saved) : null })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ownlibrary-theme') === 'dark')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [section, setSection] = useState('catalog')
  const [books, setBooks] = useState(initialBooks)
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(null)
  const [bookForm, setBookForm] = useState(emptyBook)
  const [userForm, setUserForm] = useState(emptyUser)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('ownlibrary-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const login = (user, password) => {
    const match = users.find(candidate => candidate.email.toLowerCase() === user.email.toLowerCase() && candidate.password === password && candidate.status === 'Activo')
    if (!match) return false
    setCurrentUser(match); localStorage.setItem('ownlibrary-session', JSON.stringify(match)); return true
  }

  useEffect(() => {
    Promise.all([fetch('http://localhost:3001/api/books'), fetch('http://localhost:3001/api/users')])
      .then(async ([bookResponse, userResponse]) => { if (bookResponse.ok) setBooks(await bookResponse.json()); if (userResponse.ok) setUsers(await userResponse.json()) })
      .catch(() => {})
  }, [])

  const visibleBooks = books.filter(book => {
    const matchesQuery = `${book.title} ${book.author} ${book.isbn}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (filter === 'Todos' || book.status === filter)
  })
  const openCreate = () => { setBookForm(emptyBook); setModal('book') }
  const openEdit = book => { setBookForm(book); setModal('book') }
  const saveBook = async event => {
    event.preventDefault()
    const isEditing = Boolean(bookForm.id)
    const url = `http://localhost:3001/api/books${isEditing ? `/${bookForm.id}` : ''}`
    try {
      const response = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookForm) })
      if (response.ok) { const saved = await response.json(); setBooks(current => isEditing ? current.map(book => book.id === saved.id ? saved : book) : [...current, saved]); setNotice(isEditing ? 'Libro actualizado' : 'Libro añadido'); setModal(null); return }
    } catch { /* keeps the interface useful when the API is offline */ }
    setBooks(current => isEditing ? current.map(book => book.id === bookForm.id ? bookForm : book) : [...current, { ...bookForm, id: Date.now() }])
    setNotice(isEditing ? 'Libro actualizado localmente' : 'Libro añadido localmente'); setModal(null)
  }
  const deleteBook = async id => {
    if (!window.confirm('¿Eliminar este libro del catálogo?')) return
    try { await fetch(`http://localhost:3001/api/books/${id}`, { method: 'DELETE' }) } catch { /* local fallback */ }
    setBooks(current => current.filter(book => book.id !== id)); setNotice('Libro eliminado')
  }
  const saveUser = async event => {
    event.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) })
      if (response.ok) { const saved = await response.json(); setUsers(current => [...current, saved]); setNotice('Usuario añadido'); setModal(null); return }
    } catch { /* keeps the interface useful when the API is offline */ }
    setUsers(current => [...current, { ...userForm, id: Date.now() }]); setNotice('Usuario añadido localmente'); setModal(null)
  }
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2600); return () => clearTimeout(timer) }, [notice])

  if (!currentUser) return <LoginView users={users} onLogin={login} darkMode={darkMode} onToggleTheme={() => setDarkMode(value => !value)} />

  return <div className="app-shell">
    <aside className={mobileNavOpen ? 'sidebar mobile-nav-open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark"><LibraryBig size={21} /></span><span>own<span className="brand-accent">library</span></span></div>
      <div className="workspace-label">Workspace <ChevronDown size={14} /></div>
      <nav>
        <button className={section === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => { setSection('overview'); setMobileNavOpen(false) }}><LayoutDashboard size={18} /> Resumen</button>
        <button className={section === 'catalog' ? 'nav-item active' : 'nav-item'} onClick={() => { setSection('catalog'); setMobileNavOpen(false) }}><BookOpen size={18} /> Catálogo <span className="nav-count">{books.length}</span></button>
        <button className={section === 'users' ? 'nav-item active' : 'nav-item'} onClick={() => { setSection('users'); setMobileNavOpen(false) }}><Users size={18} /> Usuarios <span className="nav-count">{users.length}</span></button>
        <button className="nav-item"><FileText size={18} /> Préstamos</button>
      </nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /> Configuración</button><button className="nav-item" onClick={() => { setCurrentUser(null); localStorage.removeItem('ownlibrary-session') }}><LogOut size={18} /> Cerrar sesión</button><div className="profile"><div className="avatar">{currentUser.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</div><div><strong>{currentUser.name}</strong><small>{currentUser.role}</small></div><ChevronDown size={15} /></div></div>
    </aside>
    {mobileNavOpen && <div className="mobile-nav-backdrop" onMouseDown={() => setMobileNavOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" type="button" title="Abrir menú" aria-label="Abrir menú" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Biblioteca <span>/</span> <strong>{section === 'users' ? 'Usuarios' : section === 'catalog' ? 'Catálogo' : 'Resumen'}</strong></div><div className="top-actions"><span className="live-dot">●</span> Sistema operativo <button className="theme-toggle" type="button" title={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'} aria-label={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'} onClick={() => setDarkMode(value => !value)}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button><CircleUserRound size={22} /></div></header>
      {section === 'catalog' && <>
        <div className="page-heading"><div><p className="eyebrow">GESTIÓN DE COLECCIÓN</p><h1>Catálogo</h1><p className="subheading">Administra y organiza todos los ejemplares de tu biblioteca.</p></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> Añadir libro</button></div>
        <section className="stats-grid"><Stat icon={<Boxes />} label="Total de ejemplares" value={books.length} detail="En el catálogo" tone="yellow" /><Stat icon={<CheckCircle2 />} label="Disponibles" value={books.filter(book => book.status === 'Disponible').length} detail="Listos para préstamo" tone="green" /><Stat icon={<BookOpen />} label="En préstamo" value={books.filter(book => book.status === 'Prestado').length} detail="Actualmente fuera" tone="blue" /><Stat icon={<Users />} label="Lectores activos" value={users.filter(user => user.status === 'Activo').length} detail="Usuarios registrados" tone="coral" /></section>
        <section className="content-panel"><div className="panel-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por título, autor o ISBN..." /></div><div className="filter-group"><span>Estado:</span>{['Todos', 'Disponible', 'Prestado', 'Mantenimiento'].map(option => <button key={option} onClick={() => setFilter(option)} className={filter === option ? 'filter active-filter' : 'filter'}>{option}</button>)}</div></div><div className="table-wrap"><table><thead><tr><th>TÍTULO</th><th>AUTOR</th><th>CATEGORÍA</th><th>AÑO</th><th>ESTADO</th><th>UBICACIÓN</th><th></th></tr></thead><tbody>{visibleBooks.map(book => <tr key={book.id}><td><div className="book-title"><span className="book-cover">{book.title.slice(0, 1)}</span><div><strong>{book.title}</strong><small>{book.isbn}</small></div></div></td><td>{book.author}</td><td><span className="category">{book.category}</span></td><td>{book.year}</td><td><Status value={book.status} /></td><td><span className="location">{book.location}</span></td><td><div className="row-actions"><button title="Editar" onClick={() => openEdit(book)}><Pencil size={16} /></button><button title="Eliminar" onClick={() => deleteBook(book.id)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{visibleBooks.length === 0 && <div className="empty-state">No encontramos libros con esos criterios.</div>}</div><div className="table-footer">Mostrando <strong>{visibleBooks.length}</strong> de <strong>{books.length}</strong> ejemplares <span>Última sincronización: ahora</span></div></section>
      </>}
      {section === 'users' && <UsersView users={users} onCreate={() => { setUserForm(emptyUser); setModal('user') }} />}
      {section === 'overview' && <Overview books={books} users={users} onCatalog={() => setSection('catalog')} />}
    </main>
    {modal === 'book' && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setModal(null)}><form className="modal" onSubmit={saveBook}><div className="modal-header"><div><p className="eyebrow">CATÁLOGO</p><h2>{bookForm.id ? 'Editar libro' : 'Añadir libro'}</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={20} /></button></div><label>Título<input required value={bookForm.title} onChange={event => setBookForm({ ...bookForm, title: event.target.value })} /></label><label>Autor<input required value={bookForm.author} onChange={event => setBookForm({ ...bookForm, author: event.target.value })} /></label><div className="form-row"><label>Categoría<select value={bookForm.category} onChange={event => setBookForm({ ...bookForm, category: event.target.value })}><option>Novela</option><option>Misterio</option><option>Historia</option><option>Ciencia</option><option>Ensayo</option></select></label><label>Año<input type="number" required value={bookForm.year} onChange={event => setBookForm({ ...bookForm, year: Number(event.target.value) })} /></label></div><div className="form-row"><label>ISBN<input value={bookForm.isbn} onChange={event => setBookForm({ ...bookForm, isbn: event.target.value })} /></label><label>Ubicación<input value={bookForm.location} onChange={event => setBookForm({ ...bookForm, location: event.target.value })} placeholder="A-01" /></label></div><label>Estado<select value={bookForm.status} onChange={event => setBookForm({ ...bookForm, status: event.target.value })}><option>Disponible</option><option>Prestado</option><option>Mantenimiento</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" type="submit">Guardar libro</button></div></form></div>}
    {modal === 'user' && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setModal(null)}><form className="modal" onSubmit={saveUser}><div className="modal-header"><div><p className="eyebrow">CONTROL DE ACCESOS</p><h2>Nuevo usuario</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={20} /></button></div><label>Nombre<input required value={userForm.name} onChange={event => setUserForm({ ...userForm, name: event.target.value })} /></label><label>Email<input type="email" required value={userForm.email} onChange={event => setUserForm({ ...userForm, email: event.target.value })} /></label><label>Contraseña<input type="password" required minLength="6" value={userForm.password} onChange={event => setUserForm({ ...userForm, password: event.target.value })} /></label><div className="form-row"><label>Rol<select value={userForm.role} onChange={event => setUserForm({ ...userForm, role: event.target.value })}><option>Lector</option><option>Bibliotecaria</option></select></label><label>Estado<select value={userForm.status} onChange={event => setUserForm({ ...userForm, status: event.target.value })}><option>Activo</option><option>Inactivo</option></select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" type="submit">Guardar usuario</button></div></form></div>}
    {notice && <div className="toast"><CheckCircle2 size={18} /> {notice}</div>}
  </div>
}
function Stat({ icon, label, value, detail, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }
function Status({ value }) { return <span className={`status ${value.toLowerCase()}`}><i />{value}</span> }
function LoginView({ users, onLogin, darkMode, onToggleTheme }) {
  const [email, setEmail] = useState('lucia@ownlibrary.local')
  const [password, setPassword] = useState('lucia123')
  const [error, setError] = useState('')
  const submit = event => { event.preventDefault(); if (!onLogin({ email }, password)) setError('Email o contraseña incorrectos') }
  return <main className="login-page"><button className="theme-toggle login-theme-toggle" type="button" title={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'} aria-label={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'} onClick={onToggleTheme}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button><form className="login-card" onSubmit={submit}><div className="brand login-brand"><span className="brand-mark"><LibraryBig size={21} /></span><span>own<span className="brand-accent">library</span></span></div><p className="eyebrow">BIBLIOTECA DIGITAL</p><h1>Inicia sesión</h1><p className="subheading">Accede a tu espacio de administración.</p><label>Email<input type="email" required value={email} onChange={event => { setEmail(event.target.value); setError('') }} /></label><label>Contraseña<input type="password" required value={password} onChange={event => { setPassword(event.target.value); setError('') }} /></label>{error && <p className="login-error">{error}</p>}<button className="primary-button login-button" type="submit">Entrar</button><small className="login-hint">Demo: lucia@ownlibrary.local / lucia123</small></form></main>
}
function UsersView({ users, onCreate }) { return <><div className="page-heading"><div><p className="eyebrow">CONTROL DE ACCESOS</p><h1>Usuarios</h1><p className="subheading">Gestiona los perfiles con acceso a la biblioteca.</p></div><button className="primary-button" onClick={onCreate}><Plus size={18} /> Nuevo usuario</button></div><section className="content-panel users-panel"><div className="users-head"><h2>Usuarios registrados</h2><span>{users.length} perfiles</span></div>{users.map(user => <div className="user-row" key={user.id}><div className="avatar user-avatar">{user.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</div><div className="user-main"><strong>{user.name}</strong><small>{user.email}</small></div><span className="role">{user.role}</span><Status value={user.status} /><button className="row-more">•••</button></div>)}</section></> }
function Overview({ books, users, onCatalog }) {
  const available = books.filter(book => book.status === 'Disponible').length
  const borrowed = books.filter(book => book.status === 'Prestado').length
  const maintenance = books.filter(book => book.status === 'Mantenimiento').length
  const categories = books.reduce((summary, book) => ({ ...summary, [book.category]: (summary[book.category] || 0) + 1 }), {})
  const recentBooks = [...books].reverse().slice(0, 3)

  return <>
    <div className="page-heading overview-heading"><div><p className="eyebrow">JUEVES, 27 DE AGOSTO DE 2026</p><h1>Buenos días, María</h1><p className="subheading">Una mirada rápida a lo que sucede en tu biblioteca.</p></div><button className="secondary-button date-button"><CalendarDays size={17} /> Hoy</button></div>
    <section className="overview-grid">
      <div className="overview-main">
        <div className="overview-hero"><div><span className="hero-kicker">ESTADO DE LA COLECCIÓN</span><h2>Todo en su sitio.</h2><p>Tu biblioteca tiene <strong>{available} ejemplares</strong> listos para encontrar una nueva lectura.</p><button className="primary-button" onClick={onCatalog}>Abrir catálogo <ArrowUpRight size={16} /></button></div><div className="hero-stamp"><TrendingUp size={22} /><strong>{books.length ? Math.round((available / books.length) * 100) : 0}%</strong><small>disponible</small></div></div>
        <div className="overview-section-heading"><div><span className="eyebrow">ACTIVIDAD RECIENTE</span><h2>Últimos ejemplares</h2></div><button className="text-button" onClick={onCatalog}>Ver catálogo <ArrowUpRight size={15} /></button></div>
        <div className="recent-list">{recentBooks.map(book => <div className="recent-item" key={book.id}><span className="book-cover">{book.title.slice(0, 1)}</span><div><strong>{book.title}</strong><small>{book.author} · {book.category}</small></div><Status value={book.status} /></div>)}</div>
      </div>
      <aside className="overview-side"><div className="overview-section-heading"><div><span className="eyebrow">RESUMEN</span><h2>En números</h2></div></div><div className="mini-stat"><span className="mini-stat-icon green"><CheckCircle2 size={18} /></span><div><strong>{available}</strong><small>Disponibles</small></div></div><div className="mini-stat"><span className="mini-stat-icon blue"><Clock3 size={18} /></span><div><strong>{borrowed}</strong><small>En préstamo</small></div></div><div className="mini-stat"><span className="mini-stat-icon yellow"><BookOpen size={18} /></span><div><strong>{maintenance}</strong><small>En mantenimiento</small></div></div><div className="category-breakdown"><span className="eyebrow">CATEGORÍAS</span>{Object.entries(categories).map(([category, total]) => <div className="category-line" key={category}><span>{category}</span><div><i style={{ width: `${(total / Math.max(books.length, 1)) * 100}%` }} /><strong>{total}</strong></div></div>)}</div><div className="member-callout"><Users size={18} /><div><strong>{users.length} usuarios</strong><small>{users.filter(user => user.status === 'Activo').length} activos ahora</small></div></div></aside>
    </section>
  </>
}
export default App
