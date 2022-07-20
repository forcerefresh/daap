# Video target

This repository is a boilerplate for creating Object for Web Slider.
This is a recommended way to build Objects.

## Prerequest

Install following tools

- [NodeJs](https://nodejs.org) 16.15.0 or newest
- [Yarn](https://yarnpkg.com/) 1.22.19 or newest
- [Gulp](https://gulpjs.com/) 2.3.0 or newest `npm install --global gulp-cli`

## Install dependencies

After you clone repo you need to install dependencies.

Run `yarn`

## Run

To run development server.

Run `yarn start`

## Add object in app

During development, in order to test your object, you can add it to Web Slider app and get realtime preview.

To connect follow these steps:

- Run `yarn start`
- Yarn start will output URL like this `http://localhost:3005`. This URL will be used later.
- In Web Slider app go to `Settings > App Settings` and enable `Developer mode`
- Go to `Library > Development` and click `+ Add Object`.
- In the `Object URL` enter URL you get from `yarn start` output.

## Build

To build object for production.

Run `yarn build` to build `video-target.zip` which contains following files

- object-definition.json
-
-
-

## Analyze

To analyze build file run `npm run analyze`
