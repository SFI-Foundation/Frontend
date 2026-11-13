# SFI Foundation — final UI polish

Branch: `feature/sfi-final-ui-polish`, based on `10e95f0c6` (the current completed overhaul). No PR or merge.

## What changed

- Replaced gold navigation text, active states, hover effects, heading highlights, and login buttons with navy, blue, and neutral styles.
- Removed public header/button gradients and decorative gold borders. Gold remains available as a reserved brand token.
- Kept the six configured destinations: Home, Spec Search, History, News & Events, Contact, Sign In. The custom OCS-style header remains the public navigation; Minima navigation and CSS are not loaded.
- Standardized a 68px header, smaller link typography, an understated active underline, and an outlined Sign In action. Mobile uses the same links in an in-flow top dropdown, with keyboard support, Escape-to-close, focus return, and a visible no-JavaScript fallback.
- Aligned page headings, prose, service information, timelines, and contact sections to the shared page container. Retained the existing content and structure.
- Refined category filters, result borders, category tiles, empty-state spacing, and document statuses without changing search behavior.
- Made Sign In and Create Account share the same compact card, readable labels, accessible input boundaries, blue submit button, and restrained shadow. Removed the old extra mobile top margin. Account messages now have a live status region; authentication JavaScript is unchanged.
- Kept the footer at the viewport edge on short pages without adding content or forcing longer pages into fixed heights.

## Shared tokens

Source: [`_sass/sfi/_tokens.scss`](../_sass/sfi/_tokens.scss). CSS aliases are emitted by [`base/_properties.scss`](../_sass/sfi/base/_properties.scss).

| Purpose | Value |
| --- | --- |
| Navy | `#153F70` |
| Secondary blue / primary button | `#24639B` |
| Main background | `#FFFFFF` |
| Subtle surface | `#F7F9FC` |
| Primary text | `#273444` |
| Decorative border | `#DFE5EC` |
| Reserved muted gold | `#D5A23A` |
| Input boundary | `#7B8797` |
| Success text | `#1B6C3D` |

The stronger input boundary provides 3.65:1 contrast against white; the lighter decorative border is for surfaces. Navy/white is 10.62:1, blue/white 6.30:1, and body/white 12.64:1. The success-state audit caught an initial 4.48:1 contrast issue; the final shared success token provides 5.68:1 against its tint. Gold is not used for normal text or controls.

Spacing follows the existing 4/8/12/16/24/32/48px scale; page width is 1200px including gutters, radii are 4/6px, and shadows use the navy token at 6–8% opacity. The 800px navigation breakpoint is exposed to JavaScript through the shared CSS tokens. Reduced-motion preferences disable transitions.

## Preserved behavior

Configuration, production URLs, API selection, feature flags, secrets handling, page routes, redirects, specification records, and backend source are unchanged. Search number/name matching, category relationships, canonical deduplication, pagination, loading/error/empty states, verified PDF URL restrictions, approval/revocation enforcement, and admin authorization remain intact. Sign In/Create Account authentication logic was not rewritten.

## Evidence and validation

[Before/after comparisons for every major page](ui-polish/COMPARISONS.md) include desktop and mobile captures. After screenshots also cover 1024px, 768px, and 320px. All seven major views were reviewed; the review corrected footer placement and verified form, timeline, category, and navigation spacing.

See [validation results](ui-polish/VALIDATION.md), [browser results](ui-polish/browser-results.json), and [state/contrast results](ui-polish/state-results.json).

## Changed source areas

- `_includes/nav/ocs-menu.html`, `_layouts/sfi.html`, and `assets/js/sfi/navigation.js`: shared responsive navigation enhancement.
- `_sass/sfi/_tokens.scss`, `base/{properties,foundation,layout,accessibility}`: centralized palette, page alignment, footer behavior, focus styles.
- `_sass/sfi/components/{navigation,buttons,footer}`, `elements/{button,card}`, and `pages/{content,specs,auth}`: component presentation.
- `navigation/login.md`: live status semantics only.
- `scripts/test-sfi-ui-overhaul.cjs`: extended existing browser coverage to Create Account, dropdown behavior, validation, and all requested screenshot widths.
- `scripts/test-sfi-ui-polish-states.cjs`: open-menu keyboard/focus, contrast pairs, feedback states, reduced motion, and reflow checks.

## Limits

Automated browser checks use Chromium. Native browser zoom and manual screen-reader testing were not performed; 720 CSS pixel reflow was checked as the layout equivalent of a 1440px browser at 200%. Accessibility scans and keyboard checks provide evidence, not a complete WCAG conformance certification. Real account flows were tested against disposable Flask/SQLite fixtures; the captured success message uses stubbed responses and creates no account. Existing legacy Jekyll/Sass warnings are reported in the build log.
