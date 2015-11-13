# config.ru
use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']
end

use Rack::Static, :urls => [""], :root => 'web', :index => 'index.html'

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=0'
    },
    File.open('web/index.html', File::RDONLY)
  ]
}