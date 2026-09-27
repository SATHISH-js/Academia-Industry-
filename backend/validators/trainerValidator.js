const { body, param } = require('express-validator');

const positiveId = param('id').isInt({ min: 1 }).toInt();
const courseId = param('courseId').isInt({ min: 1 }).toInt();
const profile = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^\+?[0-9\s().-]{7,25}$/),
  body('bio').optional().trim().isLength({ max: 3000 }),
  body('qualification').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('experience_years').optional({ values: 'falsy' }).isInt({ min: 0, max: 70 }).toInt(),
  body('specialization').optional().trim().isLength({ max: 200 }),
  body('expertise').optional().trim().isLength({ max: 2000 }),
  body('avatar_url').optional({ values: 'falsy' }).isLength({ max: 2800000 }).custom(value => {
    if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || /^https:\/\/.+/.test(value)) return true;
    throw new Error('Use a PNG, JPEG, or WebP image under 2 MB, or an HTTPS image URL.');
  })
];
const item = [
  body('item_type').isIn(['SKILL', 'COMPETENCY', 'SUBJECT', 'CERTIFICATION']),
  body('title').trim().isLength({ min: 1, max: 180 }),
  body('issuing_organization').optional().trim().isLength({ max: 180 }),
  body('issue_date').optional({ values: 'falsy' }).isISO8601(),
  body('credential_reference').optional().trim().isLength({ max: 150 })
];
const experience = [
  body('organization').trim().isLength({ min: 1, max: 180 }),
  body('designation').trim().isLength({ min: 1, max: 150 }),
  body('start_date').isISO8601(),
  body('end_date').optional({ values: 'falsy' }).isISO8601(),
  body('description').optional().trim().isLength({ max: 3000 })
];
const course = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('subject').trim().isLength({ min: 1, max: 120 }),
  body('description').optional().trim().isLength({ max: 10000 }),
  body('thumbnail_url').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).custom(value => !value || /^https?:\/\//i.test(value))
];
const adminCourse = [...course, body('trainer_user_id').isInt({ min: 1 }).toInt()];

module.exports = { positiveId, courseId, profile, item, experience, course, adminCourse };
