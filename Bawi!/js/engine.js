/**
 * LUMINA // Mathematical & Algorithmic Grading Engine
 * Implements Section 5 of PRD: Forward calculation pipeline,
 * Table 4 reverse target solver, and High-Leverage Study Allocator.
 */

window.LuminaEngine = (function () {
  'use strict';

  /**
   * Compute comprehensive metrics for a single subject.
   */
  function calculateSubject(subject, assessments) {
    if (!subject) return null;

    const activeQ = LuminaStore.getActiveQuarter();
    const subAssessments = assessments || LuminaStore.getAssessments(subject.id, activeQ);
    const wwItems = subAssessments.filter(a => a.category === 'WW');
    const ptItems = subAssessments.filter(a => a.category === 'PT');
    const qaItems = subAssessments.filter(a => a.category === 'QA');

    // 1. Written Works (WW)
    let wwScoreSum = 0;
    let wwMaxSum = 0;
    wwItems.forEach(item => {
      const mult = item.multiplier || 1.0;
      wwScoreSum += item.score * mult;
      wwMaxSum += item.max * mult;
    });
    const hasWW = wwItems.length > 0 && wwMaxSum > 0;
    const wwPercentage = hasWW ? (wwScoreSum / wwMaxSum) * 100 : 0;
    const wwWeightedScore = wwPercentage * subject.weights.ww;

    // 2. Performance Tasks (PT)
    let ptScoreSum = 0;
    let ptMaxSum = 0;
    ptItems.forEach(item => {
      const mult = item.multiplier || 1.0;
      ptScoreSum += item.score * mult;
      ptMaxSum += item.max * mult;
    });
    const hasPT = ptItems.length > 0 && ptMaxSum > 0;
    const ptPercentage = hasPT ? (ptScoreSum / ptMaxSum) * 100 : 0;
    const ptWeightedScore = ptPercentage * subject.weights.pt;

    // 3. Quarterly Exam (QA)
    let qaScoreSum = 0;
    let qaMaxSum = 0;
    qaItems.forEach(item => {
      const mult = item.multiplier || 1.0;
      qaScoreSum += item.score * mult;
      qaMaxSum += item.max * mult;
    });
    const hasQA = qaItems.length > 0 && qaMaxSum > 0;
    const qaPercentage = hasQA ? (qaScoreSum / qaMaxSum) * 100 : 0;
    const qaWeightedScore = qaPercentage * subject.weights.qa;

    // 4. Initial Grade (IG) & Locked Points
    const lockedPoints = wwWeightedScore + ptWeightedScore;
    const totalRawInitialGrade = lockedPoints + qaWeightedScore;

    // Active weight evaluated so far
    let activeWeight = 0;
    if (hasWW) activeWeight += subject.weights.ww;
    if (hasPT) activeWeight += subject.weights.pt;
    if (hasQA) activeWeight += subject.weights.qa;

    // Running performance rate (pace) to avoid false-failing when QA is pending
    const runningRate = activeWeight > 0 ? (totalRawInitialGrade / activeWeight) : 0;

    // Effective Initial Grade for Display & Transmutation:
    // If exam is completed, use actual total. If exam is pending, project based on running rate.
    const effectiveInitialGrade = hasQA ? totalRawInitialGrade : runningRate;
    const transmutedGrade = LuminaDepEd.initialToTransmuted(effectiveInitialGrade);

    // Target Grade comparison
    const profile = LuminaStore.getProfile();
    const targetGrade = subject.targetGrade || profile.targetGeneralAverage || 95;
    const targetMet = transmutedGrade >= targetGrade;
    const minIGForTarget = LuminaDepEd.transmutedToMinInitial(targetGrade);
    const deficitIG = Math.max(0, +(minIGForTarget - effectiveInitialGrade).toFixed(2));

    // Progress in weight completion (0% to 100%)
    const completedWeightRatio = activeWeight; // e.g. 0.75 if QA is 0.25 pending

    // Sparkline history: generate last 5 chronological progression points
    const sparkline = generateSparkline(subAssessments, subject.weights);

    return {
      subject,
      hasWW,
      hasPT,
      hasQA,
      ww: {
        score: wwScoreSum,
        max: wwMaxSum,
        percentage: wwPercentage,
        weighted: wwWeightedScore,
        count: wwItems.length,
        weightLabel: Math.round(subject.weights.ww * 100) + '%'
      },
      pt: {
        score: ptScoreSum,
        max: ptMaxSum,
        percentage: ptPercentage,
        weighted: ptWeightedScore,
        count: ptItems.length,
        weightLabel: Math.round(subject.weights.pt * 100) + '%'
      },
      qa: {
        score: qaScoreSum,
        max: qaMaxSum,
        percentage: qaPercentage,
        weighted: qaWeightedScore,
        count: qaItems.length,
        weightLabel: Math.round(subject.weights.qa * 100) + '%',
        isPending: !hasQA
      },
      lockedPoints: +lockedPoints.toFixed(2),
      rawInitialGrade: +totalRawInitialGrade.toFixed(2),
      runningRate: +runningRate.toFixed(2),
      effectiveInitialGrade: +effectiveInitialGrade.toFixed(2),
      transmutedGrade,
      targetGrade,
      targetMet,
      deficitIG,
      completedWeightRatio,
      completedPercentage: Math.round(completedWeightRatio * 100),
      sparkline
    };
  }

  /**
   * Helper to build a 5-step trend sparkline from assessments.
   */
  function generateSparkline(assessments, weights) {
    if (!assessments || assessments.length === 0) {
      return [75, 80, 85, 88, 90];
    }
    const sorted = [...assessments].sort((a, b) => new Date(a.date) - new Date(b.date));
    const points = [];
    let accScore = 0;
    let accMax = 0;

    sorted.forEach((item, idx) => {
      accScore += item.score;
      accMax += item.max;
      const pct = accMax > 0 ? (accScore / accMax) * 100 : 75;
      points.push(LuminaDepEd.initialToTransmuted(pct));
    });

    if (points.length < 5) {
      const last = points[points.length - 1] || 90;
      while (points.length < 5) {
        points.unshift(Math.max(75, last - (5 - points.length) * 2));
      }
    }
    return points.slice(-5);
  }

  /**
   * Calculate overall Term Statistics across all enrolled subjects.
   */
  function calculateTermSummary() {
    const subjects = LuminaStore.getSubjects();
    if (subjects.length === 0) {
      return {
        transmutedGeneralAverage: 0,
        unweightedInitialAverage: 0,
        honorsTier: LuminaDepEd.getHonorsTier(0),
        subjectCount: 0,
        subjectsCalculated: []
      };
    }

    const calculated = subjects.map(s => calculateSubject(s));
    const totalTG = calculated.reduce((acc, c) => acc + c.transmutedGrade, 0);
    const totalIG = calculated.reduce((acc, c) => acc + c.effectiveInitialGrade, 0);

    const generalAverage = +(totalTG / calculated.length).toFixed(2);
    const unweightedInitial = +(totalIG / calculated.length).toFixed(2);
    const honorsTier = LuminaDepEd.getHonorsTier(generalAverage);

    return {
      transmutedGeneralAverage: generalAverage,
      unweightedInitialAverage: unweightedInitial,
      honorsTier,
      subjectCount: subjects.length,
      subjectsCalculated: calculated
    };
  }

  /**
   * Section 5.2: Reverse Target Solver Logic.
   * "I want a Target Transmuted Grade in this subject. What exact score must I achieve on the Quarterly Exam?"
   */
  function solveForExam(subjectId, targetTransmutedGrade, examTotalItems = 50) {
    const subject = LuminaStore.getSubject(subjectId);
    if (!subject) return null;

    const calc = calculateSubject(subject);
    const targetTG = Number(targetTransmutedGrade) || subject.targetGrade || 95;
    const minRequiredIG = LuminaDepEd.transmutedToMinInitial(targetTG);

    const lockedPoints = calc.lockedPoints;
    const qaWeight = subject.weights.qa; // e.g. 0.25
    const deficitPoints = minRequiredIG - lockedPoints;

    // Required percentage on the exam
    const requiredExamPct = +(deficitPoints / qaWeight).toFixed(2);
    const rawItems = Math.ceil((requiredExamPct / 100) * examTotalItems);

    // Max possible Initial Grade if student gets 100% on Exam
    const maxAchievableIG = +(lockedPoints + (qaWeight * 100)).toFixed(2);
    const maxAchievableTG = LuminaDepEd.initialToTransmuted(maxAchievableIG);

    let status = 'HIGH_RIGOR'; // 'GUARANTEED', 'COMFORT', 'HIGH_RIGOR', 'UNREACHABLE'
    let statusLabel = '';
    let recommendation = '';

    if (lockedPoints >= minRequiredIG) {
      status = 'GUARANTEED';
      statusLabel = 'Target Guaranteed';
      recommendation = `Target ${targetTG} is already mathematically guaranteed! Your locked standing (${lockedPoints} pts) exceeds the ${minRequiredIG}% required threshold even with 0 on the exam.`;
    } else if (requiredExamPct <= 80) {
      status = 'COMFORT';
      statusLabel = 'Comfort Zone';
      recommendation = `Achievable cushion: Secure at least ${Math.max(1, rawItems)} out of ${examTotalItems} items (${requiredExamPct}%) on the Quarterly Exam to secure a ${targetTG}.`;
    } else if (requiredExamPct <= 100) {
      status = 'HIGH_RIGOR';
      statusLabel = 'High Rigor';
      recommendation = `Focused precision needed: You need at least ${rawItems} out of ${examTotalItems} items (${requiredExamPct}%) on the Quarterly Exam to reach a ${targetTG}.`;
    } else {
      status = 'UNREACHABLE';
      statusLabel = 'Mathematically Unreachable';
      recommendation = `Target ${targetTG} is unreachable with remaining points (requires ${requiredExamPct}%). Maximum achievable Transmuted Grade this quarter is ${maxAchievableTG} (requires 100% on exam).`;
    }

    return {
      subject,
      targetTG,
      minRequiredIG,
      lockedPoints,
      deficitPoints: +deficitPoints.toFixed(2),
      examTotalItems,
      requiredExamPct,
      requiredExamRawScore: Math.max(0, rawItems),
      maxAchievableIG,
      maxAchievableTG,
      status,
      statusLabel,
      recommendation
    };
  }

  /**
   * Section 5.3: Flexible Assessment Solver (WW Quiz, PT, or QA).
   * Calculates exact raw points needed out of totalItems based on current standing & pacing.
   */
  function solveForAssessment(subjectId, category = 'WW', totalItems = 20, targetTransmutedGrade) {
    const subject = LuminaStore.getSubject(subjectId);
    if (!subject) return null;

    const calc = calculateSubject(subject);
    const profile = LuminaStore.getProfile();
    const targetTG = Number(targetTransmutedGrade) || subject.targetGrade || profile.targetGeneralAverage || 95;
    const minRequiredIG = LuminaDepEd.transmutedToMinInitial(targetTG);

    const cat = (category || 'WW').toUpperCase();
    const items = Number(totalItems) || (cat === 'QA' ? 50 : (cat === 'PT' ? 50 : 20));
    const catWeight = subject.weights[cat.toLowerCase()] || 0.25;

    // Determine active weights and scores of OTHER components
    let otherActiveWeight = 0;
    let otherActiveWeighted = 0;

    if (cat === 'QA') {
      if (calc.hasWW) {
        otherActiveWeight += subject.weights.ww;
        otherActiveWeighted += calc.ww.weighted;
      }
      if (calc.hasPT) {
        otherActiveWeight += subject.weights.pt;
        otherActiveWeighted += calc.pt.weighted;
      }
    } else if (cat === 'PT') {
      if (calc.hasWW) {
        otherActiveWeight += subject.weights.ww;
        otherActiveWeighted += calc.ww.weighted;
      }
      if (calc.hasQA) {
        otherActiveWeight += subject.weights.qa;
        otherActiveWeighted += calc.qa.weighted;
      }
    } else { // WW
      if (calc.hasPT) {
        otherActiveWeight += subject.weights.pt;
        otherActiveWeighted += calc.pt.weighted;
      }
      if (calc.hasQA) {
        otherActiveWeight += subject.weights.qa;
        otherActiveWeighted += calc.qa.weighted;
      }
    }

    const totalActiveWeight = catWeight + otherActiveWeight;
    const neededWeighted = (minRequiredIG * totalActiveWeight) - otherActiveWeighted;
    const neededPct = +(neededWeighted / catWeight).toFixed(2);

    let requiredRawScore = 0;
    let maxAchievableIG = 0;
    let maxAchievableTG = 0;

    if (cat === 'QA') {
      requiredRawScore = Math.ceil((neededPct / 100) * items);
      const maxQAWeighted = 100 * catWeight;
      maxAchievableIG = +((maxQAWeighted + otherActiveWeighted) / totalActiveWeight).toFixed(2);
      maxAchievableTG = LuminaDepEd.initialToTransmuted(maxAchievableIG);
    } else if (cat === 'PT') {
      const currentScore = calc.pt.score;
      const newMax = calc.pt.max + items;
      const neededTotalScore = (neededPct / 100) * newMax;
      requiredRawScore = Math.ceil(neededTotalScore - currentScore);

      const maxPTPct = newMax > 0 ? ((currentScore + items) / newMax) * 100 : 100;
      const maxPTWeighted = maxPTPct * catWeight;
      maxAchievableIG = +((maxPTWeighted + otherActiveWeighted) / totalActiveWeight).toFixed(2);
      maxAchievableTG = LuminaDepEd.initialToTransmuted(maxAchievableIG);
    } else { // WW
      const currentScore = calc.ww.score;
      const newMax = calc.ww.max + items;
      const neededTotalScore = (neededPct / 100) * newMax;
      requiredRawScore = Math.ceil(neededTotalScore - currentScore);

      const maxWWPct = newMax > 0 ? ((currentScore + items) / newMax) * 100 : 100;
      const maxWWWeighted = maxWWPct * catWeight;
      maxAchievableIG = +((maxWWWeighted + otherActiveWeighted) / totalActiveWeight).toFixed(2);
      maxAchievableTG = LuminaDepEd.initialToTransmuted(maxAchievableIG);
    }

    const requiredPercentage = items > 0 ? +((requiredRawScore / items) * 100).toFixed(1) : 0;

    let status = 'HIGH_RIGOR'; // 'GUARANTEED', 'COMFORT', 'HIGH_RIGOR', 'IMPOSSIBLE'
    let statusLabel = '';
    let recommendation = '';

    if (requiredRawScore <= 0) {
      status = 'GUARANTEED';
      statusLabel = 'Target Secured';
      recommendation = `You are already on track for ${targetTG} with your current scores! Even a 0 on this assessment keeps you above target.`;
      requiredRawScore = 0;
    } else if (requiredRawScore <= Math.floor(items * 0.75)) {
      status = 'COMFORT';
      statusLabel = 'Comfort Zone';
      const margin = items - requiredRawScore;
      recommendation = `You need at least ${requiredRawScore} out of ${items} points to stay on track. You can miss up to ${margin} question${margin === 1 ? '' : 's'}.`;
    } else if (requiredRawScore <= items) {
      status = 'HIGH_RIGOR';
      statusLabel = 'Stay Focused';
      recommendation = `You need at least ${requiredRawScore} out of ${items} points to stay on track for ${targetTG}.`;
    } else {
      status = 'IMPOSSIBLE';
      statusLabel = 'Catch-Up Needed';
      recommendation = `Scoring a perfect ${items} out of ${items} yields a grade of ${maxAchievableTG}. You will need extra points on future assessments to reach ${targetTG}.`;
    }

    return {
      subject,
      category: cat,
      targetTG,
      totalItems: items,
      requiredRawScore,
      requiredPct: requiredPercentage,
      requiredPercentage,
      requiredInitialGrade: minRequiredIG,
      currentPaceGrade: calc.transmutedGrade,
      effectiveInitialGrade: calc.effectiveInitialGrade,
      maxAchievableTG,
      status,
      statusLabel,
      recommendation
    };
  }

  /**
   * Live What-If Assessment Simulator for the Interactive Slider.
   * Predicts projected Transmuted Grade and standing based on a hypothetical score.
   */
  function projectAssessmentScore(subjectId, category = 'WW', score = 0, totalItems = 20) {
    const subject = LuminaStore.getSubject(subjectId);
    if (!subject) return null;

    const calc = calculateSubject(subject);
    const cat = (category || 'WW').toUpperCase();
    const items = Number(totalItems) || 20;
    const clampedScore = Math.max(0, Math.min(items, Number(score) || 0));

    let simScore = 0;
    let simMax = 0;
    let simPct = 0;
    let simWeighted = 0;
    let otherWeighted = 0;
    let otherActiveWeight = 0;
    const catWeight = subject.weights[cat.toLowerCase()] || 0.25;

    if (cat === 'QA') {
      simScore = clampedScore;
      simMax = items;
      simPct = items > 0 ? (simScore / simMax) * 100 : 0;
      simWeighted = simPct * catWeight;
      otherWeighted = (calc.hasWW ? calc.ww.weighted : 0) + (calc.hasPT ? calc.pt.weighted : 0);
      otherActiveWeight = (calc.hasWW ? subject.weights.ww : 0) + (calc.hasPT ? subject.weights.pt : 0);
    } else if (cat === 'PT') {
      simScore = calc.pt.score + clampedScore;
      simMax = calc.pt.max + items;
      simPct = simMax > 0 ? (simScore / simMax) * 100 : 0;
      simWeighted = simPct * catWeight;
      otherWeighted = (calc.hasWW ? calc.ww.weighted : 0) + (calc.hasQA ? calc.qa.weighted : 0);
      otherActiveWeight = (calc.hasWW ? subject.weights.ww : 0) + (calc.hasQA ? subject.weights.qa : 0);
    } else { // WW
      simScore = calc.ww.score + clampedScore;
      simMax = calc.ww.max + items;
      simPct = simMax > 0 ? (simScore / simMax) * 100 : 0;
      simWeighted = simPct * catWeight;
      otherWeighted = (calc.hasPT ? calc.pt.weighted : 0) + (calc.hasQA ? calc.qa.weighted : 0);
      otherActiveWeight = (calc.hasPT ? subject.weights.pt : 0) + (calc.hasQA ? subject.weights.qa : 0);
    }

    const totalActiveWeight = catWeight + otherActiveWeight;
    const projectedIG = totalActiveWeight > 0 ? (simWeighted + otherWeighted) / totalActiveWeight : 0;
    const projectedTG = LuminaDepEd.initialToTransmuted(projectedIG);
    const currentTG = calc.transmutedGrade;
    const deltaTG = projectedTG - currentTG;
    const standing = LuminaDepEd.getHonorsTier ? LuminaDepEd.getHonorsTier(projectedTG) : { title: 'Good Standing', color: '#34d399' };
    const targetTG = subject.targetGrade || 95;

    return {
      score: clampedScore,
      totalItems: items,
      scorePct: items > 0 ? Math.round((clampedScore / items) * 100) : 0,
      projectedIG: +projectedIG.toFixed(2),
      projectedTG,
      currentTG,
      deltaTG,
      standingLabel: standing.title,
      standingColor: standing.color,
      targetMet: projectedTG >= targetTG,
      targetTG
    };
  }

  /**
   * Calculate 2-Quarter Semestral Final Grade.
   */
  function calculateSemestralGrade(subjectId) {
    const subject = LuminaStore.getSubject(subjectId);
    if (!subject) return null;

    const q1Assessments = LuminaStore.getAssessments(subjectId, 'Quarter 1');
    const q2Assessments = LuminaStore.getAssessments(subjectId, 'Quarter 2');

    const q1Calc = calculateSubject(subject, q1Assessments);
    const q2Calc = calculateSubject(subject, q2Assessments);

    const hasQ1 = q1Assessments.length > 0;
    const hasQ2 = q2Assessments.length > 0;

    const q1Grade = q1Calc.transmutedGrade;
    const q2Grade = q2Calc.transmutedGrade;

    let semestralFinal = q1Grade;
    if (hasQ1 && hasQ2) {
      semestralFinal = Math.round((q1Grade + q2Grade) / 2);
    } else if (hasQ2 && !hasQ1) {
      semestralFinal = q2Grade;
    }

    return {
      subject,
      q1Grade,
      q2Grade,
      hasQ1,
      hasQ2,
      semestralFinal,
      honorsTier: LuminaDepEd.getHonorsTier(semestralFinal)
    };
  }

  /**
   * Section 4.0: The Bawi Formula (Academic Catch-Up Engine)
   * Formula: Semestral Final = (Q1 + Q2) / 2
   * Required Q2 = (2 * Target) - Q1
   */
  function calculateBawiFormula(subject, customTarget) {
    if (!subject) return null;

    const profile = LuminaStore.getProfile();
    const target = Number(customTarget || subject.targetGrade || profile.targetGeneralAverage || 95);

    const q1Assessments = LuminaStore.getAssessments(subject.id, 'Quarter 1');
    const q2Assessments = LuminaStore.getAssessments(subject.id, 'Quarter 2');

    const q1Calc = calculateSubject(subject, q1Assessments);
    const q2Calc = calculateSubject(subject, q2Assessments);

    const q1Transmuted = q1Calc ? q1Calc.transmutedGrade : 75;
    const q2Transmuted = q2Calc ? q2Calc.transmutedGrade : null;
    const hasQ1Data = q1Assessments.length > 0;
    const hasQ2Data = q2Assessments.length > 0;

    // Required Q2 grade: (2 * Target) - Q1
    const requiredQ2 = (2 * target) - q1Transmuted;

    // Minimum raw percentage needed for required Q2
    let requiredQ2Initial = null;
    if (requiredQ2 >= 60 && requiredQ2 <= 100) {
      requiredQ2Initial = LuminaDepEd.transmutedToMinInitial(requiredQ2);
    }

    let semestralFinal = q1Transmuted;
    if (hasQ1Data && hasQ2Data) {
      semestralFinal = Math.round((q1Transmuted + q2Transmuted) / 2);
    } else if (hasQ2Data && !hasQ1Data) {
      semestralFinal = q2Transmuted;
    }

    let status = 'achievable';
    let headline = '';
    let description = '';
    let badgeClass = 'badge-honors';

    if (requiredQ2 > 100) {
      status = 'unreachable';
      const maxPossibleSemestral = Math.round((q1Transmuted + 100) / 2);
      const deficit = requiredQ2 - 100;
      headline = `Mathematical Stretch (+${deficit} pts needed)`;
      description = `With a Q1 grade of <strong>${q1Transmuted}</strong>, reaching a final semester grade of <strong>${target}</strong> requires a ${requiredQ2} in Q2. Even with a perfect 100 in Q2, the maximum achievable semester grade is <strong>${maxPossibleSemestral}</strong>. Extra-credit projects or high-weight bonus items are required.`;
      badgeClass = 'badge-standing';
    } else if (requiredQ2 <= 75) {
      status = 'locked_in';
      headline = `Target Safely Secured (Passing Q2 needed)`;
      description = `Your Q1 foundation of <strong>${q1Transmuted}</strong> is so solid that achieving the standard DepEd passing grade (75) in Q2 locks in your semester goal of <strong>${target}</strong>.`;
      badgeClass = 'badge-highest-honors';
    } else {
      status = 'achievable';
      headline = `Need ${requiredQ2} in Q2 to Bawi!`;
      description = `To secure your semester target of <strong>${target}</strong> after a Q1 score of <strong>${q1Transmuted}</strong>, you need at least a <strong>${requiredQ2}</strong> (≈${requiredQ2Initial}% raw) in Quarter 2.`;
      badgeClass = 'badge-high-honors';
    }

    return {
      subject,
      target,
      q1Transmuted,
      q2Transmuted,
      hasQ1Data,
      hasQ2Data,
      requiredQ2,
      requiredQ2Initial,
      semestralFinal,
      status,
      headline,
      description,
      badgeClass
    };
  }

  /**
   * Calculate Combined Semestral Average across all active subjects.
   */
  function calculateSemestralSummary() {
    const subjects = LuminaStore.getSubjects();
    if (subjects.length === 0) return null;

    const semestralSubjects = subjects.map(s => calculateSemestralGrade(s.id));
    const totalSemFinal = semestralSubjects.reduce((acc, s) => acc + (s ? s.semestralFinal : 75), 0);
    const semestralAverage = +(totalSemFinal / semestralSubjects.length).toFixed(2);
    const honorsTier = LuminaDepEd.getHonorsTier(semestralAverage);

    return {
      semestralAverage,
      honorsTier,
      subjects: semestralSubjects
    };
  }

  /**
   * Section 4.1: High-Leverage Study Allocator.
   * Examines remaining uncompleted weights across all subjects and ranks
   * where additional effort yields the highest General Average improvement.
   */
  function getHighLeverageRecommendations() {
    const summary = calculateTermSummary();
    const subjects = summary.subjectsCalculated;
    if (subjects.length === 0) return null;

    const insights = [];

    subjects.forEach(calc => {
      const subject = calc.subject;
      const currentTG = calc.transmutedGrade;
      const currentIG = calc.effectiveInitialGrade;
      const qaWeight = subject.weights.qa;

      // If QA is pending, simulate 80% vs 95% on the exam
      const igWith80 = +(calc.lockedPoints + (0.80 * qaWeight * 100)).toFixed(2);
      const tgWith80 = LuminaDepEd.initialToTransmuted(igWith80);

      const igWith95 = +(calc.lockedPoints + (0.95 * qaWeight * 100)).toFixed(2);
      const tgWith95 = LuminaDepEd.initialToTransmuted(igWith95);

      const deltaTG = tgWith95 - tgWith80;
      const gpaImpact = +(deltaTG / subjects.length).toFixed(3);

      insights.push({
        subjectName: subject.name,
        subjectId: subject.id,
        currentTG,
        currentIG,
        qaWeightPct: Math.round(qaWeight * 100),
        deltaTG,
        gpaImpact,
        igWith95,
        tgWith95
      });
    });

    // Sort descending by highest GPA impact
    insights.sort((a, b) => b.gpaImpact - a.gpaImpact);

    const topPick = insights[0];
    const comparisonPick = insights[insights.length - 1];

    let headline = '';
    let detailedMessage = '';

    if (topPick && topPick.gpaImpact > 0) {
      headline = `High Leverage: Prioritize ${topPick.subjectName}`;
      detailedMessage = `Securing 95% on the upcoming ${topPick.subjectName} Quarterly Exam elevates your Transmuted General Average by +${topPick.gpaImpact.toFixed(2)} pts (lifting subject grade from ${topPick.currentTG} to ${topPick.tgWith95}), whereas the same score in ${comparisonPick.subjectName} produces only +${comparisonPick.gpaImpact.toFixed(2)} pts.`;
    } else {
      headline = 'Balanced Term Performance';
      detailedMessage = 'All active subjects have stable momentum. Maintain consistent review across all components to lock in your honors distinction.';
    }

    return {
      headline,
      detailedMessage,
      topPick,
      rankedInsights: insights
    };
  }

  return {
    calculateSubject,
    calculateTermSummary,
    calculateSemestralGrade,
    calculateSemestralSummary,
    calculateBawiFormula,
    solveForExam,
    solveForAssessment,
    projectAssessmentScore,
    getHighLeverageRecommendations
  };
})();
