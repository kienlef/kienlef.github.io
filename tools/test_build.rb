# Run with the project's Jekyll bundle: bundle exec ruby tools/test_build.rb
# Inspects generated routes without rendering or writing build output.
require "jekyll"
require "tmpdir"

source = File.expand_path("..", __dir__)
Dir.mktmpdir("homepage-route-check") do |destination|
  site = Jekyll::Site.new(Jekyll.configuration(
    "source" => source, "destination" => destination,
    "config" => File.join(source, "_config.yml")
  ))
  site.reset
  site.read
  site.generate
  root = File.join(destination, "index.html")
  writers = site.pages.select { |page| page.destination(destination) == root }
  abort "FAIL: expected one homepage writer, got #{writers.map(&:path).inspect}" unless writers.length == 1 && writers.first.path == "index.html"
  generated_paths = site.pages.map { |page| page.destination(destination) }
  duplicates = generated_paths.tally.select { |_path, count| count > 1 }
  abort "FAIL: duplicate page destinations: #{duplicates.inspect}" unless duplicates.empty?
  leaked = site.static_files.select { |file| file.relative_path.match?(%r{\A/(tools|test)/}) }
  abort "FAIL: tooling/test fixtures would be published: #{leaked.map(&:relative_path).inspect}" unless leaked.empty?
  puts "PASS: one homepage writer, no duplicate page destinations, no tooling/test fixtures published"
end
