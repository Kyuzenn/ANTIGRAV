/**
 * LUMINA // Local-First Reactive Data Store
 * IndexedDB + LocalStorage dual-layer resilience.
 * Full CRUD, event dispatching, and official DepEd starter presets.
 */

window.LuminaStore = (function () {
  'use strict';

  const STORAGE_KEY = 'lumina_shs_state_v2';
  const listeners = new Set();

  const DEFAULT_PROFILE = {
    studentName: 'Maria Santos',
    gradeLevel: 'Grade 11',
    trackStrand: 'STEM',
    schoolYear: '2026-2027',
    semester: 'Semester 1',
    quarter: 'Quarter 1',
    targetGeneralAverage: 95.00
  };

  const DEFAULT_SUBJECTS = [
    {
      id: 'subj-gen-chem-1',
      name: 'General Chemistry 1',
      classification: 'Specialized',
      strand: 'STEM',
      weights: { ww: 0.35, pt: 0.40, qa: 0.25 },
      targetGrade: 95,
      isCustomWeight: false,
      archived: false,
      quarter: 'Quarter 1'
    },
    {
      id: 'subj-basic-calculus',
      name: 'Basic Calculus',
      classification: 'Specialized',
      strand: 'STEM',
      weights: { ww: 0.35, pt: 0.40, qa: 0.25 },
      targetGrade: 96,
      isCustomWeight: false,
      archived: false,
      quarter: 'Quarter 1'
    },
    {
      id: 'subj-gen-bio-1',
      name: 'General Biology 1',
      classification: 'Specialized',
      strand: 'STEM',
      weights: { ww: 0.35, pt: 0.40, qa: 0.25 },
      targetGrade: 95,
      isCustomWeight: false,
      archived: false,
      quarter: 'Quarter 1'
    },
    {
      id: 'subj-oral-comm',
      name: 'Oral Communication in Context',
      classification: 'Core',
      strand: 'STEM',
      weights: { ww: 0.25, pt: 0.50, qa: 0.25 },
      targetGrade: 94,
      isCustomWeight: false,
      archived: false,
      quarter: 'Quarter 1'
    },
    {
      id: 'subj-eapp',
      name: 'English for Academic and Professional Purposes (EAPP)',
      classification: 'Applied',
      strand: 'STEM',
      weights: { ww: 0.25, pt: 0.50, qa: 0.25 },
      targetGrade: 95,
      isCustomWeight: false,
      archived: false,
      quarter: 'Quarter 1'
    }
  ];

  const DEFAULT_ASSESSMENTS = [
    // General Chemistry 1
    {
      id: 'entry-chem-ww1',
      subjectId: 'subj-gen-chem-1',
      category: 'WW',
      title: 'Quiz 1: Stoichiometry & Mole Concept',
      score: 28,
      max: 30,
      multiplier: 1.0,
      date: '2026-09-12',
      allowBonus: false
    },
    {
      id: 'entry-chem-ww2',
      subjectId: 'subj-gen-chem-1',
      category: 'WW',
      title: 'Problem Set: Gas Laws & Ideal Gases',
      score: 19,
      max: 20,
      multiplier: 1.0,
      date: '2026-09-24',
      allowBonus: false
    },
    {
      id: 'entry-chem-ww3',
      subjectId: 'subj-gen-chem-1',
      category: 'WW',
      title: 'Quiz 2: Intermolecular Forces & Bonding',
      score: 27,
      max: 30,
      multiplier: 1.0,
      date: '2026-10-06',
      allowBonus: false
    },
    {
      id: 'entry-chem-pt1',
      subjectId: 'subj-gen-chem-1',
      category: 'PT',
      title: 'Acid-Base Titration Lab Report',
      score: 48,
      max: 50,
      multiplier: 1.0,
      date: '2026-09-19',
      allowBonus: false
    },
    {
      id: 'entry-chem-pt2',
      subjectId: 'subj-gen-chem-1',
      category: 'PT',
      title: '3D Crystal Lattice Modeling Project',
      score: 47,
      max: 50,
      multiplier: 1.0,
      date: '2026-10-10',
      allowBonus: false
    },

    // Basic Calculus
    {
      id: 'entry-calc-ww1',
      subjectId: 'subj-basic-calculus',
      category: 'WW',
      title: 'Quiz 1: Limits & Continuity',
      score: 29,
      max: 30,
      multiplier: 1.0,
      date: '2026-09-14',
      allowBonus: false
    },
    {
      id: 'entry-calc-ww2',
      subjectId: 'subj-basic-calculus',
      category: 'WW',
      title: 'Quiz 2: Differentiation Chain Rules',
      score: 27,
      max: 30,
      multiplier: 1.0,
      date: '2026-09-28',
      allowBonus: false
    },
    {
      id: 'entry-calc-ww3',
      subjectId: 'subj-basic-calculus',
      category: 'WW',
      title: 'Problem Set: Optimization Problems',
      score: 19,
      max: 20,
      multiplier: 1.0,
      date: '2026-10-08',
      allowBonus: false
    },
    {
      id: 'entry-calc-pt1',
      subjectId: 'subj-basic-calculus',
      category: 'PT',
      title: 'Real-World Optimization Modeling Portfolio',
      score: 49,
      max: 50,
      multiplier: 1.0,
      date: '2026-09-22',
      allowBonus: false
    },
    {
      id: 'entry-calc-pt2',
      subjectId: 'subj-basic-calculus',
      category: 'PT',
      title: 'Desmos Curve Analysis Defense',
      score: 47,
      max: 50,
      multiplier: 1.0,
      date: '2026-10-12',
      allowBonus: false
    },

    // General Biology 1
    {
      id: 'entry-bio-ww1',
      subjectId: 'subj-gen-bio-1',
      category: 'WW',
      title: 'Quiz 1: Cellular Transport Mechanisms',
      score: 29,
      max: 30,
      multiplier: 1.0,
      date: '2026-09-15',
      allowBonus: false
    },
    {
      id: 'entry-bio-ww2',
      subjectId: 'subj-gen-bio-1',
      category: 'WW',
      title: 'Genetics Problem Set: Dihybrid Crosses',
      score: 25,
      max: 25,
      multiplier: 1.0,
      date: '2026-09-29',
      allowBonus: false
    },
    {
      id: 'entry-bio-ww3',
      subjectId: 'subj-gen-bio-1',
      category: 'WW',
      title: 'Quiz 2: Photosynthesis & Cellular Respiration',
      score: 28,
      max: 30,
      multiplier: 1.0,
      date: '2026-10-09',
      allowBonus: false
    },
    {
      id: 'entry-bio-pt1',
      subjectId: 'subj-gen-bio-1',
      category: 'PT',
      title: 'Microscopy Slide Preparation Lab Report',
      score: 48,
      max: 50,
      multiplier: 1.0,
      date: '2026-09-25',
      allowBonus: false
    },
    {
      id: 'entry-bio-pt2',
      subjectId: 'subj-gen-bio-1',
      category: 'PT',
      title: 'Mitosis & Meiosis Stop-Motion Animation',
      score: 50,
      max: 50,
      multiplier: 1.0,
      date: '2026-10-14',
      allowBonus: false
    },

    // Oral Communication in Context
    {
      id: 'entry-oral-ww1',
      subjectId: 'subj-oral-comm',
      category: 'WW',
      title: 'Communication Models & Barriers Quiz',
      score: 24,
      max: 25,
      multiplier: 1.0,
      date: '2026-09-16',
      allowBonus: false
    },
    {
      id: 'entry-oral-ww2',
      subjectId: 'subj-oral-comm',
      category: 'WW',
      title: 'Speech Types Analytical Paper',
      score: 28,
      max: 30,
      multiplier: 1.0,
      date: '2026-10-02',
      allowBonus: false
    },
    {
      id: 'entry-oral-pt1',
      subjectId: 'subj-oral-comm',
      category: 'PT',
      title: 'Extemporaneous Speech Delivery',
      score: 48,
      max: 50,
      multiplier: 1.0,
      date: '2026-09-23',
      allowBonus: false
    },
    {
      id: 'entry-oral-pt2',
      subjectId: 'subj-oral-comm',
      category: 'PT',
      title: 'Simulated Press Conference Defense',
      score: 47,
      max: 50,
      multiplier: 1.0,
      date: '2026-10-11',
      allowBonus: false
    },

    // EAPP
    {
      id: 'entry-eapp-ww1',
      subjectId: 'subj-eapp',
      category: 'WW',
      title: 'Academic Text Structure & Critique',
      score: 29,
      max: 30,
      multiplier: 1.0,
      date: '2026-09-18',
      allowBonus: false
    },
    {
      id: 'entry-eapp-ww2',
      subjectId: 'subj-eapp',
      category: 'WW',
      title: 'Thesis Statement & Outlining Exercise',
      score: 20,
      max: 20,
      multiplier: 1.0,
      date: '2026-10-04',
      allowBonus: false
    },
    {
      id: 'entry-eapp-pt1',
      subjectId: 'subj-eapp',
      category: 'PT',
      title: 'Formal Concept Paper Proposal',
      score: 49,
      max: 50,
      multiplier: 1.0,
      date: '2026-09-27',
      allowBonus: false
    },
    {
      id: 'entry-eapp-pt2',
      subjectId: 'subj-eapp',
      category: 'PT',
      title: 'Synthesis of Literature Matrix',
      score: 47,
      max: 50,
      multiplier: 1.0,
      date: '2026-10-13',
      allowBonus: false
    }
  ];

  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      subjectId: 'subj-basic-calculus',
      title: 'Practice Limits & Derivatives Problem Set',
      category: 'WW',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '17:00',
      completed: false,
      estimatedItems: 20
    },
    {
      id: 'task-2',
      subjectId: 'subj-gen-chem-1',
      title: 'Titration Experiment Lab Documentation',
      category: 'PT',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: '23:59',
      completed: false,
      estimatedItems: 50
    },
    {
      id: 'task-3',
      subjectId: 'subj-general-physics-1',
      title: 'Two-Dimensional Kinematics Vector Analysis',
      category: 'WW',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: '14:30',
      completed: false,
      estimatedItems: 25
    },
    {
      id: 'task-4',
      subjectId: 'subj-oral-comm',
      title: 'Extemporaneous Speech Outline & Practice',
      category: 'PT',
      dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      dueTime: '23:59',
      completed: true,
      estimatedItems: 50
    }
  ];

  let state = {
    profile: JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
    subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
    assessments: JSON.parse(JSON.stringify(DEFAULT_ASSESSMENTS)),
    tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
    activeSubjectId: 'subj-gen-chem-1',
    activeTab: 'overview', // 'overview', 'subjects', 'planner', 'matrix'
    activeQuarter: 'Quarter 1'
  };

  function init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.subjects && parsed.subjects.length > 0) {
          state.profile = Object.assign({}, DEFAULT_PROFILE, parsed.profile || {});
          state.subjects = parsed.subjects;
          state.assessments = parsed.assessments || [];
          state.tasks = parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : JSON.parse(JSON.stringify(DEFAULT_TASKS));
          state.activeSubjectId = parsed.activeSubjectId || (state.subjects[0] ? state.subjects[0].id : null);
          state.activeTab = parsed.activeTab || 'overview';
          state.activeQuarter = parsed.activeQuarter || state.profile.quarter || 'Quarter 1';
        }
      }
    } catch (e) {
      console.warn('LuminaStore: LocalStorage load warning, using defaults.', e);
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile: state.profile,
        subjects: state.subjects,
        assessments: state.assessments,
        tasks: state.tasks,
        activeSubjectId: state.activeSubjectId,
        activeTab: state.activeTab,
        activeQuarter: state.activeQuarter
      }));
    } catch (e) {
      console.warn('LuminaStore: LocalStorage persist warning.', e);
    }
    notify();
  }

  function notify() {
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (e) {
        console.error('LuminaStore listener error:', e);
      }
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getState() {
    return state;
  }

  function getProfile() {
    return state.profile;
  }

  function updateProfile(updates) {
    state.profile = Object.assign({}, state.profile, updates);
    if (updates.quarter) {
      state.activeQuarter = updates.quarter;
    }
    if (updates.targetGeneralAverage) {
      const newTarget = Number(updates.targetGeneralAverage) || 95;
      state.subjects.forEach(s => {
        s.targetGrade = newTarget;
      });
    }
    persist();
  }

  function getActiveTab() {
    return state.activeTab;
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;
    persist();
  }

  function getActiveQuarter() {
    return state.activeQuarter;
  }

  function setActiveQuarter(quarter) {
    state.activeQuarter = quarter;
    state.profile.quarter = quarter;
    persist();
  }

  function getSubjects() {
    return state.subjects.filter(s => !s.archived);
  }

  function getAllSubjects() {
    return state.subjects;
  }

  function getSubject(id) {
    return state.subjects.find(s => s.id === id);
  }

  function getActiveSubject() {
    if (!state.activeSubjectId && state.subjects.length > 0) {
      state.activeSubjectId = state.subjects[0].id;
    }
    return getSubject(state.activeSubjectId);
  }

  function setActiveSubjectId(id) {
    state.activeSubjectId = id;
    persist();
  }

  function addSubject(data) {
    const id = 'subj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newSubject = {
      id,
      name: data.name,
      classification: data.classification || 'Core',
      strand: data.strand || state.profile.trackStrand || 'STEM',
      weights: data.weights || { ww: 0.25, pt: 0.50, qa: 0.25 },
      targetGrade: Number(data.targetGrade) || 95,
      isCustomWeight: !!data.isCustomWeight,
      archived: false,
      quarter: state.activeQuarter
    };
    state.subjects.push(newSubject);
    state.activeSubjectId = id;
    persist();
    return newSubject;
  }

  function updateSubject(id, updates) {
    const idx = state.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      state.subjects[idx] = Object.assign({}, state.subjects[idx], updates);
      persist();
    }
  }

  function deleteSubject(id) {
    state.subjects = state.subjects.filter(s => s.id !== id);
    state.assessments = state.assessments.filter(a => a.subjectId !== id);
    if (state.activeSubjectId === id) {
      state.activeSubjectId = state.subjects[0] ? state.subjects[0].id : null;
    }
    persist();
  }

  function getAssessments(subjectId, quarter) {
    return state.assessments.filter(a => {
      if (a.subjectId !== subjectId) return false;
      if (quarter) {
        return a.quarter === quarter || (!a.quarter && quarter === 'Quarter 1');
      }
      return true;
    });
  }

  function addAssessment(entry) {
    const id = 'entry-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newEntry = {
      id,
      subjectId: entry.subjectId,
      category: entry.category, // 'WW', 'PT', 'QA'
      title: entry.title.trim() || (entry.category === 'QA' ? 'Quarterly Examination' : (entry.category === 'PT' ? 'Performance Task' : 'Activity')),
      score: Number(entry.score) || 0,
      max: Number(entry.max) || 10,
      multiplier: 1.0,
      date: entry.date || new Date().toISOString().split('T')[0],
      quarter: entry.quarter || state.activeQuarter || 'Quarter 1',
      allowBonus: !!entry.allowBonus
    };
    state.assessments.push(newEntry);
    persist();
    return newEntry;
  }

  // Tasks (Planner) Management
  function getTasks(subjectId) {
    if (subjectId) {
      return state.tasks.filter(t => t.subjectId === subjectId);
    }
    return state.tasks;
  }

  function addTask(task) {
    const id = 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newTask = {
      id,
      subjectId: task.subjectId,
      title: task.title.trim() || 'Untitled Task',
      category: task.category || 'WW',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      dueTime: task.dueTime || '23:59',
      completed: !!task.completed,
      estimatedItems: Number(task.estimatedItems) || 20
    };
    state.tasks.push(newTask);
    persist();
    return newTask;
  }

  function updateTask(id, updates) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.tasks[idx] = Object.assign({}, state.tasks[idx], updates);
      persist();
    }
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      persist();
      return task;
    }
    return null;
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    persist();
  }

  function updateAssessment(id, updates) {
    const idx = state.assessments.findIndex(a => a.id === id);
    if (idx !== -1) {
      state.assessments[idx] = Object.assign({}, state.assessments[idx], updates);
      persist();
    }
  }

  function deleteAssessment(id) {
    state.assessments = state.assessments.filter(a => a.id !== id);
    persist();
  }

  function resetToDemo() {
    state.profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    state.subjects = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
    state.assessments = JSON.parse(JSON.stringify(DEFAULT_ASSESSMENTS));
    state.activeSubjectId = 'subj-gen-chem-1';
    state.activeTab = 'overview';
    state.activeQuarter = 'Quarter 1';
    persist();
  }

  function exportJSON() {
    return JSON.stringify({
      schema: 'LUMINA_SHS_V2',
      exportDate: new Date().toISOString(),
      profile: state.profile,
      subjects: state.subjects,
      assessments: state.assessments
    }, null, 2);
  }

  function importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.subjects || !Array.isArray(data.subjects)) {
        throw new Error('Invalid format: missing subjects array.');
      }
      state.profile = Object.assign({}, DEFAULT_PROFILE, data.profile || {});
      state.subjects = data.subjects;
      state.assessments = data.assessments || [];
      state.activeSubjectId = state.subjects[0] ? state.subjects[0].id : null;
      persist();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Initialize immediately
  init();

  return {
    getState,
    getProfile,
    updateProfile,
    getActiveTab,
    setActiveTab,
    getActiveQuarter,
    setActiveQuarter,
    getSubjects,
    getAllSubjects,
    getSubject,
    getActiveSubject,
    setActiveSubjectId,
    addSubject,
    updateSubject,
    deleteSubject,
    getAssessments,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    getTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    resetToDemo,
    exportJSON,
    importJSON,
    subscribe
  };
})();
