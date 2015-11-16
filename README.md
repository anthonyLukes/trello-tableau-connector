# Tableau Trello Web Connnector

## Environment setup

* Install [node.js](https://nodejs.org/en/)
* Make a copy of `local.env.json.dist` and rename it to `local.env.json`
* Update the value of `"TRELLO_API_KEY"` in your new `local.env.json` file with your [trello api key](https://trello.com/app-key)
* Run `gulp` to build html with your trello API key

## Deployment to Heroku
* Sign up with a [Heroku](http://heroku.com) account
* Install the [Heroku Toolbelt](https://toolbelt.heroku.com/)
* If you don't have a git repo already run `git init` to initialize a git repo
* Run `heroku create` to add a new Heroku app
* Set your Trello api key as a configuration variable (this can also be set from within the Heroku admin)
  ```
  heroku config:set TRELLO_API_KEY=yourtrelloapikey
  ```
* Make sure that you're using the ruby buildpack by running the following command
  ```
  heroku buildpacks:set https://github.com/heroku/heroku-buildpack-ruby
  ```
* Add a second buildpack to allow node to build
  ```
  heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-nodejs
  ```
* Run `git add .` and `git commit -m "you git message here"`
* Run `git push heroku master`
* When that's done deploying run `heroku open` to view your site in the browser.
