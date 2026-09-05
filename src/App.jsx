import {
  Beer,
  ChefHat,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Utensils,
} from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AdminPanel, Login, ProtectedRoute } from './Admin'
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

function CustomerMenu() {
  return <main className="customer catalog-page"><MenuCatalog /></main>
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
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
