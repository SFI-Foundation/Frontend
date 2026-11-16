# SFI website photography licenses

The thirteen current photographs are recorded in
[`_data/sfi_photography.yml`](../../_data/sfi_photography.yml).
The public `/photo-credits/` page provides the photographer, source, exact
Creative Commons license, and modification notice for each image.

| Asset stem | Photographer | License |
| --- | --- | --- |
| `photography/hero-*` | Scott cutler | CC BY-SA 2.0 |
| `photography/safety-*` | Bo Nash | CC BY-SA 2.0 |
| `photography/specs-*` | Bryce Walker | CC BY 2.0 |
| `photography/history-*` | JOHN LLOYD | CC BY 2.0 |
| `photography/news-*` | JoseE1471 | CC BY-SA 4.0 |
| `photography/card-specifications-*` | Sarah Stierch | CC BY 4.0 |
| `photography/card-certification-*` | Zach Catanzareti Photo | CC BY 2.0 |
| `photography/card-testing-*` | Chris Waits | CC BY 2.0 |
| `photography/card-news-*` | Todd Ellis | CC0 |
| `photography/card-about-*` | WikiImages (Pixabay) | CC0 |
| `photography/card-contact-*` | Francesco Crippa | CC BY 2.0 |
| `photography/contact-banner-*` | Zach Catanzareti Photo | CC BY 2.0 |
| `photography/services-banner-*` | Mark McArdle | CC BY-SA 2.0 |

Each image derivative retains the license listed above, separately from the
website's code license. Crops, dimensions, original hashes, derivative hashes,
and byte sizes are in the [image manifest](../../docs/site-photography/image-manifest.json).
Source URLs, permanent license evidence links, attribution requirements, and
modification notices are in the shared data file. See the
[UI maintenance guide](../../docs/SFI_UI_OVERHAUL.md) for rendering and validation.

Only optimized local WebP and JPEG derivatives are shipped. No generative
imagery, recoloring, compositing or changes to depicted equipment were used.
No photograph establishes SFI certification, endorsement, or participation.
The original SFI Foundation logo is unchanged and is not relicensed here.

Each of the thirteen placements across Home, About, Services, Contact, History,
News, and specification search uses a distinct source photograph. Responsive
WebP sizes and JPEG fallbacks are alternate encodings of a single placement,
not repeated pictures. The official logo remains shared branding.

Some new sources were downloaded using Wikimedia's provided 1280px thumbnails
when original downloads were rate-limited. Their exact download URLs, dimensions,
hashes, and crop coordinate space are recorded in the image manifest. No source
was enlarged during derivative generation.
