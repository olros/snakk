# Snakk - 1 to 1 video chat

### Basic info
This website uses the following technologies

* Yarn (Package-manager)
* ReactJs
* Material-UI (CSS-framework)
* Firebase Firestone
* WebRTC

### Getting started

#### Installing
This project uses yarn, so all you have to do is to clone, install and run.

```
git clone git@github.com:olros/snakk.git
cd snakk
yarn install
yarn start 
```

#### API URL Setup
To run a local version of the site you have to first setup the URL
for the API. To do so, create a _.env_ file in the root-directory
and write the following
```
REACT_APP_API_KEY=YOUR_API_KEY_HERE
REACT_APP_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
REACT_APP_DATABASE_URL=https://YOUR_PROJECT_ID.firebaseio.com
REACT_APP_PROJECT_ID=YOUR_PROJECT_ID_HERE
REACT_APP_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
REACT_APP_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
REACT_APP_ID=YOUR_APP_ID_HERE
REACT_APP_MEASUREMENT_ID=YOUR_MEASUREMENT_ID_HERE
```

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn deploy`

Builds the app for production using `yarn build`, then deploys to Firebase Hosting with `firebase deploy`<br />
Requires that you have logged in to Firebase in this repository

#### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
