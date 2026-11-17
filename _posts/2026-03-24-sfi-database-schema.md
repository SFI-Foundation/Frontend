---
toc: true
layout: sfi-document
title: Designing the SFI Foundation Database Schema
description: How we moved from a flat JSON file to a normalized SQLite database supporting QR lookups, spec search, and manufacturer self-service for the SFI Foundation web modernization.
permalink: /sfi-database
---

## Why a Database?

Our SFI spec search started with a flat JSON file — `_data/sfi_specs.json` — containing 136 entries scraped from the SFI Foundation website. That worked fine for the ML-powered search bar, but three upcoming features demand relational data:

1. **QR Code Scanning** — scan a product's SFI tag and instantly pull up its certification status, spec details, and manufacturer
2. **Manufacturer Self-Service** — let manufacturers log in, view their certified products, and track certification expiry
3. **Cert Expiry Tracking** — automatically flag certifications approaching their 5-year expiry window

A flat JSON file can't enforce foreign key relationships, handle many-to-many associations, or support authenticated queries. SQLite with SQLAlchemy ORM gives us all of that while staying lightweight enough for an educational project.

## The Schema: 8 Tables

Here's the entity-relationship structure we designed:

```
manufacturers (1) ────< (many) products
products      (1) ────< (many) spec_numbers
products      (many) >──< (many) categories   [via product_categories]
products      (1) ────< (many) certifications
certifications(1) ────< (many) expiry_tracking
```

### Core Tables

**categories** — The 7 SFI racing categories (Auto Racing, Drag Racing, Boat Racing, etc.), each with a URL-safe slug.

**subcategories** — 9 subcategories (DRAGSTERS, FULL BODIED CARS, etc.) linked to their parent category via foreign key.

**manufacturers** — Vendor entities with self-service authentication fields. Includes `password_hash` for login (using werkzeug's `generate_password_hash` / `check_password_hash`), contact info, and active status.

**products** — 106 deduplicated products, each optionally linked to a manufacturer. The deduplication matters because the same product (e.g., "Replacement Flywheels and Clutch Assemblies") appears in multiple categories in the source data.

### Junction Tables

**product_categories** — Resolves the many-to-many relationship between products and categories. 26 products appear in multiple categories, so a simple `category_id` column on products would lose data.

**spec_numbers** — Links products to their SFI specification numbers, along with PDF references and effective dates. Some products have multiple spec numbers (e.g., "Advanced Driver Suits" has both 3.2A and 3.4).

### Feature Tables

**certifications** — The heart of QR scan lookups. Each row has a unique `qr_code` (UUID), links to a product and manufacturer, and tracks status (`active`, `expired`, `revoked`, `pending`) with issue/expiry dates.

**expiry_tracking** — Notification log for certification expiry. Tracks whether notifications have been sent, when, and how many days remain until expiry.

## Key Query Paths

### QR Scan Lookup

When an inspector scans a QR code on a product tag:

```python
cert = Certification.query.filter_by(qr_code=scanned_code).first()
if cert:
    print(f"Product: {cert.product.name}")
    print(f"Spec: {cert.spec_number}")
    print(f"Status: {cert.status}")
    print(f"Manufacturer: {cert.manufacturer.name}")
    print(f"Expires: {cert.expiry_date}")
```

One query resolves the QR code to the full certification context.

### Spec Search

The ML search bar can now query the database instead of raw JSON:

```python
results = SpecNumber.query.filter_by(spec_number="3.2A").all()
for sn in results:
    product = sn.product
    print(f"{product.name} — Spec {sn.spec_number}")
    print(f"  Categories: {[c.name for c in product.categories]}")
    print(f"  Effective: {sn.effective_date}")
```

### Manufacturer Self-Service

Manufacturers authenticate and see their portfolio:

```python
mfr = Manufacturer.query.filter_by(contact_email=email).first()
if mfr and mfr.check_password(password):
    for product in mfr.products:
        for cert in product.certifications:
            print(f"{product.name} — {cert.status} (expires {cert.expiry_date})")
```

## Data Migration: JSON to SQLite

The migration script (`scripts/sfi_db_init.py`) transforms the 136 flat JSON entries into normalized relational data in 6 phases:

| Phase | What | Count |
|-------|------|-------|
| 1 | Insert categories + subcategories | 7 + 9 |
| 2 | Create manufacturer placeholders from PDF names | 71 |
| 3 | Deduplicate and insert products | 106 |
| 4 | Link products to categories | 136 |
| 5 | Insert spec numbers with PDFs and dates | 108 |
| 6 | Seed certifications + expiry tracking | 108 + 108 |

### Handling Messy Dates

The source data has inconsistent date formats: `"Nov. 9, 2001"`, `"May 23, 2000 (edited Feb. 23, 2016"`, `"July 24, 2023 |"`. The migration:
1. Strips trailing `)`, `|`, whitespace
2. Extracts the first date before any "(edited" note
3. Parses with `dateutil.parser.parse()` which handles abbreviated and full month names
4. Falls back to `None` for unparseable dates, preserving the raw string

### Product Deduplication

The JSON has 136 entries but only 106 unique products. "Replacement Flywheels and Clutch Assemblies" appears as separate entries under Auto Racing and Drag Racing. The migration groups entries by `(product_name, spec_numbers)` and creates one product row, then links it to both categories via the `product_categories` junction table.

## SQLAlchemy Model Example

Here's the `Certification` model showing the ORM pattern used across all 8 tables:

```python
class Certification(db.Model):
    __tablename__ = "certifications"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    spec_number = db.Column(db.String(32), nullable=False)
    qr_code = db.Column(db.String(128), unique=True)
    issue_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date)
    status = db.Column(db.String(16), nullable=False, default="active")
    manufacturer_id = db.Column(db.Integer, db.ForeignKey("manufacturers.id"))

    # status must be one of: active, expired, revoked, pending
    __table_args__ = (
        db.CheckConstraint(
            "status IN ('active','expired','revoked','pending')"
        ),
    )
```

All models follow the same pattern from our existing SQLAlchemy notebook examples: explicit `__tablename__`, typed columns with constraints, `db.relationship()` for ORM navigation, and CRUD methods.

## What's Next

- **Parse manufacturer PDFs** — extract real company names from the manufacturer list PDFs to replace placeholder records
- **Cert expiry notifications** — scheduled job to update `days_until_expiry` and flag approaching expirations
- **Frontend integration** — connect the search bar and QR scanner to the SQLite backend
- **Manufacturer portal UI** — login page and dashboard for manufacturers to manage their certifications
