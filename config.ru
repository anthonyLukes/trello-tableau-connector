use Rack::Static,
  :urls => ["/images", "/js", "/css"],
  :root => "web"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'web, max-age=86400'
    },
    File.open('web/index.html', File::RDONLY)
  ]
}