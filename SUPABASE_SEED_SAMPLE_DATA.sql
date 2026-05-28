-- Avalyst Dashboard - Seed de dados de exemplo
-- Execute este script no Supabase SQL Editor APOS rodar:
-- - SUPABASE_NEXT_STEP.sql
--
-- Importante:
-- 1) Troque o email abaixo para um usuario existente no auth.users
-- 2) O script limpa e reinsere dados de exemplo para esse usuario
--    (somente nos periodos usados no seed)

do $$
declare
  v_target_email text := 'b.alvares@avalyst.com.br';
  v_user_id uuid;
  v_current_month date := date_trunc('month', now())::date;
  v_previous_month date := (date_trunc('month', now()) - interval '1 month')::date;
  v_previous_year_same_month date := (date_trunc('month', now()) - interval '1 year')::date;
  v_lp_project_id uuid;
  v_webinar_project_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = v_target_email
  limit 1;

  if v_user_id is null then
    raise exception 'Usuario com email % nao encontrado em auth.users.', v_target_email;
  end if;

  -- ==========================================================================
  -- MARKETING METRICS (visao geral)
  -- ==========================================================================
  if to_regclass('public.marketing_metrics') is not null then
    delete from public.marketing_metrics
    where user_id = v_user_id
      and reference_date in (v_current_month, v_previous_month, v_previous_year_same_month);

    insert into public.marketing_metrics (
      user_id,
      reference_date,
      source,
      investimento,
      mqls,
      mqls_percent,
      demo_agendadas,
      demo_agendadas_percent,
      demo_realizadas,
      demo_realizadas_percent,
      onboarding,
      cpl,
      cpo,
      cpa,
      ciclo_venda
    )
    values
      -- Mes atual
      (v_user_id, v_current_month, 'Inbound', 70000, 403, 13.90, 56, 32.14, 18, 400.00, 72, 173.70, 3888.89, 972.22, 12),
      (v_user_id, v_current_month, 'Busca Paga', 12000, 85, 17.65, 15, 33.33, 5, 300.00, 15, 141.18, 2400.00, 800.00, 10),
      (v_user_id, v_current_month, 'Busca Organica', 0, 42, 11.90, 5, 20.00, 1, 200.00, 2, 0, 0, 0, 16),
      (v_user_id, v_current_month, 'Email Marketing', 3000, 55, 14.55, 8, 37.50, 3, 200.00, 6, 54.55, 1000.00, 500.00, 9),
      (v_user_id, v_current_month, 'Redes Sociais', 9000, 120, 16.67, 20, 30.00, 6, 250.00, 15, 75.00, 1500.00, 600.00, 11),
      (v_user_id, v_current_month, 'Trafego Direto', 0, 35, 8.57, 3, 33.33, 1, 100.00, 1, 0, 0, 0, 14),

      -- Mes anterior
      (v_user_id, v_previous_month, 'Inbound', 65000, 370, 13.51, 50, 30.00, 15, 366.67, 55, 175.68, 4333.33, 1181.82, 13),
      (v_user_id, v_previous_month, 'Busca Paga', 10000, 74, 16.22, 12, 33.33, 4, 250.00, 10, 135.14, 2500.00, 1000.00, 11),
      (v_user_id, v_previous_month, 'Busca Organica', 0, 36, 11.11, 4, 25.00, 1, 200.00, 2, 0, 0, 0, 16),
      (v_user_id, v_previous_month, 'Email Marketing', 2500, 48, 14.58, 7, 28.57, 2, 250.00, 5, 52.08, 1250.00, 500.00, 10),
      (v_user_id, v_previous_month, 'Redes Sociais', 7800, 102, 15.69, 16, 31.25, 5, 220.00, 12, 76.47, 1560.00, 650.00, 12),
      (v_user_id, v_previous_month, 'Trafego Direto', 0, 28, 10.71, 3, 33.33, 1, 100.00, 1, 0, 0, 0, 15),

      -- Mesmo mes do ano anterior
      (v_user_id, v_previous_year_same_month, 'Inbound', 52000, 290, 12.41, 36, 27.78, 10, 320.00, 32, 179.31, 5200.00, 1625.00, 15),
      (v_user_id, v_previous_year_same_month, 'Busca Paga', 7600, 48, 14.58, 7, 28.57, 2, 250.00, 5, 158.33, 3800.00, 1520.00, 13),
      (v_user_id, v_previous_year_same_month, 'Busca Organica', 0, 25, 8.00, 2, 50.00, 1, 100.00, 1, 0, 0, 0, 19),
      (v_user_id, v_previous_year_same_month, 'Email Marketing', 1700, 31, 12.90, 4, 25.00, 1, 200.00, 2, 54.84, 1700.00, 850.00, 12),
      (v_user_id, v_previous_year_same_month, 'Redes Sociais', 5200, 70, 14.29, 10, 30.00, 3, 233.33, 7, 74.29, 1733.33, 742.86, 14),
      (v_user_id, v_previous_year_same_month, 'Trafego Direto', 0, 18, 5.56, 1, 100.00, 1, 100.00, 1, 0, 0, 0, 18);
  else
    raise notice 'Tabela public.marketing_metrics nao encontrada. Seed de visao geral ignorado.';
  end if;

  -- ==========================================================================
  -- CONTENT METRICS
  -- ==========================================================================
  if to_regclass('public.content_metrics') is not null then
    delete from public.content_metrics
    where user_id = v_user_id
      and reference_date in (v_current_month, v_previous_month, v_previous_year_same_month);

    insert into public.content_metrics (
      user_id,
      reference_date,
      channel,
      taxa_entrega,
      taxa_hard_bounce,
      taxa_abertura,
      taxa_clique,
      taxa_conversao,
      trafego_organico,
      sessoes,
      usuarios,
      palavras_indexadas,
      tempo_pagina,
      desempenho_site,
      conversao_lead
    )
    values
      -- Email
      (v_user_id, v_current_month, 'email_marketing', 97.00, 0.50, 25.00, 4.20, 3.10, 0, 0, 0, 0, 0, 0, 0),
      (v_user_id, v_previous_month, 'email_marketing', 96.00, 0.70, 23.50, 3.90, 2.80, 0, 0, 0, 0, 0, 0, 0),
      (v_user_id, v_previous_year_same_month, 'email_marketing', 94.00, 0.90, 21.00, 3.20, 2.10, 0, 0, 0, 0, 0, 0, 0),

      -- SEO
      (v_user_id, v_current_month, 'seo', 0, 0, 0, 0, 0, 15000, 18000, 10000, 1250, 146.00, 92.00, 0),
      (v_user_id, v_previous_month, 'seo', 0, 0, 0, 0, 0, 13800, 16800, 9200, 1140, 139.00, 88.00, 0),
      (v_user_id, v_previous_year_same_month, 'seo', 0, 0, 0, 0, 0, 9800, 12000, 6900, 860, 128.00, 81.00, 0),

      -- Instagram
      (v_user_id, v_current_month, 'instagram', 0, 0, 0, 0, 2.40, 5200, 0, 0, 0, 0, 0, 58),
      (v_user_id, v_previous_month, 'instagram', 0, 0, 0, 0, 2.10, 4700, 0, 0, 0, 0, 0, 49),
      (v_user_id, v_previous_year_same_month, 'instagram', 0, 0, 0, 0, 1.60, 3200, 0, 0, 0, 0, 0, 33),

      -- LinkedIn
      (v_user_id, v_current_month, 'linkedin', 0, 0, 0, 0, 2.90, 4100, 0, 0, 0, 0, 0, 42),
      (v_user_id, v_previous_month, 'linkedin', 0, 0, 0, 0, 2.20, 3600, 0, 0, 0, 0, 0, 35),
      (v_user_id, v_previous_year_same_month, 'linkedin', 0, 0, 0, 0, 1.80, 2600, 0, 0, 0, 0, 0, 25);
  else
    raise notice 'Tabela public.content_metrics nao encontrada. Seed de conteudo ignorado.';
  end if;

  -- ==========================================================================
  -- CRM METRICS
  -- ==========================================================================
  if to_regclass('public.crm_metrics') is not null then
    delete from public.crm_metrics
    where user_id = v_user_id
      and reference_date in (v_current_month, v_previous_month, v_previous_year_same_month);

    insert into public.crm_metrics (
      user_id,
      reference_date,
      novos_leads,
      status_won,
      status_lost,
      fase_novos_leads,
      fase_discovery,
      fase_qualificacao,
      fase_cadencia,
      fase_conexao,
      fase_reuniao_agendada
    )
    values
      (v_user_id, v_current_month, 520, 46, 61, 520, 290, 210, 155, 86, 56),
      (v_user_id, v_previous_month, 470, 39, 67, 470, 250, 180, 140, 77, 49),
      (v_user_id, v_previous_year_same_month, 360, 28, 72, 360, 180, 130, 92, 55, 33);
  else
    raise notice 'Tabela public.crm_metrics nao encontrada. Seed de CRM ignorado.';
  end if;

  -- ==========================================================================
  -- ADS METRICS
  -- ==========================================================================
  if to_regclass('public.ads_metrics') is not null then
    delete from public.ads_metrics
    where user_id = v_user_id
      and reference_date in (v_current_month, v_previous_month, v_previous_year_same_month);

    insert into public.ads_metrics (
      user_id,
      reference_date,
      platform,
      taxa_conversao,
      taxa_clique,
      impressoes,
      cliques,
      custo_clique,
      custo_aquisicao,
      investimento
    )
    values
      (v_user_id, v_current_month, 'google', 4.20, 2.80, 120000, 3360, 3.40, 62.00, 11424.00),
      (v_user_id, v_current_month, 'meta', 3.80, 2.30, 96000, 2208, 2.90, 58.00, 6403.20),
      (v_user_id, v_current_month, 'linkedin', 2.90, 1.60, 43000, 688, 6.20, 95.00, 4265.60),
      (v_user_id, v_current_month, 'tiktok', 2.40, 1.90, 71000, 1349, 2.20, 54.00, 2967.80),

      (v_user_id, v_previous_month, 'google', 3.90, 2.50, 108000, 2700, 3.60, 66.00, 9720.00),
      (v_user_id, v_previous_month, 'meta', 3.40, 2.00, 90000, 1800, 3.10, 61.00, 5580.00),
      (v_user_id, v_previous_month, 'linkedin', 2.50, 1.40, 38000, 532, 6.50, 104.00, 3458.00),
      (v_user_id, v_previous_month, 'tiktok', 2.00, 1.60, 65000, 1040, 2.40, 58.00, 2496.00),

      (v_user_id, v_previous_year_same_month, 'google', 3.10, 2.00, 82000, 1640, 4.00, 72.00, 6560.00),
      (v_user_id, v_previous_year_same_month, 'meta', 2.70, 1.70, 72000, 1224, 3.30, 67.00, 4039.20),
      (v_user_id, v_previous_year_same_month, 'linkedin', 2.10, 1.20, 29000, 348, 6.90, 116.00, 2401.20),
      (v_user_id, v_previous_year_same_month, 'tiktok', 1.70, 1.30, 54000, 702, 2.70, 65.00, 1895.40);
  else
    raise notice 'Tabela public.ads_metrics nao encontrada. Seed de ADS ignorado.';
  end if;

  -- ==========================================================================
  -- PROJECTS + PROJECT METRICS
  -- ==========================================================================
  if to_regclass('public.projects') is not null and to_regclass('public.project_metrics') is not null then
    -- Remove projetos de exemplo antigos
    delete from public.projects
    where user_id = v_user_id
      and name in ('LP Campanha Inverno', 'Webinar Produto B2B');

    insert into public.projects (user_id, name, description)
    values
      (v_user_id, 'LP Campanha Inverno', 'Acompanhamento da landing page da campanha de inverno'),
      (v_user_id, 'Webinar Produto B2B', 'Performance de captacao e conversao do webinar mensal');

    -- Busca IDs dos projetos criados
    select id into v_lp_project_id
    from public.projects
    where user_id = v_user_id and name = 'LP Campanha Inverno'
    order by created_at desc
    limit 1;

    select id into v_webinar_project_id
    from public.projects
    where user_id = v_user_id and name = 'Webinar Produto B2B'
    order by created_at desc
    limit 1;

    delete from public.project_metrics
    where user_id = v_user_id
      and project_id in (v_lp_project_id, v_webinar_project_id);

    insert into public.project_metrics (
      project_id,
      user_id,
      reference_date,
      metric_name,
      metric_value
    )
    values
      -- LP Campanha Inverno
      (v_lp_project_id, v_user_id, v_current_month, 'Visitantes LP', 18200),
      (v_lp_project_id, v_user_id, v_current_month, 'Leads LP', 764),
      (v_lp_project_id, v_user_id, v_current_month, 'Taxa Conversao LP (%)', 4.20),
      (v_lp_project_id, v_user_id, v_previous_month, 'Visitantes LP', 16000),
      (v_lp_project_id, v_user_id, v_previous_month, 'Leads LP', 608),
      (v_lp_project_id, v_user_id, v_previous_month, 'Taxa Conversao LP (%)', 3.80),
      (v_lp_project_id, v_user_id, v_previous_year_same_month, 'Visitantes LP', 12300),
      (v_lp_project_id, v_user_id, v_previous_year_same_month, 'Leads LP', 443),
      (v_lp_project_id, v_user_id, v_previous_year_same_month, 'Taxa Conversao LP (%)', 3.60),

      -- Webinar Produto B2B
      (v_webinar_project_id, v_user_id, v_current_month, 'Inscricoes Webinar', 410),
      (v_webinar_project_id, v_user_id, v_current_month, 'Participantes ao vivo', 273),
      (v_webinar_project_id, v_user_id, v_current_month, 'SQLs gerados', 38),
      (v_webinar_project_id, v_user_id, v_previous_month, 'Inscricoes Webinar', 360),
      (v_webinar_project_id, v_user_id, v_previous_month, 'Participantes ao vivo', 228),
      (v_webinar_project_id, v_user_id, v_previous_month, 'SQLs gerados', 29),
      (v_webinar_project_id, v_user_id, v_previous_year_same_month, 'Inscricoes Webinar', 280),
      (v_webinar_project_id, v_user_id, v_previous_year_same_month, 'Participantes ao vivo', 160),
      (v_webinar_project_id, v_user_id, v_previous_year_same_month, 'SQLs gerados', 18);
  else
    raise notice 'Tabelas public.projects/public.project_metrics nao encontradas. Seed de projetos ignorado.';
  end if;

  raise notice 'Seed concluido para usuario: % (%).', v_target_email, v_user_id;
end $$;
