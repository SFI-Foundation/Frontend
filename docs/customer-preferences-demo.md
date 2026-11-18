# SFI customer preferences demonstration

Use the paired feature branches and a disposable local database. This guide does
not describe a production deployment or a physical phone test. Use only synthetic
names and accounts. Never reuse a customer or administrator password.

## Start the isolated demonstration

Install dependencies following both READMEs. From Backend, with its virtualenv:

```bash
python testing/test_sfi_profile.py --demo
```

This copies Python source into a temporary directory, starts the real Flask app
on `http://localhost:8865`, and seeds 23 clearly synthetic catalog entries with
unapproved PDFs. It never copies `.env`, customer databases or backups. Data is
removed when stopped. Port 8865 keeps this demo separate from a normal development API on 8605. Override it with `SFI_DEMO_PORT` if needed. No preconfigured
password or privileged demo account is created. Register synthetic accounts in
the normal Create Account form. Leave this terminal running during the demo.

From Frontend in a second terminal:

```bash
printf '%s\n' 'sfi_api_base: http://localhost:8865' > /tmp/sfi-demo-config.yml
bundle exec jekyll build --config _config.yml,/tmp/sfi-demo-config.yml --baseurl '' --destination /tmp/sfi-demo-site --disable-disk-cache
python3 -m http.server 4600 --bind 127.0.0.1 --directory /tmp/sfi-demo-site
```

Use `http://localhost:4600` consistently in both browsers so localhost cookies
and the API's credentialed CORS policy work. The static server is only a local
preview. Keep the backend running between browser/device tests.

## Show the customer

1. Open the homepage in a fresh browser context. The initial theme follows the OS.
2. Open Settings using the navigation gear. Select **Light**, then **Dark**.
3. Choose **Purple**. Open About, Contact and specification search. Show that
   backgrounds, links, inputs, navigation and footer remain consistent.
4. Return to Settings and choose **Spanish**. Open the homepage: the heading
   begins **Normas de seguridad**. Open search: show **Buscar**, **Filtrar por
   categoría**, **Página siguiente**, and Spanish document-status messages.
5. Open Sign In: show **Nombre de usuario** and **Contraseña**. Official SFI
   identifiers, source documents, product names and PDFs are deliberately unchanged.
6. In Settings, increase **Text size** and enable **High contrast**. Navigate to
   another page and show the larger text and visible focus outline with Tab.
7. In the Create Account tab, register a synthetic account using a password chosen
   for this disposable demo. A new account starts with defaults; existing server
   settings take precedence over guest settings.
8. Follow **Edit Preferences and Profile**, edit the display name and save.
   Refresh, sign out and sign back in: show the same saved name.
9. Open Settings, select Dark, Purple, Spanish and Large text. Wait for
   **Guardado en tu cuenta**. A saving or error message is not proof of success.
10. Open another independent browser profile or private window. Sign in with the
    same synthetic account. Open Settings and the homepage: show the settings
    and Spanish interface retrieved from the backend.
11. Change the second browser's accent to Teal and wait for account-save feedback.
    Refresh the first browser. Show the updated accent.
12. Use a different synthetic account to show independent defaults. Sign out to
    restore the original browser's guest preferences.
13. Restore account defaults through Settings, wait for successful save, sign out,
    then restore guest defaults. Stop both terminals after the demonstration.

If saving fails, keep the page open, restore connectivity and use **Retry**. If
another device changed settings, use **Reload account settings**; this deliberately
replaces unsaved local edits with the latest server settings. Do not claim a save
while a failure is displayed. French, German, Chinese and Japanese are labeled
partial previews and show a fallback notice.

## Evidence and limits

The automated browser script uses two independent Chromium contexts, real
HttpOnly cookies, real Flask HTTP and an isolated database; it also reads database
records through private test IPC. See `teacher-deployment-preferences-verification.md`
and `preferences-evidence/`. The script uses synthetic administrator fixtures to
verify protected UI, without granting privileges through registration.

There is no implemented privileged manufacturer account type. Selecting
Manufacturer in onboarding records an interest and grants no permissions.
Live camera/model inference, screen-reader usability, a physical phone and
production cookie/domain behavior still need separate customer/deployer checks.
