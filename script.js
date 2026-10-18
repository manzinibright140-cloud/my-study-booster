'use strict';

document.addEventListener('DOMContentLoaded', () => {
  setupPepTalks();
  setupChecklist();
  setupTimer();
  setupKindReminder();
});

function setupPepTalks() {
  const messages = [
    "You don't need to feel ready to begin. Open your notes, choose one small thing, and start there. The next step is enough for now.",
    "You've handled difficult topics before. Break this one into smaller pieces, work carefully, and give yourself time to understand it.",
    "A question that looks difficult is not proof that you cannot do it. Write down what you know, identify what's being asked, and take it step by step.",
    "You are allowed to take a break without feeling guilty. Rest helps you return with a clearer mind.",
    "Your progress might feel slow when you're tired, but every example you practise and every concept you understand is building something.",
    "In the exam, read carefully, show your working, manage your time, and move on when you need to. You can come back to a hard question.",
    "You don't need a perfect study day. You need a realistic plan and the courage to begin. Keep it simple; keep going."
  ];
  let previous = 0;
  const button = document.getElementById('pep-button');
  const output = document.getElementById('pep-output');
  const scrollButton = document.getElementById('scroll-pep');
  if (scrollButton) scrollButton.addEventListener('click', () => {
    document.getElementById('pep-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNewMessage();
  });
  if (button) button.addEventListener('click', showNewMessage);
  function showNewMessage() {
    if (!output) return;
    let next;
    do { next = Math.floor(Math.random() * messages.length); } while (messages.length > 1 && next === previous);
    previous = next;
    output.animate?.([{ opacity: 0.35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    output.textContent = messages[next];
  }
}

function setupChecklist() {
  const checks = Array.from(document.querySelectorAll('[data-task]'));
  const label = document.getElementById('progress-label');
  const percent = document.getElementById('progress-percent');
  const fill = document.getElementById('progress-fill');
  const bar = document.getElementById('progress-bar');
  const reset = document.getElementById('reset-checklist');
  if (!checks.length || !label || !percent || !fill || !bar) return;

  const storageKey = 'myExamCheerChecklistV1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_error) { saved = {}; }
  checks.forEach((check) => {
    check.checked = Boolean(saved[check.dataset.task]);
    check.addEventListener('change', saveAndRender);
  });
  reset?.addEventListener('click', () => {
    checks.forEach((check) => { check.checked = false; });
    saveAndRender();
  });
  function saveAndRender() {
    const state = {};
    checks.forEach((check) => { state[check.dataset.task] = check.checked; });
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_error) { /* Progress still updates for this session. */ }
    const done = checks.filter((check) => check.checked).length;
    const ratio = checks.length ? done / checks.length : 0;
    label.textContent = `${done} of ${checks.length} completed`;
    percent.textContent = `${Math.round(ratio * 100)}%`;
    fill.style.width = `${ratio * 100}%`;
    bar.setAttribute('aria-valuenow', String(done));
  }
  saveAndRender();
}

function setupTimer() {
  const display = document.getElementById('timer-display');
  const modeLabel = document.getElementById('timer-mode');
  const status = document.getElementById('timer-status');
  const start = document.getElementById('timer-start');
  const reset = document.getElementById('timer-reset');
  const circle = document.getElementById('timer-circle');
  if (!display || !modeLabel || !status || !start || !reset || !circle) return;
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;
  let remaining = FOCUS;
  let mode = 'focus';
  let interval = null;
  let endAt = null;

  function draw() {
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
    modeLabel.textContent = mode === 'focus' ? 'FOCUS SESSION' : 'BREAK TIME';
    const total = mode === 'focus' ? FOCUS : BREAK;
    const elapsed = total - remaining;
    circle.style.background = `conic-gradient(#69b4e8 ${(elapsed / total) * 360}deg, #e7f4ff 0deg)`;
  }
  function stop() {
    if (interval !== null) window.clearInterval(interval);
    interval = null;
    endAt = null;
  }
  function finish() {
    stop();
    if (mode === 'focus') {
      mode = 'break'; remaining = BREAK;
      status.textContent = 'Nice work. You have earned a five-minute break.';
      start.textContent = 'Start break';
    } else {
      mode = 'focus'; remaining = FOCUS;
      status.textContent = 'Break complete. Ready for another focus session?';
      start.textContent = 'Start focus';
    }
    draw();
  }
  start.addEventListener('click', () => {
    if (interval !== null) {
      stop(); start.textContent = 'Resume'; status.textContent = 'Paused. Continue when you are ready.'; return;
    }
    if (remaining <= 0) remaining = mode === 'focus' ? FOCUS : BREAK;
    start.textContent = 'Pause';
    status.textContent = mode === 'focus' ? 'Focus on one task. You can do this.' : 'Stretch, drink water, and rest your eyes.';
    endAt = Date.now() + remaining * 1000;
    interval = window.setInterval(() => {
      remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      draw();
      if (remaining <= 0) finish();
    }, 250);
  });
  reset.addEventListener('click', () => {
    stop(); mode = 'focus'; remaining = FOCUS; draw(); start.textContent = 'Start focus'; status.textContent = 'Ready when you are.';
  });
  draw();
}

function setupKindReminder() {
  const button = document.getElementById('kindness-button');
  const output = document.getElementById('kindness-output');
  if (!button || !output) return;
  const messages = [
    'You are more than one exam, one result, or one difficult day.',
    'You can ask for help. You do not have to figure everything out alone.',
    'Progress counts even when it is not perfect.',
    'Rest is part of doing well, not a reward you have to earn.',
    'Take one breath, then do the next reasonable thing.'
  ];
  let previous = -1;
  button.addEventListener('click', () => {
    let index;
    do { index = Math.floor(Math.random() * messages.length); } while (messages.length > 1 && index === previous);
    previous = index;
    output.textContent = messages[index];
  });
}
