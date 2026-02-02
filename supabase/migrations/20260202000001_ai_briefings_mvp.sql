-- ============================================
-- AI BRIEFINGS MVP - Database Schema
-- Created: 2026-02-02 02:30:00
-- Purpose: Minimal schema for AI-powered email briefings system
--
-- ROLLBACK INSTRUCTIONS:
-- DROP TABLE IF EXISTS ai_briefings CASCADE;
-- DROP TABLE IF EXISTS ai_knowledge_base CASCADE;
-- ============================================

-- ============================================
-- Table: ai_knowledge_base
-- Purpose: Store facts extracted from emails by LLM
-- ============================================
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source linking (FK to emails_ricevute)
    source_email_id UUID NOT NULL REFERENCES emails_ricevute(id) ON DELETE CASCADE,
    -- CASCADE is intentional: if email deleted, extracted fact is no longer valid
    
    -- Extracted information
    fact_summary TEXT NOT NULL,
    fact_type VARCHAR(50), -- 'conferma', 'domanda', 'problema', 'info', etc.
    
    -- AI scoring
    relevance_score FLOAT DEFAULT 0.5 NOT NULL,
    confidence_score FLOAT DEFAULT 0.5 NOT NULL,
    
    -- Raw LLM response (for debugging and refinement)
    extraction_raw JSONB,
    
    -- Metadata
    extracted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints for data quality
    CONSTRAINT valid_fact_summary CHECK (LENGTH(fact_summary) > 0 AND LENGTH(fact_summary) <= 1000),
    CONSTRAINT valid_relevance_score CHECK (relevance_score >= 0 AND relevance_score <= 1),
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_ai_kb_source_email ON ai_knowledge_base(source_email_id);
CREATE INDEX IF NOT EXISTS idx_ai_kb_relevance ON ai_knowledge_base(relevance_score DESC) WHERE relevance_score >= 0.5;
CREATE INDEX IF NOT EXISTS idx_ai_kb_extracted_at ON ai_knowledge_base(extracted_at DESC);

-- ============================================
-- Table: ai_briefings
-- Purpose: Store generated briefings for users
-- ============================================
CREATE TABLE IF NOT EXISTS ai_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to knowledge base
    fact_id UUID NOT NULL REFERENCES ai_knowledge_base(id) ON DELETE CASCADE,
    -- CASCADE: if fact deleted, briefing should also be removed
    
    -- Display content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
    icon VARCHAR(10) DEFAULT '🔵',
    
    -- User interaction tracking
    read_at TIMESTAMPTZ, -- NULL = unread
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (LENGTH(title) > 0 AND LENGTH(title) <= 200),
    CONSTRAINT valid_message CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 500),
    CONSTRAINT valid_priority CHECK (priority IN ('urgent', 'high', 'medium', 'low'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_ai_briefings_unread ON ai_briefings(created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_briefings_fact ON ai_briefings(fact_id);
CREATE INDEX IF NOT EXISTS idx_ai_briefings_all ON ai_briefings(created_at DESC);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE ai_knowledge_base IS 'Stores facts extracted from emails by AI/LLM for briefing generation';
COMMENT ON TABLE ai_briefings IS 'Stores generated briefings shown to users in UI';

COMMENT ON COLUMN ai_knowledge_base.source_email_id IS 'FK to emails_ricevute - source email for this fact';
COMMENT ON COLUMN ai_knowledge_base.extraction_raw IS 'Full JSON response from LLM for debugging';
COMMENT ON COLUMN ai_briefings.read_at IS 'Timestamp when user marked briefing as read (NULL = unread)';

-- ============================================
-- Enable Row Level Security (disabled for MVP)
-- For production, enable RLS and create policies
-- ============================================
-- ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_briefings ENABLE ROW LEVEL SECURITY;
