const { sendSuccess, sendError } = require('../utils/responseHandler');
const service = require('../services/traineeCourseService');

const action = (label, handler) => async (req, res) => {
  try {
    const data = await handler(req);
    if (data === null) return sendError(res, 'Published course, enrollment, or resource not found.', 404);
    return sendSuccess(res, data, label);
  } catch (error) {
    console.error(`[Trainee courses ${label}]`, error);
    return sendError(res, `Could not ${label.toLowerCase()}.`, 500);
  }
};

module.exports = {
  catalog: action('Course catalog retrieved', () => service.getCatalog()),
  myCourses: action('Enrolled courses retrieved', req => service.getMyCourses(req.user.id)),
  details: action('Course details retrieved', req => service.getCourse(req.user.id, Number(req.params.courseId))),
  enroll: action('Enrollment ready', req => service.enroll(req.user.id, Number(req.params.courseId))),
  progress: action('Course progress retrieved', req => service.getProgress(req.user.id, Number(req.params.courseId))),
  openResource: action('Resource opened', req => service.openResource(req.user.id, Number(req.params.courseId), Number(req.params.resourceId))),
  completeResource: action('Resource completed', req => service.completeResource(req.user.id, Number(req.params.courseId), Number(req.params.resourceId)))
};
