'use strict';

/* ================================================================
   UNIT CONVERSIONS — APPLICATION ENGINE  (app.js)
   Depends on: problems.js  (PROBLEMS, filterProblems, shuffleArray)
   ================================================================
   Sections:
     1.  State
     2.  DOM references
     3.  Initialisation
     4.  Level / department selection
     5.  Problem loading
     6.  Factor bank rendering
     7.  Chain management
     8.  Unit-cancellation engine
     9.  Answer validation
    10.  Hint system
    11.  Navigation (prev / next / exit)
    12.  Session summary
    13.  Progress persistence (localStorage)
    14.  Navigation menu (mobile hamburger)
    15.  Utility helpers
================================================================ */


/* ================================================================
   1. STATE
================================================================ */
const state = {
    dept: 'all',      // 'all' | 'physics' | 'chemistry'
    level: null,       // 1 | 2 | 3 | 4
    queue: [],         // ordered array of problem objects for this session
    currentIndex: 0,          // index into queue
    hintsUsed: 0,          // hints used on the current problem
    selectedFactors: [],         // array of factor ids currently in the chain (in order)
    results: [],         // { problem, userAnswer, userUnit, correct } per problem
    answered: false,      // has the current problem been answered?
};


/* ================================================================
   2. DOM REFERENCES
   Collected once at startup — never re-queried
================================================================ */
const dom = {};

function cacheDom() {
    // Sections
    dom.levelSelector = document.getElementById('level-selector');
    dom.workspace = document.getElementById('workspace');
    dom.summary = document.getElementById('summary');

    // Department filter
    dom.deptRadios = document.querySelectorAll('input[name="department"]');

    // Level-card start buttons
    dom.levelCardBtns = document.querySelectorAll('.level-card__cta');

    // Workspace header
    dom.workspaceLevelLabel = document.getElementById('workspace-heading');
    dom.workspaceDeptBadge = document.querySelector('.workspace__dept-badge');
    dom.workspaceProgress = document.querySelector('.workspace__progress');
    dom.progressBar = document.getElementById('progress-bar');
    dom.btnExitWorkspace = document.getElementById('btn-exit-workspace');

    // Problem statement
    dom.problemContext = document.getElementById('problem-context');
    dom.problemQuestion = document.getElementById('problem-question');
    dom.givenNumber = document.getElementById('given-number');
    dom.givenUnit = document.getElementById('given-unit');

    // Factor bank
    dom.factorBankGrid = document.querySelector('.factor-bank__grid');

    // Chain
    dom.chain = document.getElementById('chain');
    dom.chainGivenNum = document.getElementById('chain-given-num');
    dom.chainResultNum = document.getElementById('chain-result-num');
    dom.chainResultDen = document.getElementById('chain-result-den');
    dom.chainResult = document.querySelector('.chain__result');

    // Answer entry
    dom.answerNumber = document.getElementById('answer-number');
    dom.answerUnit = document.getElementById('answer-unit');
    dom.btnCheckAnswer = document.getElementById('btn-check-answer');
    dom.answerFeedback = document.getElementById('answer-feedback');

    // Hint panel
    dom.btnHint = document.getElementById('btn-hint');
    dom.hintContent = document.getElementById('hint-content');
    dom.hintText = document.getElementById('hint-text');
    dom.hintCount = document.getElementById('hint-count');
    dom.btnHintNext = document.getElementById('btn-hint-next');

    // Problem navigation
    dom.btnPrevProblem = document.getElementById('btn-prev-problem');
    dom.btnNextProblem = document.getElementById('btn-next-problem');

    // Summary
    dom.summaryScore = document.getElementById('summary-score');
    dom.summaryTotal = document.getElementById('summary-total');
    dom.summaryPct = document.getElementById('summary-pct');
    dom.summaryTbody = document.getElementById('summary-tbody');
    dom.btnRetry = document.getElementById('btn-retry');
    dom.btnNewLevel = document.getElementById('btn-new-level');
    dom.btnExport = document.getElementById('btn-export');

    // Nav toggle (mobile)
    dom.navToggle = document.querySelector('.primary-nav__toggle');
    dom.navList = document.getElementById('primary-nav-list');
}


/* ================================================================
   3. INITIALISATION
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindStaticEvents();
    loadProgressFromStorage();
});

function bindStaticEvents() {
    // Department radio chips
    dom.deptRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            state.dept = radio.value;
        });
    });

    // Level-card "Start" buttons
    dom.levelCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.level = parseInt(btn.dataset.level, 10);
            startSession();
        });
    });

    // Workspace controls
    dom.btnExitWorkspace.addEventListener('click', exitToLevelSelector);
    dom.btnCheckAnswer.addEventListener('click', checkAnswer);
    dom.btnHint.addEventListener('click', toggleHintPanel);
    dom.btnHintNext.addEventListener('click', showNextHint);
    dom.btnPrevProblem.addEventListener('click', goToPrevProblem);
    dom.btnNextProblem.addEventListener('click', goToNextProblem);

    // Answer inputs — allow Enter key to submit
    dom.answerNumber.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkAnswer();
    });
    dom.answerUnit.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkAnswer();
    });

    // Summary actions
    dom.btnRetry.addEventListener('click', retrySession);
    dom.btnNewLevel.addEventListener('click', exitToLevelSelector);
    dom.btnExport.addEventListener('click', exportResults);

    // Mobile nav
    dom.navToggle.addEventListener('click', toggleMobileNav);

    // Close mobile nav when a link is clicked
    dom.navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}


/* ================================================================
   4. LEVEL / DEPARTMENT SELECTION
================================================================ */
function startSession() {
    const allProblems = filterProblems({ level: state.level, dept: state.dept });

    if (allProblems.length === 0) {
        // Fallback: load all problems for the level regardless of dept
        state.queue = shuffleArray(filterProblems({ level: state.level, dept: 'all' }));
    } else {
        state.queue = shuffleArray(allProblems);
    }

    state.currentIndex = 0;
    state.results = [];

    showSection('workspace');
    loadProblem(state.currentIndex);
}

function exitToLevelSelector() {
    showSection('level-selector');
    // Scroll back to level selector smoothly
    dom.levelSelector.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ================================================================
   5. PROBLEM LOADING
================================================================ */
function loadProblem(index) {
    const problem = state.queue[index];
    if (!problem) return;

    // Reset per-problem state
    state.selectedFactors = [];
    state.hintsUsed = 0;
    state.answered = false;

    // ── Header ───────────────────────────────────────────────────
    const levelNames = ['', 'One-Step', 'Multi-Step', 'Double Units', 'Squared & Cubed'];
    dom.workspaceLevelLabel.textContent =
        `Level ${problem.level} — ${levelNames[problem.level]}`;

    const deptLabel = problem.dept === 'both'
        ? (state.dept !== 'all' ? capitalize(state.dept) : 'Physics & Chemistry')
        : capitalize(problem.dept);
    dom.workspaceDeptBadge.textContent = deptLabel;
    dom.workspaceDeptBadge.dataset.dept =
        problem.dept === 'both' ? state.dept || 'physics' : problem.dept;

    // ── Progress ──────────────────────────────────────────────────
    const total = state.queue.length;
    const current = index + 1;
    dom.workspaceProgress.textContent = `Problem ${current} of ${total}`;
    const pct = ((index) / total) * 100;
    dom.progressBar.style.width = `${pct}%`;

    // ── Problem statement ─────────────────────────────────────────
    dom.problemContext.textContent = problem.context || '';
    dom.problemContext.hidden = !problem.context;
    dom.problemQuestion.textContent = problem.question;
    dom.givenNumber.textContent = formatNumber(problem.given.value);
    dom.givenUnit.textContent = problem.given.unit;

    // ── Chain — reset to just the given value ─────────────────────
    dom.chainGivenNum.textContent = `${formatNumber(problem.given.value)} ${problem.given.unit}`;
    rebuildChainDOM();

    // ── Factor bank ───────────────────────────────────────────────
    renderFactorBank(problem);

    // ── Answer / feedback reset ───────────────────────────────────
    dom.answerNumber.value = '';
    dom.answerUnit.value = '';
    dom.answerNumber.classList.remove('is-correct', 'is-incorrect');
    dom.answerUnit.classList.remove('is-correct', 'is-incorrect');
    dom.answerFeedback.innerHTML = '';
    dom.btnCheckAnswer.disabled = false;

    // ── Hint reset ────────────────────────────────────────────────
    dom.hintContent.hidden = true;
    dom.btnHint.setAttribute('aria-expanded', 'false');
    dom.hintText.textContent = '';
    dom.hintCount.textContent = '';
    dom.btnHintNext.hidden = true;

    // ── Navigation buttons ────────────────────────────────────────
    dom.btnPrevProblem.disabled = index === 0;
    dom.btnNextProblem.disabled = true;   // enabled only after a correct answer

    // Focus the problem question for screen-reader announcement
    dom.problemQuestion.setAttribute('tabindex', '-1');
    dom.problemQuestion.focus();
}


/* ================================================================
   6. FACTOR BANK RENDERING
================================================================ */
function renderFactorBank(problem) {
    dom.factorBankGrid.innerHTML = '';

    // Shuffle the factors shown so order doesn't give away the answer
    const factors = shuffleArray(problem.factors);

    factors.forEach(factor => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'factor-tile';
        btn.dataset.factorId = factor.id;
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label',
            `Add conversion factor: ${factor.label}. Press to add to chain.`);

        // Numerator
        const num = document.createElement('span');
        num.className = 'factor-tile__num';
        num.textContent = formatFractionPart(factor.numVal, factor.numUnit);

        // Bar
        const bar = document.createElement('span');
        bar.className = 'factor-tile__bar';
        bar.setAttribute('aria-hidden', 'true');

        // Denominator
        const den = document.createElement('span');
        den.className = 'factor-tile__den';
        den.textContent = formatFractionPart(factor.denVal, factor.denUnit);

        // Flip button — lets student invert the factor
        const flip = document.createElement('button');
        flip.type = 'button';
        flip.className = 'factor-tile__flip';
        flip.textContent = '⇅ flip';
        flip.setAttribute('aria-label',
            `Flip factor: swap numerator and denominator for ${factor.label}`);
        flip.addEventListener('click', e => {
            e.stopPropagation();   // don't trigger the tile's own click
            flipFactor(btn, factor, num, den);
        });

        btn.append(num, bar, den, flip);

        btn.addEventListener('click', () => {
            toggleFactor(btn, factor);
        });

        dom.factorBankGrid.appendChild(btn);
    });
}

/** Format a single fraction part: "1000 m", "1", "454 g", etc. */
function formatFractionPart(val, unit) {
    const valStr = formatNumber(val);
    return unit ? `${valStr} ${unit}` : valStr;
}

/** Flip a factor tile's numerator/denominator in place */
function flipFactor(btn, factor, numEl, denEl) {
    // Swap stored values
    const tmpVal = factor.numVal;
    const tmpUnit = factor.numUnit;
    factor.numVal = factor.denVal;
    factor.numUnit = factor.denUnit;
    factor.denVal = tmpVal;
    factor.denUnit = tmpUnit;

    // Update displayed text
    numEl.textContent = formatFractionPart(factor.numVal, factor.numUnit);
    denEl.textContent = formatFractionPart(factor.denVal, factor.denUnit);

    // Update aria-label
    btn.setAttribute('aria-label',
        `Add conversion factor: ${factor.label} (flipped). Press to add to chain.`);

    // If this factor is already in the chain, rebuild the chain
    if (state.selectedFactors.includes(factor.id)) {
        rebuildChainDOM();
        evaluateChain();
    }
}


/* ================================================================
   7. CHAIN MANAGEMENT
================================================================ */

/** Toggle a factor in / out of the chain */
function toggleFactor(btn, factor) {
    const id = factor.id;
    const idx = state.selectedFactors.indexOf(id);

    if (idx === -1) {
        // Add to chain
        state.selectedFactors.push(id);
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label',
            `Remove conversion factor from chain: ${factor.label}`);
    } else {
        // Remove from chain
        state.selectedFactors.splice(idx, 1);
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label',
            `Add conversion factor: ${factor.label}. Press to add to chain.`);
    }

    rebuildChainDOM();
    evaluateChain();
}

/** Rebuild the visible chain DOM from state.selectedFactors */
function rebuildChainDOM() {
    const problem = state.queue[state.currentIndex];

    // Remove all dynamic children (keep .chain__given and .chain__result + their operators)
    // Strategy: clear and re-render everything except the given fraction
    const chain = dom.chain;

    // Remove everything after the given fraction
    while (chain.children.length > 1) {
        chain.removeChild(chain.lastChild);
    }

    // Add each selected factor as a step
    state.selectedFactors.forEach((factorId, stepIdx) => {
        const factor = problem.factors.find(f => f.id === factorId);
        if (!factor) return;

        // × operator
        const op = document.createElement('span');
        op.className = 'chain__op';
        op.setAttribute('aria-hidden', 'true');
        op.textContent = '×';

        // Fraction
        const frac = document.createElement('div');
        frac.className = 'chain__step fraction';
        frac.dataset.step = stepIdx;
        frac.setAttribute('role', 'group');
        frac.setAttribute('aria-label',
            `Step ${stepIdx + 1}: ${formatFractionPart(factor.numVal, factor.numUnit)} over ${formatFractionPart(factor.denVal, factor.denUnit)}`);

        const num = document.createElement('span');
        num.className = 'fraction__num';
        num.textContent = formatFractionPart(factor.numVal, factor.numUnit);

        const bar = document.createElement('span');
        bar.className = 'fraction__bar';
        bar.setAttribute('aria-hidden', 'true');

        const den = document.createElement('span');
        den.className = 'fraction__den';
        den.textContent = formatFractionPart(factor.denVal, factor.denUnit);

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'chain__step-remove';
        removeBtn.setAttribute('aria-label',
            `Remove step ${stepIdx + 1} from chain: ${factor.label}`);
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            // Deselect in bank + remove from chain
            const tile = dom.factorBankGrid
                .querySelector(`[data-factor-id="${factorId}"]`);
            if (tile) {
                tile.setAttribute('aria-pressed', 'false');
                tile.setAttribute('aria-label',
                    `Add conversion factor: ${factor.label}. Press to add to chain.`);
            }
            const i = state.selectedFactors.indexOf(factorId);
            if (i !== -1) state.selectedFactors.splice(i, 1);
            rebuildChainDOM();
            evaluateChain();
        });

        frac.append(num, bar, den, removeBtn);
        chain.append(op, frac);
    });

    // = operator
    const eq = document.createElement('span');
    eq.className = 'chain__op chain__op--equals';
    eq.setAttribute('aria-hidden', 'true');
    eq.textContent = '=';

    // Result fraction (re-append)
    const resultFrac = document.querySelector('.chain__result') ||
        buildResultFraction();

    chain.append(eq, resultFrac);
}

function buildResultFraction() {
    const div = document.createElement('div');
    div.className = 'chain__result fraction';
    div.id = 'chain-result';
    div.setAttribute('aria-live', 'assertive');
    div.setAttribute('aria-atomic', 'true');

    const num = document.createElement('span');
    num.className = 'fraction__num';
    num.id = 'chain-result-num';
    num.setAttribute('aria-label', 'Result');
    num.textContent = '?';

    const bar = document.createElement('span');
    bar.className = 'fraction__bar';
    bar.setAttribute('aria-hidden', 'true');

    const den = document.createElement('span');
    den.className = 'fraction__den';
    den.id = 'chain-result-den';
    den.textContent = '1';

    div.append(num, bar, den);
    return div;
}


/* ================================================================
   8. UNIT-CANCELLATION ENGINE
   Tracks which units are in the running numerator/denominator,
   marks matched pairs as cancelled, and computes the live result.
================================================================ */
function evaluateChain() {
    const problem = state.queue[state.currentIndex];

    // Remove any existing chain-status banner
    const existingStatus = dom.chain.parentElement.querySelector('.chain-status');
    if (existingStatus) existingStatus.remove();

    if (state.selectedFactors.length === 0) {
        updateResultDisplay('?', '1');
        return;
    }

    // Build a list of all { value, unit, position: 'num'|'den', stepIndex, elRef }
    // The given value starts as numerator with denominator = 1
    let runningValue = problem.given.value;

    // Multiply all numerators, divide all denominators
    state.selectedFactors.forEach(factorId => {
        const factor = problem.factors.find(f => f.id === factorId);
        if (!factor) return;
        runningValue *= factor.numVal;
        runningValue /= factor.denVal;
    });

    // Determine remaining units after cancellation
    // We track unit tokens: each factor contributes numUnit to pool, denUnit cancels from pool
    const unitPool = [];   // units remaining in numerator
    const denPool = [];   // units remaining in denominator

    // Start with given unit in numerator pool
    unitPool.push(problem.given.unit);

    state.selectedFactors.forEach(factorId => {
        const factor = problem.factors.find(f => f.id === factorId);
        if (!factor) return;

        // Factor numerator unit: try to cancel with something in denPool, else add to unitPool
        if (factor.numUnit) {
            const cancelIdx = denPool.indexOf(factor.numUnit);
            if (cancelIdx !== -1) {
                denPool.splice(cancelIdx, 1);   // cancelled
            } else {
                unitPool.push(factor.numUnit);
            }
        }

        // Factor denominator unit: try to cancel with something in unitPool, else add to denPool
        if (factor.denUnit) {
            const cancelIdx = unitPool.indexOf(factor.denUnit);
            if (cancelIdx !== -1) {
                unitPool.splice(cancelIdx, 1);  // cancelled
            } else {
                denPool.push(factor.denUnit);
            }
        }
    });

    const remainingNum = unitPool.join('·') || '1';
    const remainingDen = denPool.join('·') || '1';
    const resultUnit = remainingDen === '1' ? remainingNum : `${remainingNum}/${remainingDen}`;

    // Update result display
    updateResultDisplay(formatNumber(runningValue), remainingDen);
    dom.chainResultNum.textContent = `${formatNumber(runningValue)} ${remainingNum}`;

    // Apply cancelled styling to chain step elements
    applyUnitCancellationStyling(problem);

    // Show chain status
    renderChainStatus(resultUnit, problem.answer.unit);
}

/** Re-scan chain DOM and apply .cancelled class where units cancel */
function applyUnitCancellationStyling(problem) {
    // Simple approach: mark units that are consumed by a later denominator
    // Build a flat list of { unit, role:'num'|'den', el }
    const tokens = [];

    // Given numerator
    const givenNumEl = dom.chain.querySelector('.chain__given .fraction__num');
    if (givenNumEl) {
        tokens.push({ unit: problem.given.unit, role: 'num', el: givenNumEl });
    }

    // Each step
    const steps = dom.chain.querySelectorAll('.chain__step');
    steps.forEach(step => {
        const numEl = step.querySelector('.fraction__num');
        const denEl = step.querySelector('.fraction__den');

        const factor = getFactorForStep(step, problem);
        if (!factor) return;

        if (factor.numUnit) tokens.push({ unit: factor.numUnit, role: 'num', el: numEl });
        if (factor.denUnit) tokens.push({ unit: factor.denUnit, role: 'den', el: denEl });
    });

    // Reset all cancelled styles first
    tokens.forEach(t => {
        t.el.classList.remove('cancelled');
        // Restore aria-label to plain value
        t.el.removeAttribute('aria-label');
    });

    // Now find cancelling pairs: a 'num' token cancels the nearest later 'den' token with the same unit
    // and vice versa (den cancels earlier num)
    const used = new Set();

    tokens.forEach((tokenA, i) => {
        if (used.has(i)) return;
        for (let j = i + 1; j < tokens.length; j++) {
            if (used.has(j)) continue;
            const tokenB = tokens[j];
            if (tokenA.unit === tokenB.unit && tokenA.role !== tokenB.role) {
                // These cancel
                tokenA.el.classList.add('cancelled');
                tokenB.el.classList.add('cancelled');
                tokenA.el.setAttribute('aria-label', `${tokenA.el.textContent} — cancelled`);
                tokenB.el.setAttribute('aria-label', `${tokenB.el.textContent} — cancelled`);
                used.add(i);
                used.add(j);
                break;
            }
        }
    });
}

function getFactorForStep(stepEl, problem) {
    const stepIdx = parseInt(stepEl.dataset.step, 10);
    const factorId = state.selectedFactors[stepIdx];
    return problem.factors.find(f => f.id === factorId) || null;
}

function updateResultDisplay(numText, denText) {
    const numEl = document.getElementById('chain-result-num');
    const denEl = document.getElementById('chain-result-den');
    if (numEl) numEl.textContent = numText;
    if (denEl) denEl.textContent = denText === '1' ? '' : denText;
}

function renderChainStatus(resultUnit, targetUnit) {
    const container = dom.chain.parentElement;
    const status = document.createElement('div');
    status.className = 'chain-status';
    status.setAttribute('aria-live', 'polite');

    // Normalise units for comparison (strip spaces, lowercase)
    const normalise = u => u.toLowerCase().replace(/\s/g, '').replace('·', '');
    const match = normalise(resultUnit) === normalise(targetUnit);

    if (state.selectedFactors.length === 0) {
        return; // nothing to show
    } else if (match) {
        status.classList.add('chain-status--valid');
        status.innerHTML =
            `<span aria-hidden="true">✓</span> Units cancel correctly — remaining unit: <strong>${resultUnit}</strong>`;
    } else {
        status.classList.add('chain-status--incomplete');
        status.innerHTML =
            `<span aria-hidden="true">⚠</span> Remaining unit: <strong>${resultUnit}</strong> — target: <strong>${targetUnit}</strong>`;
    }

    container.insertBefore(status, dom.chain.nextSibling);
}


/* ================================================================
   9. ANSWER VALIDATION
================================================================ */
function checkAnswer() {
    if (state.answered) return;

    const problem = state.queue[state.currentIndex];
    const rawNum = dom.answerNumber.value.trim();
    const rawUnit = dom.answerUnit.value.trim();

    if (!rawNum) {
        announceFeedback('Please enter a numerical value.', 'neutral');
        dom.answerNumber.focus();
        return;
    }

    const parsed = parseScientificNotation(rawNum);
    if (isNaN(parsed)) {
        announceFeedback(
            'That doesn\'t look like a number. Try a decimal (e.g. 8.17) or scientific notation (e.g. 8.17e3).',
            'incorrect'
        );
        dom.answerNumber.focus();
        return;
    }

    const { value: correctVal, unit: correctUnit, tolerance } = problem.answer;
    const numCorrect = withinTolerance(parsed, correctVal, tolerance);
    const unitCorrect = normaliseUnit(rawUnit) === normaliseUnit(correctUnit);

    if (numCorrect && unitCorrect) {
        // ✓ Correct
        state.answered = true;
        dom.answerNumber.classList.add('is-correct');
        dom.answerUnit.classList.add('is-correct');
        dom.btnCheckAnswer.disabled = true;

        announceFeedback(
            `Correct! ${formatNumber(parsed)} ${rawUnit} is right.`,
            'correct'
        );

        // Mark result fraction as valid
        const resultEl = document.getElementById('chain-result');
        if (resultEl) resultEl.classList.add('is-valid');

        // Update progress bar to include this problem
        const pct = ((state.currentIndex + 1) / state.queue.length) * 100;
        dom.progressBar.style.width = `${pct}%`;

        // Enable Next
        dom.btnNextProblem.disabled = false;
        dom.btnNextProblem.focus();

        // Record result
        recordResult(problem, rawNum, rawUnit, true);
        saveProgressToStorage();

    } else {
        // ✗ Incorrect
        dom.answerNumber.classList.add('is-incorrect');
        dom.answerUnit.classList.add('is-incorrect');

        let message = 'Not quite. ';
        if (!numCorrect && !unitCorrect) {
            message += 'Both the value and the unit need attention.';
        } else if (!numCorrect) {
            message += `The unit looks right, but check your arithmetic.`;
        } else {
            message += `The value looks right, but check the unit — expected ${correctUnit}.`;
        }
        message += ' Check that all units cancel correctly in your chain.';

        announceFeedback(message, 'incorrect');

        // Clear incorrect styling after a short delay so re-entry feels fresh
        setTimeout(() => {
            dom.answerNumber.classList.remove('is-incorrect');
            dom.answerUnit.classList.remove('is-incorrect');
        }, 2500);

        recordResult(problem, rawNum, rawUnit, false);
    }
}

/** Post feedback into the live region */
function announceFeedback(message, type) {
    // type: 'correct' | 'incorrect' | 'neutral'
    dom.answerFeedback.innerHTML = '';
    const div = document.createElement('div');
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');

    if (type === 'correct') {
        div.className = 'answer-feedback__correct';
        icon.textContent = '✓';
    } else if (type === 'incorrect') {
        div.className = 'answer-feedback__incorrect';
        icon.textContent = '✗';
    } else {
        div.className = 'answer-feedback__neutral';
        icon.textContent = 'ℹ';
    }

    div.appendChild(icon);
    div.appendChild(document.createTextNode(' ' + message));
    dom.answerFeedback.appendChild(div);
}

function recordResult(problem, userNum, userUnit, correct) {
    // Update existing record if the student re-attempts (only first correct counts)
    const existing = state.results.find(r => r.problemId === problem.id);
    if (!existing) {
        state.results.push({
            problemId: problem.id,
            question: problem.question,
            userAnswer: `${userNum} ${userUnit}`,
            correctAnswer: `${formatNumber(problem.answer.value)} ${problem.answer.unit}`,
            correct,
        });
    }
}


/* ================================================================
   10. HINT SYSTEM
================================================================ */
function toggleHintPanel() {
    const expanded = dom.btnHint.getAttribute('aria-expanded') === 'true';
    if (expanded) {
        dom.hintContent.hidden = true;
        dom.btnHint.setAttribute('aria-expanded', 'false');
    } else {
        // Show first hint (or current hint)
        if (state.hintsUsed === 0) showNextHint();
        dom.hintContent.hidden = false;
        dom.btnHint.setAttribute('aria-expanded', 'true');
    }
}

function showNextHint() {
    const problem = state.queue[state.currentIndex];
    const hints = problem.hints || [];

    if (state.hintsUsed >= hints.length) return;

    dom.hintText.textContent = hints[state.hintsUsed];
    state.hintsUsed++;

    // Update count label
    dom.hintCount.textContent = `(${state.hintsUsed} of ${hints.length})`;
    dom.hintCount.setAttribute('aria-label', `${state.hintsUsed} of ${hints.length} hints used`);

    // Show/hide "Next hint" button
    dom.btnHintNext.hidden = state.hintsUsed >= hints.length;

    // Ensure panel is open
    dom.hintContent.hidden = false;
    dom.btnHint.setAttribute('aria-expanded', 'true');
}


/* ================================================================
   11. NAVIGATION
================================================================ */
function goToNextProblem() {
    if (state.currentIndex < state.queue.length - 1) {
        state.currentIndex++;
        loadProblem(state.currentIndex);
    } else {
        // End of queue — show summary
        showSummary();
    }
}

function goToPrevProblem() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        loadProblem(state.currentIndex);
    }
}


/* ================================================================
   12. SESSION SUMMARY
================================================================ */
function showSummary() {
    showSection('summary');

    const total = state.queue.length;
    const correct = state.results.filter(r => r.correct).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    dom.summaryScore.textContent = correct;
    dom.summaryTotal.textContent = total;
    dom.summaryPct.textContent = `${pct}%`;

    // Build table rows
    dom.summaryTbody.innerHTML = '';
    state.queue.forEach((problem, i) => {
        const result = state.results.find(r => r.problemId === problem.id);
        const tr = document.createElement('tr');

        const tdNum = document.createElement('td');
        tdNum.textContent = i + 1;

        const tdQ = document.createElement('td');
        tdQ.textContent = problem.question;

        const tdUser = document.createElement('td');
        tdUser.style.fontFamily = 'var(--font-mono)';
        tdUser.textContent = result ? result.userAnswer : '—';

        const tdCorrect = document.createElement('td');
        tdCorrect.style.fontFamily = 'var(--font-mono)';
        tdCorrect.textContent = `${formatNumber(problem.answer.value)} ${problem.answer.unit}`;

        const tdResult = document.createElement('td');
        if (!result) {
            tdResult.textContent = 'Skipped';
            tdResult.className = 'summary__result--incorrect';
        } else if (result.correct) {
            tdResult.textContent = '✓ Correct';
            tdResult.className = 'summary__result--correct';
        } else {
            tdResult.textContent = '✗ Incorrect';
            tdResult.className = 'summary__result--incorrect';
        }

        tr.append(tdNum, tdQ, tdUser, tdCorrect, tdResult);
        dom.summaryTbody.appendChild(tr);
    });

    // Focus heading for screen reader announcement
    document.getElementById('summary-heading').focus();

    // Scroll to top of summary
    dom.summary.scrollIntoView({ behavior: 'smooth', block: 'start' });

    clearProgressFromStorage();
}

function retrySession() {
    state.results = [];
    state.currentIndex = 0;
    state.queue = shuffleArray(state.queue);   // re-shuffle for variety
    showSection('workspace');
    loadProblem(0);
}

function exportResults() {
    const lines = [
        'Unit Conversions — Session Results',
        `Date: ${new Date().toLocaleString()}`,
        `Level: ${state.level}  Department: ${state.dept}`,
        `Score: ${state.results.filter(r => r.correct).length} / ${state.queue.length}`,
        '',
        'Problem-by-problem breakdown:',
        '─'.repeat(60),
    ];

    state.queue.forEach((problem, i) => {
        const result = state.results.find(r => r.problemId === problem.id);
        lines.push(`${i + 1}. ${problem.question}`);
        lines.push(`   Your answer:    ${result ? result.userAnswer : 'Not attempted'}`);
        lines.push(`   Correct answer: ${formatNumber(problem.answer.value)} ${problem.answer.unit}`);
        lines.push(`   Result: ${result ? (result.correct ? '✓ Correct' : '✗ Incorrect') : 'Skipped'}`);
        lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-conversions-results-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}


/* ================================================================
   13. PROGRESS PERSISTENCE (localStorage)
   Saves enough to restore mid-session on accidental navigation.
================================================================ */
const STORAGE_KEY = 'unitConversions_session';

function saveProgressToStorage() {
    try {
        const data = {
            dept: state.dept,
            level: state.level,
            currentIndex: state.currentIndex,
            queueIds: state.queue.map(p => p.id),
            results: state.results,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) { /* storage unavailable — silent fail */ }
}

function loadProgressFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);

        // Reconstruct queue from saved ids
        const queue = (data.queueIds || [])
            .map(id => PROBLEMS.find(p => p.id === id))
            .filter(Boolean);

        if (queue.length === 0) return;

        state.dept = data.dept || 'all';
        state.level = data.level || 1;
        state.queue = queue;
        state.currentIndex = data.currentIndex || 0;
        state.results = data.results || [];

        // Offer to resume
        offerResume();
    } catch (_) { /* corrupt data — silent fail */ }
}

function offerResume() {
    // Simple inline banner rather than a modal, to avoid focus-trap complexity
    const banner = document.createElement('div');
    banner.className = 'resume-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
    <p>You have an unfinished session. Would you like to continue where you left off?</p>
    <div class="resume-banner__actions">
      <button class="btn btn--primary btn--sm" id="btn-resume-yes">Continue session</button>
      <button class="btn btn--ghost btn--sm"   id="btn-resume-no">Start fresh</button>
    </div>`;

    // Insert after skip link
    document.body.insertBefore(banner, document.body.firstChild.nextSibling);

    document.getElementById('btn-resume-yes').addEventListener('click', () => {
        banner.remove();
        showSection('workspace');
        loadProblem(state.currentIndex);
    });

    document.getElementById('btn-resume-no').addEventListener('click', () => {
        banner.remove();
        clearProgressFromStorage();
    });
}

function clearProgressFromStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { }
}


/* ================================================================
   14. MOBILE NAVIGATION
================================================================ */
function toggleMobileNav() {
    const expanded = dom.navToggle.getAttribute('aria-expanded') === 'true';
    setMobileNav(!expanded);
}

function closeMobileNav() {
    setMobileNav(false);
}

function setMobileNav(open) {
    dom.navToggle.setAttribute('aria-expanded', String(open));
    dom.navList.classList.toggle('is-open', open);
}

// Close nav when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.primary-nav') && !e.target.closest('.primary-nav__toggle')) {
        closeMobileNav();
    }
});

// Close nav on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
});


/* ================================================================
   15. UTILITY HELPERS
================================================================ */

/** Show one section, hide the others */
function showSection(name) {
    // 'level-selector' | 'workspace' | 'summary'
    dom.levelSelector.hidden = name !== 'level-selector';
    dom.workspace.hidden = name !== 'workspace';
    dom.summary.hidden = name !== 'summary';
}

/** Format a number for display — avoids ugly floating-point noise */
function formatNumber(n) {
    if (n === undefined || n === null) return '';
    // If the number is very small or very large, use exponential notation
    const abs = Math.abs(n);
    if (abs !== 0 && (abs < 0.001 || abs >= 1e7)) {
        return n.toExponential(3);
    }
    // Round to 4 significant figures to remove floating-point noise
    const sig = parseFloat(n.toPrecision(4));
    // Remove trailing zeros after decimal
    return sig.toString();
}

/** Parse a string that may be in scientific notation: "3.2e4", "3.2E4", "3.2×10^4" */
function parseScientificNotation(str) {
    // normalise "×10^" notation to e-notation
    const normalised = str
        .replace(/\s/g, '')
        .replace(/×10\^/g, 'e')
        .replace(/×10/g, 'e')
        .replace(/\*10\^/g, 'e');
    return parseFloat(normalised);
}

/** Check if value is within fractional tolerance of target */
function withinTolerance(value, target, tolerance) {
    if (target === 0) return Math.abs(value) < 1e-10;
    return Math.abs((value - target) / target) <= tolerance;
}

/** Normalise a unit string for comparison: lowercase, no spaces, handle synonyms */
function normaliseUnit(unit) {
    return unit
        .toLowerCase()
        .replace(/\s/g, '')
        .replace('·', '')
        .replace('*', '')
        // common synonyms
        .replace('liters', 'l')
        .replace('liter', 'l')
        .replace('litres', 'l')
        .replace('litre', 'l')
        .replace('meters', 'm')
        .replace('meter', 'm')
        .replace('metres', 'm')
        .replace('metre', 'm')
        .replace('grams', 'g')
        .replace('gram', 'g')
        .replace('kilograms', 'kg')
        .replace('kilogram', 'kg')
        .replace('seconds', 's')
        .replace('second', 's')
        .replace('minutes', 'min')
        .replace('minute', 'min')
        .replace('hours', 'hr')
        .replace('hour', 'hr');
}

/** Capitalise first letter */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
