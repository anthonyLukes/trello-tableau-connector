use Rack::Static, :urls => [""], :root => 'web', :index => 'trelloConnector.html'

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=0'
    },
    File.open('web/trelloConnector.html', File::RDONLY)
  ]
}