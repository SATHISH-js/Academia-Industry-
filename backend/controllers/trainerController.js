const { sendSuccess, sendError } = require('../utils/responseHandler');
const profiles = require('../services/trainerProfileService');
const courses = require('../services/trainerCourseManagementService');

function handle(action, label) {
  return async (req, res) => {
    try {
      const result = await action(req);
      if (result === null || result === false) return sendError(res, 'Requested item was not found or is not available to your account.', 404);
      return sendSuccess(res, result === true ? null : result, label);
    } catch (error) {
      console.error(`[Trainer ${label}]`, error);
      return sendError(res, error.code === 'ER_DUP_ENTRY' ? 'This item already exists.' : 'Unable to complete the request.', error.code === 'ER_DUP_ENTRY' ? 409 : 500);
    }
  };
}

const actor = req => ({ id: req.user.id, role: req.user.role });
module.exports = {
  getProfile: handle(req => profiles.getProfile(req.user.id), 'Trainer profile retrieved'),
  updateProfile: handle(req => profiles.updateProfile(req.user.id, req.body), 'Trainer profile updated'),
  addItem: handle(req => profiles.addItem(req.user.id, req.body).then(() => true), 'Profile item added'),
  removeItem: handle(req => profiles.removeItem(req.user.id, Number(req.params.id))),
  addExperience: handle(req => profiles.saveExperience(req.user.id, req.body), 'Work experience saved'),
  updateExperience: handle(req => profiles.saveExperience(req.user.id, req.body, Number(req.params.id))),
  removeExperience: handle(req => profiles.removeExperience(req.user.id, Number(req.params.id))),
  listCourses: handle(req => courses.listCourses(actor(req)), 'Courses retrieved'),
  getCourse: handle(req => courses.getCourse(actor(req), Number(req.params.courseId))),
  createCourse: handle(req => courses.createCourse(actor(req), req.body), 'Course draft created'),
  updateCourse: handle(req => courses.updateCourse(actor(req), Number(req.params.courseId), req.body), 'Course updated'),
  transition: transition => handle(req => courses.transitionCourse(actor(req), Number(req.params.courseId), transition), {
    publish: 'Course published', unpublish: 'Course returned to draft', archive: 'Course archived'
  }[transition])
};
