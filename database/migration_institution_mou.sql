USE academia_industry_portal;

-- Ensure institution_industry_connections has all columns needed for dynamic MoU agreements
ALTER TABLE institution_industry_connections 
ADD COLUMN IF NOT EXISTS proposal_note TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS initiator ENUM('INSTITUTION', 'INDUSTRY') DEFAULT 'INSTITUTION';

-- Ensure students are linked to Institution #1 (National Institute of Technology) for demo testing
UPDATE student_profiles SET institution_id = 1 WHERE institution_id IS NULL OR institution_id = 0;

-- Ensure academicians are linked to Institution #1
UPDATE academician_profiles SET institution_id = 1 WHERE institution_id IS NULL OR institution_id = 0;

-- Ensure sample MoUs exist in institution_industry_connections
INSERT INTO institution_industry_connections (institution_id, industry_id, mou_signed_date, valid_until, partnership_type, status, notes, proposal_note, initiator)
SELECT 1, 1, '2025-01-15', '2027-01-15', 'MOU', 'ACTIVE', 
'Comprehensive Industry-Academia MoU covering curriculum co-design, guest lectures, student internships, and faculty sabbatical programs.', 
'Agreed upon bilateral collaboration for AI & Cloud curriculum enhancement.', 'INSTITUTION'
WHERE NOT EXISTS (SELECT 1 FROM institution_industry_connections WHERE institution_id = 1 AND industry_id = 1);
