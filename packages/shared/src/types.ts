export type PropertyContract = "sale" | "rent";
export type PropertyType = "house" | "apartment" | "penthouse" | "land" | "commercial";
export type PropertyStatus = "draft" | "pending_review" | "published" | "archived";
export type LeadStage = "new" | "contacted" | "visit" | "proposal" | "closed" | "lost";
export type UserRole = "admin" | "broker" | "assistant";

export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Property {
  id: string;
  externalId?: string;
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  contract: PropertyContract;
  status: PropertyStatus;
  reviewStatus: "pending_review" | "approved" | "rejected";
  price: number;
  condominiumFee?: number;
  iptu?: number;
  neighborhood: string;
  city: string;
  state: string;
  areaPrivate?: number;
  areaTotal?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  features: string[];
  tags: string[];
  coverImageUrl: string;
  isFeatured: boolean;
  assignedBrokerName?: string;
  updatedAt: string;
  sourceUrl?: string;
}

export interface Broker {
  id: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  creci?: string;
  active: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  stage: LeadStage;
  interest?: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  budgetMin?: number;
  budgetMax?: number;
  assignedBrokerName?: string;
  source: "site" | "whatsapp" | "manual" | "import";
  createdAt: string;
  lastActivityAt: string;
}

export interface ContactPayload {
  name: string;
  email?: string;
  phone: string;
  interest?: string;
  message?: string;
  propertyId?: string;
  lgpdAccepted: boolean;
}
