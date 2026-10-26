# Project Context & Technical Dossier: Bawi! // Senior High School Academic OS

**Full Title:** *Bawi!: A Local-First, Algorithmic Academic Operating System and Target Simulation Engine for Philippine Senior High School Students*  
**Application Name:** Bawi! (featuring internal engines formerly codenamed *Lumina* and *GradeTarget*)  
**Domain:** Educational Technology (EdTech) / Human-Computer Interaction (HCI) / Academic Decision Support Systems  
**Target Users:** Senior High School (SHS) Students (Grades 11 & 12 across STEM, ABM, HUMSS, GAS, TVL, Arts & Design, and Sports tracks), Teachers, Academic Counselors.

---

## 1. Executive Summary & Etymology

**Bawi!** is a distraction-free, local-first academic operating system (Academic OS) engineered specifically for Philippine Senior High School (SHS) students governed by the Department of Education (**DepEd**) K to 12 Basic Education Curriculum.

### Etymological Context
The name **"Bawi!"** originates from the ubiquitous Filipino expression *"Bawi"* (meaning *"to recover"*, *"to bounce back"*, or *"to redeem oneself"*). In Philippine schools, *"Bawi tayo next quarter"* is the prevailing coping mechanism when a quiz or test score falls short of expectations. However, without mathematical clarity, students cannot determine what raw score is required to genuinely recover, leading to anxiety, guesswork, and misallocated study hours.

Bawi! transforms this emotional sentiment into an **actionable, algorithmic reality**. It bridges forward cumulative performance tracking with closed-form reverse target solving, real-time "what-if" score simulation, and high-leverage study prioritization.

---

## 2. Problem Statement & Research Motivation

### 2.1 The Non-Linearity of DepEd Grading (DepEd Order No. 8, s. 2015)
Under DepEd standards, senior high school grading differs fundamentally from simple percentage averages or traditional GPA scales:
1. **Multi-Component Strand-Specific Weighting:** Scores in **Written Works (WW)**, **Performance Tasks (PT)**, and **Quarterly Assessment (QA)** carry distinct weights depending on the subject type:
   - **Specialized Track (STEM / ABM / HUMSS / GAS):** WW 25% | PT 45% | QA 30%
   - **Core Curriculum Subjects:** WW 25% | PT 50% | QA 25%
   - **Technical-Vocational / Arts / Physical Education:** WW 20% | PT 60% | QA 20%
2. **Table 4 Transmutation Matrix (Step Function):** The raw weighted percentage (Initial Grade, $IG$) does not directly become the report card grade. Instead, it must be mapped against the **DepEd Adjusted Transmutation Matrix (Table 4)** into an integer scale between 60 and 100 ($TG$):
   - A passing grade of **75** requires at least **70.00%** $IG$.
   - **With Honors (90–94)** requires $IG \ge 87.70\%$.
   - **With High Honors (95–97)** requires $IG \ge 93.60\%$.
   - **With Highest Honors (98–100)** requires $IG \ge 97.14\%$.

Because Table 4 is a non-linear piecewise step function, intuitive mental estimation of final grades is virtually impossible for students.

### 2.2 The "Blind Flying" & False-Failing Phenomenon
During the quarter, students calculate their current average by summing known assessments, which artificially penalizes them because pending assessments (such as the 25% Quarterly Exam) are counted as zero, causing premature panic (false-failing). Alternatively, students wait until report card release to realize they missed an honors cutoff by a fraction of a percent that could have been achieved with just two extra points on a 20-item seatwork.

### 2.3 Shortcomings of Existing Solutions
- **Spreadsheets (Excel / Google Sheets):** Inconvenient on mobile devices, prone to formula breakage, lack offline resilience, and require complex piecewise VLOOKUP formulas.
- **Existing Grade Calculators:** Purely static forward calculators (Score In $\rightarrow$ Grade Out). None offer **reverse target solving** (Target Out $\rightarrow$ Minimum Score In) or cross-subject study optimization.

---

## 3. Project Objectives

### General Objective
To design, implement, and evaluate **Bawi!**, an offline-first, client-side academic operating system that empowers Senior High School students to simulate grade scenarios, reverse-solve assessment score requirements, and optimize study allocation under the DepEd Table 4 grading standard.

### Specific Objectives
1. **Mathematical Engine Formulation:** Construct a validated mathematical computation engine implementing both forward DepEd K-12 grading calculations and reverse-target solving algorithms.
2. **Dynamic Step 1-2-3 Assessment Simulator:** Develop an interactive what-if simulation tool enabling students to test raw score scenarios on upcoming seatworks, laboratory tasks, or term exams with real-time Transmuted Grade projections.
3. **High-Leverage Study Allocator:** Design an algorithmic optimizer that analyzes incomplete component weights across all enrolled subjects to identify which specific assessment yields the highest marginal increase in General Average ($GA$).
4. **Local-First PWA Architecture:** Implement the system as a Progressive Web App (PWA) utilizing browser-native persistence (localStorage and IndexedDB) with zero external server dependencies, ensuring absolute student data privacy and 100% offline functionality.
5. **Academic Planning & Certified Reporting:** Integrate an action planner linking study tasks to high-leverage components and provide a print-ready, certified DepEd grade slip generator.

---

## 4. Theoretical & Legal Framework

### 4.1 Legal & Policy Mandates
- **DepEd Order No. 8, s. 2015:** *Policy Guidelines on Classroom Assessment for the K to 12 Basic Education Program*. Mandates the tripartite assessment framework (WW, PT, QA) and the Table 4 transmutation matrix.
- **DepEd Order No. 36, s. 2016:** *Policy Guidelines on Awards and Recognition for the K to 12 Basic Education Program*. Establishes academic honors criteria (General Average of 90–94 for Honors, 95–97 for High Honors, 98–100 for Highest Honors with no failing grade in any quarter).

### 4.2 Educational & HCI Theories
- **Goal-Setting Theory (Locke & Latham, 2002):** Specific, quantifiable, and challenging goals lead to higher performance than vague intentions. Providing exact score thresholds (e.g., *"Score 17/20 on Quiz 3 to secure High Honors"*) directly increases self-efficacy and focus.
- **Cognitive Load Theory (Sweller, 1988):** Offloads complex non-linear arithmetic from student working memory to an automated system, freeing cognitive capacity for actual subject matter study.
- **Pareto Principle / Leverage Theory:** Highlighting that 20% of remaining assessments (e.g., a heavily weighted Performance Task or Quarterly Exam) often dictate 80% of final honors eligibility.

---

## 5. Mathematical Formulations & Algorithms

### 5.1 Forward Grading Engine
For any given subject $s$ with weight configuration $W = \{w_{ww}, w_{pt}, w_{qa}\}$ such that $\sum w = 1.0$:

1. **Component Percentage Scores ($PS$):**
   $$PS_{ww} = \frac{\sum \text{Score}_{ww}}{\sum \text{Max}_{ww}} \times 100, \quad PS_{pt} = \frac{\sum \text{Score}_{pt}}{\sum \text{Max}_{pt}} \times 100, \quad PS_{qa} = \frac{\sum \text{Score}_{qa}}{\sum \text{Max}_{qa}} \times 100$$
2. **Weighted Score Sum & Locked Points ($LP$):**
   $$LP = (PS_{ww} \times w_{ww}) + (PS_{pt} \times w_{pt})$$
   $$\text{Raw Initial Grade } (IG_{\text{raw}}) = LP + (PS_{qa} \times w_{qa})$$
3. **Pacing-Aware Running Rate:** To prevent false-failing during mid-quarter analysis when terminal assessments are pending, the engine computes active weight $W_{\text{active}} = \sum_{c \in \text{Completed}} w_c$ and calculates:
   $$IG_{\text{effective}} = \begin{cases} IG_{\text{raw}}, & \text{if QA is completed} \\ \frac{IG_{\text{raw}}}{W_{\text{active}}}, & \text{if QA is pending} \end{cases}$$
4. **Transmutation Lookup:**
   $$TG = f_{\text{Table4}}(IG_{\text{effective}})$$
   Where $f_{\text{Table4}}: \mathbb{R} \to [60, 100]$ maps initial percentage ranges into integers according to the 41 DepEd brackets.

### 5.2 Reverse Target Solver Algorithm
Given a student's desired target transmuted grade $TG_{\text{target}}$:
1. Determine minimum initial grade threshold:
   $$IG_{\text{min}} = \min \{ IG \mid f_{\text{Table4}}(IG) = TG_{\text{target}} \}$$
2. For an upcoming assessment in category $c \in \{WW, PT, QA\}$ with $N$ total items:
   $$\text{Deficit Weighted Points } (\Delta P) = (IG_{\text{min}} \times W_{\text{new\_active}}) - \sum_{k \neq c} P_{\text{other\_weighted}}$$
3. The required percentage $PS_{\text{req}}$ on the component is:
   $$PS_{\text{req}} = \frac{\Delta P}{w_c}$$
4. For cumulative components ($WW$ or $PT$ with existing score sum $S_{\text{current}}$ and maximum $M_{\text{current}}$):
   $$\text{Required Score } X = \left\lceil \left( \frac{PS_{\text{req}}}{100} \times (M_{\text{current}} + N) \right) - S_{\text{current}} \right\rceil$$
5. Solvability Status Classification:
   - If $X \le 0$: **Target Guaranteed** (secured even with zero).
   - If $0 < X \le \lfloor 0.75 N \rfloor$: **Comfort Zone** (achievable cushion).
   - If $\lfloor 0.75 N \rfloor < X \le N$: **High Rigor** (requires disciplined focus).
   - If $X > N$: **Mathematically Impossible on this assessment alone** (triggers catch-up notice).

### 5.3 High-Leverage Study Allocator
Given $K$ enrolled subjects:
For each subject $k \in \{1, \dots, K\}$, simulate performance at 80% vs 95% on remaining uncompleted weights:
$$\Delta TG_k = f_{\text{Table4}}(IG_{k, 95\%}) - f_{\text{Table4}}(IG_{k, 80\%})$$
$$\text{Marginal GPA Yield } Y_k = \frac{\Delta TG_k}{K}$$
The system ranks subjects descending by $Y_k$, identifying the critical path where study effort yields the highest systemic return.

---

## 6. System Architecture & Technical Stack

```mermaid
graph TD
    User([Senior High School Student]) <--> UI[Responsive Web UI / PWA Shell]
    
    subgraph Client Application Layer
        UI <--> Controller[App Controller: LuminaApp]
        Controller <--> Engine[Math Engine: LuminaEngine]
        Controller <--> Store[Reactive Store: LuminaStore]
        Controller <--> Audio[Synthesizer: LuminaAudio]
        
        Engine <--> DepEdData[DepEd Catalog & Table 4: LuminaDepEd]
        Store <--> DepEdData
    end

    subgraph Persistence Layer (Local-First)
        Store <--> LS[(Browser LocalStorage)]
        Store <--> IDB[(IndexedDB Backup & JSON Export)]
    end

    subgraph Offline Service Worker
        SW[sw.js Service Worker] <--> Cache[(App Cache Storage)]
    end
```

### Technical Stack Summary
- **Frontend Core:** Vanilla HTML5, CSS3, JavaScript (ES6+ Modules / Revealing Module Pattern).
- **Styling & Design System:** Custom token-driven CSS (`tokens.css`, `style.css`), dark mode (`#090A0F`), glassmorphism, responsive desktop sidebar + mobile navigation bar.
- **Audio Synthesis:** Web Audio API (`AudioContext`, Oscillator nodes, Exponential Gain Decay).
- **Storage:** LocalStorage (instant hydration) + IndexedDB (resilience) + JSON export/import.
- **PWA Capabilities:** Service Worker (`sw.js`) with Cache-First strategy, Web App Manifest (`manifest.json`) for standalone home screen installation.

---

## 7. Key Codebase Modules

- [`index.html`](file:///b:/ANTIGRAV/Bawi!/index.html): Semantic layout, dashboards, and modal interfaces.
- [`js/deped-data.js`](file:///b:/ANTIGRAV/Bawi!/js/deped-data.js): DepEd Table 4, weight presets, curriculum catalog.
- [`js/engine.js`](file:///b:/ANTIGRAV/Bawi!/js/engine.js): Pure mathematical grading logic and reverse solvers.
- [`js/store.js`](file:///b:/ANTIGRAV/Bawi!/js/store.js): Local-first reactive state store with observer pattern.
- [`js/audio.js`](file:///b:/ANTIGRAV/Bawi!/js/audio.js): Synthesizer for tactile cues and honors celebration chimes.
- [`js/app.js`](file:///b:/ANTIGRAV/Bawi!/js/app.js): Application lifecycle, modal managers, keyboard shortcuts.
- [`manifest.json`](file:///b:/ANTIGRAV/Bawi!/manifest.json): Progressive Web App manifest.
- [`sw.js`](file:///b:/ANTIGRAV/Bawi!/sw.js): Offline service worker cache manager.

---

## 8. Proposal Paper Chapter Mapping

| Proposal Chapter | How to Use This Project Context |
| :--- | :--- |
| **I. Problem & Background** | Use Section 1 (Executive Summary) and Section 2 (DepEd Table 4 non-linearity, false-failing, and student grade anxiety). |
| **II. Review of Related Lit (RRL)** | Cite DepEd Order 8 s. 2015, DepEd Order 36 s. 2016, Goal-Setting Theory, Cognitive Load Theory, and Local-First privacy architectures. |
| **III. Methodology & Architecture** | Use Section 5 (Mathematical Formulations & Equations) and Section 6 (System Architecture Mermaid Diagram). |
| **IV. Results & Evaluation Plan** | Propose ISO/IEC 25010 testing for usability, functional accuracy across all 41 Table 4 brackets, and offline reliability. |

---

## 9. Architectural Log & Deferred Refinements
- **Quarter 1 In-Flight Task Banner:** Temporarily disabled per user directive. To be revisited and redesigned in a dedicated follow-up iteration focusing on dynamic seatwork pacing and micro-task forecasting.
- **Header Stats Container:** "Entries" counter item removed to maintain clean visual hierarchy and emphasize core academic metrics (Transmuted Grade, Semestral Final, Raw Initial, Target, and Weight Progress).
- **Specialized Subject Weighting:** Standardized across all specialized SHS curriculum subjects to **WW 25% | PT 45% | QA 30%**.

---

## 10. Slice 4 Architecture & Capabilities

### 10.1 Flexible Onboarding & Subject Selection (Zero Forced Auto-Enrollment)
- **Problem Solved:** Philippine SHS institutions sequence curriculum subjects differently (e.g. some schools teach *Pre-Calculus* in Sem 1 while others teach it in Sem 2; strand offerings differ across private vs public institutions).
- **Implementation:**
  - First-time onboarding features a 2-step setup wizard (`#onboardingModal`).
  - **Step 1:** Student Profile (Name, Track/Strand, Grade Level, Starting Semester, Target General Average with live honors tier preview).
  - **Step 2:** Interactive Multi-Select Checklist grouped into *Specialized Track*, *Core Curriculum*, *Applied Track*, and *Custom Institutional Subjects*.
  - Features real-time search filtering, 1-click **"Select Strand Load"**, **"Clear"**, and collapsible **"Custom Subject"** addition drawer.
  - Option to launch with an empty slate (`Start with Blank Slate`) or batch enroll selected subjects (`LuminaStore.addSubjectsBatch()`).

### 10.2 Semester 2 Crossover & Term Transition
- **Problem Solved:** Transitioning into Semester 2 must safely preserve Semester 1 grade records while preventing duplicate subject enrollment.
- **Implementation:**
  - Automatically activates when switching to Semester 2 if no Semester 2 subjects are enrolled, or via the empty state action button.
  - Highlights subjects completed in Semester 1 with visual badges (`(Enrolled in Sem 1)`).
  - Pre-selects recommended Semester 2 strand course load excluding completed subjects.
  - Batch enrolls Semester 2 course load and sets academic term atomically.

### 10.3 Official DepEd Form 138-SHS (SF 9-SHS) Report Card
- **Problem Solved:** Students need an authentic, official DepEd progress report card for scholarship applications, college admissions, and parent-teacher consultations.
- **Implementation:**
  - Upgraded `#gradeSlipModal` into a certified **DepEd Form 138-SHS** progress report card compliant with DepEd Order No. 8, s. 2015 and DepEd Order No. 36, s. 2016.
  - Formatted paper layout (`.form138-paper`) with Republic of the Philippines Department of Education masthead.
  - Dual quarterly rating columns (`Quarter 1`, `Quarter 2`, `Final Semestral Grade`, `Action Taken / Remarks`).
  - Distinct subject classification sections for *Core Curriculum Subjects* and *Applied & Specialized Track Subjects*.
  - DepEd Semestral General Average calculation with nearest-integer rounding.
  - DepEd Order No. 36, s. 2016 academic honors certification (*With Highest Honors* $\ge 98$, *With High Honors* $\ge 95$, *With Honors* $\ge 90$) with strict fail-check gate (no quarter rating below 75).
  - Print/PDF export stylesheet with class adviser and principal signature endorsements.

