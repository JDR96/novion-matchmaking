-- OPTIONEEL: Update match_contacts RPC om ook expertise en tags te retourneren
-- Voer dit uit in de Supabase SQL Editor als je de second query wilt elimineren
-- De app werkt ook zonder deze update (hij haalt de extra velden via een tweede query op)

CREATE OR REPLACE FUNCTION match_contacts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id int,
  volledige_naam text,
  organisatie text,
  functie text,
  sector text,
  expertise text,
  tags text,
  bio text,
  functieniveau text,
  suriname_score float,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.volledige_naam,
    c.organisatie,
    c.functie,
    c.sector,
    c.expertise,
    c.tags,
    c.bio,
    c.functieniveau,
    c.suriname_score::float,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM contacts c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
