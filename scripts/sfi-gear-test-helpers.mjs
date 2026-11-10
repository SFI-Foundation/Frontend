// Real DOM fixtures for source-client behavior; no browser or external requests.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
export const settle = async () => {
  for (let i = 0; i < 20; i++) await new Promise(resolve => setImmediate(resolve));
};
export const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => JSON.parse(JSON.stringify(body)),
  text: async () => JSON.stringify(body),
});

function client(page, fetch, local = []) {
  const dom = new JSDOM(read(`navigation/${page}.md`), {
    url: `https://frontend.test/Frontend/${page}/`, runScripts: 'outside-only',
  });
  const { window } = dom;
  const NativeDate = window.Date;
  window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-28T12:00:00Z'])); }
    static now() { return new NativeDate('2026-10-28T12:00:00Z').getTime(); }
  };
  window.SFI_API_BASE = 'https://backend.test';
  window.fetch = fetch;
  window.console = { ...console, warn() {} };
  window.localStorage.setItem('sfiMyGear', JSON.stringify(local));
  const alerts = [];
  window.alert = message => alerts.push(message);
  const context = dom.getInternalVMContext();
  const load = file => vm.runInContext(read(`assets/js/sfi/${file}.js`), context);
  const get = name => vm.runInContext(name, context);
  return { dom, window, document: window.document, context, load, get, alerts };
}

export async function quizClient(fetch, local = [], app = false) {
  const h = client('quiz', fetch, local);
  h.load('quiz-data');
  h.load('quiz-ui');
  h.data = h.get('QuizData');
  h.ui = h.get('QuizUI');
  if (app) {
    h.load('quiz-app');
    h.app = h.get('QuizApp');
    await settle();
  } else {
    await h.data.loadGear();
    h.ui.renderGear('urgency');
  }
  return h;
}

export async function adminClient(fetch) {
  const h = client('admin', fetch);
  h.load('admin');
  await settle();
  return h;
}

export function backendFixture(initial = []) {
  const state = { gear: structuredClone(initial), requests: [], authed: true,
    admin: true, role: 'User', reviewFailure: 0, writeFailure: 0, loadFailure: 0, pendingFailure: 0, waitForReview: null };
  const fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const method = options.method || 'GET';
    state.requests.push({ path, method, options });
    if (path === '/api/sfi/specs') return response([]);
    if (!state.authed) return response({ error: 'Unauthorized' }, 401);
    if (path === '/api/sfi/me') return response({ isAdmin: state.admin, role: state.role });
    if (path === '/api/sfi/users' || path === '/api/sfi/groups') return response([]);
    if (path === '/api/sfi/gear' && method === 'GET') return response(state.gear, state.loadFailure || 200);
    if (path.endsWith('/pending')) return response(state.gear.filter(g => g.status === 'pending'), state.pendingFailure || 200);
    if (path.endsWith('/all')) return response(state.gear);
    if (method === 'PUT' && path.endsWith('/review')) {
      if (state.waitForReview) await state.waitForReview;
      if (state.reviewFailure) return response({ error: 'Review failed' }, state.reviewFailure);
      const body = JSON.parse(options.body);
      const gear = state.gear.find(g => String(g.id) === path.split('/').at(-2));
      Object.assign(gear, { status: body.status, reviewer_notes: body.notes });
      return response(gear);
    }
    if (method === 'POST') {
      if (state.writeFailure) return response({}, state.writeFailure);
      const gear = { ...JSON.parse(options.body), id: state.gear.length + 100, status: 'pending' };
      state.gear.push(gear);
      return response(gear);
    }
    if (method === 'DELETE') {
      if (state.writeFailure) return response({}, state.writeFailure);
      state.gear = state.gear.filter(g => String(g.id) !== path.split('/').at(-1));
      return response({ message: 'deleted' });
    }
    throw new Error(`Unexpected fixture request: ${method} ${path}`);
  };
  return { state, fetch };
}
