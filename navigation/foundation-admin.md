---
layout: page
title: Foundation Admin
description: Review gear/document submissions and generate AI summaries of submitted PDFs.
permalink: /foundation-admin/
search_exclude: true
admin: true
---

# Foundation Admin

Use the **Admin** button at the top of the page to open the submissions
dialog. You must be signed in as an administrator.

For any **PDF** submission you can:

- **Summarize** — extracts the PDF text in your browser and returns an
  AI-generated TL;DR plus key bullet points.
- **Summarize all PDFs** — runs the summary for every PDF in the table.

> The summary is produced by the backend (`/api/sfi/pdf-summary`), so the
> Flask backend must be deployed with a valid `GEMINI_API_KEY`.
