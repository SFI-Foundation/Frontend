# SFI Foundation — site photography report

Branch: `feature/sfi-final-ui-polish`. Baseline: `4bae7bd93`. No PR or merge.

## Implemented layout

Five distinct real photographs now appear in page content: two on Home and one each on Spec Search, History, and News & Events. The tiny navbar photograph, its markup and CSS, and both obsolete thumbnails were removed. The original logo/name, navy header, six navigation destinations, and responsive menu remain unchanged.

Home has a compact image-and-text hero with “Motorsports Safety Starts Here,” the existing specification destination, and an About anchor. The hero measures 370px high at 1440px and stays within the 280–380px target at desktop widths. A second photograph of a driver and head-and-neck restraint sits beside the factual organization introduction. Existing services/program information is retained.

Spec Search has a secondary helmet photograph beside the introduction. At small widths the heading takes its own row, preventing text/image overlap; a shorter introductory sentence keeps the form prominent. The catalog UI and scripts below the introduction are byte-identical to baseline. History pairs its introduction with an archival racing image. News & Events places an explicitly illustrative event image alongside the announcements, while retaining the existing sourced entries and meeting logic.

Photographs share a reusable Liquid include, one data file, 10px radius token, responsive local sources, and consistent captions/spacing. Desktop editorial columns stack naturally on mobile. The primary hero is loaded eagerly with high fetch priority; below-the-fold photographs are lazy-loaded. Explicit intrinsic dimensions reserve layout space. WebP sources have JPEG fallbacks. No new application framework or runtime dependency was added.

## Sources, licensing and evidence

Research included Google Images, the official SFI site, and Wikimedia Commons. Google Images returned a traffic-verification page; it was not bypassed. [SFI’s published terms](https://sfifoundation.com/website-terms-of-use/) restrict copying/public display, and additional permission for its photographs was not established, so none were copied. The selected Commons files provide explicit reuse licenses and author records. The license deeds were checked on the Creative Commons website.

All images are used for motorsports context, without claims of SFI certification, endorsement, or participation. The event photo does not depict any listed SFI announcement. The history image is identified as 1968 in the photographer’s title; its 2009 metadata refers to a later scan/upload, not a modern capture. The other photographs retain their documented dates and contexts.

| Placement | Photograph / source | Photographer | License | Verification record |
| --- | --- | --- | --- | --- |
| Home hero | [NHRA Winter Nationals (6925152129)](https://commons.wikimedia.org/wiki/File:NHRA_Winter_Nationals_(6925152129).jpg) | Scott cutler | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | [Source revision](https://commons.wikimedia.org/w/index.php?title=File:NHRA_Winter_Nationals_(6925152129).jpg&oldid=1275676087) |
| Home safety introduction | [Ken SchraderHANSdevice](https://commons.wikimedia.org/wiki/File:Ken_SchraderHANSdevice.jpg) | Bo Nash | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | [Source revision](https://commons.wikimedia.org/w/index.php?title=File:Ken_SchraderHANSdevice.jpg&oldid=1062771333) |
| Spec Search introduction | [Racers Helmet (6234927568)](https://commons.wikimedia.org/wiki/File:Racers_Helmet_(6234927568).jpg) | Bryce Walker | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Source revision](https://commons.wikimedia.org/w/index.php?title=File:Racers_Helmet_(6234927568).jpg&oldid=956362310) |
| History introduction | [Racing in San Antonio, Texas 1968 (3949605466)](https://commons.wikimedia.org/wiki/File:Racing_in_San_Antonio,_Texas_1968_(3949605466).jpg) | JOHN LLOYD | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Source revision](https://commons.wikimedia.org/w/index.php?title=File:Racing_in_San_Antonio,_Texas_1968_(3949605466).jpg&oldid=1135418875) |
| News & Events announcements | [Drag Racing Cars](https://commons.wikimedia.org/wiki/File:Drag_Racing_Cars.jpg) | JoseE1471 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Source revision](https://commons.wikimedia.org/w/index.php?title=File:Drag_Racing_Cars.jpg&oldid=1098696097) |

Attribution requirements are recorded for each image in [`_data/sfi_photography.yml`](../_data/sfi_photography.yml). The public [Photography credits page](../navigation/photo-credits.md), linked from the footer and captions, identifies photographer, title, source, license, and modifications. The hero also retains the original Flickr title `IMG_0290.jpg`. Image derivatives retain their exact source license; CC BY-SA derivatives are distributed under the same license, separately from the site’s code license.

The Flickr-sourced photographs have recorded license reviews on their Commons file pages. The event photographer, JoseE1471, declares the image as their own work under CC BY-SA 4.0. Original photographer/source links and permanent evidence URLs are in the shared data file.

## Processing and delivery

Only cropped/resized derivatives are shipped. No AI generation, compositing, recoloring, or alterations to depicted people/equipment were used. Original source files remain outside the repository. Metadata was stripped during export. [Image manifest](site-photography/image-manifest.json) records original dimensions/hashes, exact crop rectangles, derivative dimensions, byte sizes and hashes. [Asset licensing notice](../images/sfi/PHOTOGRAPHY.md) accompanies the image directory.

| Photo | WebP variants | JPEG fallback |
| --- | --- | --- |
| hero | 480×240 (29,016 bytes), 800×400 (63,918 bytes), 1280×640 (147,390 bytes) | 1280×640 (188,153 bytes) |
| safety | 480×320 (12,164 bytes), 960×640 (28,832 bytes) | 960×640 (61,577 bytes) |
| specs | 480×320 (28,502 bytes), 960×640 (74,448 bytes) | 960×640 (111,685 bytes) |
| history | 480×320 (18,762 bytes), 960×640 (59,332 bytes) | 960×640 (90,586 bytes) |
| news | 480×320 (27,958 bytes), 960×640 (85,816 bytes) | 960×640 (113,738 bytes) |

Every individual delivered image is below 200KB. The browser selects one responsive source per picture rather than loading the original or every variant. The hero’s standard/Retina selections and the JPEG fallback were verified in Chromium.

## Screenshots and review

[Before/after gallery](site-photography/COMPARISONS.md) includes Home, Spec Search, History, and News & Events at desktop/mobile sizes. After captures cover 1440×900, 1024×768, 768×1024, 390×844 and 320×720. Home captures show both photographs; Spec Search captures intentionally show the initial viewport to demonstrate form visibility.

Review covered hero composition, protective-equipment context, search visibility, history balance, news composition, mobile stacking, captions and credits. It caught and corrected a 320px heading/photo overlap. The new browser check now asserts that those boxes never overlap. News photography was placed with announcements rather than enlarging the page banner.

## Verification

The final full production build passed with exit status 0 (404.094 seconds). Its public HTML, CSS and all image variants match the screenshot-tested output byte for byte. Authentication/search regressions passed; 25 accessibility scans reported zero violations. The complete artifact scan checked 2,702 generated files, and 200 internal links/fragments passed.

See [validation details and executed commands](site-photography/VALIDATION.md), [existing browser regression results](site-photography/browser-results.json), [photography-specific results](site-photography/photography-results.json), and raw logs in `docs/site-photography/checks/`.

Existing search, category filtering, canonical identities, pagination, PDF approval/revocation rules, API integration, authorization, Sign In and Create Account were exercised by the repository’s tests. Configuration, API/search/navigation JavaScript, login page and original logo are unchanged; the catalog section below its introduction is byte-identical to baseline. Backend tests use disposable fixtures, and browser admin tests use the isolated local catalog rather than production writes.

## Changed implementation

- `_includes/nav/ocs-menu.html`, `_sass/sfi/components/_navigation.scss`: remove navbar photography.
- `index.md`, `navigation/{sfi-specs,history,news-events}.md`: integrate the five photographs with existing content.
- `_includes/sfi/photograph.html`, `_data/sfi_photography.yml`: shared media rendering and source/credit records.
- `_sass/sfi/pages/_photography.scss`, `_sass/sfi/_main.scss`, `_sass/sfi/_tokens.scss`: editorial layouts and shared photo radius.
- `_includes/sfi/footer.html`, `navigation/photo-credits.md`, `images/sfi/PHOTOGRAPHY.md`: public attribution and license notices.
- `images/sfi/photography/`: optimized WebP/JPEG assets; obsolete navbar thumbnails removed.
- `scripts/test-sfi-site-photography.cjs`, `scripts/check-sfi-public-links.py`: photography/loading/accessibility coverage and credit-page link checks.

## Known limits

Browser review and automated accessibility checks use Chromium; Firefox, Safari, manual screen-reader use, and native browser zoom were not manually tested. Automated WCAG-tagged scans do not constitute a full conformance certification. Existing inherited Jekyll/Sass deprecation and legacy permalink warnings are retained in the logs. No backend source, secrets settings, or production records were changed.
