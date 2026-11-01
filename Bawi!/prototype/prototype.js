/**
 * Bawi! Prototype Core Application Logic
 * Clean, lightweight, self-contained multi-tab prototype controller.
 */

window.BawiProto = (function () {
  'use strict';

  const STORAGE_KEY = 'bawi_canva_prototype_v2';

  const DEFAULT_DATA = {
    profile: {
      name: 'Maria Santos',
      strand: 'STEM',
      gradeLevel: 'Grade 11',
      targetGrade: 95
    },
    subjects: [
      {
        id: 'stem-gen-chem',
        name: 'General Chemistry 1',
        strand: 'STEM',
        classification: 'Specialized',
        weights: { ww: 0.25, pt: 0.45, qa: 0.30 },
        assessments: [
          { id: 'c1', category: 'WW', title: 'Quiz 1: Stoichiometry & Mole Concept', score: 27, max: 30 },
          { id: 'c2', category: 'WW', title: 'Seatwork: Balancing Redox Equations', score: 19, max: 20 },
          { id: 'c3', category: 'PT', title: 'Lab Report: Acid-Base Titration', score: 47, max: 50 },
          { id: 'c4', category: 'PT', title: 'Thermochemistry Infographic Output', score: 48, max: 50 },
          { id: 'c5', category: 'QA', title: 'First Periodic Examination', score: 44, max: 50 }
        ]
      },
      {
        id: 'stem-basic-calc',
        name: 'Basic Calculus',
        strand: 'STEM',
        classification: 'Specialized',
        weights: { ww: 0.25, pt: 0.45, qa: 0.30 },
        assessments: [
          { id: 'bc1', category: 'WW', title: 'Quiz 1: Limits & Continuity', score: 28, max: 30 },
          { id: 'bc2', category: 'WW', title: 'Problem Set: Differentiation Rules', score: 24, max: 25 },
          { id: 'bc3', category: 'PT', title: 'Optimization Real-World Portfolio', score: 48, max: 50 },
          { id: 'bc4', category: 'QA', title: 'First Periodic Examination', score: 45, max: 50 }
        ]
      },
      {
        id: 'stem-gen-bio',
        name: 'General Biology 1',
        strand: 'STEM',
        classification: 'Specialized',
        weights: { ww: 0.25, pt: 0.45, qa: 0.30 },
        assessments: [
          { id: 'gb1', category: 'WW', title: 'Quiz 1: Cell Theory & Organelles', score: 29, max: 30 },
          { id: 'gb2', category: 'PT', title: 'Osmosis & Diffusion Microscopy Lab', score: 49, max: 50 },
          { id: 'gb3', category: 'QA', title: 'First Periodic Examination', score: 47, max: 50 }
        ]
      },
      {
        id: 'core-oral-comm',
        name: 'Oral Communication in Context',
        strand: 'Core',
        classification: 'Core',
        weights: { ww: 0.25, pt: 0.50, qa: 0.25 },
        assessments: [
          { id: 'oc1', category: 'WW', title: 'Quiz 1: Models of Communication', score: 25, max: 25 },
          { id: 'oc2', category: 'PT', title: 'Persuasive Speech Presentation', score: 48, max: 50 },
          { id: 'oc3', category: 'QA', title: 'First Periodic Examination', score: 46, max: 50 }
        ]
      },
      {
        id: 'core-eapp',
        name: 'English for Academic and Professional Purposes',
        strand: 'Applied',
        classification: 'Applied',
        weights: { ww: 0.25, pt: 0.45, qa: 0.30 },
        assessments: [
          { id: 'e1', category: 'WW', title: 'Concept Paper Outline', score: 29, max: 30 },
          { id: 'e2', category: 'PT', title: 'Critical Academic Book Review', score: 49, max: 50 },
          { id: 'e3', category: 'QA', title: 'First Periodic Examination', score: 46, max: 50 }
        ]
      }
    ],
    taskGroups: [
      {
        dateLabel: 'Oct 26',
        badge: 'Overdue',
        badgeClass: 'overdue',
        tasks: [
          { id: 't1', title: 'Practice Limits & Derivatives Problem Set', subject: 'Basic Calculus', category: 'WW', time: '5:00 PM', completed: false }
        ]
      },
      {
        dateLabel: 'Oct 27',
        badge: 'Due Today',
        badgeClass: 'overdue',
        tasks: [
          { id: 't2', title: 'Two-Dimensional Kinematics Vector Analysis', subject: 'General Physics 1', category: 'WW', time: '2:50 PM', completed: false },
          { id: 't3', title: 'Titration Experiment Lab Documentation', subject: 'General Chemistry 1', category: 'PT', time: '11:59 PM', completed: false }
        ]
      },
      {
        dateLabel: 'Upcoming Tasks',
        badge: 'Next Week',
        badgeClass: '',
        tasks: [
          { id: 't4', title: 'Finalize Oral Presentation Slides', subject: 'Oral Communication in Context', category: 'PT', time: '4:00 PM', completed: true }
        ]
      }
    ]
  };

  let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (!state) {
    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveState();
  }

  let activeTab = 'overview';
  let activeSubjectId = state.subjects[0]?.id || '';

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // DepEd Table 4 Transmutation
  const TRANSMUTATION_MAP = [
    { transmuted: 100, min: 99.50 }, { transmuted: 99, min: 98.32 }, { transmuted: 98, min: 97.14 },
    { transmuted: 97, min: 95.96 },  { transmuted: 96, min: 94.78 }, { transmuted: 95, min: 93.60 },
    { transmuted: 94, min: 92.42 },  { transmuted: 93, min: 91.24 }, { transmuted: 92, min: 90.06 },
    { transmuted: 91, min: 88.88 },  { transmuted: 90, min: 87.70 }, { transmuted: 89, min: 86.52 },
    { transmuted: 88, min: 85.34 },  { transmuted: 87, min: 84.16 }, { transmuted: 86, min: 82.98 },
    { transmuted: 85, min: 81.80 },  { transmuted: 84, min: 80.62 }, { transmuted: 83, min: 79.44 },
    { transmuted: 82, min: 78.26 },  { transmuted: 81, min: 77.08 }, { transmuted: 80, min: 75.90 },
    { transmuted: 79, min: 74.72 },  { transmuted: 78, min: 73.54 }, { transmuted: 77, min: 72.36 },
    { transmuted: 76, min: 71.18 },  { transmuted: 75, min: 70.00 }
  ];

  function getTransmutedGrade(initialGrade) {
    if (initialGrade >= 99.50) return 100;
    if (initialGrade < 70.00) {
      if (initialGrade <= 0) return 60;
      return Math.max(60, 60 + Math.round((initialGrade / 70.00) * 14));
    }
    const row = TRANSMUTATION_MAP.find(r => initialGrade >= r.min);
    return row ? row.transmuted : 75;
  }

  function getMinInitialForTransmuted(tg) {
    const row = TRANSMUTATION_MAP.find(r => r.transmuted === tg);
    return row ? row.min : 70.00;
  }

  // Calculate Subject
  function calculateSubjectMetrics(sub) {
    const wwItems = sub.assessments.filter(a => a.category === 'WW');
    const ptItems = sub.assessments.filter(a => a.category === 'PT');
    const qaItems = sub.assessments.filter(a => a.category === 'QA');

    const wwScore = wwItems.reduce((acc, i) => acc + Number(i.score), 0);
    const wwMax = wwItems.reduce((acc, i) => acc + Number(i.max), 0);
    const wwPct = wwMax > 0 ? (wwScore / wwMax) * 100 : 0;
    const wwWS = wwPct * sub.weights.ww;

    const ptScore = ptItems.reduce((acc, i) => acc + Number(i.score), 0);
    const ptMax = ptItems.reduce((acc, i) => acc + Number(i.max), 0);
    const ptPct = ptMax > 0 ? (ptScore / ptMax) * 100 : 0;
    const ptWS = ptPct * sub.weights.pt;

    const qaScore = qaItems.reduce((acc, i) => acc + Number(i.score), 0);
    const qaMax = qaItems.reduce((acc, i) => acc + Number(i.max), 0);
    const qaPct = qaMax > 0 ? (qaScore / qaMax) * 100 : 0;
    const qaWS = qaPct * sub.weights.qa;

    const initialGrade = +(wwWS + ptWS + qaWS).toFixed(2);
    const transmutedGrade = getTransmutedGrade(initialGrade);

    return {
      ww: { score: wwScore, max: wwMax, pct: wwPct, ws: wwWS },
      pt: { score: ptScore, max: ptMax, pct: ptPct, ws: ptWS },
      qa: { score: qaScore, max: qaMax, pct: qaPct, ws: qaWS },
      initialGrade,
      transmutedGrade
    };
  }

  // Calculate Term General Average
  function calculateGeneralAverage() {
    if (state.subjects.length === 0) return { ga: 0, initial: 0 };
    let sumTG = 0;
    let sumIG = 0;

    state.subjects.forEach(s => {
      const m = calculateSubjectMetrics(s);
      sumTG += m.transmutedGrade;
      sumIG += m.initialGrade;
    });

    return {
      ga: +(sumTG / state.subjects.length).toFixed(2),
      initial: +(sumIG / state.subjects.length).toFixed(2)
    };
  }

  // Navigation Tabs
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.proto-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    document.querySelectorAll('.proto-view').forEach(el => {
      el.classList.toggle('active', el.id === `view-${tab}`);
    });
    render();
  }

  // Dropdown Management for Subject Selection
  function toggleSubjectDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('subjectDropdownMenu');
    menu.classList.toggle('open');
  }

  function selectSubject(id) {
    activeSubjectId = id;
    const menu = document.getElementById('subjectDropdownMenu');
    if (menu) menu.classList.remove('open');
    renderSubjectsView();
    runReverseSolver();
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.querySelector('.subject-header-dropdown-wrap');
    const menu = document.getElementById('subjectDropdownMenu');
    if (wrap && !wrap.contains(e.target) && menu) {
      menu.classList.remove('open');
    }
  });

  // Render Engine
  function render() {
    renderSidebar();
    renderOverview();
    renderSubjectsView();
    renderPlanner();
    runReverseSolver();
  }

  function renderSidebar() {
    document.getElementById('sidebarStudentName').textContent = state.profile.name;
    const gradeLevel = state.profile.gradeLevel || 'Grade 11';
    document.getElementById('sidebarStrandText').textContent = `${gradeLevel} • ${state.profile.strand} Track`;
    
    // Count pending tasks across groups
    let pendingCount = 0;
    state.taskGroups.forEach(g => {
      pendingCount += g.tasks.filter(t => !t.completed).length;
    });
    document.getElementById('sidebarTaskCount').textContent = pendingCount;
  }

  function renderOverview() {
    const summary = calculateGeneralAverage();
    document.getElementById('heroGpaNumber').textContent = summary.ga.toFixed(2);
    document.getElementById('heroInitialAverage').textContent = `${summary.initial.toFixed(2)}%`;

    const honorsPill = document.getElementById('heroHonorsBadge');
    if (summary.ga >= 98.00) {
      honorsPill.textContent = 'With Highest Honors';
    } else if (summary.ga >= 95.00) {
      honorsPill.textContent = 'With High Honors';
    } else if (summary.ga >= 90.00) {
      honorsPill.textContent = 'With Honors';
    } else if (summary.ga >= 75.00) {
      honorsPill.textContent = 'Academic Good Standing';
    } else {
      honorsPill.textContent = 'Under Passing Benchmark';
    }

    // Render Subjects Cards Grid (Dashboard)
    const grid = document.getElementById('dashboardSubjectsGrid');
    grid.innerHTML = '';

    state.subjects.forEach(sub => {
      const m = calculateSubjectMetrics(sub);
      const card = document.createElement('div');
      card.className = 'subject-clean-card';
      card.onclick = () => {
        activeSubjectId = sub.id;
        switchTab('subjects');
      };

      card.innerHTML = `
        <div class="subject-card-top">
          <div>
            <div class="subject-card-name">${sub.name}</div>
            <div class="subject-card-meta">${sub.classification} &bull; ${sub.strand}</div>
          </div>
          <div class="subject-card-grade">${m.transmutedGrade}</div>
        </div>
        <div class="subject-card-footer">
          <div class="component-pill-row">
            <span class="pill-ww">WW ${Math.round(sub.weights.ww * 100)}%</span>
            <span class="pill-pt">PT ${Math.round(sub.weights.pt * 100)}%</span>
            <span class="pill-qa">QA ${Math.round(sub.weights.qa * 100)}%</span>
          </div>
          <span style="color: var(--text-muted); font-size: 13px;">View &rarr;</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderSubjectsView() {
    const activeSub = state.subjects.find(s => s.id === activeSubjectId) || state.subjects[0];
    if (!activeSub) return;
    activeSubjectId = activeSub.id;

    // Set title and dropdown options
    document.getElementById('currentSubjectTitleText').textContent = activeSub.name;
    document.getElementById('currentSubjectMeta').textContent = `${activeSub.classification} Subject • ${activeSub.strand} Track`;

    const dropdownMenu = document.getElementById('subjectDropdownMenu');
    dropdownMenu.innerHTML = '';
    state.subjects.forEach(sub => {
      const opt = document.createElement('button');
      opt.className = `subject-dropdown-option ${sub.id === activeSubjectId ? 'active' : ''}`;
      opt.innerHTML = `
        <span>${sub.name}</span>
        <span style="font-family: var(--font-mono); font-size: 13px; color: var(--text-muted);">${sub.strand}</span>
      `;
      opt.onclick = () => selectSubject(sub.id);
      dropdownMenu.appendChild(opt);
    });

    const m = calculateSubjectMetrics(activeSub);
    document.getElementById('currentSubjectGrade').textContent = m.transmutedGrade;

    // Written Works
    renderColumnItems('colList-ww', activeSub.assessments.filter(a => a.category === 'WW'));
    document.getElementById('colScore-ww').textContent = `${m.ww.score} / ${m.ww.max}`;
    document.getElementById('colPct-ww').textContent = `${m.ww.pct.toFixed(1)}%`;
    document.getElementById('colWeight-ww').textContent = `${Math.round(activeSub.weights.ww * 100)}%`;

    // Performance Tasks
    renderColumnItems('colList-pt', activeSub.assessments.filter(a => a.category === 'PT'));
    document.getElementById('colScore-pt').textContent = `${m.pt.score} / ${m.pt.max}`;
    document.getElementById('colPct-pt').textContent = `${m.pt.pct.toFixed(1)}%`;
    document.getElementById('colWeight-pt').textContent = `${Math.round(activeSub.weights.pt * 100)}%`;

    // Quarterly Exam
    renderColumnItems('colList-qa', activeSub.assessments.filter(a => a.category === 'QA'));
    document.getElementById('colScore-qa').textContent = `${m.qa.score} / ${m.qa.max}`;
    document.getElementById('colPct-qa').textContent = `${m.qa.pct.toFixed(1)}%`;
    document.getElementById('colWeight-qa').textContent = `${Math.round(activeSub.weights.qa * 100)}%`;
  }

  function renderColumnItems(containerId, items) {
    const list = document.getElementById(containerId);
    list.innerHTML = '';
    if (items.length === 0) {
      list.innerHTML = `<div style="color:var(--text-faint); font-size:14px; text-align:center; padding:30px 0;">No items recorded</div>`;
      return;
    }
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'assessment-item-card';
      card.innerHTML = `
        <div class="assessment-title">${item.title}</div>
        <div class="assessment-score-readout">${item.score} / ${item.max}</div>
      `;
      list.appendChild(card);
    });
  }

  function renderPlanner() {
    const container = document.getElementById('plannerTasksList');
    container.innerHTML = '';

    state.taskGroups.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'planner-date-group';

      groupEl.innerHTML = `
        <div class="planner-date-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span class="planner-date-title">${group.dateLabel}</span>
          ${group.badge ? `<span class="planner-date-badge ${group.badgeClass}">${group.badge}</span>` : ''}
        </div>
        <div class="planner-group-tasks" id="group_${group.dateLabel.replace(/\s+/g, '_')}"></div>
      `;

      const tasksContainer = groupEl.querySelector('.planner-group-tasks');
      group.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-clean-item';
        item.innerHTML = `
          <div class="task-left">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="BawiProto.toggleTask('${task.id}')">
            <div>
              <div class="task-text" style="${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.title}</div>
              <div class="task-meta">
                <span>${task.subject}</span>
                ${task.time ? `<span class="task-time-pill">${task.time}</span>` : ''}
              </div>
            </div>
          </div>
          <span class="task-pill">${task.category}</span>
        `;
        tasksContainer.appendChild(item);
      });

      container.appendChild(groupEl);
    });
  }

  function toggleTask(id) {
    for (const group of state.taskGroups) {
      const task = group.tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        saveState();
        render();
        break;
      }
    }
  }

  // Reverse Solver
  function runReverseSolver() {
    const sub = state.subjects.find(s => s.id === activeSubjectId);
    if (!sub) return;

    const targetTG = parseInt(document.getElementById('solverTargetSelect').value, 10) || 95;
    const category = document.getElementById('solverCategorySelect').value;
    const items = parseInt(document.getElementById('solverItemsInput').value, 10) || 50;

    const minInitial = getMinInitialForTransmuted(targetTG);

    // Existing components
    const wwItems = sub.assessments.filter(a => a.category === 'WW');
    const ptItems = sub.assessments.filter(a => a.category === 'PT');
    const qaItems = sub.assessments.filter(a => a.category === 'QA');

    let currentWWScore = wwItems.reduce((a, b) => a + Number(b.score), 0);
    let currentWWMax = wwItems.reduce((a, b) => a + Number(b.max), 0);
    let currentPTScore = ptItems.reduce((a, b) => a + Number(b.score), 0);
    let currentPTMax = ptItems.reduce((a, b) => a + Number(b.max), 0);
    let currentQAScore = qaItems.reduce((a, b) => a + Number(b.score), 0);
    let currentQAMax = qaItems.reduce((a, b) => a + Number(b.max), 0);

    let lockedFromOthers = 0;
    if (category === 'QA') {
      const wwPS = currentWWMax > 0 ? (currentWWScore / currentWWMax) * 100 : 0;
      const ptPS = currentPTMax > 0 ? (currentPTScore / currentPTMax) * 100 : 0;
      lockedFromOthers = (wwPS * sub.weights.ww) + (ptPS * sub.weights.pt);
    } else if (category === 'PT') {
      const wwPS = currentWWMax > 0 ? (currentWWScore / currentWWMax) * 100 : 0;
      const qaPS = currentQAMax > 0 ? (currentQAScore / currentQAMax) * 100 : 0;
      lockedFromOthers = (wwPS * sub.weights.ww) + (qaPS * sub.weights.qa);
    } else {
      const ptPS = currentPTMax > 0 ? (currentPTScore / currentPTMax) * 100 : 0;
      const qaPS = currentQAMax > 0 ? (currentQAScore / currentQAMax) * 100 : 0;
      lockedFromOthers = (ptPS * sub.weights.pt) + (qaPS * sub.weights.qa);
    }

    const catWeight = category === 'QA' ? sub.weights.qa : (category === 'PT' ? sub.weights.pt : sub.weights.ww);
    const neededWS = Math.max(0, minInitial - lockedFromOthers);
    const neededPS = neededWS / catWeight;

    let scoreNeeded = 0;
    if (category === 'QA') {
      scoreNeeded = (neededPS / 100) * (currentQAMax + items) - currentQAScore;
    } else if (category === 'PT') {
      scoreNeeded = (neededPS / 100) * (currentPTMax + items) - currentPTScore;
    } else {
      scoreNeeded = (neededPS / 100) * (currentWWMax + items) - currentWWScore;
    }

    scoreNeeded = Math.ceil(scoreNeeded);

    const scoreDisplay = document.getElementById('solverResultScore');
    const descDisplay = document.getElementById('solverResultDesc');

    if (scoreNeeded <= 0) {
      scoreDisplay.textContent = `0 / ${items}`;
      descDisplay.textContent = `Target grade ${targetTG} is already mathematically secured!`;
    } else if (scoreNeeded <= items) {
      scoreDisplay.textContent = `${scoreNeeded} / ${items}`;
      descDisplay.textContent = `Score at least ${scoreNeeded} points (${Math.round((scoreNeeded / items) * 100)}%) on this assessment to secure grade ${targetTG}.`;
    } else {
      scoreDisplay.textContent = `${scoreNeeded} / ${items}`;
      descDisplay.textContent = `Requires ${scoreNeeded} points (exceeds ${items} items). Additional assessments needed.`;
    }
  }

  // Modals Management
  function openModal(id) {
    document.getElementById(id).classList.add('open');
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  function openAddScoreModal(category) {
    document.getElementById('scoreModalCategory').value = category;
    document.getElementById('scoreModalCatTag').textContent = category === 'WW' ? 'Written Work' : (category === 'PT' ? 'Performance Task' : 'Quarterly Exam');
    document.getElementById('scoreModalTitle').value = '';
    document.getElementById('scoreModalScore').value = '';
    document.getElementById('scoreModalMax').value = category === 'QA' ? '50' : '30';
    openModal('modalAddScore');
  }

  function saveScoreFromModal() {
    const sub = state.subjects.find(s => s.id === activeSubjectId);
    if (!sub) return;

    const category = document.getElementById('scoreModalCategory').value;
    const title = document.getElementById('scoreModalTitle').value.trim() || `${category} Assessment`;
    const score = Number(document.getElementById('scoreModalScore').value) || 0;
    const max = Math.max(1, Number(document.getElementById('scoreModalMax').value) || 1);

    sub.assessments.push({
      id: 'score_' + Date.now(),
      category,
      title,
      score,
      max
    });

    saveState();
    closeModal('modalAddScore');
    render();
  }

  function openAddTaskModal() {
    const select = document.getElementById('taskModalSubject');
    select.innerHTML = '';
    state.subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
    document.getElementById('taskModalTitle').value = '';
    openModal('modalAddTask');
  }

  function saveTaskFromModal() {
    const title = document.getElementById('taskModalTitle').value.trim();
    if (!title) return;
    const subject = document.getElementById('taskModalSubject').value;
    const category = document.getElementById('taskModalCategory').value;

    state.taskGroups[0].tasks.unshift({
      id: 'task_' + Date.now(),
      title,
      subject,
      category,
      time: '11:59 PM',
      completed: false
    });

    saveState();
    closeModal('modalAddTask');
    render();
  }

  function openSetupModal() {
    document.getElementById('setupStudentName').value = state.profile.name;
    document.getElementById('setupStrand').value = state.profile.strand;
    if (document.getElementById('setupGradeLevel')) {
      document.getElementById('setupGradeLevel').value = state.profile.gradeLevel || 'Grade 11';
    }
    document.getElementById('setupTargetGrade').value = state.profile.targetGrade;
    openModal('modalSetup');
  }

  function saveSetupModal() {
    state.profile.name = document.getElementById('setupStudentName').value.trim() || 'Student';
    state.profile.strand = document.getElementById('setupStrand').value;
    if (document.getElementById('setupGradeLevel')) {
      state.profile.gradeLevel = document.getElementById('setupGradeLevel').value;
    }
    const targetVal = parseInt(document.getElementById('setupTargetGrade').value, 10);
    state.profile.targetGrade = isNaN(targetVal) ? 95 : Math.min(100, Math.max(75, targetVal));
    saveState();
    closeModal('modalSetup');
    render();
  }

  // DepEd SHS Curriculum Catalog
  const DEPED_CATALOG = [
    { name: 'Oral Communication in Context', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Reading and Writing Skills', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'General Mathematics', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Statistics and Probability', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Earth and Life Science', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Physical Science', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Introduction to Philosophy of the Human Person', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Contemporary Philippine Arts from the Regions', strand: 'Core', weights: { ww: 0.20, pt: 0.60, qa: 0.20 } },
    { name: 'Media and Information Literacy', strand: 'Core', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Pre-Calculus', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Basic Calculus', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Chemistry 1', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Chemistry 2', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Physics 1', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Physics 2', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Biology 1', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'General Biology 2', strand: 'STEM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Applied Economics', strand: 'ABM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Business Ethics and Social Responsibility', strand: 'ABM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Fundamentals of Accountancy, Business & Management 1', strand: 'ABM', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Creative Writing / Malikhaing Pagsulat', strand: 'HUMSS', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Disciplines and Ideas in the Social Sciences', strand: 'HUMSS', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Empowerment Technologies', strand: 'Applied', weights: { ww: 0.25, pt: 0.45, qa: 0.30 } },
    { name: 'Practical Research 1', strand: 'Applied', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } },
    { name: 'Practical Research 2', strand: 'Applied', weights: { ww: 0.25, pt: 0.50, qa: 0.25 } }
  ];

  let selectedCatalogSubject = DEPED_CATALOG[0];

  function openAddSubjectModal() {
    document.getElementById('catalogSearchInput').value = '';
    document.getElementById('catalogTargetGrade').value = '95';
    selectedCatalogSubject = DEPED_CATALOG[0];
    renderCatalogOptions(DEPED_CATALOG);
    openModal('modalAddSubject');
  }

  function filterCatalog(query) {
    const q = (query || '').toLowerCase().trim();
    const filtered = DEPED_CATALOG.filter(s => 
      s.name.toLowerCase().includes(q) || s.strand.toLowerCase().includes(q)
    );
    renderCatalogOptions(filtered);
  }

  function renderCatalogOptions(list) {
    const container = document.getElementById('catalogOptionsContainer');
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); font-size:14px; text-align:center; padding:20px;">No matching subjects found</div>';
      return;
    }

    list.forEach(item => {
      const card = document.createElement('div');
      const isSelected = selectedCatalogSubject && selectedCatalogSubject.name === item.name;
      card.className = `catalog-item-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div>
          <div class="catalog-item-name">${item.name}</div>
          <div class="catalog-item-track">${item.strand} Curriculum</div>
        </div>
        <div class="catalog-item-weights">
          WW ${Math.round(item.weights.ww * 100)}% • PT ${Math.round(item.weights.pt * 100)}% • QA ${Math.round(item.weights.qa * 100)}%
        </div>
      `;
      card.onclick = () => {
        selectedCatalogSubject = item;
        renderCatalogOptions(list);
      };
      container.appendChild(card);
    });
  }

  function saveSubjectFromModal() {
    if (!selectedCatalogSubject) return;

    // Check if already enrolled
    const exists = state.subjects.some(s => s.name === selectedCatalogSubject.name);
    if (exists) {
      alert(`"${selectedCatalogSubject.name}" is already enrolled.`);
      return;
    }

    const newSub = {
      id: 'subj_' + Date.now(),
      name: selectedCatalogSubject.name,
      strand: selectedCatalogSubject.strand,
      classification: selectedCatalogSubject.strand === 'Core' ? 'Core' : 'Specialized',
      weights: selectedCatalogSubject.weights,
      assessments: [
        { id: 'item_w1', category: 'WW', title: 'Written Quiz 1', score: 25, max: 30 },
        { id: 'item_p1', category: 'PT', title: 'Performance Output 1', score: 46, max: 50 },
        { id: 'item_q1', category: 'QA', title: 'Quarterly Examination', score: 45, max: 50 }
      ]
    };

    state.subjects.push(newSub);
    activeSubjectId = newSub.id;
    saveState();
    closeModal('modalAddSubject');
    render();
  }

  // Init
  function init() {
    render();
  }

  return {
    init,
    switchTab,
    toggleSubjectDropdown,
    selectSubject,
    toggleTask,
    runReverseSolver,
    openModal,
    closeModal,
    openAddScoreModal,
    saveScoreFromModal,
    openAddTaskModal,
    saveTaskFromModal,
    openSetupModal,
    saveSetupModal,
    openAddSubjectModal,
    filterCatalog,
    saveSubjectFromModal
  };
})();

window.addEventListener('DOMContentLoaded', BawiProto.init);
