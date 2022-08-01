# Video source unmute

Use to mute/unmute video objects.

## Prerequest

Install following tools

- [NodeJs](https://nodejs.org) 16.15.0 or newest
- [Yarn](https://yarnpkg.com/) 1.22.19 or newest
- [Gulp](https://gulpjs.com/) 2.3.0 or newest `npm install --global gulp-cli`

## Install dependencies

After you clone repo you will need to install dependencies:

`yarn`

## Run

To run development server:

`yarn start`

## Add object in app

During development, in order to test your object, you can add it to Web Slider app and get realtime preview.

To connect follow these steps:

- `yarn start`
- It will open browser and show development configuration page.
- In Web Slider App go to `Settings > App Settings` and enable `Developer mode`
- Go to `Library > Development` and click `+ Add Object`.
- Fill out form with data from development configuration page and click `Start monitoring`.

## Build

To build Object for production:

`yarn build`

Bundle is located in `dist/bundle/video-source-unmute.zip` folder.  
It contains following files:

- object-meta.json
- video-source-unmute-app.js
- video-source-unmute-player.js
- video-source-unmute.logo.svg

## Analyze

Use analyze to check what is inside your javascript build file and to optimize it.

- Run `yarn build`
- Run `yarn run analyze-app` and `yarn run analyze-player` to analyze app or player build.

## License

This repo is licensed under **EULA for Web Slider Objects** license

In short, it's allowed to clone/fork, to edit/modify, create new Object and use in Web Slider App.

Read License.txt file for details.
