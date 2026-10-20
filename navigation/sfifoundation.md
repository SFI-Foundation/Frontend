---
layout: post
title: SFI Foundation
permalink: /sfifoundation/
search_exclude: true
---

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="{{ '/images/sfi/favicon-32x32.png' | relative_url }}" sizes="32x32">
<link rel="apple-touch-icon" href="{{ '/images/sfi/apple-touch-icon.png' | relative_url }}">

<style>
/* ── Reset & Variables ─────────────────────────── */
:root {
  --sfi-dark: #0d1117;
  --sfi-surface: #161b27;
  --sfi-surface2: #1e2535;
  --sfi-surface3: #252d3f;
  --sfi-border: rgba(240,165,0,0.15);
  --sfi-gold: #F0A500;
  --sfi-gold-dim: rgba(240,165,0,0.6);
  --sfi-cyan: #00d4ff;
  --sfi-purple: #7c3aed;
  --sfi-text: #e6edf3;
  --sfi-muted: #8b949e;
  --sfi-green: #3fb950;
  --sfi-red: #f85149;
}

/* ── Full-width breakout ───────────────────────── */
.sfi-full {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

/* ── Fade-in on scroll ─────────────────────────── */
.sfi-fade {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.sfi-fade.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ══════════════════════════════════════════════════
   HERO SECTION
   ══════════════════════════════════════════════════ */
.sfi-hero {
  position: relative;
  background: linear-gradient(135deg, #0d1117 0%, #1a1025 40%, #0d1117 100%);
  padding: 100px 20px 80px;
  text-align: center;
  overflow: hidden;
}
.sfi-hero canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}
.sfi-hero-content {
  position: relative;
  z-index: 2;
  max-width: 850px;
  margin: 0 auto;
}

/* Racing stripe accent */
.sfi-racing-stripe {
  width: 120px;
  height: 4px;
  margin: 0 auto 24px;
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan), var(--sfi-gold));
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(240,165,0,0.4);
}

/* Real SFI Foundation logo */
.sfi-hero-logo {
  display: block;
  margin: 0 auto 28px;
  max-width: 280px;
  width: 80%;
  height: auto;
  filter: drop-shadow(0 4px 18px rgba(240,165,0,0.25)) brightness(1.05);
  background: rgba(255,255,255,0.96);
  padding: 14px 22px;
  border-radius: 14px;
  border: 1px solid rgba(240,165,0,0.25);
}
@media (max-width: 600px) {
  .sfi-hero-logo { max-width: 220px; padding: 10px 16px; margin-bottom: 20px; }
}

.sfi-hero h1 {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: 3px;
  text-transform: uppercase;
  line-height: 1.1;
}
.sfi-hero h1 span { color: var(--sfi-gold); }
.sfi-hero-sub {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  color: var(--sfi-cyan);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 20px;
  font-weight: 500;
}
.sfi-hero-tag {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: var(--sfi-muted);
  margin-bottom: 36px;
  line-height: 1.7;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.sfi-hero-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.sfi-btn {
  font-family: 'Inter', sans-serif;
  padding: 14px 36px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
  display: inline-block;
}
.sfi-btn-primary {
  background: linear-gradient(135deg, var(--sfi-gold), #d49400);
  color: #000;
  box-shadow: 0 4px 15px rgba(240,165,0,0.3);
}
.sfi-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(240,165,0,0.5);
}
.sfi-btn-secondary {
  background: transparent;
  color: var(--sfi-cyan);
  border: 2px solid var(--sfi-cyan);
}
.sfi-btn-secondary:hover {
  background: rgba(0,212,255,0.1);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,212,255,0.2);
}

/* ── Checkered flag decoration ─────────────────── */
.sfi-checkered {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 6px;
  background: repeating-linear-gradient(
    90deg,
    var(--sfi-gold) 0px, var(--sfi-gold) 12px,
    transparent 12px, transparent 24px
  );
  opacity: 0.4;
}

/* ══════════════════════════════════════════════════
   STATS BAR
   ══════════════════════════════════════════════════ */
.sfi-stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  max-width: 950px;
  margin: -40px auto 50px;
  padding: 0 20px;
  position: relative;
  z-index: 3;
}
.sfi-stat-card {
  background: rgba(22,27,39,0.9);
  backdrop-filter: blur(16px);
  border: 1px solid var(--sfi-border);
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.sfi-stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--sfi-gold);
  box-shadow: 0 8px 25px rgba(240,165,0,0.15);
}
.sfi-stat-val {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sfi-gold);
  line-height: 1;
}
.sfi-stat-suffix {
  font-size: 1.4rem;
  color: var(--sfi-gold-dim);
}
.sfi-stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: var(--sfi-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ══════════════════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════════════════ */
.sfi-section {
  max-width: 1050px;
  margin: 0 auto 60px;
  padding: 0 20px;
}
.sfi-section-header {
  text-align: center;
  margin-bottom: 32px;
}
.sfi-section-title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.sfi-section-title span { color: var(--sfi-gold); }
.sfi-section-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan));
  margin: 0 auto;
  border-radius: 2px;
}

/* ══════════════════════════════════════════════════
   ABOUT
   ══════════════════════════════════════════════════ */
.sfi-about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}
.sfi-about-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sfi-border);
  border-radius: 16px;
  padding: 32px;
  border-top: 3px solid var(--sfi-gold);
}
.sfi-about-card p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  line-height: 1.8;
  font-size: 0.95rem;
  margin-bottom: 14px;
}
.sfi-about-card strong { color: var(--sfi-text); }
.sfi-about-highlight {
  background: rgba(0,212,255,0.06);
  border: 1px solid rgba(0,212,255,0.15);
  border-radius: 12px;
  padding: 24px;
  margin-top: 12px;
}
.sfi-about-highlight p {
  color: var(--sfi-cyan) !important;
  font-size: 1.05rem !important;
  font-weight: 500;
  margin: 0;
}
.sfi-value-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sfi-value-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.3s, transform 0.2s;
}
.sfi-value-card:hover {
  border-color: var(--sfi-gold);
  transform: translateX(4px);
}
.sfi-value-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240,165,0,0.1);
  border-radius: 12px;
  color: var(--sfi-gold);
}
.sfi-value-icon svg { width: 26px; height: 26px; display: block; }
.sfi-value-text h4 {
  font-family: 'Oswald', sans-serif;
  color: var(--sfi-gold);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sfi-value-text p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}

/* ══════════════════════════════════════════════════
   PROGRAMS GRID
   ══════════════════════════════════════════════════ */
.sfi-programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}
.sfi-program-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sfi-border);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.sfi-program-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--sfi-gold), var(--sfi-cyan));
  opacity: 0;
  transition: opacity 0.3s;
}
.sfi-program-card:hover {
  border-color: var(--sfi-gold);
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.3), 0 0 20px rgba(240,165,0,0.08);
}
.sfi-program-card:hover::before { opacity: 1; }
.sfi-program-icon {
  margin: 0 auto 14px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240,165,0,0.08);
  border: 1px solid rgba(240,165,0,0.18);
  border-radius: 14px;
  color: var(--sfi-gold);
}
.sfi-program-icon svg { width: 28px; height: 28px; display: block; }
.sfi-program-card h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--sfi-text);
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sfi-program-card p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

/* ══════════════════════════════════════════════════
   RACING CATEGORIES
   ══════════════════════════════════════════════════ */
.sfi-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.sfi-cat-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 22px 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  text-decoration: none;
  display: block;
}
.sfi-cat-card:hover {
  border-color: var(--sfi-gold);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
.sfi-cat-icon {
  margin: 0 auto 10px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sfi-gold);
}
.sfi-cat-icon svg { width: 32px; height: 32px; display: block; }
.sfi-cat-card:hover .sfi-cat-icon { color: var(--sfi-cyan); transition: color 0.3s; }
.sfi-cat-name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: var(--sfi-text);
  font-size: 0.88rem;
  margin-bottom: 4px;
}
.sfi-cat-count {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-gold);
  font-size: 0.75rem;
  font-weight: 600;
}

/* ══════════════════════════════════════════════════
   FAQ ACCORDION
   ══════════════════════════════════════════════════ */
.sfi-faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sfi-faq-item {
  background: rgba(22,27,39,0.7);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.3s;
}
.sfi-faq-item.open {
  border-color: var(--sfi-gold);
}
.sfi-faq-q {
  width: 100%;
  padding: 18px 24px;
  background: none;
  border: none;
  color: var(--sfi-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s;
}
.sfi-faq-q:hover { color: var(--sfi-gold); }
.sfi-faq-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s;
  color: var(--sfi-gold);
}
.sfi-faq-item.open .sfi-faq-arrow { transform: rotate(90deg); }
.sfi-faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
}
.sfi-faq-item.open .sfi-faq-a {
  max-height: 300px;
  padding: 0 24px 20px;
}
.sfi-faq-a p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 0.9rem;
  line-height: 1.7;
  margin: 0;
}

/* ══════════════════════════════════════════════════
   SPEC TOOL CTA
   ══════════════════════════════════════════════════ */
.sfi-cta-banner {
  background: linear-gradient(135deg, rgba(240,165,0,0.08), rgba(0,212,255,0.06));
  border: 1px solid var(--sfi-border);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.sfi-cta-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--sfi-gold), var(--sfi-cyan), transparent);
}
.sfi-cta-banner h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  color: #fff;
  margin: 0 0 12px;
  text-transform: uppercase;
}
.sfi-cta-banner h2 span { color: var(--sfi-gold); }
.sfi-cta-banner p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 1rem;
  margin-bottom: 28px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════
   CONTACT
   ══════════════════════════════════════════════════ */
.sfi-contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}
.sfi-contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sfi-contact-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sfi-border);
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.3s;
}
.sfi-contact-card:hover { border-color: var(--sfi-gold); }
.sfi-contact-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240,165,0,0.1);
  border-radius: 12px;
  flex-shrink: 0;
  color: var(--sfi-gold);
}
.sfi-contact-icon svg { width: 22px; height: 22px; display: block; }
.sfi-contact-card h4 {
  font-family: 'Oswald', sans-serif;
  color: var(--sfi-gold);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 4px;
}
.sfi-contact-card p {
  font-family: 'Inter', sans-serif;
  color: var(--sfi-muted);
  font-size: 0.88rem;
  margin: 0;
  line-height: 1.5;
}
.sfi-contact-card a {
  color: var(--sfi-cyan);
  text-decoration: none;
}
.sfi-contact-card a:hover { text-decoration: underline; }

/* Contact form */
.sfi-form-card {
  background: rgba(22,27,39,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--sfi-border);
  border-radius: 16px;
  padding: 32px;
}
.sfi-form-card h3 {
  font-family: 'Oswald', sans-serif;
  color: var(--sfi-gold);
  font-size: 1.2rem;
  margin: 0 0 20px;
  text-transform: uppercase;
}
.sfi-form-field {
  width: 100%;
  padding: 14px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  border: 2px solid rgba(240,165,0,0.15);
  border-radius: 12px;
  background: var(--sfi-dark);
  color: var(--sfi-text);
  margin-bottom: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.sfi-form-field:focus { outline: none; border-color: var(--sfi-gold); }
.sfi-form-field::placeholder { color: #555; }
textarea.sfi-form-field { resize: vertical; min-height: 100px; }
.sfi-form-msg {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  display: none;
}
.sfi-form-msg.success { display: block; background: rgba(63,185,80,0.12); color: var(--sfi-green); border: 1px solid rgba(63,185,80,0.25); }
.sfi-form-msg.error { display: block; background: rgba(248,81,73,0.12); color: var(--sfi-red); border: 1px solid rgba(248,81,73,0.25); }

/* ══════════════════════════════════════════════════
   CHATBOT WIDGET
   ══════════════════════════════════════════════════ */
.sfi-chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sfi-gold), #d49400);
  border: none;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(240,165,0,0.4);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: sfiChatPulse 2s ease-in-out infinite;
}
.sfi-chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(240,165,0,0.6);
}
.sfi-chat-toggle svg { width: 28px; height: 28px; fill: #000; }
@keyframes sfiChatPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(240,165,0,0.4); }
  50% { box-shadow: 0 4px 30px rgba(240,165,0,0.7); }
}

.sfi-chat-panel {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 380px;
  max-height: 520px;
  background: var(--sfi-surface);
  border: 1px solid var(--sfi-border);
  border-radius: 20px;
  z-index: 9999;
  display: none;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.sfi-chat-panel.open {
  display: flex;
}
.sfi-chat-header {
  padding: 16px 20px;
  background: rgba(240,165,0,0.08);
  border-bottom: 1px solid var(--sfi-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sfi-chat-header h4 {
  font-family: 'Oswald', sans-serif;
  color: var(--sfi-gold);
  font-size: 1rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.sfi-chat-close {
  background: none;
  border: none;
  color: var(--sfi-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
}
.sfi-chat-close:hover { color: var(--sfi-text); }
.sfi-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 350px;
  min-height: 250px;
}
.sfi-chat-msg {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  line-height: 1.5;
  word-wrap: break-word;
}
.sfi-chat-msg.bot {
  align-self: flex-start;
  background: rgba(240,165,0,0.1);
  border: 1px solid rgba(240,165,0,0.15);
  color: var(--sfi-text);
}
.sfi-chat-msg.user {
  align-self: flex-end;
  background: rgba(0,212,255,0.12);
  border: 1px solid rgba(0,212,255,0.2);
  color: var(--sfi-text);
}
.sfi-chat-typing {
  align-self: flex-start;
  padding: 12px 16px;
  display: none;
}
.sfi-chat-typing span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--sfi-gold);
  border-radius: 50%;
  margin: 0 2px;
  animation: sfiBounce 1.2s infinite;
}
.sfi-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.sfi-chat-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes sfiBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}
.sfi-chat-input-row {
  padding: 12px 16px;
  border-top: 1px solid var(--sfi-border);
  display: flex;
  gap: 8px;
}
.sfi-chat-input {
  flex: 1;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  border: 1px solid rgba(240,165,0,0.15);
  border-radius: 10px;
  background: var(--sfi-dark);
  color: var(--sfi-text);
}
.sfi-chat-input:focus { outline: none; border-color: var(--sfi-gold); }
.sfi-chat-input::placeholder { color: #555; }
.sfi-chat-send {
  padding: 12px 18px;
  background: linear-gradient(135deg, var(--sfi-gold), #d49400);
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  transition: transform 0.2s;
}
.sfi-chat-send:hover { transform: translateY(-2px); }

/* ══════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════ */
.sfi-footer {
  text-align: center;
  padding: 40px 20px;
  color: var(--sfi-muted);
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  border-top: 1px solid var(--sfi-border);
}
.sfi-footer a { color: var(--sfi-cyan); text-decoration: none; }
.sfi-footer a:hover { text-decoration: underline; }

/* ══════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .sfi-about-grid { grid-template-columns: 1fr; }
  .sfi-contact-grid { grid-template-columns: 1fr; }
  .sfi-stats-bar { grid-template-columns: repeat(2, 1fr); margin-top: -24px; }
}
@media (max-width: 600px) {
  .sfi-hero { padding: 70px 16px 60px; }
  .sfi-hero h1 { font-size: 2.2rem; letter-spacing: 1px; }
  .sfi-programs-grid { grid-template-columns: repeat(2, 1fr); }
  .sfi-chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
}
@media (max-width: 420px) {
  .sfi-stats-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
  .sfi-programs-grid { grid-template-columns: 1fr; }
}
</style>

<!-- ═══════════════════════════════════════════════════
     HERO SECTION
     ═══════════════════════════════════════════════════ -->
<div class="sfi-full">
  <div class="sfi-hero" id="sfiHero">
    <canvas id="sfiParticles"></canvas>
    <div class="sfi-hero-content">
      <img src="{{ '/images/sfi/SFI-Logo.png' | relative_url }}" alt="SFI Foundation" class="sfi-hero-logo">
      <div class="sfi-racing-stripe"></div>
      <p class="sfi-hero-sub">Motorsports Safety Standards</p>
      <h1>SFI <span>Foundation</span></h1>
      <p class="sfi-hero-tag">
        Established in 1978 as a non-profit organization to develop and administer
        quality assurance standards for specialty performance and racing equipment worldwide.
      </p>
      <div class="sfi-hero-btns">
        <a href="{{ site.baseurl }}/sfi-specs/" class="sfi-btn sfi-btn-primary">Explore Specs</a>
        <a href="#about" class="sfi-btn sfi-btn-secondary">Learn More</a>
      </div>
    </div>
    <div class="sfi-checkered"></div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     STATS BAR
     ═══════════════════════════════════════════════════ -->
<div class="sfi-stats-bar sfi-fade" id="statsBar">
  <div class="sfi-stat-card">
    <div class="sfi-stat-val"><span class="sfi-counter" data-target="1978" data-duration="1500">1978</span></div>
    <div class="sfi-stat-label">Year Founded</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statSpecs"><span class="sfi-counter" data-target="140" data-duration="1200">0</span></div>
    <div class="sfi-stat-label">Total Specifications</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val" id="statCats"><span class="sfi-counter" data-target="7" data-duration="1000">0</span></div>
    <div class="sfi-stat-label">Racing Categories</div>
  </div>
  <div class="sfi-stat-card">
    <div class="sfi-stat-val"><span class="sfi-counter" data-target="300" data-duration="1400">0</span><span class="sfi-stat-suffix">+</span></div>
    <div class="sfi-stat-label">Manufacturers</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     ABOUT
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade" id="about">
  <div class="sfi-section-header">
    <h2 class="sfi-section-title">About <span>SFI Foundation</span></h2>
    <div class="sfi-section-line"></div>
  </div>
  <div class="sfi-about-grid">
    <div class="sfi-about-card">
      <p>
        The <strong>SFI Foundation, Inc.</strong> is a non-profit organization established to issue and
        administer standards for the quality assurance of specialty performance and racing equipment.
        The SFI Foundation has served the automotive aftermarket and the motorsports industry since 1978.
      </p>
      <p>
        The quality performance specifications program is the heart of the SFI Foundation. Based on
        technical committees, due process, openness, and general consensus, the program has earned
        widespread respect throughout the motorsports community.
      </p>
      <p>
        While the heart of the certification program is the development and administration of the
        specification programs, it always comes back to the great people at SFI who make it all work.
        Our passion and respect for motorsports lets us do our jobs efficiently and to our fullest potential.
      </p>
      <div class="sfi-about-highlight">
        <p>SFI has an international presence with approximately 100 member sanctioning bodies and well over 300 individual equipment manufacturers who participate in more than 85 specification programs.</p>
      </div>
    </div>
    <div class="sfi-value-cards">
      <div class="sfi-value-card">
        <div class="sfi-value-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="3" x2="5" y2="21"/>
            <path d="M5 4 H19 V14 H5 Z"/>
            <path d="M5 4 h3.5 v2.5 h-3.5 z M12 4 h3.5 v2.5 h-3.5 z M8.5 6.5 h3.5 v2.5 h-3.5 z M15.5 6.5 h3.5 v2.5 h-3.5 z M5 9 h3.5 v2.5 h-3.5 z M12 9 h3.5 v2.5 h-3.5 z M8.5 11.5 h3.5 v2.5 h-3.5 z M15.5 11.5 h3.5 v2.5 h-3.5 z" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <div class="sfi-value-text">
          <h4>Quality Standards</h4>
          <p>Rigorous specification development through technical committees and industry consensus</p>
        </div>
      </div>
      <div class="sfi-value-card">
        <div class="sfi-value-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 3 v6.5 L4 18 a2 2 0 0 0 1.8 3 h12.4 a2 2 0 0 0 1.8 -3 L15 9.5 V3"/>
            <line x1="8" y1="3" x2="16" y2="3"/>
            <path d="M6.6 14 h10.8"/>
            <circle cx="11" cy="17" r="0.8" fill="currentColor" stroke="none"/>
            <circle cx="14" cy="18" r="0.6" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <div class="sfi-value-text">
          <h4>Independent Testing</h4>
          <p>SFI Test Laboratory in Poway, CA serving manufacturers since 1999</p>
        </div>
      </div>
      <div class="sfi-value-card">
        <div class="sfi-value-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3 12 h18"/>
            <path d="M12 3 c3 3 3 15 0 18 c-3 -3 -3 -15 0 -18 Z"/>
          </svg>
        </div>
        <div class="sfi-value-text">
          <h4>Global Reach</h4>
          <p>International presence across sanctioning bodies and manufacturers worldwide</p>
        </div>
      </div>
      <div class="sfi-value-card">
        <div class="sfi-value-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13 a8 8 0 0 1 16 0 v4 a1.5 1.5 0 0 1 -1.5 1.5 h-13 a1.5 1.5 0 0 1 -1.5 -1.5 Z"/>
            <path d="M9 18.5 v2 a1 1 0 0 0 1 1 h4 a1 1 0 0 0 1 -1 v-2"/>
            <path d="M8 12 h8"/>
            <path d="M7.5 15 h9"/>
          </svg>
        </div>
        <div class="sfi-value-text">
          <h4>Racer Safety</h4>
          <p>Established performance benchmarks that protect racers across all disciplines</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     PROGRAMS & SERVICES
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade">
  <div class="sfi-section-header">
    <h2 class="sfi-section-title">Programs & <span>Services</span></h2>
    <div class="sfi-section-line"></div>
  </div>
  <div class="sfi-programs-grid">
    <div class="sfi-program-card">
      <span class="sfi-program-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3 h9 l4 4 v13 a1 1 0 0 1 -1 1 h-12 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 Z"/>
          <path d="M15 3 v4 h4"/>
          <line x1="9" y1="12" x2="16" y2="12"/>
          <line x1="9" y1="16" x2="16" y2="16"/>
        </svg>
      </span>
      <h3>Specs Program</h3>
      <p>The heart of SFI — developing quality performance specifications through technical committees and industry consensus.</p>
    </div>
    <div class="sfi-program-card">
      <span class="sfi-program-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 3 v6.5 L4 18 a2 2 0 0 0 1.8 3 h12.4 a2 2 0 0 0 1.8 -3 L15 9.5 V3"/>
          <line x1="8" y1="3" x2="16" y2="3"/>
          <path d="M6.6 14 h10.8"/>
          <circle cx="10.5" cy="17" r="0.8" fill="currentColor" stroke="none"/>
          <circle cx="14" cy="18" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
      </span>
      <h3>Test Laboratory</h3>
      <p>Opened in 1999 in Poway, CA — serving manufacturers with independent testing and certification services.</p>
    </div>
    <div class="sfi-program-card">
      <span class="sfi-program-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2 L20 5 V12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 V5 Z"/>
          <path d="M8.5 12 L11 14.5 L15.5 10"/>
        </svg>
      </span>
      <h3>Tech Inspector Cert</h3>
      <p>Certification program for technical inspectors who verify compliance at racetracks nationwide.</p>
    </div>
    <div class="sfi-program-card">
      <span class="sfi-program-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="2"/>
          <path d="M9 6 V4 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2"/>
          <line x1="12" y1="10" x2="12" y2="16"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
        </svg>
      </span>
      <h3>Incident Response</h3>
      <p>Training programs for incident response teams at motorsports events across the country.</p>
    </div>
    <div class="sfi-program-card">
      <span class="sfi-program-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 13 a8 8 0 0 1 16 0 v4 a1.5 1.5 0 0 1 -1.5 1.5 h-13 a1.5 1.5 0 0 1 -1.5 -1.5 Z"/>
          <path d="M9 18.5 v2 a1 1 0 0 0 1 1 h4 a1 1 0 0 0 1 -1 v-2"/>
          <path d="M8 12 h8"/>
          <path d="M7.5 15 h9"/>
        </svg>
      </span>
      <h3>Tech &amp; Safety</h3>
      <p>Advisories, guidelines, bulletins, and safety articles for the motorsports community.</p>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     RACING CATEGORIES
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade">
  <div class="sfi-section-header">
    <h2 class="sfi-section-title">Racing <span>Categories</span></h2>
    <div class="sfi-section-line"></div>
  </div>
  <div class="sfi-cat-grid" id="catGrid"></div>
</div>
<!-- ═══════════════════════════════════════════════════
     FAQ
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade">
  <div class="sfi-section-header">
    <h2 class="sfi-section-title">Frequently Asked <span>Questions</span></h2>
    <div class="sfi-section-line"></div>
  </div>
  <div class="sfi-faq-list">
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">What Is the SFI Foundation, Inc.? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>The SFI Foundation, Inc. (SFI) is a non-profit organization established to issue and administer standards for specialty/performance automotive and racing equipment.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">What Do the Letters "SFI" Stand For? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>SFI was originally a foundation run by SEMA, the automotive aftermarket trade organization. The letters "SFI" stood for "SEMA Foundation, Inc." Although SFI is now completely independent from SEMA, the Foundation has retained the name SFI Foundation, Inc. but the "S" no longer means SEMA.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">Who Uses SFI Standards? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>Manufacturers of equipment are the primary users of SFI standards. Some standards are adopted as part of the rules of race sanctioning organizations. Ultimately, the consumer benefits from the program as it establishes recognized levels of performance or quality for a product.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">How is the SFI Standards Program Funded? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>Participating manufacturers pay for development and administration of these programs through licensing fees and/or unit charges. Also, interested associations have provided grants and donations.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">How is a Standard Initiated? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>The SFI Technical Committee initiates the specification process, typically at the request of the affected industry or race sanctioning body.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">How is Participation Obtained? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>SFI encourages industry-wide participation in the drafting of specifications. However, once a standard is enacted, participation by the manufacturer is strictly voluntary.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">What About Enforcement? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>Typically, there are policing provisions through contractual or licensing agreements whereby SFI may inspect the records and/or equipment of a manufacturer in order to ascertain that the product involved meets SFI Specs. Once a manufacturer has voluntarily committed to participating in the program, it must comply with the specifications in all respects.</p></div>
    </div>
    <div class="sfi-faq-item">
      <button class="sfi-faq-q">How Are the Specs Used in Racing? <span class="sfi-faq-arrow">&#9654;</span></button>
      <div class="sfi-faq-a"><p>When adopted as part of the rules of a race sanctioning body, enforcement is entirely up to that organization. The manufacturer then provides the racer with product that is in compliance with the specs enforced by the sanctioning body.</p></div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     SPEC TOOL CTA
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade">
  <div class="sfi-cta-banner">
    <h2>Try Our <span>ML-Powered Spec Detector</span></h2>
    <p>Identify racing safety specifications instantly using machine learning. Search 140+ SFI specs across drag racing, auto racing, boat racing, and more.</p>
    <a href="{{ site.baseurl }}/sfi-specs/" class="sfi-btn sfi-btn-primary">Launch Spec Detection Tool</a>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     CONTACT
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section sfi-fade" id="contact">
  <div class="sfi-section-header">
    <h2 class="sfi-section-title">Get In <span>Touch</span></h2>
    <div class="sfi-section-line"></div>
  </div>
  <div class="sfi-contact-grid">
    <div class="sfi-contact-info">
      <div class="sfi-contact-card">
        <div class="sfi-contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 C8 2 5 5 5 9 c0 5 7 13 7 13 s7 -8 7 -13 c0 -4 -3 -7 -7 -7 Z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <h4>Address</h4>
          <p>15708 Pomerado Road<br>Suite N208<br>Poway, CA 92064</p>
        </div>
      </div>
      <div class="sfi-contact-card">
        <div class="sfi-contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 4 a1 1 0 0 1 1 -1 h3 l2 5 l-2.5 1.5 a11 11 0 0 0 5 5 L15 12 l5 2 v3 a1 1 0 0 1 -1 1 c-8 0 -14 -6 -14 -14 Z"/>
          </svg>
        </div>
        <div>
          <h4>Phone</h4>
          <p>(858) 451-8868</p>
        </div>
      </div>
      <div class="sfi-contact-card">
        <div class="sfi-contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M3 7 L12 13 L21 7"/>
          </svg>
        </div>
        <div>
          <h4>Email</h4>
          <p><a href="mailto:sfi@sfifoundation.com">sfi@sfifoundation.com</a></p>
        </div>
      </div>
      <div class="sfi-contact-card">
        <div class="sfi-contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3 12 h18"/>
            <path d="M12 3 c3 3 3 15 0 18 c-3 -3 -3 -15 0 -18 Z"/>
          </svg>
        </div>
        <div>
          <h4>Website</h4>
          <p><a href="https://www.sfifoundation.com" target="_blank" rel="noopener">sfifoundation.com</a></p>
        </div>
      </div>
    </div>
    <div class="sfi-form-card">
      <h3>Send a Message</h3>
      <div id="contactMsg" class="sfi-form-msg"></div>
      <input type="text" class="sfi-form-field" id="contactName" placeholder="Your Name">
      <input type="email" class="sfi-form-field" id="contactEmail" placeholder="Your Email">
      <input type="text" class="sfi-form-field" id="contactSubject" placeholder="Subject">
      <textarea class="sfi-form-field" id="contactMessage" placeholder="Your Message"></textarea>
      <button class="sfi-btn sfi-btn-primary" id="contactSubmit" style="width:100%;margin-top:4px;">Send Message</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════ -->
<div class="sfi-section">
  <div class="sfi-footer">
    <p>&copy; 2026 SFI Foundation, Inc. All rights reserved.</p>
    <p style="margin-top:8px;">
      <a href="{{ site.baseurl }}/sfifoundation/">Home</a> &middot;
      <a href="{{ site.baseurl }}/sfi-specs/">Spec Detection</a> &middot;
      <a href="https://www.sfifoundation.com" target="_blank" rel="noopener">sfifoundation.com</a>
    </p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     CHATBOT WIDGET
     ═══════════════════════════════════════════════════ -->
<button class="sfi-chat-toggle" id="chatToggle" title="SFI Specs Assistant">
  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
</button>
<div class="sfi-chat-panel" id="chatPanel">
  <div class="sfi-chat-header">
    <h4>SFI Specs Assistant</h4>
    <button class="sfi-chat-close" id="chatClose">&times;</button>
  </div>
  <div class="sfi-chat-messages" id="chatMessages">
    <div class="sfi-chat-msg bot">Hi! I'm the SFI Specs Assistant. Ask me anything about SFI specifications, racing safety standards, or the Foundation.</div>
  </div>
  <div class="sfi-chat-typing" id="chatTyping">
    <span></span><span></span><span></span>
  </div>
  <div class="sfi-chat-input-row">
    <input type="text" class="sfi-chat-input" id="chatInput" placeholder="Ask about SFI specs...">
    <button class="sfi-chat-send" id="chatSend">Send</button>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════
     SCRIPTS
     ═══════════════════════════════════════════════════ -->
<script>
(function() {
  // ── API Configuration ────────────────────────────
  var API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8423"
    : "https://greppers-be.opencodingsociety.com";
  var API = API_BASE + "/api/sfi";

  var SVG_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var CATEGORY_ICONS = {
    // Race car (Auto Racing)
    "Auto Racing":
      '<svg ' + SVG_ATTR + '><path d="M3 15 l1.5 -4 a2 2 0 0 1 1.6 -1.3 l3.4 -0.7 l3 -3 h3 l3 3 l3.4 0.7 a2 2 0 0 1 1.6 1.3 L22 15"/><path d="M2.5 15 h19 v2 a1 1 0 0 1 -1 1 h-2 a1 1 0 0 1 -1 -1 h-10 a1 1 0 0 1 -1 1 h-2 a1 1 0 0 1 -1 -1 z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/><path d="M9.5 9.5 L10.5 7.5 h3 l1 2"/></svg>',
    // Christmas tree (Drag Racing start tree)
    "Drag Racing":
      '<svg ' + SVG_ATTR + '><rect x="9.5" y="3" width="5" height="14" rx="0.8"/><circle cx="12" cy="5.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="8.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="11.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><line x1="8.5" y1="20" x2="15.5" y2="20"/><line x1="10" y1="17" x2="10" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/></svg>',
    // Chassis / roll cage
    "Drag Racing Chassis":
      '<svg ' + SVG_ATTR + '><path d="M4 17 l2 -6 a2 2 0 0 1 1.8 -1.5 h8.4 a2 2 0 0 1 1.8 1.5 l2 6"/><line x1="4" y1="17" x2="20" y2="17"/><path d="M7.5 9.5 V6 a1 1 0 0 1 1 -1 h7 a1 1 0 0 1 1 1 v3.5"/><line x1="12" y1="5" x2="12" y2="17"/><line x1="6" y1="13" x2="18" y2="13"/></svg>',
    // Boat
    "Boat Racing":
      '<svg ' + SVG_ATTR + '><path d="M3 14 L5 19 a1 1 0 0 0 0.9 0.6 h12.2 a1 1 0 0 0 0.9 -0.6 L21 14 Z"/><path d="M6 14 V10 a1 1 0 0 1 1 -1 h10 a1 1 0 0 1 1 1 v4"/><line x1="12" y1="4" x2="12" y2="9"/><path d="M12 4 L17 8.5 H12"/></svg>',
    // Fuel pump
    "Fuel Related":
      '<svg ' + SVG_ATTR + '><rect x="5" y="3" width="9" height="17" rx="1.5"/><line x1="5" y1="10" x2="14" y2="10"/><rect x="7" y="5.5" width="5" height="3"/><path d="M14 7 h3 a1.5 1.5 0 0 1 1.5 1.5 v7.5 a1.5 1.5 0 0 0 3 0 V10 l-2 -2"/></svg>',
    // Helmet (PPE)
    "Personal Protective Gear, Restraints & Nets":
      '<svg ' + SVG_ATTR + '><path d="M4 13 a8 8 0 0 1 16 0 v2 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z"/><path d="M8 11 h8"/><path d="M10 7.5 a4 4 0 0 1 4 0"/><line x1="5" y1="17" x2="19" y2="17"/></svg>',
    // Tractor
    "Tractor Pulling & Chassis":
      '<svg ' + SVG_ATTR + '><rect x="8" y="7" width="7" height="6" rx="1"/><path d="M15 9 h3 l2 3 v2 h-5"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="2.2"/><line x1="10" y1="7" x2="10" y2="4"/><line x1="8" y1="4" x2="12" y2="4"/></svg>',
    // Fallback — checkered flag
    "_default":
      '<svg ' + SVG_ATTR + '><line x1="5" y1="3" x2="5" y2="21"/><path d="M5 4 H19 V14 H5 Z"/><path d="M5 4 h3.5 v2.5 h-3.5 z M12 4 h3.5 v2.5 h-3.5 z M8.5 6.5 h3.5 v2.5 h-3.5 z M15.5 6.5 h3.5 v2.5 h-3.5 z M5 9 h3.5 v2.5 h-3.5 z M12 9 h3.5 v2.5 h-3.5 z M8.5 11.5 h3.5 v2.5 h-3.5 z M15.5 11.5 h3.5 v2.5 h-3.5 z" fill="currentColor" stroke="none"/></svg>'
  };

  // ── Particle Canvas ──────────────────────────────
  var canvas = document.getElementById('sfiParticles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var w, h, particles = [];

    function resize() {
      var hero = document.getElementById('sfiHero');
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.3) * 2.5,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.6 ? '#F0A500' : '#00d4ff',
        trail: Math.random() > 0.7
      };
    }

    function initParticles() {
      resize();
      particles = [];
      for (var i = 0; i < 80; i++) particles.push(createParticle());
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = p.alpha;
        if (p.trail) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          Object.assign(p, createParticle());
          p.x = -5;
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawParticles);
    }

    initParticles();
    drawParticles();
    window.addEventListener('resize', resize);
  }

  // ── Animated Counters ────────────────────────────
  function animateCounters() {
    var counters = document.querySelectorAll('.sfi-counter');
    for (var i = 0; i < counters.length; i++) {
      (function(el) {
        if (el.dataset.animated) return;
        el.dataset.animated = '1';
        var target = parseInt(el.dataset.target);
        var duration = parseInt(el.dataset.duration) || 1200;
        var startTime = performance.now();
        var startVal = target > 1900 ? 1950 : 0;

        function tick(now) {
          var elapsed = now - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(startVal + (target - startVal) * eased);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      })(counters[i]);
    }
  }

  // ── Fade-in on Scroll ────────────────────────────
  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.id === 'statsBar') animateCounters();
      }
    });
  }, { threshold: 0.15 });
  var fadeEls = document.querySelectorAll('.sfi-fade');
  for (var i = 0; i < fadeEls.length; i++) fadeObserver.observe(fadeEls[i]);

  // ── Load Racing Categories from API ──────────────
  function parseSvg(svgString) {
    var doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
    return doc.documentElement;
  }

  function buildCategoryCard(name, count, baseUrl) {
    var iconSvg = CATEGORY_ICONS[name] || CATEGORY_ICONS._default;
    var card = document.createElement('a');
    card.href = baseUrl + '/sfi-specs/';
    card.className = 'sfi-cat-card';
    var iconSpan = document.createElement('span');
    iconSpan.className = 'sfi-cat-icon';
    iconSpan.appendChild(parseSvg(iconSvg));
    var nameDiv = document.createElement('div');
    nameDiv.className = 'sfi-cat-name';
    nameDiv.textContent = name;
    var countDiv = document.createElement('div');
    countDiv.className = 'sfi-cat-count';
    countDiv.textContent = count + ' specs';
    card.appendChild(iconSpan);
    card.appendChild(nameDiv);
    card.appendChild(countDiv);
    return card;
  }

  async function loadCategories() {
    var grid = document.getElementById('catGrid');
    var baseUrl = '{{ site.baseurl }}';
    var fallback = [
      { name: "Drag Racing", count: 47 },
      { name: "Auto Racing", count: 33 },
      { name: "Drag Racing Chassis", count: 19 },
      { name: "Personal Protective Gear, Restraints & Nets", count: 18 },
      { name: "Fuel Related", count: 10 },
      { name: "Tractor Pulling & Chassis", count: 10 },
      { name: "Boat Racing", count: 3 }
    ];

    var categories = fallback;
    try {
      var res = await fetch(API + '/stats');
      if (res.ok) {
        var data = await res.json();
        if (data.by_category) {
          categories = Object.entries(data.by_category)
            .map(function(e) { return { name: e[0], count: e[1] }; })
            .sort(function(a, b) { return b.count - a.count; });
        }
      }
    } catch (e) { /* use fallback */ }

    grid.textContent = '';
    categories.forEach(function(cat) {
      grid.appendChild(buildCategoryCard(cat.name, cat.count, baseUrl));
    });
  }
  loadCategories();

  // ── Update stats from API ────────────────────────
  async function loadStats() {
    try {
      var res = await fetch(API + '/stats');
      if (res.ok) {
        var data = await res.json();
        if (data.total_specs) {
          var el = document.querySelector('#statSpecs .sfi-counter');
          if (el) { el.dataset.target = data.total_specs; el.textContent = '0'; }
        }
        if (data.total_categories) {
          var catEl = document.querySelector('#statCats .sfi-counter');
          if (catEl) { catEl.dataset.target = data.total_categories; catEl.textContent = '0'; }
        }
      }
    } catch (e) { /* use static fallback */ }
  }
  loadStats();

  // ── FAQ Accordion ────────────────────────────────
  var faqBtns = document.querySelectorAll('.sfi-faq-q');
  for (var i = 0; i < faqBtns.length; i++) {
    faqBtns[i].addEventListener('click', function() {
      var item = this.parentElement;
      var wasOpen = item.classList.contains('open');
      var allOpen = document.querySelectorAll('.sfi-faq-item.open');
      for (var j = 0; j < allOpen.length; j++) allOpen[j].classList.remove('open');
      if (!wasOpen) item.classList.add('open');
    });
  }

  // ── Contact Form (opens mailto with composed message) ──
  document.getElementById('contactSubmit').addEventListener('click', function() {
    var msgEl = document.getElementById('contactMsg');
    var name = document.getElementById('contactName').value.trim();
    var email = document.getElementById('contactEmail').value.trim();
    var subject = document.getElementById('contactSubject').value.trim();
    var message = document.getElementById('contactMessage').value.trim();

    msgEl.className = 'sfi-form-msg';
    msgEl.style.display = 'none';

    if (!name || !email || !message) {
      msgEl.textContent = 'Please fill in name, email, and message.';
      msgEl.className = 'sfi-form-msg error';
      return;
    }

    var mailSubject = encodeURIComponent(subject || 'Contact from SFI Foundation Website');
    var mailBody = encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message);
    window.open('mailto:sfi@sfifoundation.com?subject=' + mailSubject + '&body=' + mailBody, '_blank');

    msgEl.textContent = 'Opening your email client to send the message.';
    msgEl.className = 'sfi-form-msg success';
  });

  // ── Chatbot ──────────────────────────────────────
  var chatToggle = document.getElementById('chatToggle');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatClose');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatMessages = document.getElementById('chatMessages');
  var chatTyping = document.getElementById('chatTyping');

  chatToggle.addEventListener('click', function() {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) chatInput.focus();
  });
  chatClose.addEventListener('click', function() { chatPanel.classList.remove('open'); });

  function addChatMsg(text, role) {
    var div = document.createElement('div');
    div.className = 'sfi-chat-msg ' + role;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // FAQ knowledge base for the chatbot
  var FAQ_RESPONSES = {
    'what is sfi': 'The SFI Foundation, Inc. is a non-profit organization established in 1978 to issue and administer quality assurance standards for specialty performance and racing equipment.',
    'sfi stand for': 'SFI originally stood for "SEMA Foundation, Inc." Though now independent from SEMA, the Foundation retained the SFI name.',
    'who uses': 'Equipment manufacturers are the primary users of SFI standards. Standards are adopted into rules by race sanctioning organizations, ultimately benefiting consumers.',
    'funded': 'Participating manufacturers fund SFI programs through licensing fees and unit charges. Associations also provide grants and donations.',
    'enforcement': 'SFI may inspect records and equipment through contractual agreements. Once committed, manufacturers must comply with specifications fully.',
    'contact': 'SFI Foundation Inc. is at 15708 Pomerado Road, Suite N208, Poway, CA 92064. Phone: (858) 451-8868. Email: sfi@sfifoundation.com',
    'test lab': 'The SFI Test Laboratory opened in 1999 in Poway, CA, serving manufacturers with independent testing and certification.',
    'hello': "Hello! I'm the SFI Specs Assistant. I can answer questions about SFI Foundation, or describe a racing part and I'll find matching specs. Try: \"fire resistant helmet\" or \"roll cage\"",
    'hi': "Hey there! Describe any racing part (e.g. \"fuel cell\", \"driver suit\") and I'll look up matching SFI specs, or ask me about the Foundation.",
    'help': "I can do two things:\n1. Describe a racing part and I'll search for matching SFI specs using our ML classifier\n2. Ask about SFI Foundation (history, contact, programs, etc.)\n\nTry: \"turbocharger\" or \"what is SFI?\""
  };

  function faqLookup(msg) {
    var lower = msg.toLowerCase();
    var keys = Object.keys(FAQ_RESPONSES);
    for (var i = 0; i < keys.length; i++) {
      if (lower.indexOf(keys[i]) !== -1) return FAQ_RESPONSES[keys[i]];
    }
    return null;
  }

  // Check if message looks like a part description vs a FAQ question
  function isPartQuery(msg) {
    var lower = msg.toLowerCase();
    var questionWords = ['what is', 'who ', 'how ', 'why ', 'where', 'when', 'tell me about sfi', 'sfi stand'];
    for (var i = 0; i < questionWords.length; i++) {
      if (lower.indexOf(questionWords[i]) === 0 || lower.indexOf(questionWords[i]) !== -1) return false;
    }
    if (lower.length < 3) return false;
    return true;
  }

  async function sendChatMessage() {
    var text = chatInput.value.trim();
    if (!text) return;
    addChatMsg(text, 'user');
    chatInput.value = '';
    chatTyping.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Check FAQ first
    var faqAnswer = faqLookup(text);
    if (faqAnswer) {
      chatTyping.style.display = 'none';
      addChatMsg(faqAnswer, 'bot');
      return;
    }

    // Search specs from the backend by matching product names
    try {
      var res = await fetch(API + '/specs');
      chatTyping.style.display = 'none';
      if (res.ok) {
        var allSpecs = await res.json();
        var lower = text.toLowerCase();
        var words = lower.split(/\s+/);
        // Score each spec by how many query words match its product name or category
        var scored = allSpecs.map(function(s) {
          var target = (s.product_name + ' ' + s.category + ' ' + (s.subcategory || '')).toLowerCase();
          var score = 0;
          words.forEach(function(w) { if (w.length > 1 && target.indexOf(w) !== -1) score++; });
          return { spec: s, score: score };
        }).filter(function(s) { return s.score > 0; })
          .sort(function(a, b) { return b.score - a.score; })
          .slice(0, 5);

        if (scored.length > 0) {
          var reply = 'Here are matching SFI specs for "' + text + '":\n\n';
          scored.forEach(function(r) {
            reply += '\u2022 SFI ' + r.spec.spec_number + ' \u2014 ' + r.spec.product_name + ' (' + r.spec.category + ')\n';
          });
          reply += '\nVisit the Spec Detection tool for full details and PDF links!';
          addChatMsg(reply, 'bot');
        } else {
          addChatMsg('No specs matched "' + text + '". Try terms like "helmet", "roll cage", "fuel cell", "clutch", or "turbocharger". Or ask me about SFI Foundation!', 'bot');
        }
      } else {
        addChatMsg("I couldn't reach the specs database. Try our Spec Detection tool for full search!", 'bot');
      }
    } catch (e) {
      chatTyping.style.display = 'none';
      addChatMsg("Server unavailable right now. Try our Spec Detection tool or ask me about SFI Foundation.", 'bot');
    }
  }

  chatSend.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
  });

  // ── Smooth Scroll for Anchor Links ───────────────
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();
</script>
