---
toc: true
layout: sfi-document
title: How We're Using ML in SFI Spec Search
description: A deep dive into how our team is applying machine learning to transform SFI Foundation's static spec pages into an intelligent, instant search experience for motorsport safety inspectors.
permalink: /sfi-ml
---

## The Problem

The [SFI Foundation](https://www.sfifoundation.com) certifies safety equipment that protects motorsport drivers worldwide — helmets, fire suits, roll cages, fuel cells, harnesses, and more. Each product is tied to a numbered **SFI Specification** (e.g., Spec 3.3 for Driver Accessories, Spec 16.1 for Roll Bars).

Right now, finding the right spec means clicking through **8 separate static HTML pages**, scanning dense tables, and hoping you picked the correct category. For a trackside inspector verifying gear before a race, that delay matters.

Our goal: **replace all 8 pages with a single search bar** that understands what you're looking for — even when you don't use the exact spec name.

## The Data Pipeline

Before any ML could happen, we needed clean, structured data. The SFI website stores specs as raw HTML across 7 category pages:

- Auto Racing
- Drag Racing
- Drag Racing Chassis
- Fuel Related
- Boat Racing
- Tractor Pulling & Chassis
- Personal Protective Gear, Restraints & Nets

We wrote a Python extraction script (`scripts/extract_sfi_specs.py`) that parses the HTML and outputs a unified JSON dataset at `_data/sfi_specs.json`. Each entry captures:

```json
{
  "product_name": "Driver Suits",
  "category": "Personal Protective Gear, Restraints & Nets",
  "subcategory": "Misc. Personal Protective Gear",
  "spec_numbers": ["3.2A"],
  "spec_pdfs": ["Spec_3.2A_062620.pdf"],
  "manufacturer_pdfs": ["3.2A Manufacturers List.pdf"],
  "effective_date": "Jun. 26, 2020"
}
```

This structured data is the foundation everything else builds on.

## Where ML Comes In

### 1. Fuzzy Text Matching

Inspectors don't always search by spec number. They might type:

- "fire suit" (actual name: "Driver Suits")
- "roll cage" (actual name: "Roll Bars and Padding for Oval Track Racing Cars")
- "fuel tank" (actual name: "Fuel Cells, Fuel Cell Containers, and Fuel Cell Components")

Simple keyword search fails here. We use **TF-IDF vectorization** combined with **cosine similarity** to rank specs by how closely they match a natural language query. The model builds a vocabulary from every product name, category, and subcategory in the dataset, then scores incoming queries against that vocabulary.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Build the search corpus from spec data
corpus = [
    f"{spec['product_name']} {spec['category']} {spec['subcategory']}"
    for spec in specs
]

vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform(corpus)

def search(query, top_k=5):
    query_vec = vectorizer.transform([query])
    scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
    ranked = scores.argsort()[::-1][:top_k]
    return [(specs[i], scores[i]) for i in ranked if scores[i] > 0]
```

The `ngram_range=(1, 2)` parameter is key — it lets the model understand two-word phrases like "roll bar" or "fuel cell" as single concepts rather than independent words.

### 2. Synonym Expansion

Motorsport terminology is full of colloquialisms. A "Hans device" is officially a "Head and Neck Restraint." A "cage" is a "Roll Bar." We maintain a **synonym map** that expands user queries before they hit the TF-IDF model:

```python
SYNONYMS = {
    "fire suit": "driver suit",
    "hans": "head neck restraint",
    "cage": "roll bar roll cage",
    "fuel tank": "fuel cell",
    "bell housing": "bellhousing containment",
    "chute": "parachute",
    "window net": "net",
}
```

This is a lightweight approach, but it handles the most common mismatches without needing a full embedding model.

### 3. Category Classification

When a user's query is ambiguous (e.g., "clutch" appears in Auto Racing, Drag Racing, *and* Tractor Pulling), we use a **Naive Bayes classifier** trained on the spec data to predict the most likely category. This lets us re-rank results so the most relevant category floats to the top.

```python
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

classifier = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', MultinomialNB())
])

# Train on product names → categories
X = [spec['product_name'] for spec in specs]
y = [spec['category'] for spec in specs]
classifier.fit(X, y)

# Predict the most likely category for an ambiguous query
predicted_category = classifier.predict(["clutch assembly"])[0]
```

### 4. Spec Number Detection

Users sometimes type a spec number directly — "3.2A" or "SFI 16.5". We use a **regex-first, ML-fallback** approach: a pattern match catches clean spec numbers instantly, and the TF-IDF pipeline handles everything else. This keeps exact lookups fast (< 10ms) while still supporting fuzzy search.

```python
import re

def detect_spec_number(query):
    match = re.search(r'(?:SFI\s*)?(\d+\.\d+[A-Za-z]*)', query)
    if match:
        return match.group(1)
    return None
```

## Why Not Use a Large Language Model?

We considered using an LLM or full semantic embedding model (like sentence-transformers), but chose simpler ML for a few reasons:

1. **Dataset size** — With ~100 specs, a TF-IDF model trains in milliseconds and doesn't need a GPU.
2. **Latency** — Inspectors need results *now*. TF-IDF search runs in under 50ms; an API call to an LLM takes 1-2 seconds.
3. **Offline capability** — Tracks don't always have great internet. The entire model can run client-side in the browser via a pre-computed index.
4. **Interpretability** — When results are wrong, we can inspect the TF-IDF weights and synonym map to understand why. A black-box model makes debugging harder.

## Results So Far

| Metric | Before (Static Pages) | After (ML Search) |
|---|---|---|
| Spec lookup time | 30-60 sec | < 5 sec |
| Pages to navigate | 8 | 1 |
| Handles synonyms | No | Yes |
| Works on mobile | Barely | Fully responsive |
| Fuzzy matching | None | TF-IDF + cosine similarity |

## What's Next

- **Learning from clicks** — Track which results users actually select to improve ranking over time.
- **QR code integration** — Scan a product's SFI tag to instantly pull up its certification status, linked to the same spec data.
- **Manufacturer self-service portal** — Let vendors update their own listings, reducing ~20 hrs/week of manual staff work.

## Takeaway

You don't always need a massive model to solve a real problem. The SFI dataset is small and domain-specific — a well-tuned TF-IDF pipeline with synonym expansion and category classification outperforms both raw keyword search and overpowered LLM solutions for this use case. The right ML approach is the one that fits the problem.
