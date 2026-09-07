import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Trash2, X, Plus, Pencil, Search, RefreshCw, ExternalLink, LogOut, UtensilsCrossed, Layers3, CircleCheck, CirclePause, ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { checkAdmin, fetchMenu, saveSection, saveProduct, deleteSection, deleteProduct, setProductSoldOut } from './lib/menuApi'
import './admin.css'

const AuthContext = createContext(null)

function PriceInput({ initialValue }) {
  const format = cents => (Number(cents) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [value, setValue] = useState(initialValue == null ? '' : format(Math.round(Number(initialValue) * 100)))
  return <label>Preço (R$)<span className="admin-money-input"><span aria-hidden="true">R$</span><input name="preco" type="text" inputMode="numeric" required placeholder="0,00" value={value} onFocus={event => event.target.select()} onChange={event => {
    const digits = event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    if (digits.length <= 10) setValue(digits ? format(digits) : '')
  }} /></span></label>
}

function DeleteConfirmation({ pending, busy, error, onCancel, onConfirm }) {
  const dialog = useRef(null)
  useEffect(() => {
    const node = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    node.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      node.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])
  return <dialog className="admin-delete-modal" ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event => { event.preventDefault(); if (!busy) onCancel() }} onClick={event => {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!busy && event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) onCancel()
  }}>
    <button className="admin-modal-close" type="button" aria-label="Fechar confirmação" disabled={busy} onClick={onCancel}><X size={20} /></button>
    <span className="admin-delete-icon"><Trash2 size={26} aria-hidden="true" /></span>
    <h2 id="delete-title">Excluir {pending.type === 'section' ? 'seção' : 'produto'}?</h2>
    <p id="delete-description">Você está prestes a excluir <strong>{pending.item.nome}</strong>. Esta ação não pode ser desfeita.</p>
    {pending.type === 'section' && <p className="admin-delete-hint">A seção precisa estar sem produtos para ser excluída.</p>}
    {error && <p role="alert">{error}</p>}
    <div className="admin-modal-actions"><button type="button" autoFocus disabled={busy} onClick={onCancel}>Cancelar</button><button type="button" className="admin-delete-confirm" disabled={busy} onClick={onConfirm}>{busy ? 'Excluindo...' : 'Sim, excluir'}</button></div>
  </dialog>
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [access, setAccess] = useState({ token: null, allowed: false, error: '' })
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) setAccess({ token: null, allowed: false, error: '' })
    })
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    let alive = true
    if (!session) return
    checkAdmin().then(allowed => { if (alive) setAccess({ token: session.access_token, allowed, error: '' }) })
      .catch(() => { if (alive) setAccess({ token: session.access_token, allowed: false, error: 'Não foi possível verificar a permissão. Confira a conexão e a configuração do administrador.' }) })
    return () => { alive = false }
  }, [session])
  const loading = session === undefined || Boolean(session && access.token !== session.access_token)
  const admin = Boolean(session && access.token === session.access_token && access.allowed)
  return <AuthContext.Provider value={{ session, loading, admin, error: session ? access.error : '' }}>{children}</AuthContext.Provider>
}
export function ProtectedRoute({ children }) {
  const { loading, admin } = useContext(AuthContext)
  if (loading) return <div className="center-screen">Verificando acesso...</div>
  return admin ? children : <Navigate to="/admin/login" replace />
}
export function Login() {
  const auth = useContext(AuthContext)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.get('email').trim(), password: form.get('password') })
      if (error) throw error
    } catch { setError('Não foi possível entrar. Confira o e-mail, a senha e sua conexão.') }
    finally { setBusy(false) }
  }
  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) setError('Não foi possível sair. Tente novamente.')
  }
  if (auth.loading) return <div className="center-screen">Verificando acesso...</div>
  if (auth.admin) return <Navigate to="/admin/painel" replace />
  return <main className="menu-admin"><div className="admin-login"><Link to="/"><img src="/logo.svg" width="60" alt="Bar do Pezão" /></Link><h1>Acesso do administrador</h1>
    {auth.session ? <><p role="alert">{auth.error || 'Esta conta não tem permissão para editar o cardápio.'}</p><button onClick={logout}>Sair e usar outra conta</button></> : <form onSubmit={submit}>
      <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
      <label>Senha<input name="password" type="password" autoComplete="current-password" required /></label>
      <button disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
    </form>}{error && <p role="alert">{error}</p>}<Link to="/cardapio">Voltar ao cardápio</Link></div></main>
}

export function AdminPanel() {
  const [data, setData] = useState({ sections: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [collapsedSections, setCollapsedSections] = useState({})
  const normalize = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const soldOutCount = data.products.filter(product => product.ic_disponivel === false).length
  const filteredSections = data.sections.map(section => ({ ...section, products: data.products.filter(product => product.id_secao === section.id
    && (statusFilter === 'all' || (product.ic_disponivel === false ? 'sold-out' : 'available') === statusFilter)
    && normalize(`${product.nome} ${product.descricao || ''} ${section.nome}`).includes(normalize(search.trim()))) }))
    .filter(section => section.products.length || (!search.trim() && statusFilter === 'all'))
  async function reload() {
    setLoading(true)
    try { setData(await fetchMenu()); setError('') }
    catch { setError('Não foi possível carregar o cardápio. Confira a conexão e se as tabelas foram configuradas.') }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [])
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    const form = new FormData(event.currentTarget)
    const value = { nome: form.get('nome').trim(), descricao: form.get('descricao').trim(), ordem: Number(form.get('ordem')) }
    try {
      if (editor.type === 'section') await saveSection({ ...value, slug: form.get('slug').trim() }, editor.item?.id)
      else await saveProduct({ ...value, id_secao: form.get('id_secao'), preco: Number(form.get('preco').replaceAll('.', '').replace(',', '.')), ic_disponivel: form.has('ic_disponivel'), destaque: form.get('destaque').trim() }, editor.item?.id)
      setEditor(null); setCollapsedSections({}); await reload(); setNotice('Alteração salva.')
    } catch (err) { setError(err.code === '23505' ? 'Este identificador de seção já existe.' : 'Não foi possível salvar. Confira os campos, sua permissão e a conexão.') }
    finally { setBusy(false) }
  }
  function remove(type, item) {
    setDeleteError('')
    setPendingDelete({ type, item })
  }
  async function confirmDelete() {
    if (!pendingDelete || busy) return
    const { type, item } = pendingDelete
    setBusy(true); setError(''); setNotice('')
    setDeleteError('')
    try { await (type === 'section' ? deleteSection : deleteProduct)(item.id); setPendingDelete(null); await reload(); setNotice('Registro excluído.') }
    catch (err) { setDeleteError(err.code === '23503' ? 'Mova ou exclua os produtos desta seção antes de removê-la.' : 'Não foi possível excluir. Confira sua permissão e a conexão.') }
    finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setError('Não foi possível sair. Tente novamente.')
    setBusy(false)
  }
  async function toggleSoldOut(product) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const updated = await setProductSoldOut(product.id, product.ic_disponivel !== false)
      setData(current => ({ ...current, products: current.products.map(item => item.id === updated.id ? updated : item) }))
      setNotice(updated.ic_disponivel === false ? 'Produto marcado como esgotado.' : 'Produto disponível novamente.')
    } catch { setError('Não foi possível alterar o status. Confira a conexão e a configuração do banco.') }
    finally { setBusy(false) }
  }
  return <main className="menu-admin"><div className="admin-content">
    <header className="admin-topbar"><Link className="admin-brand" to="/"><img src="/logo.svg" alt="" /><span><strong>BAR DO PEZÃO</strong><small>PAINEL ADMINISTRATIVO</small></span></Link><div className="admin-topbar-actions"><Link to="/cardapio"><ExternalLink size={16} /> Ver cardápio público</Link><button className="admin-quiet" disabled={busy} onClick={logout}><LogOut size={16} /> Sair</button></div></header>
    <div className="admin-page-heading"><div><span className="admin-eyebrow">DO SEU JEITO, NA MESA DE TODOS</span><h1>Seu cardápio<span>.</span></h1><p>Um toque para atualizar. Tudo pronto para receber seus clientes.</p></div><span className="admin-heading-icon" aria-hidden="true"><UtensilsCrossed size={42} /></span></div>
    {!editor && <div className="admin-summary">
      <div><span className="admin-stat-icon"><UtensilsCrossed size={22} /></span><span><small>Produtos no cardápio</small><strong>{loading ? '—' : data.products.length}</strong></span></div>
      <div><span className="admin-stat-icon is-green"><CircleCheck size={22} /></span><span><small>Disponíveis</small><strong>{loading ? '—' : data.products.length - soldOutCount}</strong></span></div>
      <div><span className="admin-stat-icon is-red"><CirclePause size={22} /></span><span><small>Esgotados</small><strong>{loading ? '—' : soldOutCount}</strong></span></div>
    </div>}
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {editor ? <form className="admin-editor" key={`${editor.type}-${editor.item?.id || 'new'}`} onSubmit={save}>
      <div className="admin-editor-heading"><button type="button" className="admin-quiet" disabled={busy} onClick={() => setEditor(null)} aria-label="Voltar à lista"><ArrowLeft size={20} /></button><div><span className="admin-eyebrow">CUIDE DOS DETALHES</span><h2>{editor.item ? 'Editar' : 'Adicionar'} {editor.type === 'section' ? 'seção' : 'produto'}</h2></div></div>
      <fieldset disabled={busy}>
        <label>Nome<input name="nome" required maxLength="150" defaultValue={editor.item?.nome || ''} /></label>
        <label>Descrição<textarea name="descricao" defaultValue={editor.item?.descricao || ''} /></label>
        <label>Ordem<input name="ordem" type="number" min="0" step="1" required defaultValue={editor.item?.ordem ?? 0} /></label>
        {editor.type === 'section' ? <label>Identificador (ex.: porcoes-fritas)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={editor.item?.slug || ''} /></label> : <>
          <label>Seção<select name="id_secao" required defaultValue={editor.item?.id_secao || editor.sectionId}>{data.sections.map(section => <option key={section.id} value={section.id}>{section.nome}</option>)}</select></label>
          <PriceInput initialValue={editor.item?.preco} />
          <label>Selo de destaque<input name="destaque" maxLength="40" defaultValue={editor.item?.destaque || ''} /></label>
          <label className="admin-checkbox"><input name="ic_disponivel" type="checkbox" defaultChecked={editor.item?.ic_disponivel ?? true} /> Disponível (desmarque para indicar esgotado)</label>
        </>}
        <div className="admin-actions admin-form-actions"><button className="admin-primary" type="submit"><CircleCheck size={17} />{busy ? 'Salvando...' : 'Salvar'}</button><button type="button" onClick={() => setEditor(null)}>Cancelar</button></div>
      </fieldset>
    </form> : <>
      <div className="admin-list-toolbar"><label className="admin-search"><Search size={19} /><input type="search" aria-label="Buscar produto ou seção" placeholder="Encontre um produto ou seção..." value={search} onChange={event => { setSearch(event.target.value); setCollapsedSections({}) }} /></label><button className="admin-quiet" disabled={busy || loading} onClick={reload}><RefreshCw size={17} /> Atualizar</button><button className="admin-primary" disabled={busy || loading} onClick={() => setEditor({ type: 'section' })}><Plus size={18} /> Adicionar seção</button></div>
      <div className="admin-filters" aria-label="Filtrar por disponibilidade">{[['all', 'Todos'], ['available', 'Disponíveis'], ['sold-out', 'Esgotados']].map(([id, label]) => <button key={id} aria-pressed={statusFilter === id} onClick={() => { setStatusFilter(id); setCollapsedSections({}) }}>{label}</button>)}</div>
      {loading ? <p role="status">Carregando...</p> : data.sections.length === 0 ? <div className="admin-empty"><Layers3 size={32} /><h2>Seu cardápio começa aqui</h2><p>Adicione a primeira seção para organizar seus produtos.</p></div> : !filteredSections.length ? <div className="admin-empty"><Search size={32} /><h2>Nenhum produto encontrado</h2><p>Tente outro nome ou altere os filtros.</p><button onClick={() => { setSearch(''); setStatusFilter('all') }}>Limpar filtros</button></div> : filteredSections.map(section => <section className="admin-section" key={section.id}>
        <div className="admin-section-top"><div className="admin-section-name"><span className="admin-section-icon"><UtensilsCrossed size={23} /></span><div><h2>{section.nome}<span className="admin-item-count">{section.products.length}</span></h2>{section.descricao && <p>{section.descricao}</p>}</div></div><div className="admin-actions"><button type="button" className="admin-collapse-section" aria-expanded={!collapsedSections[section.id]} aria-controls={`admin-section-products-${section.id}`} aria-label={`${collapsedSections[section.id] ? 'Expandir' : 'Minimizar'} ${section.nome}`} onClick={() => setCollapsedSections(current => ({ ...current, [section.id]: !current[section.id] }))}><ChevronDown size={17} />{collapsedSections[section.id] ? 'Expandir' : 'Minimizar'}</button><button className="admin-quiet" disabled={busy} onClick={() => setEditor({ type: 'section', item: section })}><Pencil size={15} /> Editar seção</button><button className="admin-icon-danger" aria-label="Excluir seção" title="Excluir seção" disabled={busy} onClick={() => remove('section', section)}><Trash2 size={17} /></button><button className="admin-add-product" disabled={busy} onClick={() => setEditor({ type: 'product', sectionId: section.id })}><Plus size={17} /> Adicionar produto</button></div></div>
        <div id={`admin-section-products-${section.id}`} hidden={Boolean(collapsedSections[section.id])}>
        {section.products.length === 0 && <p className="admin-section-empty">Essa seção ainda não tem produtos. Adicione o primeiro para começar.</p>}
        {section.products.map(product => <article className={`admin-product${product.ic_disponivel === false ? ' admin-product-unavailable' : ''}`} key={product.id}><div className="admin-product-details"><div className="admin-product-title"><strong>{product.nome}</strong>{product.destaque && <span className="admin-product-highlight">{product.destaque}</span>}</div>{product.descricao && <p className="admin-product-description">{product.descricao}</p>}<div className="admin-product-meta"><span className="admin-product-price">{Number(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span><span className={`admin-product-status ${product.ic_disponivel === false ? 'is-sold-out' : ''}`}><span />{product.ic_disponivel === false ? 'Esgotado' : 'Disponível'}</span></div></div><div className="admin-actions"><button className="admin-sold-out-toggle" aria-pressed={product.ic_disponivel === false} disabled={busy} onClick={() => toggleSoldOut(product)}>{product.ic_disponivel === false ? <CircleCheck size={16} /> : <CirclePause size={16} />}{product.ic_disponivel === false ? 'Marcar como disponível' : 'Marcar como esgotado'}</button><button className="admin-edit-product" disabled={busy} onClick={() => setEditor({ type: 'product', item: product })}><Pencil size={15} /> Editar</button><button className="admin-icon-danger" aria-label="Excluir" title="Excluir produto" disabled={busy} onClick={() => remove('product', product)}><Trash2 size={17} /></button></div></article>)}
        </div>
      </section>)}
    </>}
    {pendingDelete && <DeleteConfirmation pending={pendingDelete} busy={busy} error={deleteError} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />}
  </div></main>
}
