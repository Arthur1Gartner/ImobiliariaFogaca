import type { Broker, Lead, Property } from "./types";

export const brokers: Broker[] = [
  {
    id: "broker-matheus",
    fullName: "Matheus A. Souza",
    role: "broker",
    phone: "(13) 99760-4508",
    creci: "71432-F",
    active: true
  },
  {
    id: "broker-juliana",
    fullName: "Juliana P. Lima",
    role: "broker",
    phone: "(13) 99760-4508",
    active: true
  }
];

export const properties: Property[] = [
  {
    id: "prop-001",
    slug: "casa-pe-na-areia-balneario-meu-recanto",
    title: "Casa pe na areia com vista permanente para o mar",
    description:
      "Residencia costeira com ambientes integrados, ampla area externa e acesso privilegiado a praia.",
    type: "house",
    contract: "sale",
    status: "published",
    reviewStatus: "approved",
    price: 3250000,
    neighborhood: "Balneario Meu Recanto",
    city: "Ilha Comprida",
    state: "SP",
    areaPrivate: 280,
    areaTotal: 620,
    bedrooms: 4,
    suites: 2,
    bathrooms: 5,
    parkingSpaces: 4,
    features: ["Frente para o mar", "Piscina", "Espaco gourmet", "Suite master"],
    tags: ["alto-padrao", "destaque"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    isFeatured: true,
    assignedBrokerName: "Matheus A. Souza",
    updatedAt: "2026-06-01T10:15:00.000Z"
  },
  {
    id: "prop-002",
    slug: "apartamento-vista-mar-centro",
    title: "Apartamento vista mar no Centro",
    description:
      "Apartamento mobiliado com varanda, planta eficiente e localizacao proxima aos servicos essenciais.",
    type: "apartment",
    contract: "sale",
    status: "published",
    reviewStatus: "approved",
    price: 1650000,
    neighborhood: "Centro",
    city: "Ilha Comprida",
    state: "SP",
    areaPrivate: 160,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parkingSpaces: 2,
    features: ["Vista mar", "Varanda", "Mobiliado"],
    tags: ["vista-mar"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
    isFeatured: false,
    assignedBrokerName: "Juliana P. Lima",
    updatedAt: "2026-05-29T15:30:00.000Z"
  },
  {
    id: "prop-003",
    slug: "casa-com-piscina-balneario-adriana",
    title: "Casa com piscina no Balneario Adriana",
    description:
      "Casa terrea pronta para receber familia, com area de lazer reservada e boa distancia da praia.",
    type: "house",
    contract: "sale",
    status: "published",
    reviewStatus: "approved",
    price: 980000,
    neighborhood: "Balneario Adriana",
    city: "Ilha Comprida",
    state: "SP",
    areaPrivate: 180,
    areaTotal: 360,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parkingSpaces: 2,
    features: ["Piscina", "Churrasqueira", "Quintal"],
    tags: ["familia"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    isFeatured: false,
    assignedBrokerName: "Matheus A. Souza",
    updatedAt: "2026-05-27T09:20:00.000Z"
  },
  {
    id: "prop-004",
    slug: "terreno-a-200m-da-praia-santa-tereza",
    title: "Terreno a 200m da praia",
    description:
      "Lote regular em bairro tranquilo, indicado para construcao residencial ou investimento patrimonial.",
    type: "land",
    contract: "sale",
    status: "published",
    reviewStatus: "approved",
    price: 420000,
    neighborhood: "Balneario Santa Tereza",
    city: "Ilha Comprida",
    state: "SP",
    areaTotal: 600,
    features: ["20m x 30m", "Rua aberta", "Proximo ao mar"],
    tags: ["investimento"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    isFeatured: false,
    assignedBrokerName: "Juliana P. Lima",
    updatedAt: "2026-05-25T11:05:00.000Z"
  },
  {
    id: "prop-005",
    slug: "sala-comercial-centro-locacao",
    title: "Sala comercial no Centro",
    description:
      "Sala com boa fachada, fluxo constante e facil acesso para atendimento presencial.",
    type: "commercial",
    contract: "rent",
    status: "published",
    reviewStatus: "approved",
    price: 1800,
    neighborhood: "Centro",
    city: "Ilha Comprida",
    state: "SP",
    areaPrivate: 45,
    bathrooms: 1,
    features: ["Fachada", "Banheiro privativo", "Ponto central"],
    tags: ["comercial", "locacao"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    isFeatured: false,
    assignedBrokerName: "Matheus A. Souza",
    updatedAt: "2026-05-23T08:15:00.000Z"
  }
];

export const leads: Lead[] = [
  {
    id: "lead-001",
    name: "Lucas Ferreira",
    email: "lucas.ferreira@email.com",
    phone: "(13) 99948-1234",
    stage: "new",
    interest: "Apartamento",
    message: "Procura imovel com elevador e uma vaga.",
    propertyId: "prop-002",
    propertyTitle: "Apartamento vista mar no Centro",
    budgetMax: 600000,
    assignedBrokerName: "Matheus A. Souza",
    source: "site",
    createdAt: "2026-05-23T10:32:00.000Z",
    lastActivityAt: "2026-05-23T13:47:00.000Z"
  },
  {
    id: "lead-002",
    name: "Camila Ribeiro",
    phone: "(13) 99713-4400",
    stage: "contacted",
    interest: "Casa",
    propertyId: "prop-003",
    propertyTitle: "Casa com piscina no Balneario Adriana",
    assignedBrokerName: "Juliana P. Lima",
    source: "whatsapp",
    createdAt: "2026-05-22T09:10:00.000Z",
    lastActivityAt: "2026-05-23T09:00:00.000Z"
  },
  {
    id: "lead-003",
    name: "Mariana Costa",
    phone: "(13) 99100-7890",
    stage: "visit",
    interest: "Casa pe na areia",
    propertyId: "prop-001",
    propertyTitle: "Casa pe na areia com vista permanente para o mar",
    assignedBrokerName: "Matheus A. Souza",
    source: "site",
    createdAt: "2026-05-21T17:44:00.000Z",
    lastActivityAt: "2026-05-24T08:20:00.000Z"
  },
  {
    id: "lead-004",
    name: "Rafael Prado",
    phone: "(13) 99650-1122",
    stage: "closed",
    interest: "Terreno",
    propertyId: "prop-004",
    propertyTitle: "Terreno a 200m da praia",
    assignedBrokerName: "Juliana P. Lima",
    source: "manual",
    createdAt: "2026-05-19T15:00:00.000Z",
    lastActivityAt: "2026-05-28T11:30:00.000Z"
  }
];
