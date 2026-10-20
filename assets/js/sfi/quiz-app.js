// ════════════════════════════════════════════════════
// Quiz App – Orchestration & Event Binding
// Single Responsibility: Initialize modules,
// wire user events to data and UI operations.
// ════════════════════════════════════════════════════

const QuizApp = (() => {
  let sortMode = 'urgency';

  async function init() {
    QuizData.fetchSpecs();
    QuizUI.initAutocomplete();

    await QuizData.loadGear();
    QuizUI.updateAuthBanner(QuizData.isRemote(), QuizData.isAuthed());
    render();

    document.getElementById('gearName').addEventListener('keydown', e => { if (e.key === 'Enter') addGearAction(); });
    document.getElementById('gearDate').addEventListener('keydown', e => { if (e.key === 'Enter') addGearAction(); });
  }

  async function addGearAction() {
    const nameEl = document.getElementById('gearName');
    const specEl = document.getElementById('gearSpec');
    const dateEl = document.getElementById('gearDate');

    const name = nameEl.value.trim();
    if (!name) { alert('Enter an equipment name.'); return; }

    await QuizData.addItem(name, specEl.value.trim(), dateEl.value, QuizUI.getSelectedSpec());
    render();

    nameEl.value = '';
    specEl.value = '';
    dateEl.value = '';
    QuizUI.clearSelectedSpec();
  }

  async function removeGearAction(id) {
    await QuizData.removeItem(id);
    render();
  }

  function toggleSort() {
    const modes = ['urgency', 'name', 'date'];
    sortMode = modes[(modes.indexOf(sortMode) + 1) % modes.length];
    document.getElementById('sortLabel').textContent =
      sortMode === 'urgency' ? 'Urgency' : sortMode === 'name' ? 'Name' : 'Date';
    render();
  }

  function render() {
    QuizUI.renderGear(sortMode);
  }

  return { init, addGear: addGearAction, removeGear: removeGearAction, toggleSort };
})();

// Global helpers for onclick handlers in HTML
function addGear() { QuizApp.addGear(); }
function removeGear(id) { QuizApp.removeGear(id); }
function toggleSort() { QuizApp.toggleSort(); }

document.addEventListener('DOMContentLoaded', () => QuizApp.init());
