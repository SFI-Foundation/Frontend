// ════════════════════════════════════════════════════
// Quiz App – Orchestration & Event Binding
// Single Responsibility: Initialize modules,
// wire user events to data and UI operations.
// ════════════════════════════════════════════════════

const QuizApp = (() => {
  let sortMode = 'urgency';
  let adding = false;

  async function init() {
    QuizData.fetchSpecs();
    QuizUI.initAutocomplete();

    await QuizData.loadGear();
    render();

    document.getElementById('gearAddBtn').addEventListener('click', addGearAction);
    document.getElementById('gearSortBtn').addEventListener('click', toggleSort);
    document.getElementById('gearName').addEventListener('keydown', e => { if (e.key === 'Enter') addGearAction(); });
    document.getElementById('gearDate').addEventListener('keydown', e => { if (e.key === 'Enter') addGearAction(); });
  }

  async function addGearAction() {
    if (adding) return;
    const nameEl = document.getElementById('gearName');
    const specEl = document.getElementById('gearSpec');
    const dateEl = document.getElementById('gearDate');

    const name = nameEl.value.trim();
    if (!name) { alert('Enter an equipment name.'); return; }

    adding = true;
    const button = document.getElementById('gearAddBtn');
    button.disabled = true;
    try {
      await QuizData.addItem(name, specEl.value.trim(), dateEl.value, QuizUI.getSelectedSpec());
      nameEl.value = '';
      specEl.value = '';
      dateEl.value = '';
      QuizUI.clearSelectedSpec();
    } catch (error) { alert(error.message || 'Unable to add gear. Please retry.'); }
    finally { adding = false; button.disabled = false; render(); }
  }

  async function removeGearAction(id) {
    try { await QuizData.removeItem(id); }
    catch (error) { alert(error.message || 'Unable to remove gear. Please retry.'); }
    finally { render(); }
  }

  function toggleSort() {
    const modes = ['urgency', 'name', 'date'];
    sortMode = modes[(modes.indexOf(sortMode) + 1) % modes.length];
    document.getElementById('sortLabel').textContent =
      sortMode === 'urgency' ? 'Urgency' : sortMode === 'name' ? 'Name' : 'Date';
    render();
  }

  function render() {
    QuizUI.updateAuthBanner(QuizData.isRemote(), QuizData.isAuthed(), QuizData.getLoadError());
    QuizUI.renderGear(sortMode);
  }

  return { init, addGear: addGearAction, removeGear: removeGearAction, toggleSort };
})();

// Global helpers for onclick handlers in HTML
function addGear() { QuizApp.addGear(); }
function removeGear(id) { QuizApp.removeGear(id); }
function toggleSort() { QuizApp.toggleSort(); }

document.addEventListener('DOMContentLoaded', () => QuizApp.init());
