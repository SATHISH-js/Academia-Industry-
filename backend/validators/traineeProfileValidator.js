const { body, param } = require('express-validator');

const profile = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^\+?[0-9\s().-]{7,25}$/),
  body('bio').optional().trim().isLength({ max: 3000 }),
  body('degree').optional().trim().isLength({ max: 100 }),
  body('institution').optional().trim().isLength({ max: 200 }),
  body('specialization').optional().trim().isLength({ max: 200 }),
  body('graduation_year').optional({ values: 'falsy' }).isInt({ min: 1950, max: 2100 }).toInt(),
  body('avatar_url').optional({ values: 'falsy' }).isLength({ max: 2800000 }).custom(value => {
    if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
    if (/^https:\/\/.+/.test(value)) return true;
    throw new Error('Use a PNG, JPEG, or WebP image under 2 MB, or an HTTPS image URL.');
  })
];

const itemId = param('id').isInt({ min: 1 }).toInt();
const name = body('name').trim().isLength({ min: 1, max: 100 });
const experience = [
  body('organization').trim().isLength({ min: 1, max: 180 }),
  body('designation').trim().isLength({ min: 1, max: 150 }),
  body('start_date').isISO8601(),
  body('end_date').optional({ values: 'falsy' }).isISO8601(),
  body('description').optional().trim().isLength({ max: 3000 })
];
const certificate = [
  body('title').trim().isLength({ min: 1, max: 180 }),
  body('issuing_organization').trim().isLength({ min: 1, max: 150 }),
  body('issue_date').optional({ values: 'falsy' }).isISO8601(),
  body('credential_id').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
  body('certificate_url').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).isURL({ protocols: ['http', 'https'], require_protocol: true })
];

module.exports = { profile, itemId, name, experience, certificate };
