export interface ContactResult {
  id: number;
  full_name: string;
  organization: string | null;
  job_title: string | null;
  sector: string | null;
  match_score: number;
  labels: string[];
  motivation: string;
  // Contact details
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
  // Extra metadata
  function_level: string | null;
  suriname_score: number | null;
  source: string | null;
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
