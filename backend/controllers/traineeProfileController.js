const { sendSuccess, sendError } = require('../utils/responseHandler');
const service = require('../services/traineeProfileService');

const asyncAction = (label, action) => async (req, res) => {
  try {
    const result = await action(req);
    if (result === false) return sendError(res, 'Profile item not found.', 404);
    return sendSuccess(res, result, `${label} successfully`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 'That item already exists in your profile.', 409);
    console.error(`[Trainee profile ${label}]`, error);
    return sendError(res, `Could not ${label.toLowerCase()}.`, 500);
  }
};

module.exports = {
  getProfile: asyncAction('Profile retrieved', req => service.getProfile(req.user.id)),
  updateProfile: asyncAction('Profile updated', req => service.updateProfile(req.user.id, req.body)),
  addSkill: asyncAction('Skill added', req => service.addSkill(req.user.id, req.body.name).then(() => true)),
  removeSkill: asyncAction('Skill removed', req => service.removeSkill(req.user.id, Number(req.params.id))),
  addInterest: asyncAction('Interest added', req => service.addInterest(req.user.id, req.body.name).then(() => true)),
  removeInterest: asyncAction('Interest removed', req => service.removeInterest(req.user.id, Number(req.params.id))),
  addExperience: asyncAction('Experience added', req => service.saveExperience(req.user.id, req.body).then(() => true)),
  updateExperience: asyncAction('Experience updated', req => service.saveExperience(req.user.id, req.body, Number(req.params.id))),
  removeExperience: asyncAction('Experience removed', req => service.removeExperience(req.user.id, Number(req.params.id))),
  addCertificate: asyncAction('Certificate added', req => service.saveCertificate(req.user.id, req.body).then(() => true)),
  updateCertificate: asyncAction('Certificate updated', req => service.saveCertificate(req.user.id, req.body, Number(req.params.id))),
  removeCertificate: asyncAction('Certificate removed', req => service.removeCertificate(req.user.id, Number(req.params.id)))
};
