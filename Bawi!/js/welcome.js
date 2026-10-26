/**
 * Bawi! // Dedicated Welcome & Setup Controller
 * Powers welcome.html standalone intro command center.
 */

window.WelcomeApp = (function () {
  'use strict';

  let selectedSubjects = new Map();
  let customSubjects = [];

  function init() {
    LuminaStore.init();

    const profile = LuminaStore.getProfile();
    const allSubjects = LuminaStore.getAllSubjects();

    // If user already has an active workspace, show "Return to Dashboard" in navbar
    const returnBtn = document.getElementById('introReturnToDashboardBtn');
    if (returnBtn && (profile.onboardingCompleted || allSubjects.length > 0)) {
      returnBtn.style.display = 'inline-flex';
    }

    const nameInput = document.getElementById('onboardStudentName');
    const strandSelect = document.getElementById('onboardStrandSelect');
    const gradeSelect = document.getElementById('onboardGradeLevel');
    const semSelect = document.getElementById('onboardSemesterSelect');
    const targetInput = document.getElementById('onboardTargetAverage');

    if (nameInput) nameInput.value = (profile.studentName && profile.studentName !== 'Student Profile') ? profile.studentName : 'Maria Santos';
    if (strandSelect) strandSelect.value = profile.trackStrand || 'STEM';
    if (gradeSelect) gradeSelect.value = profile.gradeLevel || 'Grade 11';
    if (semSelect) semSelect.value = profile.semester || 'Semester 1';
    if (targetInput) targetInput.value = profile.targetGeneralAverage || 95;

    updateHonorsPreview();

    if (window.location.hash === '#step2') {
      goToStep(2);
    } else {
      goToStep(1);
    }
  }

  function updateHonorsPreview() {
    const targetInput = document.getElementById('onboardTargetAverage');
    const badge = document.getElementById('onboardHonorsBadge');
    if (!targetInput || !badge) return;

    const targetVal = Number(targetInput.value) || 95;
    const tier = LuminaDepEd.getHonorsTier(targetVal);
    badge.className = `honors-badge-pill ${tier.badgeClass}`;
    badge.textContent = tier.title;
  }

  function onStrandChange() {
    if (document.getElementById('onboardingStep2').style.display !== 'none') {
      renderChecklist();
    }
  }

  function goToStep(step) {
    const step1 = document.getElementById('onboardingStep1');
    const step2 = document.getElementById('onboardingStep2');
    const ind1 = document.getElementById('onboardingStepIndicator1');
    const ind2 = document.getElementById('onboardingStepIndicator2');

    if (step === 2) {
      const nameInput = document.getElementById('onboardStudentName');
      const strandSelect = document.getElementById('onboardStrandSelect');
      const gradeSelect = document.getElementById('onboardGradeLevel');
      const semSelect = document.getElementById('onboardSemesterSelect');
      const targetInput = document.getElementById('onboardTargetAverage');

      LuminaStore.updateProfile({
        studentName: (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Maria Santos',
        trackStrand: strandSelect ? strandSelect.value : 'STEM',
        gradeLevel: gradeSelect ? gradeSelect.value : 'Grade 11',
        semester: semSelect ? semSelect.value : 'Semester 1',
        targetGeneralAverage: Number(targetInput ? targetInput.value : 95) || 95
      });

      if (selectedSubjects.size === 0) {
        selectStrandRecommended();
      } else {
        renderChecklist();
      }

      step1.style.display = 'none';
      step2.style.display = 'block';
      if (ind1) ind1.classList.remove('active');
      if (ind2) ind2.classList.add('active');
    } else {
      step2.style.display = 'none';
      step1.style.display = 'block';
      if (ind2) ind2.classList.remove('active');
      if (ind1) ind1.classList.add('active');
    }
  }

  function renderChecklist(filterText = '') {
    const container = document.getElementById('onboardingChecklistContainer');
    if (!container) return;

    const profile = LuminaStore.getProfile();
    const strand = profile.trackStrand || 'STEM';
    const query = filterText.toLowerCase().trim();
    const catalog = LuminaDepEd.CURRICULUM_CATALOG;

    const specialized = catalog.filter(s => s.classification === 'Specialized' && (!s.strand || s.strand === strand));
    const core = catalog.filter(s => s.classification === 'Core');
    const applied = catalog.filter(s => s.classification === 'Applied');

    let html = '';

    function renderGroup(title, items, weightTag) {
      const filtered = items.filter(it => !query || it.name.toLowerCase().includes(query));
      if (filtered.length === 0) return '';

      const itemsHtml = filtered.map(item => {
        const isSelected = selectedSubjects.has(item.name);
        return `
          <div class="checklist-item-card ${isSelected ? 'selected' : ''}" onclick="WelcomeApp.toggleItem(this, '${encodeURIComponent(JSON.stringify(item))}')">
            <div class="checklist-item-left">
              <div class="checklist-custom-checkbox">${isSelected ? '✓' : ''}</div>
              <div>
                <div class="checklist-item-name">${item.name}</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                  ${item.classification} ${item.strand ? '• ' + item.strand : ''}
                </div>
              </div>
            </div>
            <div class="checklist-item-meta">
              <span class="category-tag" style="font-family:var(--font-mono); font-size:10.5px;">${weightTag}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="checklist-group">
          <div class="checklist-group-header">
            <span>${title}</span>
            <span style="font-family:var(--font-mono); font-size:10px; opacity:0.8;">${weightTag}</span>
          </div>
          <div class="checklist-group-items">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    html += renderGroup(`Specialized Track (${strand})`, specialized, 'WW 25% • PT 45% • QA 30%');
    html += renderGroup('Core Curriculum Subjects', core, 'WW 25% • PT 50% • QA 25%');
    html += renderGroup('Applied Track Subjects', applied, 'WW 25% • PT 50% • QA 25%');

    if (customSubjects.length > 0) {
      const customItemsHtml = customSubjects.map(item => {
        const isSelected = selectedSubjects.has(item.name);
        const wLabel = item.classification === 'Specialized' ? 'WW 25% • PT 45% • QA 30%' : 'WW 25% • PT 50% • QA 25%';
        return `
          <div class="checklist-item-card ${isSelected ? 'selected' : ''}" onclick="WelcomeApp.toggleItem(this, '${encodeURIComponent(JSON.stringify(item))}')">
            <div class="checklist-item-left">
              <div class="checklist-custom-checkbox">${isSelected ? '✓' : ''}</div>
              <div>
                <div class="checklist-item-name">${item.name}</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Custom • ${item.classification}</div>
              </div>
            </div>
            <div class="checklist-item-meta">
              <span class="category-tag" style="font-family:var(--font-mono); font-size:10.5px;">${wLabel}</span>
            </div>
          </div>
        `;
      }).join('');

      html += `
        <div class="checklist-group">
          <div class="checklist-group-header">
            <span>Custom Institutional Subjects</span>
          </div>
          <div class="checklist-group-items">
            ${customItemsHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = html || '<div style="padding:20px; text-align:center; color:var(--text-tertiary); font-size:12px;">No matching subjects found.</div>';
    updateCounterUI();
  }

  function filterChecklist() {
    const input = document.getElementById('onboardingChecklistSearch');
    renderChecklist(input ? input.value : '');
  }

  function toggleItem(el, jsonStr) {
    try {
      const item = JSON.parse(decodeURIComponent(jsonStr));
      if (selectedSubjects.has(item.name)) {
        selectedSubjects.delete(item.name);
        el.classList.remove('selected');
        const box = el.querySelector('.checklist-custom-checkbox');
        if (box) box.textContent = '';
      } else {
        const isSpecialized = item.classification === 'Specialized';
        const weights = isSpecialized ? { ww: 0.25, pt: 0.45, qa: 0.30 } : { ww: 0.25, pt: 0.50, qa: 0.25 };
        selectedSubjects.set(item.name, {
          name: item.name,
          classification: item.classification || 'Core',
          strand: item.strand || LuminaStore.getProfile().trackStrand || 'STEM',
          weights,
          targetGrade: LuminaStore.getProfile().targetGeneralAverage || 95
        });
        el.classList.add('selected');
        const box = el.querySelector('.checklist-custom-checkbox');
        if (box) box.textContent = '✓';
      }
      updateCounterUI();
      if (window.LuminaAudio) LuminaAudio.playClick();
    } catch (e) {
      console.error(e);
    }
  }

  function updateCounterUI() {
    const count = selectedSubjects.size;
    const countEl = document.getElementById('onboardingSelectedCount');
    const submitBtn = document.getElementById('onboardSubmitBtn');

    if (countEl) countEl.textContent = count;
    if (submitBtn) {
      submitBtn.textContent = count > 0 ? `Launch Academic OS (Enroll ${count} Subjects) 🚀` : `Launch Academic OS (Blank Workspace) 🚀`;
    }
  }

  function selectStrandRecommended() {
    const profile = LuminaStore.getProfile();
    const strand = profile.trackStrand || 'STEM';
    const catalog = LuminaDepEd.CURRICULUM_CATALOG;

    selectedSubjects.clear();

    let recommendedNames = [];
    if (strand === 'STEM') {
      recommendedNames = [
        'Pre-Calculus',
        'General Chemistry 1',
        'Oral Communication in Context',
        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
        'General Mathematics',
        'Earth and Life Science',
        'Physical Education and Health',
        'English for Academic and Professional Purposes (EAPP)'
      ];
    } else if (strand === 'ABM') {
      recommendedNames = [
        'Applied Economics',
        'Organization and Management',
        'Oral Communication in Context',
        'General Mathematics',
        'Earth and Life Science',
        'Physical Education and Health',
        'English for Academic and Professional Purposes (EAPP)'
      ];
    } else if (strand === 'HUMSS') {
      recommendedNames = [
        'Creative Writing',
        'Disciplines and Ideas in the Social Sciences (DISS)',
        'Oral Communication in Context',
        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
        'General Mathematics',
        'Earth and Life Science',
        'Physical Education and Health'
      ];
    } else {
      recommendedNames = [
        'Oral Communication in Context',
        'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
        'General Mathematics',
        'Earth and Life Science',
        'Physical Education and Health',
        'English for Academic and Professional Purposes (EAPP)'
      ];
    }

    recommendedNames.forEach(name => {
      const match = catalog.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (match) {
        const isSpec = match.classification === 'Specialized';
        selectedSubjects.set(match.name, {
          name: match.name,
          classification: match.classification,
          strand: match.strand || strand,
          weights: isSpec ? { ww: 0.25, pt: 0.45, qa: 0.30 } : { ww: 0.25, pt: 0.50, qa: 0.25 },
          targetGrade: profile.targetGeneralAverage || 95
        });
      }
    });

    renderChecklist();
  }

  function clearAllChecklist() {
    selectedSubjects.clear();
    renderChecklist();
  }

  function toggleCustomDrawer() {
    const form = document.getElementById('onboardCustomForm');
    const arrow = document.getElementById('customDrawerArrow');
    if (!form) return;
    const isHidden = form.style.display === 'none';
    form.style.display = isHidden ? 'block' : 'none';
    if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
  }

  function addCustomSubject() {
    const nameInput = document.getElementById('onboardCustomName');
    const classSelect = document.getElementById('onboardCustomClassification');
    if (!nameInput || !nameInput.value.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    const name = nameInput.value.trim();
    const classification = classSelect ? classSelect.value : 'Core';
    const isSpec = classification === 'Specialized';
    const weights = isSpec ? { ww: 0.25, pt: 0.45, qa: 0.30 } : { ww: 0.25, pt: 0.50, qa: 0.25 };

    const newSubj = {
      name,
      classification,
      strand: LuminaStore.getProfile().trackStrand || 'STEM',
      weights,
      targetGrade: LuminaStore.getProfile().targetGeneralAverage || 95
    };

    customSubjects.push(newSubj);
    selectedSubjects.set(name, newSubj);
    nameInput.value = '';
    renderChecklist();
  }

  function launchOS() {
    const profile = LuminaStore.getProfile();
    const semester = profile.semester || 'Semester 1';

    const subjectsToEnroll = Array.from(selectedSubjects.values()).map(s => Object.assign({}, s, {
      semester,
      quarter: 'Quarter 1'
    }));

    if (subjectsToEnroll.length > 0) {
      LuminaStore.addSubjectsBatch(subjectsToEnroll);
    }

    LuminaStore.updateProfile({ onboardingCompleted: true });
    if (window.LuminaAudio) LuminaAudio.playCelebration();
    window.location.href = 'index.html';
  }

  function startBlank() {
    LuminaStore.updateProfile({ onboardingCompleted: true });
    window.location.href = 'index.html';
  }

  function exploreDemo() {
    LuminaStore.resetToDemo();
    LuminaStore.updateProfile({ onboardingCompleted: true });
    window.location.href = 'index.html';
  }

  function returnToDashboard() {
    window.location.href = 'index.html';
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    goToStep,
    onStrandChange,
    updateHonorsPreview,
    filterChecklist,
    toggleItem,
    selectStrandRecommended,
    clearAllChecklist,
    toggleCustomDrawer,
    addCustomSubject,
    launchOS,
    startBlank,
    exploreDemo,
    returnToDashboard
  };
})();
