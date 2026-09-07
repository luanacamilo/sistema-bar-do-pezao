import { useEffect, useRef, useState } from 'react'
import { Beer, Check, ChevronDown, Flame, GlassWater, Search, UtensilsCrossed, Wine, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchMenu } from './lib/menuApi'
import './menuCatalog.css'

const definitions = [
  ['porcoes', 'Porções', 'Para dividir — ou não', UtensilsCrossed],
  ['peixes', 'Peixes', 'Crocantes e feitos na hora', Flame],
  ['porcoes-fritas', 'Porções fritas', 'Clássicos de boteco', UtensilsCrossed],
  ['porcao-premium', 'Porção premium', 'Um capricho a mais na mesa', Flame],
  ['frios', 'Frios', 'Petiscos rápidos', UtensilsCrossed],
  ['caipirinhas', 'Caipirinhas', 'Frutas, gelo e bons brindes', Wine],
  ['drinks', 'Drinks & doses', 'A noite começa aqui', Wine],
  ['cervejas', 'Cervejas', 'Sempre trincando', Beer],
  ['sem-alcool', 'Sem álcool', 'Refrescantes para todos', GlassWater],
]
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function MenuCatalog() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setLoadError(false)
    fetchMenu().then(data => {
      if (!active) return
      setSections(data.sections.map(section => ({
        id: section.slug, title: section.nome, subtitle: section.descricao,
        Icon: definitions.find(definition => definition[0] === section.slug)?.[3] || UtensilsCrossed,
        items: data.products.filter(product => product.id_secao === section.id).map(product => ({
          id: product.id, name: product.nome, description: product.descricao,
          price: Number(product.preco), badge: product.destaque, soldOut: product.ic_disponivel === false,
        })),
      })))
    }).catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todos')
  const [collapsedSections, setCollapsedSections] = useState({})
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoryMenu = useRef(null)
  const categoryTrigger = useRef(null)
  const toolbar = useRef(null)
  const selected = sections.find(section => section.id === category)
  const SelectedIcon = selected?.Icon || UtensilsCrossed
  const search = normalize(query.trim())
  const visible = sections.filter(section => category === 'todos' || section.id === category)
    .map(section => ({ ...section, items: section.items.filter(item => normalize(`${item.name} ${item.description} ${item.group || ''} ${section.title}`).includes(search)) }))
    .filter(section => section.items.length)

  useEffect(() => {
    if (!categoriesOpen) return
    function dismiss(event) {
      if (!categoryMenu.current?.contains(event.target)) setCategoriesOpen(false)
    }
    function escape(event) {
      if (event.key === 'Escape') {
        setCategoriesOpen(false)
        categoryTrigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [categoriesOpen])

  function chooseCategory(id) {
    setCategory(id)
    setCollapsedSections(current => ({ ...current, [id]: false }))
    setCategoriesOpen(false)
    if (categoriesOpen) categoryTrigger.current?.focus({ preventScroll: true })
    if (toolbar.current.getBoundingClientRect().top < 0) toolbar.current.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return <div className="catalog">
    <section className="catalog-hero">
      <header className="catalog-container catalog-header">
        <Link className="catalog-brand" to="/" aria-label="Bar do Pezão, página inicial">
          <img className="catalog-logo" src="/logo.svg" alt="" />
          <span><b>BAR DO <em>PEZÃO</em></b><small>DESDE 1986</small></span>
        </Link>
        <span className="catalog-location">Americana — SP</span>
      </header>
      <div className="catalog-container catalog-intro">
        <p className="catalog-kicker"><Flame size={15} /> Cerveja gelada, porção na mesa</p>
        <h1>NOSSO<strong>CARDÁPIO</strong></h1>
        <p className="catalog-description">Escolha sem pressa. Aqui tem comida boa, bebida gelada e sabor de boteco de verdade.</p>
      </div>
    </section>
    <div className="catalog-toolbar" ref={toolbar}>
      <div className="catalog-container">
        <div className="catalog-search">
          <Search size={21} aria-hidden="true" />
          <input type="search" aria-label="Buscar no cardápio" placeholder="O que você quer hoje?" value={query} onChange={event => { setQuery(event.target.value); setCollapsedSections({}) }} />
          {query && <button onClick={() => setQuery('')} aria-label="Limpar busca"><X size={18} /></button>}
        </div>
        <nav className="catalog-tabs" aria-label="Categorias do cardápio">
          <button className={category === 'todos' ? 'is-active' : ''} aria-pressed={category === 'todos'} onClick={() => chooseCategory('todos')}>Todos</button>
          {sections.map(({ id, title, Icon }) => <button key={id} className={category === id ? 'is-active' : ''} aria-pressed={category === id} onClick={() => chooseCategory(id)}><Icon size={16} />{title}</button>)}
        </nav>
        <div className="catalog-mobile-category" ref={categoryMenu} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setCategoriesOpen(false)
        }}>
          <button type="button" className="catalog-category-trigger" ref={categoryTrigger} aria-expanded={categoriesOpen} aria-controls="catalog-category-options" onClick={() => {
            setCategoriesOpen(!categoriesOpen)
            if (!categoriesOpen) toolbar.current.scrollIntoView({ behavior: 'instant', block: 'start' })
          }}>
            <SelectedIcon size={22} aria-hidden="true" />
            <span><small>Ir para a categoria</small><strong>{selected?.title || 'Cardápio completo'}</strong></span>
            <ChevronDown size={17} aria-hidden="true" />
          </button>
          {categoriesOpen && <nav id="catalog-category-options" className="catalog-category-options" aria-label="Escolher categoria">
            {[{ id: 'todos', title: 'Cardápio completo', Icon: UtensilsCrossed }, ...sections].map(({ id, title, Icon }) => <button type="button" key={id} aria-pressed={category === id} onClick={() => chooseCategory(id)}>
              <Icon size={20} aria-hidden="true" /><span>{title}</span>{category === id && <Check size={18} aria-hidden="true" />}
            </button>)}
          </nav>}
        </div>
      </div>
    </div>
    <div className="catalog-container catalog-sections">
      <span className="catalog-sr-only" role="status">{visible.reduce((sum, section) => sum + section.items.length, 0)} itens encontrados</span>
      {visible.map(({ id, title, subtitle, Icon, items }) => <section className="catalog-section" key={id} aria-labelledby={`catalog-${id}`}>
        <div className="catalog-section-heading">
          <p className="catalog-kicker">{subtitle}</p>
          <h2 id={`catalog-${id}`}>
            <button type="button" className="catalog-section-toggle" aria-expanded={!collapsedSections[id]} aria-controls={`catalog-items-${id}`} aria-label={`${collapsedSections[id] ? 'Expandir' : 'Recolher'} ${title}`} onClick={() => setCollapsedSections(current => ({ ...current, [id]: !current[id] }))}>
              <span>{title}</span>
              <span className="catalog-section-control"><Icon size={24} aria-hidden="true" /><span>{collapsedSections[id] ? 'Expandir' : 'Recolher'}</span><ChevronDown size={20} aria-hidden="true" /></span>
            </button>
          </h2>
        </div>
        <div className="catalog-items" id={`catalog-items-${id}`} hidden={Boolean(collapsedSections[id])}>{items.map(item => <article className={`catalog-item${item.soldOut ? ' is-sold-out' : ''}`} key={item.id}>
          <div className="catalog-item-copy"><div className="catalog-item-title"><h3>{item.name}</h3>{item.badge && <span className="catalog-badge">{item.badge}</span>}</div>{item.description && <p>{item.description}</p>}</div>
          <strong className="catalog-price"><small>R$</small>{item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          {item.soldOut && <span className="catalog-sold-out-banner">Esgotado</span>}
        </article>)}</div>
      </section>)}
      {loading && <p role="status">Carregando cardápio...</p>}
      {loadError && <div className="catalog-empty" role="alert"><p>Não foi possível carregar o cardápio.</p><button onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></div>}
      {!loading && !loadError && !visible.length && <div className="catalog-empty"><Search size={30} /><h2>Nenhum item encontrado</h2><p>Tente outro nome ou veja o cardápio completo.</p><button onClick={() => { setQuery(''); setCategory('todos') }}>Ver todo o cardápio</button></div>}
    </div>
  </div>
}
