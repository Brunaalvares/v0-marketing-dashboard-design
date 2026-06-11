import { createSign } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const GA_API_BASE_URL = 'https://analyticsdata.googleapis.com/v1beta'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const metricNames = [
  'activeUsers',
  'sessions',
  'screenPageViews',
  'eventCount',
  'userEngagementDuration',
] as const

type MetricName = (typeof metricNames)[number]

type ReportTotals = Record<MetricName, number>

interface ReportRow {
  date: string
  activeUsers: number
  sessions: number
  screenPageViews: number
  eventCount: number
  userEngagementDuration: number
}

interface GoogleAnalyticsMetricValue {
  value?: string
}

interface GoogleAnalyticsRow {
  dimensionValues?: GoogleAnalyticsMetricValue[]
  metricValues?: GoogleAnalyticsMetricValue[]
}

interface GoogleAnalyticsReportResponse {
  rows?: GoogleAnalyticsRow[]
  totals?: Array<{
    metricValues?: GoogleAnalyticsMetricValue[]
  }>
  error?: {
    message?: string
  }
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function getPrivateKey() {
  return process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

async function getGoogleAccessToken() {
  if (process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN) {
    return process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN
  }

  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL
  const privateKey = getPrivateKey()

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Configure GOOGLE_ANALYTICS_CLIENT_EMAIL e GOOGLE_ANALYTICS_PRIVATE_KEY, ou GOOGLE_ANALYTICS_ACCESS_TOKEN.'
    )
  }

  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )

  const unsignedToken = `${header}.${payload}`
  const signature = createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedToken}.${signature}`,
    }),
  })

  const tokenPayload = await tokenResponse.json()

  if (!tokenResponse.ok) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'Erro ao autenticar no Google Analytics.')
  }

  return tokenPayload.access_token as string
}

function parseDateInput(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new Error(`Campo ${fieldName} invalido. Use o formato YYYY-MM-DD.`)
  }

  return value
}

function emptyTotals(): ReportTotals {
  return {
    activeUsers: 0,
    sessions: 0,
    screenPageViews: 0,
    eventCount: 0,
    userEngagementDuration: 0,
  }
}

function parseMetricValues(metricValues: GoogleAnalyticsMetricValue[] = []) {
  return metricNames.reduce((acc, metricName, index) => {
    acc[metricName] = Number(metricValues[index]?.value || 0)
    return acc
  }, emptyTotals())
}

function parseReport(data: GoogleAnalyticsReportResponse) {
  const totals = parseMetricValues(data.totals?.[0]?.metricValues)
  const rows: ReportRow[] = (data.rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || '',
    ...parseMetricValues(row.metricValues),
  }))

  return { totals, rows }
}

async function runReport(accessToken: string, propertyId: string, startDate: string, endDate: string) {
  const response = await fetch(`${GA_API_BASE_URL}/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: metricNames.map((name) => ({ name })),
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
        },
      ],
      keepEmptyRows: true,
    }),
  })

  const data = (await response.json()) as GoogleAnalyticsReportResponse

  if (!response.ok) {
    throw new Error(data.error?.message || 'Erro ao consultar o Google Analytics.')
  }

  return parseReport(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
  }

  try {
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Configure GOOGLE_ANALYTICS_PROPERTY_ID no ambiente do servidor.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const currentStart = parseDateInput(body.currentStart, 'currentStart')
    const currentEnd = parseDateInput(body.currentEnd, 'currentEnd')
    const compareStart = parseDateInput(body.compareStart, 'compareStart')
    const compareEnd = parseDateInput(body.compareEnd, 'compareEnd')
    const accessToken = await getGoogleAccessToken()

    const [current, compare] = await Promise.all([
      runReport(accessToken, propertyId, currentStart, currentEnd),
      runReport(accessToken, propertyId, compareStart, compareEnd),
    ])

    return NextResponse.json({ current, compare })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado ao buscar dados do Google Analytics.' },
      { status: 500 }
    )
  }
}
