/**
 * RoadSense Driver Safety & Fatigue Intelligence Engine
 * Provides real-time driver coaching, mathematical fatigue indexing,
 * circadian rhythm risk evaluation, and post-trip actionable recommendations.
 */

/**
 * Calculates a fair, duration-weighted driving score (0 - 100)
 */
export const calculateAdvancedDrivingScore = (totalTime, warnTime, sleepTime, alertCount = 0) => {
  if (!totalTime || totalTime <= 0) return 100;

  // Time in normal/alert flow
  const attentiveTime = Math.max(0, totalTime - (warnTime + sleepTime));
  const normalRatio = attentiveTime / totalTime;
  const warningRatio = warnTime / totalTime;
  const sleepRatio = sleepTime / totalTime;

  // Base score from attention ratio
  let score = normalRatio * 100;

  // Weighted penalties for critical asleep states and alerts
  const sleepPenalty = sleepRatio * 75;
  const warningPenalty = warningRatio * 35;
  const alertTriggerPenalty = Math.min(25, alertCount * 4);

  score = score - sleepPenalty - warningPenalty - alertTriggerPenalty;

  // Bound between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));
  return Math.round(finalScore * 10) / 10;
};

/**
 * Evaluates circadian rhythm risk based on the current hour of driving
 */
export const getCircadianRiskProfile = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 2 && hour <= 6) {
    return {
      level: 'High Risk',
      title: 'Circadian Sleep Window (02:00 - 06:00)',
      description: 'Human biological alertness reaches its natural circadian trough during this period. Reaction times can degrade significantly.',
      badgeClass: 'bg-rose-950/40 text-rose-300 border-rose-800/60'
    };
  } else if (hour >= 13 && hour <= 15) {
    return {
      level: 'Moderate Risk',
      title: 'Post-Prandial Dip (13:00 - 15:00)',
      description: 'Natural post-lunch physiological alertness dip. Increased driver vigilance and ventilation recommended.',
      badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-800/60'
    };
  } else if (hour >= 22 || hour === 1) {
    return {
      level: 'Elevated Risk',
      title: 'Late Evening Driving Zone (22:00 - 02:00)',
      description: 'Melatonin production increases in darkness. Visual contrast and peripheral hazard detection are reduced.',
      badgeClass: 'bg-orange-950/40 text-orange-300 border-orange-800/60'
    };
  } else {
    return {
      level: 'Optimal',
      title: 'Standard Daylight Window',
      description: 'Ambient lighting and physiological cortisol levels support optimal attentiveness and reaction times.',
      badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
    };
  }
};

/**
 * Generates comprehensive post-trip safety analysis & recommendations
 */
export const generateTripAIAnalysis = ({
  totalTime = 0,
  warningTime = 0,
  asleepTime = 0,
  alertCount = 0,
  sessionDate = new Date()
}) => {
  const score = calculateAdvancedDrivingScore(totalTime, warningTime, asleepTime, alertCount);
  const circadian = getCircadianRiskProfile(sessionDate);

  const attentiveTime = Math.max(0, totalTime - (warningTime + asleepTime));
  const attentivePercentage = totalTime > 0 ? Math.round((attentiveTime / totalTime) * 100) : 100;
  const warningPercentage = totalTime > 0 ? Math.round((warningTime / totalTime) * 100) : 0;
  const asleepPercentage = totalTime > 0 ? Math.round((asleepTime / totalTime) * 100) : 0;

  let riskLevel = 'Low Risk';
  let grade = 'A+';
  let statusHeadline = 'Optimal Attention & Alertness Maintained';
  let statusMessage = 'Driver maintained steady attentiveness throughout the trip with minimal fatigue indicators.';

  if (asleepTime > 3 || alertCount >= 3 || score < 50) {
    riskLevel = 'Critical Risk';
    grade = 'F';
    statusHeadline = 'Critical Fatigue Threshold Exceeded';
    statusMessage = 'Repeated micro-sleep and eye closure events detected. Continued driving in this state presents high risk.';
  } else if (asleepTime > 0 || alertCount >= 1 || score < 70) {
    riskLevel = 'Elevated Risk';
    grade = 'C';
    statusHeadline = 'Frequent Fatigue Indicators Recorded';
    statusMessage = 'Observable drops in driver alertness detected. An immediate rest stop is strongly advised.';
  } else if (warningTime > 10 || score < 85) {
    riskLevel = 'Moderate Risk';
    grade = 'B';
    statusHeadline = 'Intermittent Drowsiness Observed';
    statusMessage = 'Early fatigue signals detected. Proactive countermeasures recommended before proceeding on long routes.';
  } else if (score < 95) {
    riskLevel = 'Low Risk';
    grade = 'A';
    statusHeadline = 'Consistent Driving Alertness';
    statusMessage = 'Driver demonstrated steady focus with safe posture and reaction margins.';
  }

  // Actionable recommendations tailored to trip telemetry
  const suggestions = [];

  if (asleepTime > 0 || alertCount > 0) {
    suggestions.push({
      category: 'Emergency Protocol',
      type: 'critical',
      title: 'Mandatory 15-20 Minute Rest Break',
      detail: 'Eye closure durations exceeded safety thresholds. Physical rest is mandatory before driving further.'
    });
  }

  if (warningTime > 15 || warningPercentage > 15) {
    suggestions.push({
      category: 'Cabin Environment',
      type: 'warning',
      title: 'Increase Fresh Airflow & Lower Cabin Temp',
      detail: 'Elevated cabin CO2 accelerates fatigue. Switch off recirculation mode and lower temperature to 20°C.'
    });
  }

  if (totalTime >= 7200) { // >= 2 hours
    suggestions.push({
      category: 'Trip Schedule',
      type: 'info',
      title: '2-Hour Continuous Driving Limit Reached',
      detail: 'Cognitive endurance naturally declines after 120 minutes of continuous road monitoring. Plan a 15-minute walk.'
    });
  } else if (totalTime >= 3600) {
    suggestions.push({
      category: 'Trip Schedule',
      type: 'info',
      title: 'Mid-Journey Refresh Scheduled',
      detail: 'Plan a brief rest stop within the next 30 minutes to reduce visual fatigue and maintain peak reaction speed.'
    });
  }

  if (circadian.level.includes('Risk')) {
    suggestions.push({
      category: 'Circadian Timing',
      type: 'warning',
      title: `${circadian.title}`,
      detail: `${circadian.description} Increase mirror checks and avoid heavy meals before driving.`
    });
  }

  suggestions.push({
    category: 'Physiological Care',
    type: 'success',
    title: 'Hydration & Postural Reset',
    detail: 'Maintain steady hydration throughout your trip. Perform brief shoulder and neck rolls during stops to alleviate muscle tension.'
  });

  return {
    score,
    grade,
    riskLevel,
    statusHeadline,
    statusMessage,
    metrics: {
      totalTime,
      attentiveTime,
      warningTime,
      asleepTime,
      attentivePercentage,
      warningPercentage,
      asleepPercentage,
      alertCount
    },
    circadian,
    suggestions
  };
};

/**
 * Returns dynamic live driver assistant tips based on real-time detections
 */
export const getLiveCoPilotAdvice = ({
  detectedClasses = [],
  alert = false,
  alertDuration = 0,
  totalDrivingTime = 0
}) => {
  if (alert || detectedClasses.includes('asleep')) {
    return {
      type: 'danger',
      badge: 'HAZARD ALERT',
      text: `Critical eye closure detected (${alertDuration > 0 ? alertDuration + 's' : 'active'})! Safely pull over immediately.`
    };
  }

  if (detectedClasses.includes('drowsy')) {
    return {
      type: 'warning',
      badge: 'DROWSINESS WARNING',
      text: 'Early fatigue detected. Increase fresh air ventilation and prepare for a rest stop.'
    };
  }

  if (totalDrivingTime > 7200) {
    return {
      type: 'warning',
      badge: 'REST ADVISORY',
      text: 'Over 2 hours of continuous driving. A 15-minute break is strongly recommended.'
    };
  }

  if (totalDrivingTime > 3600) {
    return {
      type: 'info',
      badge: 'JOURNEY ADVISORY',
      text: 'Good focus maintained. Remember to blink regularly and stay hydrated.'
    };
  }

  return {
    type: 'normal',
    badge: 'ATTENTION NORMAL',
    text: 'Visual attention steady. Maintain safe following distance and scan mirrors.'
  };
};
