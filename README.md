# nodeON

> A Node.js Web Application Skelleton

[![Build Status](https://secure.travis-ci.org/thanpolas/nodeON.png?branch=master)](http://travis-ci.org/thanpolas/nodeON)

## Install

To use, simply Clone, Enter directory, delete `.git` folder and start over:

```shell
git clone git@github.com:thanpolas/nodeON.git myApp
cd myApp
rm -rf .git
git init
git add .
git commit "Boot!"
```


## <a name='TOC'>Table of Contents</a>

1. [Overview](#overview)
1. [API](#api)

## Overview

Once the project is cloned you need to install the dependent npm and bower modules:

```shell
npm install && bower install
```

## Shell Controll

* `grunt` Boot up the application for development workflow, it will:
  * Launch the databases (Mongo & Redis).
  * Launch the Node.js Application.
  * Watch for changes on the SASS files, compile and livereload.
  * Watch for changes on the frontend files (JS, templates, css, images, static assets) and livereload.
  * Watch for changes on the backend files and relaunch the Node.js App.
  * Open the browser on the launched web service.
* `grunt start` Will start the databases (Mongo & Redis).
* `node .` Will launch the Node.js Application.
* `npm test` Will run all test suites (BDD, TDD, lint).

## API

One more to go back without onez has together we know!

**[[⬆]](#TOC)**

## Release History

- **v0.0.1**, *TBD*
    - Big Bang

## License

Copyright (c) 2014 Thanasis Polychronakis. Licensed under the MIT license.
