# Run with the same bundle as Jekyll:
# bundle exec ruby scripts/test-sfi-sass.rb <built-site> [approved-baseline.css]
require "sass-embedded"
require "uri"
require "pathname"
require "json"

root = Pathname.new(__dir__).parent.realpath
site = Pathname.new(ARGV.fetch(0)).expand_path
entry = root.join("assets/css/sfi.scss")
source = entry.read.sub(/\A---\s*\n.*?\n---\s*\n/m, "")
abort "FAIL: Sass entry must have Jekyll front matter" if source == entry.read

# Compile the actual entry with Jekyll's _sass load path. loaded_urls proves
# dependencies were consumed by the compiler, rather than just named in a file.
result = Sass.compile_string(source, url: "file://#{entry}", load_paths: [root.join("_sass").to_s])
loaded = result.loaded_urls.map { |url| Pathname.new(URI::DEFAULT_PARSER.unescape(URI(url).path)).realpath }
partials = root.glob("_sass/sfi/**/*.scss").map(&:realpath).sort
missing = partials - loaded
abort "FAIL: Unused SFI partials: #{missing.join(', ')}" unless missing.empty?
unexpected = loaded - partials - [entry]
abort "FAIL: Non-SFI imports: #{unexpected.join(', ')}" unless unexpected.empty?

# Jekyll appends a source-map comment; it must otherwise ship this exact CSS.
normalize = ->(css) { css.gsub(%r{/\*# sourceMappingURL=.*?\*/}m, "").strip }
generated = site.join("assets/css/sfi.css").read
abort "FAIL: Built CSS differs from the Sass entry" unless normalize.call(generated) == normalize.call(result.css)
if ARGV[1]
  abort "FAIL: Approved CSS baseline changed" unless generated == Pathname.new(ARGV[1]).read
end

# Every expanded rule must remain scoped. At-rules and keyframe steps are
# exempt; selector lines within media queries retain the .sfi-site prefix.
result.css.each_line do |line|
  next unless line.include?("{")
  selector = line.strip.sub(/\s*\{\s*$/, "")
  next if selector.start_with?("@") || selector.match?(/\A(?:from|to|\d+(?:\.\d+)?%)(?:,\s*\d+(?:\.\d+)?%)*\z/)
  abort "FAIL: Unscoped CSS selector: #{selector}" unless selector.start_with?(".sfi-site")
end

# Verify every generated SFI document, including extensionless account aliases.
pages = site.glob("**/*.html").select { |file| file.read.include?('<body class="sfi-site">') }
abort "FAIL: No rendered SFI pages found" if pages.empty?
pages.each do |file|
  html = file.read
  stylesheets = html.scan(/<link\b[^>]*>/i).select { |tag| tag.match?(/\brel=["']stylesheet["']/i) }
  unless stylesheets.length == 1 && stylesheets.first.match?(%r{\bhref=["'][^"']*/assets/css/sfi\.css["']}i)
    abort "FAIL: Competing or missing stylesheet in #{file}"
  end
  abort "FAIL: Inline stylesheet in #{file}" if html.match?(/<style\b/i)
  html.scan(/\bstyle=["']([^"']*)["']/i).flatten.each do |style|
    # Initial auth visibility is controlled by the existing JS state machine.
    auth_state = style.match?(/\Adisplay:\s*none;?\z/)
    confidence_data = file.relative_path_from(site).to_s == "sfi-specs/index.html" && style == 'width:${confPct}%'
    abort "FAIL: Inline appearance declaration in #{file}: #{style}" unless auth_state || confidence_data
  end
end

manifest = loaded.select { |file| partials.include?(file) }.map { |file| file.relative_path_from(root).to_s }.sort
puts JSON.pretty_generate(entry: entry.relative_path_from(root).to_s,
                          compiled_bytes: result.css.bytesize,
                          imported_partials: manifest,
                          compiled_css_matches: true,
                          approved_baseline_matches: !!ARGV[1],
                          scope: ".sfi-site", rendered_sfi_documents: pages.length)
puts "PASS: actual Sass entry, all #{partials.length} partials, isolated imports, CSS scope and Jekyll output#{ARGV[1] ? ', approved visual CSS baseline' : ''}"
