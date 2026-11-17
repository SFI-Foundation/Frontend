# Focused flag tests without fetching a remote theme or generating the whole site.
require 'ostruct'
module Jekyll
  class Generator
    def self.safe(*) = nil
    def self.priority(*) = nil
  end
  module Errors
    class FatalException < StandardError; end
  end
  def self.env = ENV.fetch('JEKYLL_ENV', 'development')
end
load File.expand_path('../_plugins/internal_demos.rb', __dir__)
gate = SFI::InternalDemos.new
['production', 'development'].each do |mode|
  ENV['JEKYLL_ENV'] = mode
  gate.generate(OpenStruct.new(config: {}))
  gate.generate(OpenStruct.new(config: {'sfi_manufacturer_demo' => false}))
  [nil, 'true', 1].each do |bad|
    begin
      gate.generate(OpenStruct.new(config: {'sfi_manufacturer_demo' => bad}))
      raise 'Invalid flag accepted'
    rescue Jekyll::Errors::FatalException
    end
  end
end
ENV['JEKYLL_ENV'] = 'production'
begin
  gate.generate(OpenStruct.new(config: {'sfi_manufacturer_demo' => true}))
  raise 'Production demo enabled'
rescue Jekyll::Errors::FatalException
end
puts 'PASS: default-off, explicit-off, strict boolean validation and production opt-in rejection'
