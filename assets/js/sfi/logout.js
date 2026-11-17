import { pythonURI } from '../api/config.js';

const status = document.getElementById('signOutStatus');
const retry = document.getElementById('signOutRetry');
async function signOut() {
    retry.hidden = true;
    status.textContent = 'Signing out of SFI Foundation…';
    try {
        const response = await fetch(pythonURI + '/api/authenticate', {
            method: 'DELETE', credentials: 'include',
        });
        if (!response.ok && response.status !== 401) throw new Error('Sign out failed. Please try again.');
        window.dispatchEvent(new CustomEvent('sfi-auth', { detail: null }));
        window.location.replace(new URL('../login/', window.location.href).href);
    } catch (error) {
        status.textContent = error.message || 'Could not connect to server.';
        retry.hidden = false;
    }
}
retry.addEventListener('click', signOut);
signOut();
