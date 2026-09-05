import { createContext, useContext, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { checkAdmin, fetchMenu, saveSection, saveProduct, deleteSection, deleteProduct } from './lib/menuApi'
import './admin.css'

const AuthContext = createContext(null)
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
  async function reload() {
    setLoading(true)
    try { setData(await fetchMenu({ admin: true })); setError('') }
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
      else await saveProduct({ ...value, id_secao: form.get('id_secao'), preco: Number(form.get('preco')), ic_disponivel: form.has('ic_disponivel'), destaque: form.get('destaque').trim() }, editor.item?.id)
      setEditor(null); await reload(); setNotice('Alteração salva.')
    } catch (err) { setError(err.code === '23505' ? 'Este identificador de seção já existe.' : 'Não foi possível salvar. Confira os campos, sua permissão e a conexão.') }
    finally { setBusy(false) }
  }
  async function remove(type, item) {
    if (!window.confirm(`Excluir "${item.nome}"? Esta ação não pode ser desfeita.`)) return
    setBusy(true); setError(''); setNotice('')
    try { await (type === 'section' ? deleteSection : deleteProduct)(item.id); await reload(); setNotice('Registro excluído.') }
    catch (err) { setError(err.code === '23503' ? 'Mova ou exclua os produtos desta seção antes de removê-la.' : 'Não foi possível excluir. Confira sua permissão e a conexão.') }
    finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setError('Não foi possível sair. Tente novamente.')
    setBusy(false)
  }
  return <main className="menu-admin"><div className="admin-content">
    <header><div><h1>Editar cardápio</h1><Link to="/cardapio">Ver cardápio público</Link></div><button disabled={busy} onClick={logout}>Sair</button></header>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {editor ? <form className="admin-editor" key={`${editor.type}-${editor.item?.id || 'new'}`} onSubmit={save}>
      <h2>{editor.item ? 'Editar' : 'Adicionar'} {editor.type === 'section' ? 'seção' : 'produto'}</h2>
      <fieldset disabled={busy}>
        <label>Nome<input name="nome" required maxLength="150" defaultValue={editor.item?.nome || ''} /></label>
        <label>Descrição<textarea name="descricao" defaultValue={editor.item?.descricao || ''} /></label>
        <label>Ordem<input name="ordem" type="number" min="0" step="1" required defaultValue={editor.item?.ordem ?? 0} /></label>
        {editor.type === 'section' ? <label>Identificador (ex.: porcoes-fritas)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={editor.item?.slug || ''} /></label> : <>
          <label>Seção<select name="id_secao" required defaultValue={editor.item?.id_secao || editor.sectionId}>{data.sections.map(section => <option key={section.id} value={section.id}>{section.nome}</option>)}</select></label>
          <label>Preço (R$)<input name="preco" type="number" required min="0" max="99999999.99" step="0.01" defaultValue={editor.item?.preco ?? ''} /></label>
          <label>Selo de destaque<input name="destaque" maxLength="40" defaultValue={editor.item?.destaque || ''} /></label>
          <label className="admin-checkbox"><input name="ic_disponivel" type="checkbox" defaultChecked={editor.item?.ic_disponivel ?? true} /> Disponível no cardápio</label>
        </>}
        <div className="admin-actions"><button type="submit">{busy ? 'Salvando...' : 'Salvar'}</button><button type="button" onClick={() => setEditor(null)}>Cancelar</button></div>
      </fieldset>
    </form> : <>
      <div className="admin-actions"><button disabled={busy || loading} onClick={() => setEditor({ type: 'section' })}>Adicionar seção</button><button disabled={busy || loading} onClick={reload}>Atualizar</button></div>
      {loading ? <p role="status">Carregando...</p> : data.sections.length === 0 ? <p>Nenhuma seção cadastrada.</p> : data.sections.map(section => <section className="admin-section" key={section.id}>
        <h2>{section.nome}</h2><div className="admin-actions"><button disabled={busy} onClick={() => setEditor({ type: 'section', item: section })}>Editar seção</button><button disabled={busy} onClick={() => remove('section', section)}>Excluir seção</button><button disabled={busy} onClick={() => setEditor({ type: 'product', sectionId: section.id })}>Adicionar produto</button></div>
        {data.products.filter(product => product.id_secao === section.id).map(product => <article className="admin-product" key={product.id}><div><strong>{product.nome}</strong><p>{Number(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {product.ic_disponivel ? 'Disponível' : 'Oculto'}</p></div><div className="admin-actions"><button disabled={busy} onClick={() => setEditor({ type: 'product', item: product })}>Editar</button><button disabled={busy} onClick={() => remove('product', product)}>Excluir</button></div></article>)}
      </section>)}
    </>}
  </div></main>
}
