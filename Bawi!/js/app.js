/**
 * LUMINA // Core Application Controller & UI Coordinator
 * Handles view routing, dynamic breadcrumbs, keyboard shortcuts,
 * modal interactions, Command Palette (⌘K), live rendering, and export.
 */

window.LuminaApp = (function () {
  'use strict';

  // Cached DOM Elements
  const els = {};

  function cacheElements() {
    els.appShell = document.getElementById('appShell');
    els.navPillContainer = document.getElementById('navPillContainer');
    els.navPillIndicator = document.getElementById('navPillIndicator');
    els.navTabs = document.querySelectorAll('.nav-tab-btn');
    els.sidebarNavBtns = document.querySelectorAll('.sidebar-nav-btn');
    els.mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    els.tabViews = document.querySelectorAll('.tab-view');
    els.themeToggleBtn = document.getElementById('themeToggleBtn');
    els.audioToggleBtn = document.getElementById('audioToggleBtn');
    els.cmdKTrigger = document.getElementById('cmdKTrigger');
    els.cmdPaletteModal = document.getElementById('cmdPaletteModal');
    els.cmdSearchInput = document.getElementById('cmdSearchInput');
    els.cmdResultsList = document.getElementById('cmdResultsList');
    els.semesterBadge = document.getElementById('semesterBadge');
    els.strandBadge = document.getElementById('strandBadge');
    els.targetAverageBadge = document.getElementById('targetAverageBadge');

    // Sidebar Elements
    els.appSidebar = document.getElementById('appSidebar');
    els.sidebarSemesterBadge = document.getElementById('sidebarSemesterBadge');
    els.sidebarProfileCard = document.getElementById('sidebarProfileCard');
    els.sidebarStudentName = document.getElementById('sidebarStudentName');
    els.sidebarStrandText = document.getElementById('sidebarStrandText');
    els.sidebarTargetPill = document.getElementById('sidebarTargetPill');
    els.sidebarTaskCount = document.getElementById('sidebarTaskCount');
    els.sidebarCmdKTrigger = document.getElementById('sidebarCmdKTrigger');
    els.sidebarAudioToggleBtn = document.getElementById('sidebarAudioToggleBtn');
    els.sidebarThemeToggleBtn = document.getElementById('sidebarThemeToggleBtn');

    // Modals
    els.addSubjectModal = document.getElementById('addSubjectModal');
    els.logScoreModal = document.getElementById('logScoreModal');
    els.addTaskModal = document.getElementById('addTaskModal');
    els.subjectSettingsModal = document.getElementById('subjectSettingsModal');
    els.profileModal = document.getElementById('profileModal');
    els.gradeSlipModal = document.getElementById('gradeSlipModal');
    els.toastContainer = document.getElementById('toastContainer');
  }

  function init() {
    cacheElements();
    setupEventListeners();
    setupKeyboardShortcuts();
    applyThemeFromStorage();
    updateAudioButtonState();

    // Subscribe to store updates
    LuminaStore.subscribe(() => {
      renderCurrentView();
      renderGlobalHeaderBadges();
    });

    // Initial render
    const activeTab = LuminaStore.getActiveTab() || 'overview';
    switchTab(activeTab, false);
    renderGlobalHeaderBadges();
  }

  // ==========================================================================
  // Navigation & Routing
  // ==========================================================================

  function switchTab(tabName, updateStore = true) {
    if (updateStore) {
      LuminaStore.setActiveTab(tabName);
    }

    // Update active tab buttons (header pill if present)
    els.navTabs.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isTarget);
      if (isTarget) {
        positionPillIndicator(btn);
      }
    });

    // Update desktop sidebar buttons
    els.sidebarNavBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update mobile nav buttons
    els.mobileNavBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab view visibility
    els.tabViews.forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabName}`);
    });

    // Render corresponding view
    renderCurrentView(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function positionPillIndicator(activeBtn) {
    if (!els.navPillIndicator || !activeBtn || !els.navPillContainer) return;
    const containerRect = els.navPillContainer.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const left = btnRect.left - containerRect.left;
    const width = btnRect.width;

    els.navPillIndicator.style.transform = `translateX(${left}px)`;
    els.navPillIndicator.style.width = `${width}px`;
  }

  function navigateToSubject(subjectId) {
    LuminaStore.setActiveSubjectId(subjectId);
    switchTab('subject-view');
  }

  function cycleSubject(direction) {
    const subjects = LuminaStore.getSubjects();
    if (subjects.length <= 1) return;
    const currentSubj = LuminaStore.getActiveSubject();
    const currentIndex = subjects.findIndex(s => s.id === (currentSubj ? currentSubj.id : ''));
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = subjects.length - 1;
    if (nextIndex >= subjects.length) nextIndex = 0;
    navigateToSubject(subjects[nextIndex].id);
    showToast(`Switched to ${subjects[nextIndex].name}`);
  }

  // ==========================================================================
  // View Renderers
  // ==========================================================================

  function renderCurrentView(tabName) {
    const currentTab = tabName || LuminaStore.getActiveTab();
    switch (currentTab) {
      case 'overview':
        renderDashboard();
        break;
      case 'pipeline':
        renderPipeline();
        break;
      case 'planner':
        renderPlanner();
        break;
      case 'subject-view':
        renderSubjectDeepDive();
        break;
      case 'matrix':
        renderMatrix();
        break;
    }
  }

  function renderGlobalHeaderBadges() {
    const profile = LuminaStore.getProfile();
    const termText = `${profile.semester} • ${LuminaStore.getActiveQuarter()}`;
    const shortTermText = `Sem ${profile.semester.includes('2') ? '2' : '1'} • Q${LuminaStore.getActiveQuarter().includes('2') ? '2' : '1'}`;

    if (els.semesterBadge) els.semesterBadge.textContent = termText;
    if (els.sidebarSemesterBadge) els.sidebarSemesterBadge.textContent = shortTermText;

    if (els.strandBadge) els.strandBadge.innerHTML = `<span class="dot"></span> ${profile.trackStrand} Track`;
    if (els.sidebarStrandText) els.sidebarStrandText.textContent = `${profile.trackStrand} Track`;
    if (els.sidebarStudentName) els.sidebarStudentName.textContent = profile.studentName || 'Student Profile';

    const targetVal = Number(profile.targetGeneralAverage).toFixed(2);
    const targetFormatted = `Target: ${targetVal}`;
    if (els.targetAverageBadge) els.targetAverageBadge.textContent = targetFormatted;
    if (els.sidebarTargetPill) els.sidebarTargetPill.textContent = targetFormatted;

    // Update pending tasks badge count
    const pendingTasks = LuminaStore.getTasks().filter(t => !t.completed).length;
    if (els.sidebarTaskCount) {
      els.sidebarTaskCount.textContent = pendingTasks;
      els.sidebarTaskCount.style.display = pendingTasks > 0 ? 'inline-block' : 'none';
    }
  }

  // --------------------------------------------------------------------------
  // Tab 1: Executive Analytics Dashboard
  // --------------------------------------------------------------------------

  function renderDashboard() {
    const summary = LuminaEngine.calculateTermSummary();
    const container = document.getElementById('tab-overview');
    if (!container) return;

    const gpaDisplay = document.getElementById('heroTransmutedGPA');
    const igDisplay = document.getElementById('heroInitialAverage');
    const honorsBadge = document.getElementById('heroHonorsBadge');
    const proximityMeter = document.getElementById('proximityMeterContent');
    const leverageCard = document.getElementById('leverageAllocatorContent');
    const subjectsGrid = document.getElementById('dashboardSubjectsGrid');

    // Rolling animation for general average
    if (gpaDisplay) {
      animateRollingNumber(gpaDisplay, summary.transmutedGeneralAverage);
    }
    if (igDisplay) {
      igDisplay.textContent = `${summary.unweightedInitialAverage.toFixed(2)}%`;
    }

    // Honors Distinction Badge
    if (honorsBadge) {
      const tier = summary.honorsTier;
      honorsBadge.className = `honors-badge-pill ${tier.badgeClass}`;
      honorsBadge.innerHTML = `
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${tier.color}; box-shadow:0 0 8px ${tier.glow};"></span>
        <span>${tier.title}</span>
      `;
    }

    // Honors Proximity Delta Meter
    if (proximityMeter) {
      const tier = summary.honorsTier;
      if (tier.nextTier) {
        const targetThreshold = tier.nextTier === 'With Highest Honors' ? 98.00 : (tier.nextTier === 'With High Honors' ? 95.00 : 90.00);
        const currentAvg = summary.transmutedGeneralAverage;
        const base = tier.nextTier === 'With Highest Honors' ? 95.00 : (tier.nextTier === 'With High Honors' ? 90.00 : 75.00);
        const progressPct = Math.min(100, Math.max(0, ((currentAvg - base) / (targetThreshold - base)) * 100));

        proximityMeter.innerHTML = `
          <div class="proximity-delta-readout">
            <strong>+${tier.deltaNeeded.toFixed(2)} pts</strong> needed to cross into <strong>${tier.nextTier}</strong>.
          </div>
          <div class="gauge-track">
            <div class="gauge-fill" style="width: ${progressPct}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-top:8px; font-family:var(--font-mono);">
            <span>Current: ${currentAvg.toFixed(2)}</span>
            <span>Target: ${targetThreshold.toFixed(2)}</span>
          </div>
        `;
      } else {
        proximityMeter.innerHTML = `
          <div class="proximity-delta-readout">
            <strong style="color:var(--status-opal-1);">Pinnacle Tier Reached!</strong>
            Currently holding the highest DepEd academic distinction with a General Average of ${summary.transmutedGeneralAverage.toFixed(2)}.
          </div>
          <div class="gauge-track">
            <div class="gauge-fill" style="width: 100%; background: linear-gradient(90deg, #38bdf8, #c084fc, #f472b6);"></div>
          </div>
        `;
      }
    }

    // High-Leverage Study Allocator
    if (leverageCard) {
      const allocator = LuminaEngine.getHighLeverageRecommendations();
      if (allocator) {
        leverageCard.innerHTML = `
          <div class="leverage-header">
            <div class="leverage-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              ${allocator.headline}
            </div>
            <button class="btn-ghost" style="font-size:11px; padding:3px 10px;" onclick="LuminaApp.navigateToSubject('${allocator.topPick ? allocator.topPick.subjectId : ''}')">
              Open Workspace →
            </button>
          </div>
          <div class="leverage-desc">${allocator.detailedMessage}</div>
        `;
      }
    }

    // Subject Health Grid
    if (subjectsGrid) {
      subjectsGrid.innerHTML = '';
      summary.subjectsCalculated.forEach(calc => {
        const card = document.createElement('div');
        card.className = 'glass-card interactive mini-subject-card';
        card.onclick = () => navigateToSubject(calc.subject.id);

        const sparklineSvg = renderSparklineSvg(calc.sparkline);

        card.innerHTML = `
          <div class="mini-card-top">
            <div>
              <div class="mini-subject-title">${calc.subject.name}</div>
              <div class="mini-subject-strand">${calc.subject.classification} • ${calc.subject.strand}</div>
            </div>
            <div class="mini-subject-grade mono">${calc.transmutedGrade}</div>
          </div>
          <div class="mini-sparkline-box">
            ${sparklineSvg}
          </div>
          <div class="mini-card-bottom">
            <span>Progress: <strong class="mono">${calc.completedPercentage}%</strong></span>
            <span class="mono">${calc.hasQA ? 'Exam Logged' : 'Exam Pending'}</span>
          </div>
        `;
        subjectsGrid.appendChild(card);
      });
    }
  }

  function renderSparklineSvg(points) {
    if (!points || points.length < 2) return '';
    const width = 240;
    const height = 28;
    const min = Math.min(...points, 75);
    const max = Math.max(...points, 100);
    const range = Math.max(1, max - min);

    const step = width / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const pathD = `M ${coords.join(' L ')}`;
    return `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <path d="${pathD}" fill="none" stroke="var(--status-emerald)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${coords.map(coord => {
          const [cx, cy] = coord.split(',');
          return `<circle cx="${cx}" cy="${cy}" r="2" fill="var(--status-emerald)"/>`;
        }).join('')}
      </svg>
    `;
  }

  // --------------------------------------------------------------------------
  // Tab 2: The Pipeline (Subjects Hub & Management)
  // --------------------------------------------------------------------------

  let currentPipelineFilter = 'all';

  function renderPipeline() {
    const subjects = LuminaStore.getSubjects();
    const grid = document.getElementById('pipelineSubjectsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = subjects.filter(s => {
      if (currentPipelineFilter === 'all') return true;
      return s.classification.toLowerCase() === currentPipelineFilter.toLowerCase();
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding:48px; text-align:center; color:var(--text-secondary);" class="glass-card">
          <p style="margin-bottom:12px;">No subjects found under "${currentPipelineFilter}".</p>
          <button class="btn-primary" onclick="LuminaApp.openAddSubjectModal()">+ Add New Subject</button>
        </div>
      `;
      return;
    }

    filtered.forEach(subject => {
      const calc = LuminaEngine.calculateSubject(subject);
      const card = document.createElement('div');
      const isPriority = calc.transmutedGrade < subject.targetGrade;

      card.className = `glass-card interactive pipeline-subject-card ${isPriority ? 'priority-focus' : ''}`;
      card.onclick = (e) => {
        if (e.target.closest('.card-action-menu')) return;
        navigateToSubject(subject.id);
      };

      const wwWidth = Math.round(subject.weights.ww * 100);
      const ptWidth = Math.round(subject.weights.pt * 100);
      const qaWidth = Math.round(subject.weights.qa * 100);

      const targetMet = calc.transmutedGrade >= subject.targetGrade;
      const statusPillClass = targetMet ? 'met' : 'pending';
      const statusPillText = targetMet
        ? `Target Met (${calc.transmutedGrade}/${subject.targetGrade})`
        : `Priority Focus (-${calc.deficitIG} pts)`;

      const semCalc = LuminaEngine.calculateSemestralGrade(subject.id);
      const semGradeDisplay = semCalc ? `<span class="category-tag" title="Semestral Average (${LuminaStore.getProfile().semester})">Sem: ${semCalc.finalGrade}</span>` : '';

      card.innerHTML = `
        <div class="pipeline-card-header">
          <div>
            <div class="pipeline-subject-title">${subject.name}</div>
            <div class="pipeline-meta-row">
              <span class="category-tag">${subject.classification}</span>
              <span class="category-tag">${subject.strand}</span>
              ${semGradeDisplay}
            </div>
          </div>
          <div class="card-action-menu">
            <button class="icon-btn" title="Subject Options" onclick="event.stopPropagation(); LuminaApp.openSubjectSettings('${subject.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </div>

        <!-- Tripartite Weight Bar -->
        <div class="tripartite-bar">
          <div class="tripartite-segment ww" style="width: ${wwWidth}%;" title="Written Works: ${wwWidth}%"></div>
          <div class="tripartite-segment pt" style="width: ${ptWidth}%;" title="Performance Tasks: ${ptWidth}%"></div>
          <div class="tripartite-segment qa" style="width: ${qaWidth}%;" title="Quarterly Exam: ${qaWidth}%"></div>
        </div>

        <div class="tripartite-labels">
          <span><span class="indicator ww"></span>WW ${wwWidth}%</span>
          <span><span class="indicator pt"></span>PT ${ptWidth}%</span>
          <span><span class="indicator qa"></span>QA ${qaWidth}%</span>
        </div>

        <div class="pipeline-metrics-row">
          <div class="pipeline-tg-box">
            <div class="pipeline-tg-number">${calc.transmutedGrade}</div>
            <div class="pipeline-raw-ig">Raw: ${calc.effectiveInitialGrade}</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            ${isPriority ? `<div class="priority-focus-badge">⚡ Priority Focus (-${calc.deficitIG} pts)</div>` : ''}
            <div class="target-status-pill ${statusPillClass}">
              <span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:currentColor;"></span>
              ${statusPillText}
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function setPipelineFilter(filter) {
    currentPipelineFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-filter') === filter);
    });
    renderPipeline();
  }

  // --------------------------------------------------------------------------
  // Tab 3: Dynamic Subject Deep-Dive (Tri-Pane Gradebook)
  // --------------------------------------------------------------------------

  function renderSubjectDeepDive() {
    const subject = LuminaStore.getActiveSubject();
    const container = document.getElementById('tab-subject-view');
    if (!container || !subject) return;

    const calc = LuminaEngine.calculateSubject(subject);
    const assessments = LuminaStore.getAssessments(subject.id);

    // Subject Breadcrumb & Title
    const breadcrumbTitle = document.getElementById('subjBreadcrumbTitle');
    const headerTitle = document.getElementById('subjHeaderTitle');
    const statsBar = document.getElementById('subjStatsBar');

    if (breadcrumbTitle) breadcrumbTitle.textContent = subject.name;
    if (headerTitle) headerTitle.textContent = subject.name;

    if (statsBar) {
      statsBar.innerHTML = `
        <div class="stat-item">
          <span class="label">Transmuted Grade</span>
          <span class="val" style="color:var(--status-emerald);">${calc.transmutedGrade}</span>
        </div>
        <div class="stat-item">
          <span class="label">Initial Grade</span>
          <span class="val">Raw: ${calc.effectiveInitialGrade}</span>
        </div>
        <div class="stat-item">
          <span class="label">Target Transmuted</span>
          <span class="val">${subject.targetGrade || 95}</span>
        </div>
        <div class="stat-item">
          <span class="label">Weight Finalized</span>
          <span class="val">${calc.completedPercentage}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Total Entries</span>
          <span class="val">${assessments.length}</span>
        </div>
      `;
    }

    // Populate Column 1: Written Works (WW)
    renderGradebookColumn('ww', calc.ww, assessments.filter(a => a.category === 'WW'), subject);

    // Populate Column 2: Performance Tasks (PT)
    renderGradebookColumn('pt', calc.pt, assessments.filter(a => a.category === 'PT'), subject);

    // Populate Column 3: Quarterly Exam (QA)
    renderGradebookColumn('qa', calc.qa, assessments.filter(a => a.category === 'QA'), subject);

    // Render interactive embedded simulator at the bottom
    renderEmbeddedSimulator(subject);
  }

  function renderGradebookColumn(categoryKey, compCalc, items, subject) {
    const colScore = document.getElementById(`colScore-${categoryKey}`);
    const colPct = document.getElementById(`colPct-${categoryKey}`);
    const colWeight = document.getElementById(`colWeight-${categoryKey}`);
    const colList = document.getElementById(`colList-${categoryKey}`);

    if (colWeight) colWeight.textContent = compCalc.weightLabel;
    if (colScore) colScore.innerHTML = `${compCalc.score} <span>/ ${compCalc.max}</span>`;
    if (colPct) colPct.textContent = `${compCalc.percentage.toFixed(1)}%`;

    if (colList) {
      colList.innerHTML = '';
      if (items.length === 0) {
        colList.innerHTML = `
          <div class="entry-empty-state">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" style="margin-bottom:8px; opacity:0.5;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            No entries recorded yet.<br>Click "+ Log" above to record.
          </div>
        `;
        return;
      }

      items.forEach(item => {
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card';
        const pct = item.max > 0 ? ((item.score / item.max) * 100).toFixed(1) : 0;

        entryCard.innerHTML = `
          <div class="entry-card-header">
            <div class="entry-title">${item.title}</div>
            <button class="entry-delete-btn" title="Delete Entry" onclick="LuminaApp.deleteAssessmentEntry('${item.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="entry-card-meta">
            <span class="entry-date">${item.date || 'Recent'}</span>
            <span class="entry-score-readout">${item.score} / ${item.max} (${pct}%)</span>
          </div>
        `;
        colList.appendChild(entryCard);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Tab 4: Academic Action Planner (Tasks & Study Tracker)
  // --------------------------------------------------------------------------

  let currentTaskFilter = 'all';

  function setTaskFilter(filter) {
    currentTaskFilter = filter;
    document.querySelectorAll('[data-task-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-task-filter') === filter);
    });
    renderPlanner();
  }

  function renderPlanner() {
    const container = document.getElementById('plannerTaskList');
    if (!container) return;

    const tasks = LuminaStore.getTasks();
    const subjects = LuminaStore.getSubjects();
    const subjectMap = new Map(subjects.map(s => [s.id, s]));

    let filtered = tasks;
    if (currentTaskFilter === 'pending') {
      filtered = tasks.filter(t => !t.completed);
    } else if (currentTaskFilter === 'completed') {
      filtered = tasks.filter(t => t.completed);
    } else if (currentTaskFilter === 'high-leverage') {
      filtered = tasks.filter(t => t.category === 'PT' || t.category === 'QA');
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding:48px 20px; text-align:center; color:var(--text-secondary);" class="glass-card">
          <p style="margin-bottom:12px;">No tasks found under "${currentTaskFilter}".</p>
          <button class="btn-primary" onclick="LuminaApp.openAddTaskModal()">+ Add New Task</button>
        </div>
      `;
      return;
    }

    filtered.forEach(task => {
      const subject = subjectMap.get(task.subjectId) || { name: 'Unknown Subject', classification: 'General' };
      const isHighLeverage = task.category === 'PT' || task.category === 'QA';
      const catLabel = task.category === 'WW' ? 'Written Work' : (task.category === 'PT' ? 'Performance Task' : 'Quarterly Exam');

      const itemEl = document.createElement('div');
      itemEl.className = `planner-task-item ${task.completed ? 'completed' : ''}`;

      itemEl.innerHTML = `
        <div class="planner-task-left">
          <input type="checkbox" class="planner-task-checkbox" ${task.completed ? 'checked' : ''} onchange="LuminaApp.toggleTaskItem('${task.id}')">
          <div>
            <div class="planner-task-title">${task.title}</div>
            <div class="planner-task-meta">
              <span class="category-tag">${subject.name}</span>
              <span class="category-tag">${catLabel}</span>
              ${isHighLeverage ? '<span class="planner-leverage-tag">⚡ High Leverage</span>' : ''}
              ${task.dueDate ? `<span style="color:var(--text-secondary); font-family:var(--font-mono); font-size:11px;">Due: ${task.dueDate}</span>` : ''}
              ${task.estimatedItems ? `<span style="color:var(--text-tertiary); font-family:var(--font-mono); font-size:11px;">(${task.estimatedItems} items)</span>` : ''}
            </div>
          </div>
        </div>
        <div class="planner-task-actions">
          ${!task.completed ? `
            <button class="btn-primary" style="font-size:11px; padding:4px 10px;" onclick="LuminaApp.logScoreFromTask('${task.id}')">
              + Log Score
            </button>
          ` : ''}
          <button class="icon-btn" title="Delete Task" onclick="LuminaApp.deleteTaskItem('${task.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      `;
      container.appendChild(itemEl);
    });
  }

  function openAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    const subjSelect = document.getElementById('taskInputSubject');
    const titleInput = document.getElementById('taskInputTitle');
    const dateInput = document.getElementById('taskInputDueDate');
    const itemsInput = document.getElementById('taskInputItems');

    if (titleInput) titleInput.value = '';
    if (dateInput) dateInput.value = '';
    if (itemsInput) itemsInput.value = '20';

    if (subjSelect) {
      const subjects = LuminaStore.getSubjects();
      const activeSubj = LuminaStore.getActiveSubject();
      subjSelect.innerHTML = subjects.map(s => `
        <option value="${s.id}" ${activeSubj && activeSubj.id === s.id ? 'selected' : ''}>${s.name}</option>
      `).join('');
    }

    openModal(modal);
  }

  function saveTaskFromModal() {
    const titleInput = document.getElementById('taskInputTitle');
    const subjSelect = document.getElementById('taskInputSubject');
    const catSelect = document.getElementById('taskInputCategory');
    const dateInput = document.getElementById('taskInputDueDate');
    const itemsInput = document.getElementById('taskInputItems');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      alert('Please enter a task title or description.');
      return;
    }

    const subjectId = subjSelect ? subjSelect.value : '';
    const category = catSelect ? catSelect.value : 'WW';
    const dueDate = dateInput ? dateInput.value : '';
    const estimatedItems = Number(itemsInput ? itemsInput.value : 20) || 20;

    LuminaStore.addTask({
      title,
      subjectId,
      category,
      dueDate,
      estimatedItems
    });

    closeModal(document.getElementById('addTaskModal'));
    showToast('Academic task added');
    renderPlanner();
    renderGlobalHeaderBadges();
  }

  function toggleTaskItem(taskId) {
    LuminaStore.toggleTask(taskId);
    renderPlanner();
    renderGlobalHeaderBadges();
  }

  function deleteTaskItem(taskId) {
    LuminaStore.deleteTask(taskId);
    renderPlanner();
    renderGlobalHeaderBadges();
    showToast('Task removed');
  }

  function logScoreFromTask(taskId) {
    const task = LuminaStore.getTasks().find(t => t.id === taskId);
    if (!task) return;

    LuminaStore.setActiveSubjectId(task.subjectId);
    openLogScoreModal(task.category, {
      title: task.title,
      max: task.estimatedItems || 20
    });
  }

  // --------------------------------------------------------------------------
  // Embedded Reverse-Solver Target Simulator (Inside Subject Gradebook)
  // --------------------------------------------------------------------------

  let embeddedSimCategory = 'WW';
  let embeddedSimItems = 20;
  let embeddedSimTarget = 95;
  let embeddedSimLiveScore = null;

  function setEmbeddedSimCategory(cat) {
    embeddedSimCategory = cat;
    const label = document.getElementById('embeddedSimTotalItemsLabel');
    const itemsInput = document.getElementById('embeddedSimTotalItems');
    if (cat === 'WW') {
      if (label) label.textContent = 'Quiz Total Items';
      if (itemsInput && !itemsInput.dataset.userEdited) itemsInput.value = '20';
    } else if (cat === 'PT') {
      if (label) label.textContent = 'Performance Task Max Score';
      if (itemsInput && !itemsInput.dataset.userEdited) itemsInput.value = '50';
    } else if (cat === 'QA') {
      if (label) label.textContent = 'Quarterly Exam Total Items';
      if (itemsInput && !itemsInput.dataset.userEdited) itemsInput.value = '50';
    }

    const currentItems = Number(itemsInput ? itemsInput.value : embeddedSimItems) || 20;
    document.querySelectorAll('#embeddedSimItemPresets .sim-preset-chip').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-items')) === currentItems);
    });

    document.querySelectorAll('#embeddedSimCategoryGroup .sim-type-card, #embeddedSimCategoryGroup .log-category-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });

    embeddedSimLiveScore = null;
    const subject = LuminaStore.getActiveSubject();
    if (subject) renderEmbeddedSimulator(subject);
  }

  function setEmbeddedSimTarget(targetVal) {
    embeddedSimTarget = Number(targetVal) || 95;
    const customInput = document.getElementById('embeddedSimCustomTarget');
    if (customInput) customInput.value = embeddedSimTarget;

    document.querySelectorAll('#embeddedSimPresetChips .sim-preset-chip').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-target')) === embeddedSimTarget);
    });

    const subject = LuminaStore.getActiveSubject();
    if (subject) renderEmbeddedSimulator(subject);
  }

  function setEmbeddedSimItems(items) {
    embeddedSimItems = Number(items) || 20;
    const itemsInput = document.getElementById('embeddedSimTotalItems');
    if (itemsInput) {
      itemsInput.value = embeddedSimItems;
      itemsInput.dataset.userEdited = 'true';
    }

    document.querySelectorAll('#embeddedSimItemPresets .sim-preset-chip').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-items')) === embeddedSimItems);
    });

    embeddedSimLiveScore = null;
    const subject = LuminaStore.getActiveSubject();
    if (subject) renderEmbeddedSimulator(subject);
  }

  function setSimSliderScore(val) {
    const slider = document.getElementById('simLiveSlider');
    const itemsInput = document.getElementById('embeddedSimTotalItems');
    const items = Number(itemsInput ? itemsInput.value : embeddedSimItems) || 20;
    const clamped = Math.max(0, Math.min(items, Number(val) || 0));
    embeddedSimLiveScore = clamped;
    if (slider) slider.value = clamped;
    const subject = LuminaStore.getActiveSubject();
    if (subject) updateLiveSliderProjection(subject, items);
  }

  function updateLiveSliderProjection(subject, items) {
    const slider = document.getElementById('simLiveSlider');
    if (!slider || !subject) return;

    const score = Number(slider.value);
    const proj = LuminaEngine.projectAssessmentScore(subject.id, embeddedSimCategory, score, items);
    if (!proj) return;

    // Update score readout
    const scoreVal = document.getElementById('simSliderScoreVal');
    const maxVal = document.getElementById('simSliderMaxVal');
    const pctVal = document.getElementById('simSliderPctVal');
    if (scoreVal) scoreVal.textContent = proj.score;
    if (maxVal) maxVal.textContent = proj.totalItems;
    if (pctVal) pctVal.textContent = `${proj.scorePct}%`;

    // Update projected grade & badge
    const gradeVal = document.getElementById('simSliderProjectedGrade');
    const standingPill = document.getElementById('simSliderStandingPill');
    const deltaBadge = document.getElementById('simSliderDeltaBadge');
    const statusNote = document.getElementById('simSliderStatusNote');

    if (gradeVal) gradeVal.textContent = proj.projectedTG;
    if (standingPill) {
      standingPill.textContent = proj.standingLabel;
      standingPill.style.color = proj.standingColor;
    }
    if (deltaBadge) {
      if (proj.deltaTG > 0) {
        deltaBadge.className = 'sim-delta-badge positive';
        deltaBadge.textContent = `▲ +${proj.deltaTG} pts (${proj.currentTG} → ${proj.projectedTG})`;
      } else if (proj.deltaTG < 0) {
        deltaBadge.className = 'sim-delta-badge negative';
        deltaBadge.textContent = `▼ ${proj.deltaTG} pts (${proj.currentTG} → ${proj.projectedTG})`;
      } else {
        deltaBadge.className = 'sim-delta-badge neutral';
        deltaBadge.textContent = `● Same pace (${proj.currentTG})`;
      }
    }
    if (statusNote) {
      if (proj.targetMet) {
        statusNote.innerHTML = `<span style="color:var(--status-emerald); font-weight:600;">Target ${proj.targetTG} Reached! 🎉</span>`;
      } else {
        const gap = proj.targetTG - proj.projectedTG;
        statusNote.innerHTML = `<span style="color:var(--text-secondary);">${gap} pt${gap === 1 ? '' : 's'} away from Target ${proj.targetTG}</span>`;
      }
    }
  }

  function renderEmbeddedSimulator(subject) {
    const resultCard = document.getElementById('embeddedSimResultCard');
    if (!resultCard || !subject) return;

    // Sync weight pills on cards if present
    const wwWeightLabel = document.getElementById('simCardWeightWW');
    const ptWeightLabel = document.getElementById('simCardWeightPT');
    const qaWeightLabel = document.getElementById('simCardWeightQA');
    if (wwWeightLabel) wwWeightLabel.textContent = `${Math.round(subject.weights.ww * 100)}%`;
    if (ptWeightLabel) ptWeightLabel.textContent = `${Math.round(subject.weights.pt * 100)}%`;
    if (qaWeightLabel) qaWeightLabel.textContent = `${Math.round(subject.weights.qa * 100)}%`;

    document.querySelectorAll('#embeddedSimCategoryGroup .sim-type-card, #embeddedSimCategoryGroup .log-category-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === embeddedSimCategory);
    });

    const itemsInput = document.getElementById('embeddedSimTotalItems');
    const customTargetInput = document.getElementById('embeddedSimCustomTarget');

    const items = Number(itemsInput ? itemsInput.value : embeddedSimItems) || 20;
    const target = Number(customTargetInput ? customTargetInput.value : embeddedSimTarget) || subject.targetGrade || 95;

    const sol = LuminaEngine.solveForAssessment(subject.id, embeddedSimCategory, items, target);
    if (!sol) return;

    const categoryName = embeddedSimCategory === 'WW' ? 'Quiz / Written Work' : (embeddedSimCategory === 'PT' ? 'Performance Task' : 'Quarterly Exam');

    // Default slider position
    let initialSliderScore;
    if (embeddedSimLiveScore !== null && embeddedSimLiveScore <= items) {
      initialSliderScore = embeddedSimLiveScore;
    } else if (sol.status === 'GUARANTEED') {
      initialSliderScore = items;
    } else if (sol.status === 'IMPOSSIBLE') {
      initialSliderScore = items;
    } else {
      initialSliderScore = Math.max(0, Math.min(items, sol.requiredRawScore));
    }
    const initialSliderPct = items > 0 ? Math.round((initialSliderScore / items) * 100) : 0;
    const initialProj = LuminaEngine.projectAssessmentScore(subject.id, embeddedSimCategory, initialSliderScore, items);

    // Build the hero status & plain English message
    let heroNumber = '';
    let heroClass = '';
    let statusBadgeText = '';
    let statusBadgeClass = '';
    let plainEnglishMsg = '';
    let plainEnglishSub = '';
    let logScoreValue = sol.requiredRawScore;

    if (sol.status === 'GUARANTEED') {
      heroClass = 'guaranteed-card';
      statusBadgeText = 'Target Secured';
      statusBadgeClass = 'guaranteed';
      heroNumber = `<span class="sim-hero-number" style="color:var(--status-emerald);">0</span>`;
      plainEnglishMsg = `You are already on track for <strong>${target}</strong> with your current scores!`;
      plainEnglishSub = `Even with 0 points on this ${categoryName}, your grade stays comfortably above target.`;
      logScoreValue = items;
    } else if (sol.status === 'IMPOSSIBLE') {
      heroClass = 'impossible-card';
      statusBadgeText = 'Catch-Up Needed';
      statusBadgeClass = 'unreachable';
      heroNumber = `<span class="sim-hero-number" style="color:var(--status-rose);">${items}</span>`;
      plainEnglishMsg = `A perfect score of <strong>${items} out of ${items} (100%)</strong> reaches a grade of <strong>${sol.maxAchievableTG}</strong> on current standing.`;
      plainEnglishSub = `To reach <strong>${target}</strong>, you will need to catch up across other upcoming assessments this quarter.`;
      logScoreValue = items;
    } else {
      // Reachable
      const isComfort = sol.status === 'COMFORT';
      heroClass = isComfort ? 'comfort-card' : 'stretch-card';
      statusBadgeText = isComfort ? 'Comfort Zone' : 'Stay Focused';
      statusBadgeClass = isComfort ? 'comfort' : 'high-rigor';
      heroNumber = `<span class="sim-hero-number">${sol.requiredRawScore}</span>`;
      plainEnglishMsg = `You need at least <strong>${sol.requiredRawScore} out of ${sol.totalItems} points</strong> (${sol.requiredPercentage}%) to stay on track.`;
      const margin = items - sol.requiredRawScore;
      if (margin > 0) {
        plainEnglishSub = `Safe cushion: You can miss up to <strong>${margin} question${margin === 1 ? '' : 's'}</strong> and still maintain your target.`;
      } else {
        plainEnglishSub = `Precision required: A perfect score is needed on this assessment to keep up with your target.`;
      }
    }

    resultCard.className = `embedded-sim-result-card ${heroClass}`;

    resultCard.innerHTML = `
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <span class="feasibility-tag ${statusBadgeClass}">${statusBadgeText}</span>
          <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-secondary);">Target: ${target}</span>
        </div>

        <div class="sim-hero-score-box">
          ${heroNumber}
          <span class="sim-hero-total">/ ${sol.totalItems} pts needed</span>
        </div>

        <div class="sim-plain-english-msg">
          ${plainEnglishMsg}
        </div>
        <div class="sim-plain-english-sub">
          ${plainEnglishSub}
        </div>

        <div style="margin-top:14px; display:flex; justify-content:flex-end;">
          <button class="btn-primary" style="font-size:12px; padding:6px 14px;" onclick="LuminaApp.openLogScoreModal('${embeddedSimCategory}', { score: ${logScoreValue}, max: ${sol.totalItems} })">
            + Log This Score
          </button>
        </div>
      </div>

      <!-- Interactive What-If Slider Section -->
      <div class="sim-slider-wrap">
        <div class="sim-slider-header">
          <div class="sim-slider-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Live What-If Slider
          </div>
          <div class="sim-slider-score-callout">
            Score: <span id="simSliderScoreVal" style="color:var(--status-emerald); font-weight:700;">${initialSliderScore}</span> / <span id="simSliderMaxVal">${items}</span> (<span id="simSliderPctVal">${initialSliderPct}%</span>)
          </div>
        </div>

        <input type="range" id="simLiveSlider" class="sim-slider" min="0" max="${items}" value="${initialSliderScore}" step="1">

        <div class="sim-slider-labels">
          <span>0 pts</span>
          <span>Passing 75% (${Math.ceil(items * 0.75)})</span>
          <span>Max (${items})</span>
        </div>

        <div class="sim-slider-snaps">
          <button type="button" class="sim-snap-btn" onclick="LuminaApp.setSimSliderScore(${Math.ceil(items * 0.75)})">Passing 75%</button>
          <button type="button" class="sim-snap-btn" onclick="LuminaApp.setSimSliderScore(${Math.min(items, Math.max(0, sol.requiredRawScore))})">Target Needed</button>
          <button type="button" class="sim-snap-btn" onclick="LuminaApp.setSimSliderScore(${items})">Perfect 100%</button>
        </div>

        <div class="sim-live-outcome-box">
          <div>
            <div class="sim-outcome-grade-label">Projected Final Grade</div>
            <div class="sim-outcome-grade-group">
              <span class="sim-outcome-grade-val" id="simSliderProjectedGrade">${initialProj ? initialProj.projectedTG : '--'}</span>
              <span id="simSliderStandingPill" style="font-size:11px; font-weight:600; color:${initialProj ? initialProj.standingColor : 'inherit'};">${initialProj ? initialProj.standingLabel : ''}</span>
            </div>
          </div>
          <div style="text-align:right;">
            <div id="simSliderDeltaBadge" class="sim-delta-badge ${initialProj && initialProj.deltaTG > 0 ? 'positive' : (initialProj && initialProj.deltaTG < 0 ? 'negative' : 'neutral')}">
              ${initialProj ? (initialProj.deltaTG > 0 ? `▲ +${initialProj.deltaTG} pts (${initialProj.currentTG} → ${initialProj.projectedTG})` : (initialProj.deltaTG < 0 ? `▼ ${initialProj.deltaTG} pts (${initialProj.currentTG} → ${initialProj.projectedTG})` : `● Same pace (${initialProj.currentTG})`)) : ''}
            </div>
            <div id="simSliderStatusNote" style="font-size:11px; margin-top:4px;">
              ${initialProj ? (initialProj.targetMet ? `<span style="color:var(--status-emerald); font-weight:600;">Target ${target} Reached! 🎉</span>` : `<span style="color:var(--text-secondary);">${target - initialProj.projectedTG} pt away from Target ${target}</span>`) : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach slider live dragging event listener
    const liveSlider = document.getElementById('simLiveSlider');
    if (liveSlider) {
      liveSlider.addEventListener('input', (e) => {
        embeddedSimLiveScore = Number(e.target.value);
        updateLiveSliderProjection(subject, items);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Tab 5: Transmutation Matrix & Certified Exporter
  // --------------------------------------------------------------------------

  function renderMatrix() {
    const subject = LuminaStore.getActiveSubject();
    const tableBody = document.getElementById('transmutationTableBody');
    const pinpointCard = document.getElementById('matrixPinpointCard');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const currentIG = subject ? LuminaEngine.calculateSubject(subject).effectiveInitialGrade : 92.5;
    const currentTG = LuminaDepEd.initialToTransmuted(currentIG);

    LuminaDepEd.TRANSMUTATION_TABLE.forEach(row => {
      const isPinpoint = (row.transmuted === currentTG);
      const tr = document.createElement('tr');
      if (isPinpoint) {
        tr.className = 'active-pinpoint';
      }

      tr.innerHTML = `
        <td class="transmuted-grade-cell mono">${row.transmuted}</td>
        <td>${row.min.toFixed(2)}% – ${row.max.toFixed(2)}%</td>
        <td style="font-family:var(--font-sans); font-size:11px;">${row.remarks}</td>
      `;
      tableBody.appendChild(tr);
    });

    if (pinpointCard && subject) {
      const currentRow = LuminaDepEd.getTransmutationRow(currentIG);
      const distanceToNext = currentRow.transmuted < 100
        ? +(LuminaDepEd.transmutedToMinInitial(currentRow.transmuted + 1) - currentIG).toFixed(2)
        : 0;
      const cushionFromLower = +(currentIG - currentRow.min).toFixed(2);

      pinpointCard.innerHTML = `
        <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-secondary); margin-bottom:8px;">
          Active Subject Pinpoint
        </div>
        <div style="font-size:18px; font-weight:400; color:var(--text-primary); margin-bottom:12px;">
          ${subject.name}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
          <span style="font-size:13px; color:var(--text-secondary);">Current Initial Grade</span>
          <span class="mono" style="font-size:24px; color:var(--status-emerald);">${currentIG}%</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
          <span style="font-size:13px; color:var(--text-secondary);">Transmuted Grade</span>
          <span class="mono" style="font-size:24px; color:var(--text-primary); font-weight:500;">${currentTG}</span>
        </div>
        <div style="padding:12px; background:var(--glass-subtle); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); font-size:12px; line-height:1.5;">
          ${distanceToNext > 0
            ? `<strong>+${distanceToNext} pts</strong> required on raw initial score to advance to Transmuted Grade <strong>${currentRow.transmuted + 1}</strong>.`
            : `Holding the peak transmuted score of 100.`
          }<br>
          <span style="color:var(--text-secondary); font-size:11px;">Current cushion above threshold: +${cushionFromLower} pts.</span>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // Certified Grade Slip Exporter
  // --------------------------------------------------------------------------

  function openGradeSlipModal() {
    const summary = LuminaEngine.calculateTermSummary();
    const profile = LuminaStore.getProfile();
    const paper = document.getElementById('gradeSlipPaperContent');
    if (!paper) return;

    const subjectsHtml = summary.subjectsCalculated.map(c => `
      <tr>
        <td class="subj-name">${c.subject.name}</td>
        <td>${c.subject.classification}</td>
        <td>${c.ww.percentage.toFixed(1)}%</td>
        <td>${c.pt.percentage.toFixed(1)}%</td>
        <td>${c.qa.count > 0 ? c.qa.percentage.toFixed(1) + '%' : 'Pending'}</td>
        <td>${c.effectiveInitialGrade.toFixed(2)}%</td>
        <td style="font-weight:600; font-size:13px;">${c.transmutedGrade}</td>
        <td>${c.transmutedGrade >= 75 ? 'Passed' : 'Failed'}</td>
      </tr>
    `).join('');

    paper.innerHTML = `
      <div class="slip-header">
        <div>
          <div class="slip-title">OFFICIAL TRANSMUTED GRADE REPORT</div>
          <div class="slip-subtitle">Senior High School Academic Standing • DepEd Table 4 Protocol</div>
        </div>
        <div style="text-align:right; font-family:var(--font-mono); font-size:11px; color:#64748b;">
          <div>REF: LUMINA-${Date.now().toString(36).toUpperCase()}</div>
          <div>DATE: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
      </div>

      <div class="slip-meta-grid">
        <div><strong>STUDENT:</strong> ${profile.studentName}</div>
        <div><strong>GRADE & STRAND:</strong> ${profile.gradeLevel} • ${profile.trackStrand}</div>
        <div><strong>ACADEMIC YEAR:</strong> ${profile.schoolYear}</div>
        <div><strong>SEMESTER:</strong> ${profile.semester}</div>
        <div><strong>TERM:</strong> ${profile.quarter}</div>
        <div><strong>CURRICULUM:</strong> DepEd K to 12 Basic Education</div>
      </div>

      <table class="slip-table">
        <thead>
          <tr>
            <th>Subject Title</th>
            <th>Track</th>
            <th>WW %</th>
            <th>PT %</th>
            <th>QA %</th>
            <th>Initial</th>
            <th>Transmuted</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${subjectsHtml}
        </tbody>
      </table>

      <div class="slip-footer-summary">
        <div>
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.06em; opacity:0.8;">GENERAL AVERAGE</div>
          <div style="font-size:28px; font-weight:700; font-family:var(--font-mono);">${summary.transmutedGeneralAverage.toFixed(2)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.06em; opacity:0.8;">OFFICIAL ACADEMIC DISTINCTION</div>
          <div style="font-size:18px; font-weight:600; color:#38bdf8;">${summary.honorsTier.title}</div>
        </div>
      </div>

      <div style="margin-top:16px; font-size:10px; color:#94a3b8; text-align:center;">
        Transmuted using Department of Education Philippines Table 4 Adjusted Transmutation Standard. Verified by LUMINA Academic OS.
      </div>
    `;

    openModal(els.gradeSlipModal);
  }

  function printGradeSlip() {
    window.print();
  }

  // --------------------------------------------------------------------------
  // Universal Command Palette (⌘K / Ctrl+K)
  // --------------------------------------------------------------------------

  function openCommandPalette() {
    openModal(els.cmdPaletteModal);
    if (els.cmdSearchInput) {
      els.cmdSearchInput.value = '';
      els.cmdSearchInput.focus();
    }
    renderCommandPaletteResults('');
  }

  function closeCommandPalette() {
    closeModal(els.cmdPaletteModal);
  }

  function renderCommandPaletteResults(query) {
    if (!els.cmdResultsList) return;
    const q = (query || '').toLowerCase().trim();
    const subjects = LuminaStore.getSubjects();

    const results = [];

    // Navigation Items
    const navItems = [
      { type: 'nav', title: 'Dashboard Overview', desc: 'Jump to Term Analytics', action: () => switchTab('overview') },
      { type: 'nav', title: 'Pipeline Subjects', desc: 'Manage Course Load', action: () => switchTab('pipeline') },
      { type: 'nav', title: 'Simulation Laboratory', desc: 'Reverse Target Solver', action: () => switchTab('simulator') },
      { type: 'nav', title: 'Transmutation Matrix', desc: 'DepEd Table 4 Reference', action: () => switchTab('matrix') },
      { type: 'nav', title: 'Export Grade Slip', desc: 'Generate printable summary', action: () => openGradeSlipModal() }
    ];

    navItems.forEach(item => {
      if (!q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)) {
        results.push(item);
      }
    });

    // Subject items
    subjects.forEach(s => {
      if (!q || s.name.toLowerCase().includes(q) || s.strand.toLowerCase().includes(q)) {
        results.push({
          type: 'subject',
          title: s.name,
          desc: `${s.classification} • ${s.strand}`,
          action: () => navigateToSubject(s.id)
        });
      }
    });

    // Quick score log syntax: e.g. "add ww 28/30 chem" or "ww 25/25"
    if (q.includes('/') && (q.includes('ww') || q.includes('pt') || q.includes('qa') || q.includes('score'))) {
      results.unshift({
        type: 'action',
        title: `Quick Log Score: "${q}"`,
        desc: 'Execute instant grade recording',
        action: () => handleQuickLogQuery(q)
      });
    }

    // Actions: Switch Quarter, Theme, Sound
    const actionItems = [
      { type: 'action', title: '+ Add New Subject', desc: 'Browse DepEd Curriculum Catalog', action: () => openAddSubjectModal() },
      { type: 'action', title: 'Toggle Dark / Light Theme', desc: 'Switch visual canvas mode', action: () => toggleTheme() },
      { type: 'action', title: 'Toggle Harmonic Audio Cues', desc: 'Mute/unmute sound effects', action: () => toggleAudio() },
      { type: 'action', title: 'Switch to Quarter 1', desc: 'Set active grading term', action: () => LuminaStore.setActiveQuarter('Quarter 1') },
      { type: 'action', title: 'Switch to Quarter 2', desc: 'Set active grading term', action: () => LuminaStore.setActiveQuarter('Quarter 2') }
    ];

    actionItems.forEach(item => {
      if (!q || item.title.toLowerCase().includes(q)) {
        results.push(item);
      }
    });

    els.cmdResultsList.innerHTML = '';
    if (results.length === 0) {
      els.cmdResultsList.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-tertiary); font-size:12px;">
          No matching commands or subjects found.
        </div>
      `;
      return;
    }

    results.forEach((res, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = `cmd-item ${idx === 0 ? 'selected' : ''}`;
      itemEl.onclick = () => {
        closeCommandPalette();
        res.action();
      };

      itemEl.innerHTML = `
        <div class="cmd-item-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div>
            <div style="font-weight:400; color:var(--text-primary);">${res.title}</div>
            <div style="font-size:11px; color:var(--text-secondary);">${res.desc}</div>
          </div>
        </div>
        <kbd style="font-size:10px; opacity:0.6;">↵</kbd>
      `;
      els.cmdResultsList.appendChild(itemEl);
    });
  }

  function handleQuickLogQuery(q) {
    // Basic parser for "ww 28/30" or "add pt 45/50 chem"
    const slashIdx = q.indexOf('/');
    if (slashIdx === -1) return;

    let category = 'WW';
    if (q.includes('pt')) category = 'PT';
    if (q.includes('qa') || q.includes('exam')) category = 'QA';

    // Extract numbers around slash
    const match = q.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const score = Number(match[1]);
      const max = Number(match[2]);
      const currentSubject = LuminaStore.getActiveSubject();
      if (currentSubject) {
        LuminaStore.addAssessment({
          subjectId: currentSubject.id,
          category,
          title: `Quick Log ${category}`,
          score,
          max,
          multiplier: 1.0
        });
        showToast(`Logged ${score}/${max} into ${currentSubject.name} (${category})`);
        LuminaAudio.playTargetChime();
      }
    }
  }

  // --------------------------------------------------------------------------
  // Modals & Forms
  // --------------------------------------------------------------------------

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // Add Subject Modal with Curated Catalog
  function openAddSubjectModal() {
    const catalogSearchInput = document.getElementById('catalogSearchInput');
    const customWeightsGroup = document.getElementById('customWeightsGroup');
    const customWeightsToggle = document.getElementById('customWeightsToggle');

    if (catalogSearchInput) catalogSearchInput.value = '';
    renderCatalogOptions('');

    if (customWeightsToggle) customWeightsToggle.checked = false;
    if (customWeightsGroup) customWeightsGroup.style.display = 'none';

    openModal(els.addSubjectModal);
  }

  function renderCatalogOptions(filterText) {
    const container = document.getElementById('catalogOptionsContainer');
    const hiddenInput = document.getElementById('selectedCatalogKey');
    if (!container) return;

    const q = (filterText || '').toLowerCase().trim();
    const catalog = LuminaDepEd.CURRICULUM_CATALOG;
    const filtered = catalog.filter(s => !q || s.name.toLowerCase().includes(q) || (s.strand && s.strand.toLowerCase().includes(q)) || s.classification.toLowerCase().includes(q));

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-tertiary); font-size:12px;">No matching DepEd subjects found.</div>';
      return;
    }

    let selectedId = hiddenInput ? hiddenInput.value : '';
    if (!filtered.some(f => f.id === selectedId)) {
      selectedId = filtered[0].id;
      if (hiddenInput) hiddenInput.value = selectedId;
    }

    filtered.forEach(item => {
      const opt = document.createElement('div');
      opt.className = `catalog-subject-option ${item.id === selectedId ? 'selected' : ''}`;
      opt.setAttribute('data-id', item.id);
      opt.onclick = () => selectCatalogItem(item.id);

      const preset = LuminaDepEd.WEIGHT_PRESETS[item.defaultPreset] || LuminaDepEd.WEIGHT_PRESETS.core_language;
      const weightSummary = `WW ${Math.round(preset.ww * 100)}% • PT ${Math.round(preset.pt * 100)}% • QA ${Math.round(preset.qa * 100)}%`;

      opt.innerHTML = `
        <div>
          <div style="font-weight:400; color:var(--text-primary); font-size:13px;">${item.name}</div>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
            ${item.classification} ${item.strand ? '• ' + item.strand : ''}
          </div>
        </div>
        <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-tertiary); text-align:right;">
          ${weightSummary}
        </div>
      `;
      container.appendChild(opt);
    });

    onCatalogSelectionChange();
  }

  function selectCatalogItem(id) {
    const hiddenInput = document.getElementById('selectedCatalogKey');
    if (hiddenInput) hiddenInput.value = id;

    const container = document.getElementById('catalogOptionsContainer');
    if (container) {
      container.querySelectorAll('.catalog-subject-option').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-id') === id);
      });
    }

    onCatalogSelectionChange();
  }

  function onCatalogSelectionChange() {
    const hiddenInput = document.getElementById('selectedCatalogKey');
    if (!hiddenInput || !hiddenInput.value) return;

    const catalogItem = LuminaDepEd.CURRICULUM_CATALOG.find(c => c.id === hiddenInput.value);
    if (!catalogItem) return;

    const presetKey = catalogItem.defaultPreset || 'core_language';
    const preset = LuminaDepEd.WEIGHT_PRESETS[presetKey] || LuminaDepEd.WEIGHT_PRESETS.core_language;

    const wwInput = document.getElementById('customWeightWW');
    const ptInput = document.getElementById('customWeightPT');
    const qaInput = document.getElementById('customWeightQA');

    if (wwInput) wwInput.value = Math.round(preset.ww * 100);
    if (ptInput) ptInput.value = Math.round(preset.pt * 100);
    if (qaInput) qaInput.value = Math.round(preset.qa * 100);
  }

  function saveNewSubjectFromModal() {
    const hiddenInput = document.getElementById('selectedCatalogKey');
    const customToggle = document.getElementById('customWeightsToggle');
    const targetInput = document.getElementById('subjectTargetGrade');

    if (!hiddenInput || !hiddenInput.value) {
      alert('Please select a subject from the DepEd catalog.');
      return;
    }

    const catalogItem = LuminaDepEd.CURRICULUM_CATALOG.find(c => c.id === hiddenInput.value);
    if (!catalogItem) {
      alert('Selected subject is invalid.');
      return;
    }

    let weights = { ww: 0.25, pt: 0.50, qa: 0.25 };
    const isCustom = customToggle && customToggle.checked;

    if (isCustom) {
      const ww = Number(document.getElementById('customWeightWW').value) / 100;
      const pt = Number(document.getElementById('customWeightPT').value) / 100;
      const qa = Number(document.getElementById('customWeightQA').value) / 100;

      const sum = Math.round((ww + pt + qa) * 100);
      if (sum !== 100) {
        alert(`Grading weights must sum to exactly 100%. Current sum: ${sum}%`);
        return;
      }
      weights = { ww, pt, qa };
    } else {
      const presetKey = catalogItem.defaultPreset || 'core_language';
      const preset = LuminaDepEd.WEIGHT_PRESETS[presetKey] || LuminaDepEd.WEIGHT_PRESETS.core_language;
      weights = { ww: preset.ww, pt: preset.pt, qa: preset.qa };
    }

    const profile = LuminaStore.getProfile();
    const targetGrade = Number(targetInput ? targetInput.value : (profile.targetGeneralAverage || 95)) || 95;

    const newSubj = LuminaStore.addSubject({
      name: catalogItem.name,
      classification: catalogItem.classification,
      strand: catalogItem.strand || profile.trackStrand || 'STEM',
      weights,
      targetGrade,
      isCustomWeight: isCustom
    });

    closeModal(els.addSubjectModal);
    showToast(`Added ${newSubj.name} to enrolled subjects`);
    navigateToSubject(newSubj.id);
  }

  // Log Assessment Modal
  let activeLogCategory = 'WW';
  let currentWWSubType = 'Quiz';

  function setWWSubType(type) {
    currentWWSubType = type;
    const btnQuiz = document.getElementById('btnTypeQuiz');
    const btnAct = document.getElementById('btnTypeActivity');
    if (btnQuiz) btnQuiz.classList.toggle('active', type === 'Quiz');
    if (btnAct) btnAct.classList.toggle('active', type === 'Activity');

    const titleInput = document.getElementById('logEntryTitle');
    const subject = LuminaStore.getActiveSubject();
    if (titleInput && subject) {
      const existing = LuminaStore.getAssessments(subject.id).filter(a => a.category === 'WW');
      const count = existing.filter(a => a.title.toLowerCase().startsWith(type.toLowerCase())).length + 1;
      titleInput.value = `${type} ${count}`;
    }
  }

  function openLogScoreModal(category, options = {}) {
    activeLogCategory = category || 'WW';
    const titleLabel = document.getElementById('logModalCategoryTag');
    const titleInput = document.getElementById('logEntryTitle');
    const scoreInput = document.getElementById('logEntryScore');
    const maxInput = document.getElementById('logEntryMax');
    const dateInput = document.getElementById('logEntryDate');
    const bonusToggle = document.getElementById('logEntryBonusToggle');
    const wwSubTypeContainer = document.getElementById('wwSubTypeContainer');
    const subject = LuminaStore.getActiveSubject();

    if (titleLabel) {
      titleLabel.textContent = category === 'WW' ? 'Written Work' : (category === 'PT' ? 'Performance Task' : 'Quarterly Exam');
    }

    if (category === 'WW') {
      if (wwSubTypeContainer) wwSubTypeContainer.style.display = 'block';
      currentWWSubType = options.subType || 'Quiz';
      const btnQuiz = document.getElementById('btnTypeQuiz');
      const btnAct = document.getElementById('btnTypeActivity');
      if (btnQuiz) btnQuiz.classList.toggle('active', currentWWSubType === 'Quiz');
      if (btnAct) btnAct.classList.toggle('active', currentWWSubType === 'Activity');

      const existing = subject ? LuminaStore.getAssessments(subject.id).filter(a => a.category === 'WW') : [];
      const count = existing.filter(a => a.title.toLowerCase().startsWith(currentWWSubType.toLowerCase())).length + 1;
      if (titleInput) titleInput.value = options.title || `${currentWWSubType} ${count}`;
      if (maxInput) maxInput.value = options.max || (currentWWSubType === 'Quiz' ? '20' : '30');
    } else if (category === 'PT') {
      if (wwSubTypeContainer) wwSubTypeContainer.style.display = 'none';
      const existing = subject ? LuminaStore.getAssessments(subject.id).filter(a => a.category === 'PT') : [];
      const count = existing.length + 1;
      if (titleInput) titleInput.value = options.title || `Performance Task ${count}`;
      if (maxInput) maxInput.value = options.max || '50';
    } else if (category === 'QA') {
      if (wwSubTypeContainer) wwSubTypeContainer.style.display = 'none';
      if (titleInput) titleInput.value = options.title || 'Quarterly Examination';
      if (maxInput) maxInput.value = options.max || '50';
    }

    if (scoreInput) scoreInput.value = options.score !== undefined ? options.score : '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (bonusToggle) bonusToggle.checked = false;

    openModal(els.logScoreModal);
    if (scoreInput) {
      setTimeout(() => scoreInput.focus(), 150);
    }
  }

  function saveAssessmentFromModal() {
    const subject = LuminaStore.getActiveSubject();
    if (!subject) return;

    const titleInput = document.getElementById('logEntryTitle');
    const scoreInput = document.getElementById('logEntryScore');
    const maxInput = document.getElementById('logEntryMax');
    const dateInput = document.getElementById('logEntryDate');
    const bonusToggle = document.getElementById('logEntryBonusToggle');

    const score = Number(scoreInput ? scoreInput.value : 0);
    const max = Number(maxInput ? maxInput.value : 10);
    const allowBonus = bonusToggle && bonusToggle.checked;

    if (max <= 0) {
      alert('Total possible score must be greater than zero.');
      return;
    }

    if (score > max && !allowBonus) {
      alert('Score earned cannot exceed total possible score unless Bonus Points are enabled.');
      return;
    }

    const title = (titleInput && titleInput.value.trim()) || `${activeLogCategory} Assessment`;
    const date = (dateInput && dateInput.value) || new Date().toISOString().split('T')[0];

    LuminaStore.addAssessment({
      subjectId: subject.id,
      category: activeLogCategory,
      title,
      score,
      max,
      multiplier: 1.0,
      date,
      allowBonus
    });

    closeModal(els.logScoreModal);
    showToast(`Recorded "${title}" (${score}/${max})`);
    LuminaAudio.playTargetChime();
  }

  function deleteAssessmentEntry(id) {
    if (confirm('Delete this assessment entry?')) {
      LuminaStore.deleteAssessment(id);
      showToast('Assessment deleted');
    }
  }

  function deleteCurrentSubject() {
    const subject = LuminaStore.getActiveSubject();
    if (!subject) return;
    if (confirm(`Are you sure you want to delete ${subject.name}? All logged scores will be removed.`)) {
      LuminaStore.deleteSubject(subject.id);
      showToast(`Deleted ${subject.name}`);
      switchTab('pipeline');
    }
  }

  // Subject Options (Triple-Dots Modal)
  function openSubjectSettings(subjectId) {
    const subject = LuminaStore.getSubject(subjectId);
    if (!subject) return;

    const modal = document.getElementById('subjectSettingsModal');
    const titleEl = document.getElementById('subjectSettingsTitle');
    const idInput = document.getElementById('settingsTargetSubjectId');
    const targetInput = document.getElementById('settingsSubjectTargetInput');

    if (titleEl) titleEl.textContent = `${subject.name} Options`;
    if (idInput) idInput.value = subject.id;
    if (targetInput) targetInput.value = subject.targetGrade || 95;

    openModal(modal);
  }

  function saveSubjectSettings() {
    const idInput = document.getElementById('settingsTargetSubjectId');
    const targetInput = document.getElementById('settingsSubjectTargetInput');
    if (!idInput || !idInput.value) return;

    const newTarget = Number(targetInput ? targetInput.value : 95) || 95;
    LuminaStore.updateSubject(idInput.value, { targetGrade: newTarget });
    closeModal(document.getElementById('subjectSettingsModal'));
    showToast('Subject target updated');
    renderPipeline();
  }

  function quickLogFromSettings(category) {
    const idInput = document.getElementById('settingsTargetSubjectId');
    if (!idInput || !idInput.value) return;
    LuminaStore.setActiveSubjectId(idInput.value);
    closeModal(document.getElementById('subjectSettingsModal'));
    openLogScoreModal(category);
  }

  function deleteSubjectFromSettings() {
    const idInput = document.getElementById('settingsTargetSubjectId');
    if (!idInput || !idInput.value) return;
    const subject = LuminaStore.getSubject(idInput.value);
    if (!subject) return;

    if (confirm(`Are you sure you want to delete ${subject.name}? All logged scores will be removed.`)) {
      LuminaStore.deleteSubject(subject.id);
      closeModal(document.getElementById('subjectSettingsModal'));
      showToast(`Deleted ${subject.name}`);
      renderPipeline();
    }
  }

  // Profile Modal & Backup
  function openProfileModal() {
    const profile = LuminaStore.getProfile();
    const nameInput = document.getElementById('profileStudentName');
    const strandSelect = document.getElementById('profileStrandSelect');
    const levelSelect = document.getElementById('profileGradeLevel');
    const targetInput = document.getElementById('profileTargetAverage');

    if (nameInput) nameInput.value = profile.studentName;
    if (strandSelect) strandSelect.value = profile.trackStrand;
    if (levelSelect) levelSelect.value = profile.gradeLevel;
    if (targetInput) targetInput.value = profile.targetGeneralAverage;

    openModal(els.profileModal);
  }

  function saveProfileFromModal() {
    const nameInput = document.getElementById('profileStudentName');
    const strandSelect = document.getElementById('profileStrandSelect');
    const levelSelect = document.getElementById('profileGradeLevel');
    const targetInput = document.getElementById('profileTargetAverage');

    const newTarget = Number(targetInput ? targetInput.value : 95) || 95;

    LuminaStore.updateProfile({
      studentName: nameInput ? nameInput.value : 'Student',
      trackStrand: strandSelect ? strandSelect.value : 'STEM',
      gradeLevel: levelSelect ? levelSelect.value : 'Grade 11',
      targetGeneralAverage: newTarget
    });

    closeModal(els.profileModal);
    renderGlobalHeaderBadges();
    renderCurrentView();
    showToast(`Academic profile updated (Target: ${newTarget})`);
  }

  function exportDataFile() {
    const json = LuminaStore.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bawi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Academic record exported to JSON');
  }

  function importDataFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = LuminaStore.importJSON(e.target.result);
      if (res.success) {
        showToast('Academic records successfully imported!');
        closeAllModals();
      } else {
        alert('Failed to import JSON: ' + res.error);
      }
    };
    reader.readAsText(file);
  }

  function resetToDemoData() {
    if (confirm('Reset application to standard STEM demo subjects and scores?')) {
      LuminaStore.resetToDemo();
      showToast('Reset to demo records');
      closeAllModals();
    }
  }

  // --------------------------------------------------------------------------
  // UI Polish: Theme, Sound, Toasts, Rolling Numbers
  // --------------------------------------------------------------------------

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lumina_theme', newTheme);
    updateThemeIcon(newTheme);
    LuminaAudio.playClick();
  }

  function applyThemeFromStorage() {
    const stored = localStorage.getItem('lumina_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
    updateThemeIcon(stored);
  }

  function updateThemeIcon(theme) {
    const iconHtml = theme === 'dark'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    if (els.themeToggleBtn) els.themeToggleBtn.innerHTML = iconHtml;
    if (els.sidebarThemeToggleBtn) els.sidebarThemeToggleBtn.innerHTML = iconHtml;
  }

  function toggleAudio() {
    const isMuted = LuminaAudio.toggleMute();
    updateAudioButtonState();
    showToast(isMuted ? 'Audio cues muted' : 'Harmonic chimes active');
  }

  function updateAudioButtonState() {
    const isMuted = LuminaAudio.getMuted();
    const iconHtml = isMuted
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    if (els.audioToggleBtn) els.audioToggleBtn.innerHTML = iconHtml;
    if (els.sidebarAudioToggleBtn) els.sidebarAudioToggleBtn.innerHTML = iconHtml;
  }

  function showToast(message) {
    if (!els.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-emerald)" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
      <span>${message}</span>
    `;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  function animateRollingNumber(element, targetVal) {
    const startVal = parseFloat(element.textContent) || 0;
    const diff = targetVal - startVal;
    if (Math.abs(diff) < 0.01) {
      element.textContent = Number(targetVal).toFixed(2);
      return;
    }

    const duration = 500;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * ease;
      element.textContent = current.toFixed(2);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = Number(targetVal).toFixed(2);
      }
    }
    requestAnimationFrame(step);
  }

  // --------------------------------------------------------------------------
  // Event Listeners & Shortcuts
  // --------------------------------------------------------------------------

  function setupEventListeners() {
    // Navigation Pill Clicks (Mobile top header if present)
    els.navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
        LuminaAudio.playClick();
      });
    });

    // Mobile Bottom Navigation Clicks
    els.mobileNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
        LuminaAudio.playClick();
      });
    });

    // Sidebar Navigation Clicks
    const sidebarNavBtns = document.querySelectorAll('.sidebar-nav-btn');
    sidebarNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
        LuminaAudio.playClick();
      });
    });

    // Header Badges & Sidebar Profile Click Handlers
    if (els.themeToggleBtn) els.themeToggleBtn.addEventListener('click', toggleTheme);
    if (els.sidebarThemeToggleBtn) els.sidebarThemeToggleBtn.addEventListener('click', toggleTheme);

    if (els.audioToggleBtn) els.audioToggleBtn.addEventListener('click', toggleAudio);
    if (els.sidebarAudioToggleBtn) els.sidebarAudioToggleBtn.addEventListener('click', toggleAudio);

    if (els.cmdKTrigger) els.cmdKTrigger.addEventListener('click', openCommandPalette);
    if (els.sidebarCmdKTrigger) els.sidebarCmdKTrigger.addEventListener('click', openCommandPalette);

    if (els.strandBadge) els.strandBadge.addEventListener('click', openProfileModal);
    if (els.targetAverageBadge) els.targetAverageBadge.addEventListener('click', openProfileModal);
    if (els.sidebarProfileCard) els.sidebarProfileCard.addEventListener('click', openProfileModal);
    if (els.sidebarTargetPill) els.sidebarTargetPill.addEventListener('click', openProfileModal);

    if (els.semesterBadge) els.semesterBadge.addEventListener('click', () => {
      const currentQ = LuminaStore.getActiveQuarter();
      const nextQ = currentQ === 'Quarter 1' ? 'Quarter 2' : 'Quarter 1';
      LuminaStore.setActiveQuarter(nextQ);
      showToast(`Switched active term to ${nextQ}`);
    });

    if (els.sidebarSemesterBadge) els.sidebarSemesterBadge.addEventListener('click', () => {
      const currentQ = LuminaStore.getActiveQuarter();
      const nextQ = currentQ === 'Quarter 1' ? 'Quarter 2' : 'Quarter 1';
      LuminaStore.setActiveQuarter(nextQ);
      showToast(`Switched active term to ${nextQ}`);
    });

    // Command Palette Input Listener
    if (els.cmdSearchInput) {
      els.cmdSearchInput.addEventListener('input', (e) => {
        renderCommandPaletteResults(e.target.value);
      });
    }

    // Catalog search in Add Subject Modal
    const catalogSearch = document.getElementById('catalogSearchInput');
    if (catalogSearch) {
      catalogSearch.addEventListener('input', (e) => {
        renderCatalogOptions(e.target.value);
      });
    }

    const customWeightsToggle = document.getElementById('customWeightsToggle');
    const customWeightsGroup = document.getElementById('customWeightsGroup');
    if (customWeightsToggle && customWeightsGroup) {
      customWeightsToggle.addEventListener('change', (e) => {
        customWeightsGroup.style.display = e.target.checked ? 'flex' : 'none';
      });
    }

    // Setup Embedded Simulator Listeners
    setupEmbeddedSimulatorListeners();

    // Setup Keyboard Shortcuts
    setupKeyboardShortcuts();

    // Window Resize -> Reposition pill indicator
    window.addEventListener('resize', () => {
      const activeBtn = document.querySelector('.nav-tab-btn.active');
      if (activeBtn) positionPillIndicator(activeBtn);
    });
  }

  function setupEmbeddedSimulatorListeners() {
    // Step 1: Category selection cards / buttons
    document.querySelectorAll('#embeddedSimCategoryGroup .sim-type-card, #embeddedSimCategoryGroup .log-category-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setEmbeddedSimCategory(btn.getAttribute('data-cat'));
      });
    });

    // Preset chips for target
    document.querySelectorAll('#embeddedSimPresetChips .sim-preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        setEmbeddedSimTarget(btn.getAttribute('data-target'));
      });
    });

    // Custom target input
    const customTargetInput = document.getElementById('embeddedSimCustomTarget');
    if (customTargetInput) {
      customTargetInput.addEventListener('input', (e) => {
        setEmbeddedSimTarget(e.target.value);
      });
    }

    // Step 2: Preset chips for total items
    document.querySelectorAll('#embeddedSimItemPresets .sim-preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        setEmbeddedSimItems(btn.getAttribute('data-items'));
      });
    });

    // Total items input
    const itemsInput = document.getElementById('embeddedSimTotalItems');
    if (itemsInput) {
      itemsInput.addEventListener('input', (e) => {
        embeddedSimLiveScore = null;
        const subject = LuminaStore.getActiveSubject();
        if (subject) renderEmbeddedSimulator(subject);
      });
    }
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K to toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (els.cmdPaletteModal.classList.contains('active')) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
        return;
      }

      // Escape to close active modal
      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }

      // If user is typing in an input, do not trigger single-key navigation
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      // '[' and ']' for Subject Cycling
      if (e.key === '[') {
        e.preventDefault();
        cycleSubject(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        cycleSubject(1);
      }

      // Quick Numbers: 1, 2, 3 inside subject view to log scores
      if (LuminaStore.getActiveTab() === 'subject-view') {
        if (e.key === '1') {
          e.preventDefault();
          openLogScoreModal('WW');
        } else if (e.key === '2') {
          e.preventDefault();
          openLogScoreModal('PT');
        } else if (e.key === '3') {
          e.preventDefault();
          openLogScoreModal('QA');
        }
      }
    });
  }

  return {
    init,
    switchTab,
    navigateToSubject,
    cycleSubject,
    setPipelineFilter,
    setTaskFilter,
    openAddSubjectModal,
    saveNewSubjectFromModal,
    selectCatalogItem,
    openLogScoreModal,
    saveAssessmentFromModal,
    setWWSubType,
    openAddTaskModal,
    saveTaskFromModal,
    toggleTaskItem,
    deleteTaskItem,
    logScoreFromTask,
    openSubjectSettings,
    saveSubjectSettings,
    quickLogFromSettings,
    deleteSubjectFromSettings,
    deleteAssessmentEntry,
    deleteCurrentSubject,
    openProfileModal,
    saveProfileFromModal,
    openGradeSlipModal,
    printGradeSlip,
    openCommandPalette,
    closeCommandPalette,
    closeModal,
    closeAllModals,
    toggleTheme,
    toggleAudio,
    exportDataFile,
    importDataFile,
    resetToDemoData,
    showToast,
    setSimSliderScore,
    setEmbeddedSimCategory,
    setEmbeddedSimTarget,
    setEmbeddedSimItems
  };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  LuminaApp.init();
});
