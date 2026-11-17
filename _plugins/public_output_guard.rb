# Fail closed if a provider secret or private local file reaches static output.
# Errors report only relative file locations, never matched values.
Jekyll::Hooks.register :site, :post_write do |site|
  token = /AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|ghp_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
  Dir.glob(File.join(site.dest, '**', '*'), File::FNM_DOTMATCH).each do |file|
    next unless File.file?(file)
    relative = file.delete_prefix(site.dest + '/')
    if File.basename(file).match?(/\A(?:\.env(?:\..*)?|.*\.(?:pem|key|p12|pfx))\z/) || relative.start_with?('qa-evidence/')
      raise Jekyll::Errors::FatalException, "Private file in public output: #{relative}"
    end
    next unless file.match?(/\.(?:html|css|js|mjs|json|txt|xml|map|yml)\z/i)
    if File.binread(file).force_encoding('UTF-8').scrub.match?(token)
      raise Jekyll::Errors::FatalException, "Potential provider credential in public output: #{relative}"
    end
  end
end
