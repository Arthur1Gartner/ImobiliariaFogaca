import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  Facebook,
  Home,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Ruler,
  Search,
  ShieldCheck,
  Star,
  X
} from "lucide-react";
import {
  brand,
  fetchPublishedProperties,
  formatArea,
  formatCurrency,
  isValidBrazilPhone,
  isValidEmail,
  maskPhone,
  sanitizeText,
  submitLead,
  type ContactPayload,
  type Property,
  type PropertyContract,
  type PropertyType
} from "@alceu/shared";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

const typeLabels: Record<PropertyType | "all", string> = {
  all: "Todos",
  house: "Casas",
  apartment: "Apartamentos",
  penthouse: "Coberturas",
  land: "Terrenos",
  commercial: "Comerciais"
};

const contractLabels: Record<PropertyContract | "all", string> = {
  all: "Todos",
  sale: "Comprar",
  rent: "Alugar"
};

type AlertState = { tone: "success" | "error"; message: string } | null;

export function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [contractFilter, setContractFilter] = useState<PropertyContract | "all">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [cookieChoice, setCookieChoice] = useState<string | null>(() => localStorage.getItem("cookie-consent"));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchPublishedProperties().then(setProperties);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [properties.length]);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesType = typeFilter === "all" || property.type === typeFilter;
        const matchesContract = contractFilter === "all" || property.contract === contractFilter;
        return matchesType && matchesContract;
      }),
    [contractFilter, properties, typeFilter]
  );

  const featuredProperty = properties.find((property) => property.isFeatured) ?? properties[0];

  const setCookies = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookie-consent", choice);
    setCookieChoice(choice);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand-mark" href="#inicio" aria-label="Voltar ao inicio">
          <span>Alceu Fogaca</span>
          <small>Imoveis</small>
        </a>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Navegacao principal">
          <a href="#imoveis" onClick={() => setMenuOpen(false)}>
            Comprar
          </a>
          <a href="#imoveis" onClick={() => setMenuOpen(false)}>
            Alugar
          </a>
          <a href="#sobre" onClick={() => setMenuOpen(false)}>
            Institucional
          </a>
          <a href="#contato" onClick={() => setMenuOpen(false)}>
            Contato
          </a>
        </nav>
        <a className="header-cta" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        <button
          className="icon-button mobile-menu"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section className="hero" id="inicio" aria-label="Apresentacao">
          <div className="hero-bg" />
          <div className="hero-content">
            <p className="hero-location">
              <MapPin size={16} /> Ilha Comprida, Litoral Sul de Sao Paulo
            </p>
            <h1>
              Invista no <em>imovel dos seus sonhos</em>
            </h1>
            <p>{brand.heroSubtitle}</p>
            <div className="hero-actions">
              <a className="button primary" href="#imoveis">
                Ver imoveis
              </a>
              <a className="button ghost" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="scroll-line" aria-hidden="true" />
        </section>

        <section className="stats-band" aria-label="Diferenciais">
          <Stat value="+20" label="anos no litoral sul" />
          <Stat value="CRECI" label={brand.creci} />
          <Stat value="Venda" label="compra e locacao" />
          <Stat value="Local" label="atendimento em Ilha Comprida" />
        </section>

        <section className="section portfolio" id="imoveis" data-reveal>
          <SectionTitle
            kicker="Portfolio"
            title="Imoveis selecionados"
            text="Uma curadoria inicial para demonstrar a experiencia. Os imoveis reais serao cadastrados e publicados pelo dashboard."
          />
          <div className="filters" aria-label="Filtros de imoveis">
            <div className="segmented-control">
              {(["all", "sale", "rent"] as const).map((contract) => (
                <button
                  key={contract}
                  type="button"
                  className={contractFilter === contract ? "is-active" : ""}
                  onClick={() => setContractFilter(contract)}
                >
                  {contractLabels[contract]}
                </button>
              ))}
            </div>
            <div className="segmented-control type-control">
              {(["all", "house", "apartment", "land", "commercial"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={typeFilter === type ? "is-active" : ""}
                  onClick={() => setTypeFilter(type)}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <div className="property-grid">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />
            ))}
          </div>
          {filteredProperties.length === 0 ? (
            <div className="empty-state">
              <Search size={24} />
              <p>Nenhum imovel publicado nesse filtro.</p>
            </div>
          ) : null}
        </section>

        {featuredProperty ? (
          <section className="featured section" data-reveal>
            <div className="featured-media">
              <img src={featuredProperty.coverImageUrl} alt={featuredProperty.title} loading="lazy" />
            </div>
            <div className="featured-copy">
              <span className="section-kicker">Destaque</span>
              <h2>{featuredProperty.title}</h2>
              <p>{featuredProperty.description}</p>
              <div className="spec-grid">
                <Spec icon={<Ruler size={18} />} label="Area" value={formatArea(featuredProperty.areaPrivate ?? featuredProperty.areaTotal)} />
                <Spec icon={<BedDouble size={18} />} label="Quartos" value={String(featuredProperty.bedrooms ?? "-")} />
                <Spec icon={<Bath size={18} />} label="Banheiros" value={String(featuredProperty.bathrooms ?? "-")} />
                <Spec icon={<Car size={18} />} label="Vagas" value={String(featuredProperty.parkingSpaces ?? "-")} />
              </div>
              <button className="button primary" type="button" onClick={() => setSelectedProperty(featuredProperty)}>
                Tenho interesse
              </button>
            </div>
          </section>
        ) : null}

        <section className="section about" id="sobre" data-reveal>
          <div className="about-copy">
            <SectionTitle
              kicker="Institucional"
              title="Tradicao local com atendimento proximo"
              text="Ha mais de duas decadas, a Imobiliaria Alceu Fogaca ajuda familias e investidores a comprarem, venderem e locarem com clareza em Ilha Comprida."
            />
            <div className="values-grid">
              <Value icon={<ShieldCheck />} title="Seguranca" text="Processo organizado, documentacao cuidada e orientacao clara." />
              <Value icon={<MapPin />} title="Conhecimento local" text="Equipe com leitura pratica dos bairros e da rotina da ilha." />
              <Value icon={<Check />} title="Transparencia" text="Informacoes objetivas para decisoes sem pressa e sem ruído." />
              <Value icon={<Home />} title="Curadoria" text="Imoveis publicados com revisao antes de aparecer no site." />
            </div>
          </div>
          <img
            className="about-image"
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85"
            alt="Sala sofisticada de imovel costeiro"
            loading="lazy"
          />
        </section>

        <section className="section testimonials" data-reveal>
          <SectionTitle kicker="Clientes" title="Relacoes construidas com cuidado" text="Depoimentos de demonstracao para validar a experiencia visual antes de cadastrar avaliações reais." />
          <div className="testimonial-grid">
            {["Atendimento direto e seguro do primeiro contato ate a visita.", "A equipe explicou cada etapa e trouxe opcoes dentro do nosso perfil.", "Conseguimos organizar venda e compra com muita clareza."].map(
              (text, index) => (
                <article className="testimonial" key={text}>
                  <div className="stars" aria-label="5 estrelas">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p>{text}</p>
                  <div className="avatar" aria-hidden="true">
                    {["M", "R", "C"][index]}
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section className="section contact" id="contato" data-reveal>
          <div className="contact-info">
            <SectionTitle kicker="Contato" title="Fale com a imobiliaria" text="Envie seu interesse ou chame diretamente no WhatsApp para atendimento." />
            <ContactLine icon={<Phone />} label="WhatsApp" value={brand.phone.whatsappDisplay} />
            <ContactLine icon={<Building2 />} label="Telefone" value={brand.phone.landlineDisplay} />
            <ContactLine icon={<MapPin />} label="Endereco" value={`${brand.address.street}, ${brand.address.number} - ${brand.address.city}`} />
            <div className="social-row">
              <a href={brand.social.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </a>
              <a href={brand.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </a>
              <a href={whatsappUrl()} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          <LeadForm />
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Alceu Fogaca Imoveis</strong>
          <p>{brand.description}</p>
        </div>
        <div>
          <h3>Imoveis</h3>
          <a href="#imoveis">Comprar</a>
          <a href="#imoveis">Alugar</a>
        </div>
        <div>
          <h3>Empresa</h3>
          <a href="#sobre">Institucional</a>
          <a href="#contato">Contato</a>
        </div>
        <div>
          <h3>Legal</h3>
          <a href="#cookies">Politica de privacidade</a>
          <a href="#cookies">Termos de uso</a>
        </div>
        <small>CRECI {brand.creci}. CNPJ a confirmar no cadastro final.</small>
      </footer>

      <a className="floating-whatsapp" href={whatsappUrl()} aria-label="Conversar pelo WhatsApp" target="_blank" rel="noopener noreferrer">
        <MessageCircle size={26} />
      </a>

      {selectedProperty ? <PropertyInterestModal property={selectedProperty} onClose={() => setSelectedProperty(null)} /> : null}

      {!cookieChoice ? (
        <div className="cookie-banner" id="cookies" role="dialog" aria-label="Preferencias de cookies">
          <p>Usamos cookies essenciais para melhorar a navegacao e medir interesse nos imoveis.</p>
          <div>
            <button className="button small ghost" type="button" onClick={() => setCookies("rejected")}>
              Rejeitar
            </button>
            <button className="button small primary" type="button" onClick={() => setCookies("accepted")}>
              Aceitar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PropertyCard({ property, onSelect }: { property: Property; onSelect: (property: Property) => void }) {
  return (
    <article className="property-card">
      <button type="button" className="card-image" onClick={() => onSelect(property)}>
        <img src={property.coverImageUrl} alt={property.title} loading="lazy" />
        <span>{typeLabels[property.type]}</span>
      </button>
      <div className="card-body">
        <p className="location">
          <MapPin size={15} /> {property.neighborhood}, {property.city}
        </p>
        <h3>{property.title}</h3>
        <strong>{formatCurrency(property.price)}</strong>
        <div className="card-specs" aria-label="Caracteristicas">
          <span>
            <Ruler size={15} /> {formatArea(property.areaPrivate ?? property.areaTotal)}
          </span>
          <span>
            <BedDouble size={15} /> {property.bedrooms ?? "-"}
          </span>
          <span>
            <Car size={15} /> {property.parkingSpaces ?? "-"}
          </span>
        </div>
      </div>
    </article>
  );
}

function LeadForm({ propertyId }: { propertyId?: string }) {
  const [phone, setPhone] = useState("");
  const [alert, setAlert] = useState<AlertState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: ContactPayload = {
      name: sanitizeText(String(form.get("name") ?? "")),
      email: sanitizeText(String(form.get("email") ?? "")),
      phone: sanitizeText(String(form.get("phone") ?? "")),
      interest: sanitizeText(String(form.get("interest") ?? "")),
      message: sanitizeText(String(form.get("message") ?? "")),
      propertyId,
      lgpdAccepted: form.get("lgpd") === "on"
    };
    const honeypot = String(form.get("company") ?? "");

    if (honeypot) return;
    if (!payload.name || !payload.phone || !payload.lgpdAccepted) {
      setAlert({ tone: "error", message: "Preencha nome, telefone e aceite LGPD." });
      return;
    }
    if (!isValidEmail(payload.email) || !isValidBrazilPhone(payload.phone)) {
      setAlert({ tone: "error", message: "Revise e-mail e telefone antes de enviar." });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitLead(payload);
      setAlert({ tone: "success", message: "Interesse enviado. A equipe entrara em contato." });
      event.currentTarget.reset();
      setPhone("");
    } catch {
      setAlert({ tone: "error", message: "Nao foi possivel enviar agora. Tente pelo WhatsApp." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
      <input name="company" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      <label>
        Nome
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" />
      </label>
      <label>
        Telefone
        <input name="phone" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} autoComplete="tel" required />
      </label>
      <label>
        Interesse
        <select name="interest" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          <option value="Comprar">Comprar</option>
          <option value="Alugar">Alugar</option>
          <option value="Vender">Vender meu imovel</option>
          <option value="Avaliar">Avaliar oportunidade</option>
        </select>
      </label>
      <label className="full">
        Mensagem
        <textarea name="message" rows={4} placeholder="Conte o que voce procura" />
      </label>
      <label className="checkbox full">
        <input name="lgpd" type="checkbox" required /> Aceito ser contatado conforme a LGPD.
      </label>
      {alert ? <p className={`form-alert ${alert.tone}`}>{alert.message}</p> : null}
      <button className="button primary full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar interesse"}
      </button>
    </form>
  );
}

function PropertyInterestModal({ property, onClose }: { property: Property; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Interesse em ${property.title}`}>
      <div className="modal">
        <button className="icon-button close" type="button" aria-label="Fechar modal" onClick={onClose}>
          <X size={20} />
        </button>
        <img src={property.coverImageUrl} alt={property.title} />
        <div className="modal-copy">
          <span>{formatCurrency(property.price)}</span>
          <h2>{property.title}</h2>
          <p>{property.neighborhood}, {property.city}</p>
          <LeadForm propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="section-title">
      <span className="section-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Value({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article>
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function ContactLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <p className="contact-line">
      {icon}
      <span>
        <small>{label}</small>
        {value}
      </span>
    </p>
  );
}

function whatsappUrl(message = "Ola, gostaria de falar sobre imoveis em Ilha Comprida.") {
  return `https://api.whatsapp.com/send?phone=${brand.phone.whatsappRaw}&text=${encodeURIComponent(message)}`;
}
