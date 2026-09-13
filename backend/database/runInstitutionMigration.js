const { pool } = require('../config/db');

async function runMigration() {
  console.log('[Migration] Starting Robust Institution MoU & Student Linkage Migration...');
  const connection = await pool.getConnection();

  try {
    // 1. Check and add proposal_note column
    const [noteCol] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'academia_industry_portal' 
         AND TABLE_NAME = 'institution_industry_connections' 
         AND COLUMN_NAME = 'proposal_note'`
    );
    if (noteCol.length === 0) {
      console.log('Adding column proposal_note...');
      await connection.query(`ALTER TABLE institution_industry_connections ADD COLUMN proposal_note TEXT DEFAULT NULL`);
    }

    // 2. Check and add initiator column
    const [initCol] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'academia_industry_portal' 
         AND TABLE_NAME = 'institution_industry_connections' 
         AND COLUMN_NAME = 'initiator'`
    );
    if (initCol.length === 0) {
      console.log('Adding column initiator...');
      await connection.query(`ALTER TABLE institution_industry_connections ADD COLUMN initiator ENUM('INSTITUTION', 'INDUSTRY') DEFAULT 'INSTITUTION'`);
    }

    // 3. Link students and academicians to Institution #1 (NIT)
    await connection.query(`UPDATE student_profiles SET institution_id = 1 WHERE institution_id IS NULL OR institution_id = 0`);
    await connection.query(`UPDATE academician_profiles SET institution_id = 1 WHERE institution_id IS NULL OR institution_id = 0`);
    console.log('Linked demo students & academicians to Institution #1');

    // 4. Insert or update sample MoU
    const [existing] = await connection.query(
      `SELECT id FROM institution_industry_connections WHERE institution_id = 1 AND industry_id = 1`
    );
    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO institution_industry_connections 
         (institution_id, industry_id, mou_signed_date, valid_until, partnership_type, status, notes, proposal_note, initiator)
         VALUES (1, 1, '2025-01-15', '2027-01-15', 'MOU', 'ACTIVE', 
         'Comprehensive Industry-Academia MoU covering curriculum co-design, guest lectures, student internships, and faculty sabbatical programs.', 
         'Agreed upon bilateral collaboration for AI & Cloud curriculum enhancement.', 'INSTITUTION')`
      );
      console.log('Inserted sample active MoU with TechCorp');
    }

    console.log('[Migration] All columns, links, and MoU seeds applied successfully ✔');
  } catch (err) {
    console.error('[Migration Error]', err.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
