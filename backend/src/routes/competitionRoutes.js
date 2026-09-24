const express = require('express');
const { param } = require('express-validator');
const { listCompetitions, getCompetition } = require('../controllers/competitionController');
const { registerForCompetition, cancelRegistration } = require('../controllers/registrationController');
const { uploadSubmission } = require('../controllers/submissionController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

const idParam = param('id').isMongoId().withMessage('Invalid competition id');

router.get('/', listCompetitions);
router.get('/:id', idParam, validate, optionalAuth, getCompetition);

router.post('/:id/register', idParam, validate, requireAuth, registerForCompetition);
router.post('/:id/unregister', idParam, validate, requireAuth, cancelRegistration);

router.post(
  '/:id/submissions',
  idParam,
  validate,
  requireAuth,
  upload.single('file'),
  uploadSubmission
);

module.exports = router;
