const { param } = require('express-validator');

module.exports = {
  courseId: param('courseId').isInt({ min: 1 }).toInt(),
  resourceId: param('resourceId').isInt({ min: 1 }).toInt()
};
