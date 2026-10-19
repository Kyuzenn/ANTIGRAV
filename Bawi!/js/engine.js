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

    const subAssessments = assessments || LuminaStore.getAssessments(subject.id);
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
    const targetGrade = subject.targetGrade || 95;
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
    solveForExam,
    getHighLeverageRecommendations
  };
})();
