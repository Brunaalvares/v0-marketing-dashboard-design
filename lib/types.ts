// Types for the Avalyst Marketing Dashboard

export interface MarketingMetric {
  id: string
  user_id: string
  reference_date: string
  source: string
  investimento: number
  mqls: number
  mqls_percent: number
  demo_agendadas: number
  demo_agendadas_percent: number
  demo_realizadas: number
  demo_realizadas_percent: number
  onboarding: number
  cpl: number
  cpo: number
  cpa: number
  ciclo_venda: number
  created_at: string
  updated_at: string
}

export interface ContentMetric {
  id: string
  user_id: string
  reference_date: string
  channel: 'email_marketing' | 'seo' | 'instagram' | 'linkedin'
  // Email Marketing
  taxa_entrega: number
  taxa_hard_bounce: number
  taxa_abertura: number
  taxa_clique: number
  taxa_conversao: number
  // SEO
  trafego_organico: number
  sessoes: number
  usuarios: number
  palavras_indexadas: number
  tempo_pagina: number
  desempenho_site: number
  // Social
  conversao_lead: number
  created_at: string
  updated_at: string
}

export interface CRMMetric {
  id: string
  user_id: string
  reference_date: string
  novos_leads: number
  status_won: number
  status_lost: number
  fase_novos_leads: number
  fase_discovery: number
  fase_qualificacao: number
  fase_cadencia: number
  fase_conexao: number
  fase_reuniao_agendada: number
  created_at: string
  updated_at: string
}

export interface ADSMetric {
  id: string
  user_id: string
  reference_date: string
  platform: string
  taxa_conversao: number
  taxa_clique: number
  impressoes: number
  cliques: number
  custo_clique: number
  custo_aquisicao: number
  investimento: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectMetric {
  id: string
  project_id: string
  user_id: string
  reference_date: string
  metric_name: string
  metric_value: number
  created_at: string
  updated_at: string
}

export type DashboardMetricTab = 'overview' | 'content' | 'crm' | 'ads'

export interface DashboardCustomMetric {
  id: string
  user_id: string
  tab_key: DashboardMetricTab
  section_key: string | null
  reference_date: string
  metric_name: string
  metric_value: number
  created_at: string
  updated_at: string
}

export type DateFilter = {
  month: number
  year: number
}

export const MARKETING_SOURCES = [
  'Inbound',
  'Busca Paga',
  'Busca Organica',
  'Email Marketing',
  'Redes Sociais',
  'Trafego Direto',
] as const

export const CONTENT_CHANNELS = [
  { value: 'email_marketing', label: 'E-mail Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const

export const ADS_PLATFORMS = [
  { value: 'google', label: 'Google Ads' },
  { value: 'meta', label: 'Meta Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
] as const
