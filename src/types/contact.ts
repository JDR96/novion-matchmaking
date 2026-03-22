export interface ContactResult {
  id: number;
  full_name: string;
  organization: string | null;
  job_title: string | null;
  sector: string | null;
  match_score: number;
  labels: string[];
  motivation: string;
}

export interface SearchResponse {
  results: ContactResult[];
  query: string;
  count: number;
}

export interface SearchFilters {
  sector?: string;
  country?: string;
  suriname_relevant?: boolean;
}
