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
    <div className="brand-lockup" aria-label="Bar do Pezão, desde 1986">
      <img className="brand-logo" src="/logo.svg" alt="" />
      <span>
        <b>BAR DO <em>PEZÃO</em></b>
        <small>DESDE 1986</small>
      </span>
    </div>
  )
}

function LandingPage() {
  const highlights = [
    { name: 'Polenta Recheada Costela com Provolone', text: 'Polenta frita crocante com provolone derretido e costela desfiada.', image: '/destaque-polenta.jpg' },
    { name: 'Almofadinha de Tilápia', text: 'Massa de mandioca com recheio de tilápia desfiada e molho da casa.', image: '/destaque-almofadinha.jpg' },
    { name: 'Camarão Empanado com Catupiry', text: 'Camarões empanados e crocantes, recheados com catupiry cremoso.', image: '/destaque-camarao.jpg' },
  ]

  return (
    <main className="landing-page">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <nav className="site-nav">
            <a href="#sobre">Sobre</a>
            <a href="#destaques">Destaques</a>
            <a href="#cardapio">Cardápio</a>
            <a href="#localizacao">Localização</a>
          </nav>
          <div className="header-actions">
            <a className="social-button" href="https://www.instagram.com/barpezaoam/" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={19} /></a>
            <a className="whatsapp-button" href="https://wa.me/5519992351141" target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
          </div>
        </div>
      </header>

      <section className="bar-hero">
        <div className="hero-shade" />
        <div className="home-container hero-content">
          <span className="heritage-tag"><Star size={16} fill="currentColor" /> Tradição desde 1986</span>
          <h1>BAR DO <strong>PEZÃO</strong></h1>
          <p>Cerveja gelada, porção na mesa e história no balcão.</p>
          <div className="hero-cta">
            <Link className="home-primary" to="/cardapio"><Utensils size={18} /> Ver cardápio</Link>
          </div>
        </div>
      </section>

      <section className="home-section story-section" id="sobre">
        <div className="home-container story-layout">
          <article className="story-copy">
            <p className="kicker">Nossa história</p><h2>Mais que um bar, um ponto de encontro</h2>
            <p><b>O Bar do Pezão</b> nasceu em 1986 com uma missão simples: servir comida boa, bebida gelada e fazer todo mundo se sentir em casa.</p>
            <p>Aqui a mesa é farta, o papo é bom e a cerveja não tem chance de esquentar.</p>
            <p>Seja para aquele happy hour depois do trabalho, o almoço de domingo em família ou a noite com os amigos, o Pezão é o lugar certo.</p>
            <div className="story-stats"><span><b>38+</b> anos de história</span><span><b>50+</b> itens no cardápio</span><span><b>∞</b> boas histórias</span></div>
          </article>
          <div className="feature-grid">
            <article><Beer /><h3>Cerveja Extra Gelada</h3><p>Chopp e cervejas sempre na temperatura ideal para o seu brinde.</p></article>
            <article><ChefHat /><h3>Porções Generosas</h3><p>Tamanho de família, feitas para dividir ou não, a gente não julga.</p></article>
            <article><Utensils /><h3>Comida de Buteco</h3><p>O sabor autêntico do boteco brasileiro com aquele toque caseiro.</p></article>
            <article><Clock3 /><h3>Ambiente Acolhedor</h3><p>Atendimento de gente grande e clima de encontro de amigos.</p></article>
          </div>
        </div>
      </section>

      <section className="home-section favorites-section" id="destaques"><div className="home-container">
        <div className="section-heading"><p className="kicker">Os favoritos</p><h2>Porções e bebidas que não decepcionam</h2></div>
        <div className="favorite-grid">{highlights.map(item => <article className="favorite-card" key={item.name}><div className="food-photo" style={{ backgroundImage: `url(${item.image})` }} /><div><h3>{item.name}</h3><p>{item.text}</p></div></article>)}</div>
      </div></section>

      <section className="home-container menu-callout" id="cardapio"><div><p className="kicker">Cardápio completo</p><h2>Quer ver tudo o que servimos?</h2><p>Acesse nosso cardápio digital com porções, bebidas, combos e preços. Tudo na palma da mão.</p></div><Link className="menu-open" to="/cardapio">Abrir cardápio <ChevronRight size={20} /></Link></section>

      <section className="home-section location-section" id="localizacao"><div className="home-container">
        <div className="section-heading"><p className="kicker">Onde estamos</p><h2>Venha nos visitar</h2></div>
        <div className="contact-grid">
          <article><MapPin /><h3>Endereço</h3><p>Av. Paschoal Ardito, 301<br />São Manoel, Americana - SP<br />CEP 13472-130</p></article>
          <article><Clock3 /><h3>Horário de funcionamento</h3><p>Domingo <b>Fechado</b><br />Segunda e Terça <b>15:00-00:30</b><br />Quarta a Sábado <b>15:00-01:00</b></p></article>
          <article><Phone /><h3>Contato</h3><p>(19) 99235-1141</p><a href="https://wa.me/5519992351141" target="_blank" rel="noreferrer">Falar no WhatsApp</a></article>
        </div>
        <div className="location-map-layout">
          <div className="map-frame">
            <iframe
              title="Localização do Bar do Pezão no Google Maps"
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
            <p>O melhor ponto de encontro de Americana. Cerveja gelada, porção na mesa e história no balcão.</p>
            <div className="footer-social"><a href="https://wa.me/5519992351141" target="_blank" rel="noreferrer"><MessageCircle size={19} /></a><a href="https://www.instagram.com/barpezaoam/" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={19} /></a></div>
          </div>
          <div className="footer-nav">
            <h3>NAVEGAÇÃO</h3>
            <a href="#sobre">Sobre</a>
            <a href="#destaques">Destaques</a>
            <a href="#cardapio">Cardápio</a>
            <a href="#localizacao">Localização</a>
          </div>
          <div className="footer-contact">
            <h3>FALE CONOSCO</h3>
            <p><strong>Bar do Pezão</strong><br />Av. Paschoal Ardito, 301<br />São Manoel, Americana - SP<br />CEP 13472-130</p>
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
