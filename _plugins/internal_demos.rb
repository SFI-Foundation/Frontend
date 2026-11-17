# No prototype page or fictional dataset is copied by the default static build.
module SFI
  class InternalDemos < Jekyll::Generator
    safe true
    priority :highest
    def generate(site)
      enabled = site.config.fetch('sfi_manufacturer_demo', false)
      unless [true, false].include?(enabled)
        raise Jekyll::Errors::FatalException, 'sfi_manufacturer_demo must be a boolean'
      end
      return unless enabled
      unless Jekyll.env == 'development'
        raise Jekyll::Errors::FatalException, 'Manufacturer demo requires JEKYLL_ENV=development'
      end
      page = Jekyll::Page.new(site, site.source, '_internal', 'manufacturer-demo.md')
      page.data['sitemap'] = false
      site.pages << page
      site.static_files << Jekyll::StaticFile.new(site, site.source, '_internal', 'manufacturer-demo.js')
    end
  end
end
