import { useEffect, useState } from 'react'
import {
  Bell,
  Beer,
  ChefHat,
  ChevronRight,
  Clock3,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Utensils,
  Volume2,
} from 'lucide-react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import MenuCatalog from './MenuCatalog'

function InstagramIcon({ size = 19 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const demoProducts = [
  {
    id: 'p1',
    name: 'Pezao Burger',
    category: 'Pratos',
    description: 'Pao brioche, burger artesanal, queijo e molho da casa.',
    price: 29.9,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    available: true,
  },
  {
    id: 'p2',
    name: 'Batata Crocante',
    category: 'Pratos',
    description: 'Porcao generosa com paprika defumada e maionese verde.',
    price: 18.9,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    available: true,
  },
  {
    id: 'p3',
    name: 'Caipirinha da Casa',
    category: 'Bebidas',
    description: 'Cachaca, limao fresco, acucar e muito gelo.',
    price: 16.9,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80',
    available: true,
  },
  {
    id: 'p4',
    name: 'Chopp Pilsen',
    category: 'Bebidas',
    description: 'Caneca trincando de 500 ml, leve e refrescante.',
    price: 12,
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&q=80',
    available: true,
  },
  {
    id: 'p5',
    name: 'Brownie com Sorvete',
    category: 'Sobremesas',
    description: 'Brownie quentinho, sorvete de creme e calda de chocolate.',
    price: 19.9,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800&q=80',
    available: true,
  },
]

const categories = ['Todos', 'Pratos', 'Bebidas', 'Sobremesas']
const allowedAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@pezao.com')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function playBell() {
  try {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 740
    gain.gain.setValueAtTime(0.001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.42)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.42)
  } catch {
    new Audio('/bell.mp3').play().catch(() => {})
  }
}

function isAllowedAdmin(session) {
  const email = session?.user?.email?.toLowerCase()
  return Boolean(email && allowedAdminEmails.includes(email))
}

export function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="center-screen">Carregando painel...</div>
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAllowedAdmin(session)) {
    return <Navigate to="/admin/login?erro=permissao" replace />
  }

  return children
}

function Brand() {
  return (
    <div className="brand-lockup" aria-label="Bar do Pezao, desde 1986">
      <img className="brand-logo" src="/logo.svg" alt="" />
      <span>
        <b>BAR DO <em>PEZAO</em></b>
        <small>DESDE 1986</small>
      </span>
    </div>
  )
}

function LandingPage() {
  const highlights = [
    { name: 'Batata Frita com Cheddar e Bacon', text: 'Batatas crocantes cobertas com cheddar derretido e bacon crocante.', price: 'R$ 42', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=1000&q=85' },
    { name: 'Calabresa Acebolada', text: 'Calabresa fatiada na chapa com cebola dourada, limao e pao frances.', price: 'R$ 48', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&q=85' },
    { name: 'Camarao ao Alho e Oleo', text: 'Camaroes suculentos salteados no alho e oleo com ervas frescas.', price: 'R$ 65', image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=1000&q=85' },
  ]

  return (
    <main className="landing-page">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <nav className="site-nav">
            <a href="#sobre">Sobre</a>
            <a href="#destaques">Destaques</a>
            <a href="#cardapio">Cardapio</a>
            <a href="#localizacao">Localizacao</a>
          </nav>
          <div className="header-actions">
            <a className="social-button" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={19} /></a>
            <a className="whatsapp-button" href="https://wa.me/5519992351141" target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
          </div>
        </div>
      </header>

      <section className="bar-hero">
        <div className="hero-shade" />
        <div className="home-container hero-content">
          <span className="heritage-tag"><Star size={16} fill="currentColor" /> Tradicao desde 1986</span>
          <h1>BAR DO <strong>PEZAO</strong></h1>
          <p>Cerveja gelada, porcao na mesa e historia no balcao.</p>
          <div className="hero-cta">
            <Link className="home-primary" to="/cardapio"><Utensils size={18} /> Ver cardapio</Link>
          </div>
        </div>
      </section>

      <section className="home-section story-section" id="sobre">
        <div className="home-container story-layout">
          <article className="story-copy">
            <p className="kicker">Nossa historia</p><h2>Mais que um bar, um ponto de encontro</h2>
            <p><b>O Bar do Pezao</b> nasceu em 1986 com uma missao simples: servir comida boa, bebida gelada e fazer todo mundo se sentir em casa.</p>
            <p>Aqui a mesa e farta, o papo e bom e a cerveja nao tem chance de esquentar.</p>
            <p>Seja para aquele happy hour depois do trabalho, o almoco de domingo em familia ou a noite com os amigos, o Pezao e o lugar certo.</p>
            <div className="story-stats"><span><b>38+</b> anos de historia</span><span><b>50+</b> itens no cardapio</span><span><b>∞</b> boas historias</span></div>
          </article>
          <div className="feature-grid">
            <article><Beer /><h3>Cerveja Extra Gelada</h3><p>Chopp e cervejas sempre na temperatura ideal para o seu brinde.</p></article>
            <article><ChefHat /><h3>Porcoes Generosas</h3><p>Tamanho de familia, feitas para dividir ou nao, a gente nao julga.</p></article>
            <article><Utensils /><h3>Comida de Buteco</h3><p>O sabor autentico do boteco brasileiro com aquele toque caseiro.</p></article>
            <article><Clock3 /><h3>Ambiente Acolhedor</h3><p>Atendimento de gente grande e clima de encontro de amigos.</p></article>
          </div>
        </div>
      </section>

      <section className="home-section favorites-section" id="destaques"><div className="home-container">
        <div className="section-heading"><p className="kicker">Os favoritos</p><h2>Porcoes e bebidas que nao decepcionam</h2></div>
        <div className="favorite-grid">{highlights.map(item => <article className="favorite-card" key={item.name}><div className="food-photo" style={{ backgroundImage: `url(${item.image})` }}><span>{item.price}</span></div><div><h3>{item.name}</h3><p>{item.text}</p></div></article>)}</div>
      </div></section>

      <section className="home-container menu-callout" id="cardapio"><div><p className="kicker">Cardapio completo</p><h2>Quer ver tudo o que servimos?</h2><p>Acesse nosso cardapio digital com porcoes, bebidas, combos e precos. Tudo na palma da mao.</p></div><Link className="menu-open" to="/cardapio">Abrir cardapio <ChevronRight size={20} /></Link></section>

      <section className="home-section location-section" id="localizacao"><div className="home-container">
        <div className="section-heading"><p className="kicker">Onde estamos</p><h2>Venha nos visitar</h2></div>
        <div className="contact-grid">
          <article><MapPin /><h3>Endereco</h3><p>Av. Paschoal Ardito, 301<br />Sao Manoel, Americana - SP<br />CEP 13472-130</p></article>
          <article><Clock3 /><h3>Horario de funcionamento</h3><p>Quinta-feira <b>15:00-01:00</b><br />Sexta-feira <b>15:00-01:00</b><br />Sabado <b>15:00-01:00</b><br />Domingo <b>Fechado</b><br />Segunda-feira <b>15:00-00:30</b><br />Terca-feira <b>15:00-00:30</b><br />Quarta-feira <b>15:00-01:00</b></p></article>
          <article><Phone /><h3>Contato</h3><p>(19) 99235-1141</p><a href="https://wa.me/5519992351141" target="_blank" rel="noreferrer">Falar no WhatsApp</a></article>
        </div>
        <div className="location-map-layout">
          <div className="map-frame">
            <iframe
              title="Localizacao do Bar do Pezao no Google Maps"
              src="https://www.google.com/maps?q=Av.+Paschoal+Ardito%2C+301%2C+Sao+Manoel%2C+Americana+-+SP%2C+13472-130&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div></section>

      <footer className="bar-footer">
        <div className="home-container footer-content-full">
          <div className="footer-brand">
            <Brand />
            <p>O melhor ponto de encontro de Americana. Cerveja gelada, porcao na mesa e historia no balcao.</p>
            <div className="footer-social"><a href="https://wa.me/5519992351141" target="_blank" rel="noreferrer"><MessageCircle size={19} /></a><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={19} /></a></div>
          </div>
          <div className="footer-nav">
            <h3>NAVEGAÇÃO</h3>
            <a href="#sobre">Sobre</a>
            <a href="#destaques">Destaques</a>
            <a href="#cardapio">Cardapio</a>
            <a href="#localizacao">Localizacao</a>
          </div>
          <div className="footer-contact">
            <h3>FALE CONOSCO</h3>
            <p><strong>Bar do Pezao</strong><br />Av. Paschoal Ardito, 301<br />Sao Manoel, Americana - SP<br />CEP 13472-130</p>
            <p><a href="https://wa.me/5519992351141" target="_blank" rel="noreferrer">(19) 99235-1141</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Desenvolvido por Luana Camilo</p>
        </div>
      </footer>
    </main>
  )
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha invalidos.' : authError.message)
      setBusy(false)
      return
    }

    if (!isAllowedAdmin(data.session)) {
      await supabase.auth.signOut()
      setError('Este usuario nao tem permissao para acessar o painel.')
      setBusy(false)
      return
    }

    navigate('/admin/painel')
    setBusy(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Brand />
        <p className="eyebrow">Acesso restrito</p>
        <h1>Login do admin</h1>
        <p className="muted">
          Entre com um usuario cadastrado no Supabase Auth e liberado em `VITE_ADMIN_EMAILS`.
        </p>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary full" disabled={busy}>
            {busy ? 'Entrando...' : 'Entrar no painel'} <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </main>
  )
}

function CustomerMenu() {
  return <main className="customer catalog-page"><MenuCatalog /></main>
}

function KitchenPanel() {
  const [orders, setOrders] = useState([])
  const [sound, setSound] = useState(false)
  const [products, setProducts] = useState(demoProducts)
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setOrders(data))

    supabase
      .from('products')
      .select('*')
      .order('category')
      .then(({ data }) => data?.length && setProducts(data))

    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        setOrders(current => [payload.new, ...current])
        if (payload.new.status === 'Pendente' && sound) {
          playBell()
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload =>
        setOrders(current => current.map(order => (order.id === payload.new.id ? payload.new : order))),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sound])

  async function updateStatus(order, status) {
    const { data } = await supabase.from('orders').update({ status }).eq('id', order.id).select().single()
    if (data) {
      setOrders(current => current.map(item => (item.id === order.id ? data : item)))
    }
  }

  async function toggleProduct(product) {
    const available = !product.available
    await supabase.from('products').update({ available }).eq('id', product.id)
    setProducts(current => current.map(item => (item.id === product.id ? { ...item, available } : item)))
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const shown = orders.filter(order => filter === 'Todos' || order.status === filter)
  const pending = orders.filter(order => order.status === 'Pendente').length

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <Brand />
          <div>
            <span className="eyebrow">Operacao</span>
            <h1>Painel da casa</h1>
          </div>
        </div>
        <div className="admin-actions">
          <button className={sound ? 'sound-on' : 'outline'} onClick={() => setSound(!sound)}>
            <Volume2 size={17} /> {sound ? 'Som ativo' : 'Ativar alerta sonoro'}
          </button>
          <button className="icon-button" onClick={logout} title="Sair">
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <section className="dashboard-stats">
        <div>
          <span>Pedidos abertos</span>
          <strong>{orders.length}</strong>
          <small>
            <Clock3 size={14} /> Atualizacao ao vivo
          </small>
        </div>
        <div>
          <span>Pendentes agora</span>
          <strong className="red-text">{pending}</strong>
          <small>Prioridade da cozinha</small>
        </div>
        <div>
          <span>Faturamento da lista</span>
          <strong>{money(orders.reduce((sum, item) => sum + (item.total || 0), 0))}</strong>
          <small>Pedidos registrados</small>
        </div>
      </section>

      <div className="panel-columns">
        <section className="orders-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Fila em tempo real</p>
              <h2>Pedidos recebidos</h2>
            </div>
            <div className="filter-tabs">
              {['Todos', 'Pendente', 'Em Preparo', 'Entregue'].map(item => (
                <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={28} />
              <p>Nenhum pedido nesta fila.</p>
            </div>
          ) : (
            shown.map(order => (
              <article
                className={`order-card status-${(order.status || 'Pendente').toLowerCase().replace(' ', '-')}`}
                key={order.id}
              >
                <div className="order-top">
                  <div>
                    <span className="order-number">Pedido</span>
                    <h3>#{String(order.id).slice(-4)}</h3>
                  </div>
                  <span className="status-pill">{order.status}</span>
                </div>

                <div className="order-lines">
                  {(order.items || []).map((item, index) => (
                    <div key={index}>
                      <b>{item.quantity}x</b>
                      <span>{item.name}</span>
                      {item.note && <em>"{item.note}"</em>}
                    </div>
                  ))}
                </div>

                <div className="order-bottom">
                  <strong>{money(order.total || 0)}</strong>
                  <select value={order.status} onChange={event => updateStatus(order, event.target.value)}>
                    <option>Pendente</option>
                    <option>Em Preparo</option>
                    <option>Entregue</option>
                  </select>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="inventory-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Disponibilidade</p>
              <h2>Cardapio</h2>
            </div>
            <ChefHat size={23} />
          </div>

          {products.map(product => (
            <div className="inventory-row" key={product.id}>
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <span>{money(product.price)}</span>
              </div>
              <button className={`toggle ${product.available ? 'on' : ''}`} onClick={() => toggleProduct(product)}>
                <span />
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cardapio" element={<CustomerMenu />} />
      <Route path="/mesa/:id" element={<Navigate to="/cardapio" replace />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/painel"
        element={
          <ProtectedRoute>
            <KitchenPanel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
