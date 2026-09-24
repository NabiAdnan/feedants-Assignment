/**
 * Single source of truth for deriving the competition's lifecycle state
 * and the current user's allowed actions from raw timestamps + counts.
 * The frontend never guesses this - it just renders whatever this
 * function (via the API) says.
 */

const LIFECYCLE = {
  UPCOMING: 'UPCOMING', // registration not open yet
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED', // closed, submission not started
  SUBMISSION_OPEN: 'SUBMISSION_OPEN',
  SUBMISSION_CLOSED: 'SUBMISSION_CLOSED', // waiting for results
  RESULTS_DECLARED: 'RESULTS_DECLARED',
};

function getLifecycleStage(competition, now = new Date()) {
  const {
    registrationOpenAt,
    registrationCloseAt,
    submissionStartAt,
    submissionEndAt,
    resultDate,
  } = competition;

  if (now < new Date(registrationOpenAt)) return LIFECYCLE.UPCOMING;
  if (now < new Date(registrationCloseAt)) return LIFECYCLE.REGISTRATION_OPEN;
  if (now < new Date(submissionStartAt)) return LIFECYCLE.REGISTRATION_CLOSED;
  if (now < new Date(submissionEndAt)) return LIFECYCLE.SUBMISSION_OPEN;
  if (now < new Date(resultDate)) return LIFECYCLE.SUBMISSION_CLOSED;
  return LIFECYCLE.RESULTS_DECLARED;
}

/**
 * Builds the full "view model" the frontend renders directly - spots
 * left, whether the CTA is enabled, what the CTA should say, etc.
 * Keeping this on the server means business rules can change without an
 * app release, and two clients never disagree about what's allowed.
 */
function buildCompetitionView(competition, { registration, submission } = {}, now = new Date()) {
  const stage = getLifecycleStage(competition, now);
  const spotsLeft = Math.max(competition.totalSpots - competition.bookedCount, 0);
  const isFull = spotsLeft <= 0;
  const isRegistered = !!registration && registration.status === 'REGISTERED';
  const hasSubmitted = !!submission;

  const canRegister =
    stage === LIFECYCLE.REGISTRATION_OPEN && !isRegistered && !isFull;

  const canSubmit =
    stage === LIFECYCLE.SUBMISSION_OPEN && isRegistered && !hasSubmitted;

  const canResubmit =
    stage === LIFECYCLE.SUBMISSION_OPEN && isRegistered && hasSubmitted;

  // Primary CTA shown at the bottom of the screen ("Upload Submission",
  // "Register Now", "Registration Closed", etc.)
  let primaryAction = { type: 'NONE', label: 'Not available', enabled: false };

  if (!isRegistered) {
    if (stage === LIFECYCLE.REGISTRATION_OPEN) {
      primaryAction = isFull
        ? { type: 'FULL', label: 'Spots Full', enabled: false }
        : { type: 'REGISTER', label: `Register - ₹${competition.entryFee}`, enabled: true };
    } else if (stage === LIFECYCLE.UPCOMING) {
      primaryAction = { type: 'UPCOMING', label: 'Registration Opens Soon', enabled: false };
    } else {
      primaryAction = { type: 'CLOSED', label: 'Registration Closed', enabled: false };
    }
  } else {
    // user is registered
    if (stage === LIFECYCLE.REGISTRATION_OPEN || stage === LIFECYCLE.REGISTRATION_CLOSED) {
      primaryAction = { type: 'WAIT', label: 'Submissions Open Soon', enabled: false };
    } else if (stage === LIFECYCLE.SUBMISSION_OPEN) {
      primaryAction = hasSubmitted
        ? { type: 'RESUBMIT', label: 'Update Submission', enabled: true }
        : { type: 'SUBMIT', label: 'Upload Submission', enabled: true };
    } else if (stage === LIFECYCLE.SUBMISSION_CLOSED) {
      primaryAction = hasSubmitted
        ? { type: 'AWAITING_RESULT', label: 'Submitted - Awaiting Result', enabled: false }
        : { type: 'MISSED', label: 'Submission Window Missed', enabled: false };
    } else if (stage === LIFECYCLE.RESULTS_DECLARED) {
      primaryAction = { type: 'VIEW_RESULT', label: 'View Result', enabled: true };
    }
  }

  return {
    stage,
    spotsLeft,
    isFull,
    isRegistered,
    hasSubmitted,
    canRegister,
    canSubmit,
    canResubmit,
    primaryAction,
    // Countdown target the client should render a timer against.
    // Always the *next* meaningful deadline given the current stage.
    countdownTarget: (() => {
      switch (stage) {
        case LIFECYCLE.UPCOMING:
          return { label: 'Registration opens in', target: competition.registrationOpenAt };
        case LIFECYCLE.REGISTRATION_OPEN:
          return { label: 'Registration closes in', target: competition.registrationCloseAt };
        case LIFECYCLE.REGISTRATION_CLOSED:
          return { label: 'Submissions open in', target: competition.submissionStartAt };
        case LIFECYCLE.SUBMISSION_OPEN:
          return { label: 'Submissions close in', target: competition.submissionEndAt };
        case LIFECYCLE.SUBMISSION_CLOSED:
          return { label: 'Results on', target: competition.resultDate };
        default:
          return null;
      }
    })(),
  };
}

module.exports = { LIFECYCLE, getLifecycleStage, buildCompetitionView };
