/**
 * REALITY HIT — DIGITAL MONK FRONTEND CONTROLLER
 * Handles monastic interactions, transition animations, ambient canvas, and Web Audio synthesis.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const queryInput = document.getElementById('query-input');
  const submitBtn = document.getElementById('submit-btn');
  const truthContainer = document.getElementById('truth-container');
  const truthText = document.getElementById('truth-text');
  const monasticPulse = document.getElementById('monastic-pulse');
  const statusText = document.getElementById('status-text');
  
  // Actions
  const actionCopy = document.getElementById('action-copy');
  const actionSpeak = document.getElementById('action-speak');
  const actionReflect = document.getElementById('action-reflect');
  
  // Settings & Journal
  const settingsTrigger = document.getElementById('settings-trigger');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const apiKeySection = document.getElementById('api-key-section');
  const apiKeyInput = document.getElementById('api-key-input');
  const systemPromptViewer = document.getElementById('system-prompt-viewer');
  
  const journalDrawer = document.getElementById('journal-drawer');
  const closeJournal = document.getElementById('close-journal');
  const journalList = document.getElementById('journal-list');
  
  // Toggles
  const toggleSound = document.getElementById('toggle-sound');
  const toggleCanvas = document.getElementById('toggle-canvas');
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  const providerCards = document.querySelectorAll('.provider-card');

  // State
  let currentProvider = 'local';
  let zenJournalEntries = [];
  let isThinking = false;
  let audioCtx = null;

  // ==========================================================================
  // INITIALIZATION & SYSTEM PROMPT AUDIT
  // ==========================================================================
  try {
    const res = await fetch('/api/system-prompt');
    if (res.ok) {
      const data = await res.json();
      if (systemPromptViewer && data.systemPrompt) {
        systemPromptViewer.textContent = data.systemPrompt;
      }
    }
  } catch (err) {
    console.warn('Could not load prompt via API, using fallback display.');
  }

  // Load initial gentle truth on opening
  setTimeout(() => {
    deliverTruth('Silence reveals truth', 'Init');
  }, 300);

  // ==========================================================================
  // AMBIENT ETHEREAL CANVAS (Subtle Ripple/Particle Field)
  // ==========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let ripples = [];

  function initCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.35 + 0.1
      });
    }
  }

  function createRipple(x, y) {
    if (!toggleCanvas || !toggleCanvas.checked) return;
    ripples.push({
      x, y,
      radius: 5,
      maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.4,
      alpha: 0.15
    });
  }

  function animateCanvas() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (toggleCanvas && toggleCanvas.checked) {
      // Draw particles
      ctx.fillStyle = '#1A1A1A';
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw expanding zen ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.5;
        r.alpha *= 0.97;
        if (r.alpha <= 0.005 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 1;
        ctx.globalAlpha = r.alpha;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    requestAnimationFrame(animateCanvas);
  }

  window.addEventListener('resize', initCanvas);
  initCanvas();
  animateCanvas();

  // ==========================================================================
  // WEB AUDIO TIBETAN SINGING BOWL RESONANCE SYNTHESIZER
  // ==========================================================================
  function playZenChime() {
    if (!toggleSound || !toggleSound.checked) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      // Fundamental monastic resonance (~220Hz + harmonic overtone ~660Hz)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, now); // A3
      osc1.frequency.exponentialRampToValueAtTime(218.5, now + 3.5);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, now); // Harmonic overtone
      osc2.frequency.exponentialRampToValueAtTime(656, now + 3.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.6);
      osc2.stop(now + 3.6);
    } catch (e) {
      // Audio synth ignored if blocked by browser policy
    }
  }

  // ==========================================================================
  // REALITY HIT REQUEST & TRANSITION LOGIC
  // ==========================================================================
  async function requestTruth() {
    if (isThinking) return;
    const query = queryInput.value.trim();
    if (!query) return;

    isThinking = true;
    queryInput.disabled = true;
    submitBtn.style.opacity = '0.5';

    // Create ripple from input box center
    const rect = queryInput.getBoundingClientRect();
    createRipple(rect.left + rect.width / 2, rect.top);

    // 1. Fade out previous truth
    truthContainer.classList.add('fade-out');

    // 2. Show monastic pulse after brief dissolve
    setTimeout(() => {
      monasticPulse.classList.remove('hidden');
    }, 350);

    try {
      const response = await fetch('/api/truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          provider: currentProvider,
          apiKey: apiKeyInput ? apiKeyInput.value.trim() : undefined
        })
      });

      let truthResult = 'Silence';
      if (response.ok) {
        const data = await response.json();
        truthResult = data.truth || 'Silence';
      } else {
        truthResult = 'Chaos is temporary';
      }

      // Enforce Rule #5 just in case: strip any period or exclamation
      truthResult = truthResult.replace(/[.!?]+$/, '').trim();

      // Wait a minimum reflection interval for zen transition
      setTimeout(() => {
        monasticPulse.classList.add('hidden');
        deliverTruth(truthResult, query);
        isThinking = false;
        queryInput.disabled = false;
        submitBtn.style.opacity = '1';
        queryInput.value = '';
        queryInput.focus();
      }, 700);

    } catch (error) {
      console.error('Truth fetch failed:', error);
      monasticPulse.classList.add('hidden');
      deliverTruth('Stillness outlasts storm', query);
      isThinking = false;
      queryInput.disabled = false;
      submitBtn.style.opacity = '1';
      queryInput.value = '';
      queryInput.focus();
    }
  }

  function deliverTruth(truth, query) {
    if (!truthText) return;
    truthText.textContent = truth;
    truthContainer.classList.remove('fade-out');

    // Play singing bowl chime
    if (query !== 'Init') {
      playZenChime();
      createRipple(window.innerWidth / 2, window.innerHeight / 2);
    }

    // Add to journal if it was from a user query
    if (query && query !== 'Init') {
      zenJournalEntries.unshift({ truth, query, time: new Date().toLocaleTimeString() });
      renderJournal();
    }
  }

  // Event Listeners for Input & Submit
  if (submitBtn) {
    submitBtn.addEventListener('click', requestTruth);
  }
  if (queryInput) {
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        requestTruth();
      }
    });
  }

  // ==========================================================================
  // MICRO-ACTIONS (Copy, Speak, Reflect)
  // ==========================================================================
  if (actionCopy) {
    actionCopy.addEventListener('click', () => {
      const text = truthText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const span = actionCopy.querySelector('span');
        const orig = span.textContent;
        span.textContent = 'Copied';
        actionCopy.classList.add('active');
        setTimeout(() => {
          span.textContent = orig;
          actionCopy.classList.remove('active');
        }, 1800);
      });
    });
  }

  if (actionSpeak) {
    actionSpeak.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(truthText.textContent);
        utterance.rate = 0.82; // Calm, monastic cadence
        utterance.pitch = 0.92;
        window.speechSynthesis.speak(utterance);
        actionSpeak.classList.add('active');
        utterance.onend = () => actionSpeak.classList.remove('active');
      }
    });
  }

  if (actionReflect && journalDrawer) {
    actionReflect.addEventListener('click', () => {
      journalDrawer.classList.remove('hidden');
    });
  }

  if (closeJournal && journalDrawer) {
    closeJournal.addEventListener('click', () => {
      journalDrawer.classList.add('hidden');
    });
  }

  function renderJournal() {
    if (!journalList) return;
    if (zenJournalEntries.length === 0) {
      journalList.innerHTML = '<p class="journal-empty">No reflections recorded during this meditation yet.</p>';
      return;
    }
    journalList.innerHTML = zenJournalEntries.map(entry => `
      <div class="journal-entry">
        <div class="journal-entry-truth">${entry.truth}</div>
        <div class="journal-entry-query">Query: "${entry.query}" (${entry.time})</div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // MONASTIC ORACLE SETTINGS MODAL
  // ==========================================================================
  if (settingsTrigger && settingsModal) {
    settingsTrigger.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }
  if (closeSettings && settingsModal) {
    closeSettings.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  providerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentProvider = e.target.value;
      providerCards.forEach(card => card.classList.remove('active'));
      e.target.closest('.provider-card').classList.add('active');

      if (currentProvider === 'gemini' || currentProvider === 'openai') {
        if (apiKeySection) apiKeySection.classList.remove('hidden');
        if (statusText) statusText.textContent = currentProvider === 'gemini' ? 'Google Gemini Cloud Mode' : 'OpenAI Cloud Mode';
      } else {
        if (apiKeySection) apiKeySection.classList.add('hidden');
        if (statusText) statusText.textContent = 'Monastic Intelligence Engine (Instant)';
      }
    });
  });

});
