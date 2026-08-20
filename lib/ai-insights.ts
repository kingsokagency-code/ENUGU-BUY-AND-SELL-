/**
 * lib/ai-insights.ts
 * SERVER-ONLY — quantitative chart aggregator.
 * AI functionality deactivated under Phase 1 Core MVP Scope (H5).
 */

export interface InsightReport {
  executiveSummary: string;
  responseCount:    number;
  generatedAt:      string;

  charts: {
    institution:         Record<string, number>;
    living_situation:    Record<string, number>;
    hardest_item:        Record<string, number>;
    first_search:        Record<string, number>;
    biggest_challenge:   Record<string, number>;
    platform_preference: Record<string, number>;
    whatsapp_daily:      Record<string, number>;
    found_item:          Record<string, number>;
    trust_vs_price:      Record<string, number>;
    cancelled_purchase:  Record<string, number>;
  };

  topPainPoints: Array<{
    theme:      string;
    frequency:  number;
    percentage: number;
    evidence:   string[];
  }>;

  audienceSegments: Array<{
    name:         string;
    description:  string;
    sizeEstimate: number;
    needs:        string[];
  }>;

  decisionSignals: {
    priceSensitivity:    'low' | 'medium' | 'high';
    deliveryImportance:  'low' | 'medium' | 'high';
    trustImportance:     'low' | 'medium' | 'high';
  };

  productRecommendations: Array<{
    priority:       number;
    recommendation: string;
    reason:         string;
    confidence:     'low' | 'medium' | 'high';
  }>;

  keyQuotes: string[];
}

function tally(
  rows: Record<string, string>[],
  field: string
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const v = row[field];
    if (v && typeof v === 'string' && v.trim()) {
      acc[v.trim()] = (acc[v.trim()] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export async function buildInsightReport(
  rows: Record<string, string>[],
  total: number
): Promise<InsightReport> {
  const now = new Date().toISOString();

  const charts = {
    institution:         tally(rows, 'institution'),
    living_situation:    tally(rows, 'living_situation'),
    hardest_item:        tally(rows, 'hardest_item'),
    first_search:        tally(rows, 'first_search'),
    biggest_challenge:   tally(rows, 'biggest_challenge'),
    platform_preference: tally(rows, 'platform_preference'),
    whatsapp_daily:      tally(rows, 'whatsapp_daily'),
    found_item:          tally(rows, 'found_item'),
    trust_vs_price:      tally(rows, 'trust_vs_price'),
    cancelled_purchase:  tally(rows, 'cancelled_purchase'),
  };

  const freeTexts = rows
    .map(r => r.one_improvement)
    .filter(Boolean)
    .map(t => t.trim().slice(0, 300))
    .slice(0, 5);

  return {
    executiveSummary: `${total} survey responses aggregated into quantitative discovery charts.`,
    responseCount:    total,
    generatedAt:      now,
    charts,
    topPainPoints:         [],
    audienceSegments:      [],
    decisionSignals:       { priceSensitivity: 'medium', deliveryImportance: 'medium', trustImportance: 'high' },
    productRecommendations: [],
    keyQuotes:             freeTexts,
  };
}
