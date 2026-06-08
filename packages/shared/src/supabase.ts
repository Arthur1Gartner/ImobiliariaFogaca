import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leads, properties } from "./mockData";
import type { ContactPayload, Lead, Property } from "./types";

type RuntimeEnv = Record<string, string | undefined>;

interface DbPropertyRow {
  id: string;
  external_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  type: Property["type"];
  contract: Property["contract"];
  status: Property["status"];
  review_status: Property["reviewStatus"];
  price: string | number | null;
  condominium_fee: string | number | null;
  iptu: string | number | null;
  neighborhood: string;
  city: string;
  state: string;
  area_private: string | number | null;
  area_total: string | number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  features: string[] | null;
  tags: string[] | null;
  cover_image_url: string;
  is_featured: boolean;
  assigned_broker_name: string | null;
  updated_at: string;
  source_url: string | null;
}

function getEnv(): RuntimeEnv {
  const meta = import.meta as unknown as { env?: RuntimeEnv };
  return meta.env ?? {};
}

export function getSupabaseClient(): SupabaseClient | null {
  const env = getEnv();
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export async function fetchPublishedProperties(): Promise<Property[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return properties.filter((property) => property.status === "published");

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "published")
    .eq("review_status", "approved")
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) return properties.filter((property) => property.status === "published");
  return data.map(mapPropertyFromDb);
}

export async function fetchAllProperties(): Promise<Property[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return properties;
  const { data, error } = await supabase.from("properties").select("*").order("updated_at", { ascending: false });
  if (error || !data) return properties;
  return data.map(mapPropertyFromDb);
}

export async function saveProperty(property: Property): Promise<Property> {
  const supabase = getSupabaseClient();
  if (!supabase) return property;

  const { data, error } = await supabase
    .from("properties")
    .upsert(mapPropertyToDb(property))
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Nao foi possivel salvar o imovel.");
  return mapPropertyFromDb(data);
}

export async function archiveProperty(propertyId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("properties")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", propertyId);
  if (error) throw new Error(error.message);
}

export async function submitLead(payload: ContactPayload): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("leads").insert({
    name: payload.name,
    email: payload.email || null,
    phone: payload.phone,
    interest: payload.interest || null,
    message: payload.message || null,
    property_id: payload.propertyId || null,
    lgpd_accepted: payload.lgpdAccepted,
    source: "site"
  });
  if (error) throw new Error(error.message);
}

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return leads;
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error || !data) return leads;
  return data.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email ?? undefined,
    phone: lead.phone,
    stage: lead.stage,
    interest: lead.interest ?? undefined,
    message: lead.message ?? undefined,
    propertyId: lead.property_id ?? undefined,
    propertyTitle: lead.property_title ?? undefined,
    budgetMin: lead.budget_min ?? undefined,
    budgetMax: lead.budget_max ?? undefined,
    assignedBrokerName: lead.assigned_broker_name ?? undefined,
    source: lead.source,
    createdAt: lead.created_at,
    lastActivityAt: lead.last_activity_at ?? lead.created_at
  }));
}

function mapPropertyFromDb(row: DbPropertyRow): Property {
  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    type: row.type,
    contract: row.contract,
    status: row.status,
    reviewStatus: row.review_status,
    price: Number(row.price ?? 0),
    condominiumFee: row.condominium_fee ? Number(row.condominium_fee) : undefined,
    iptu: row.iptu ? Number(row.iptu) : undefined,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    areaPrivate: row.area_private ? Number(row.area_private) : undefined,
    areaTotal: row.area_total ? Number(row.area_total) : undefined,
    bedrooms: row.bedrooms ?? undefined,
    suites: row.suites ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    parkingSpaces: row.parking_spaces ?? undefined,
    features: row.features ?? [],
    tags: row.tags ?? [],
    coverImageUrl: row.cover_image_url,
    isFeatured: row.is_featured,
    assignedBrokerName: row.assigned_broker_name ?? undefined,
    updatedAt: row.updated_at,
    sourceUrl: row.source_url ?? undefined
  };
}

function mapPropertyToDb(property: Property) {
  return {
    id: property.id,
    external_id: property.externalId ?? null,
    slug: property.slug,
    title: property.title,
    description: property.description,
    type: property.type,
    contract: property.contract,
    status: property.status,
    review_status: property.reviewStatus,
    price: property.price,
    condominium_fee: property.condominiumFee ?? null,
    iptu: property.iptu ?? null,
    neighborhood: property.neighborhood,
    city: property.city,
    state: property.state,
    area_private: property.areaPrivate ?? null,
    area_total: property.areaTotal ?? null,
    bedrooms: property.bedrooms ?? null,
    suites: property.suites ?? null,
    bathrooms: property.bathrooms ?? null,
    parking_spaces: property.parkingSpaces ?? null,
    features: property.features,
    tags: property.tags,
    cover_image_url: property.coverImageUrl,
    is_featured: property.isFeatured,
    source_url: property.sourceUrl ?? null,
    updated_at: new Date().toISOString()
  };
}
