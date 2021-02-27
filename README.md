# Template Project

This is a template project for assistivecards react native projects.

## Adaptation Procedure

1) Clone this repository to the slug name of the new project.

`git clone http://github.com/assistivecards/template new-project`

2) Edit `app.json` file respective to new project's properties.

3) Edit `./interface/en.json` file respective to new project's properties.

4) Create a firebase project for the new project and update GoogleService files.

5) Create a Google Analytics property and add the tracking code into the `app.json` file.

6) Open the project in Xcode and update General Target Settings.

7) Symlink the GoogleServices file to Xcode project.

9) Change android/app/src/main/java/org/dreamoriented/template path to the new project slug.

10) Change package refrences of android java file to new project slug.

11) Copy GoogleServices android file to `android/src/app/` folder.

12) Create a `.keystore` to sign the project on with `keytool` tool.

13) Update app icon and splashScreen assets for both android and ios projects.

14) Add the `server_key` to Expo, if your app will use Expo's FCM capabilities, with the command: `expo push:android:upload --api-key <your-token-here>`

## Documentation

Some basic "i hope i won't forget this" notes for this project.

### Basics

Use yarn.

Some stable tool versions:
- yarn v1.22.5
- npm v6.12.0
- node v12.13.0
- expo-cli @latest (v3.27.12) (if needed for notification server)

Installs pods for iOS project, must be on macOS, you might also install npx globally

```
npm install npx -g
npx pod-install
```

Now open the ios folder in xcode. (Open a project or file) Make sure you have the latest Xcode and respective ios version on your test device.

Wait for project to symlink, takes about 5-10 min.

Now run the project. (Play button top left.) This will build an sign a development version of the app to your device, and will automatically start an react-native bundler. Now you can close the Xcode and for the next time, you can use the development app on your device just like expo. Everytime you open this development app, it will try to connect to the react bundler via local network.

For the next time to start the bundler without launching xcode run the command in the hub wingo path.

`yarn start`

### Localization

- Add a textIdentifier to `interface/en.json` file.
- Use all the interface texts with `API.t('textSlug')`
- You can add variables to the interface texts like; `API.t('My name is $1', user.name)`
- You can have multiple variables; `API.t('My name is $1, and my surname is $2', [user.name, user.surname])`

The `yarn translate` command (add `:win` on windows machine) will automatically apply the Google Translate API keys to your local device, sync/translate `en.json` to other languages, and create a `pre-require` file that is hooked to api.js, so you can make sure all the UI texts will be translated into 37 languages automatically.

### Settings

The `app.json` file allows you to personalize the settings tabs depending on app's needs.

```JS
"config": {
  "language": true,
  "tts": true,
  "accent": true,
  "backgroundColor": "#333333",
  "pFontColor": "#333333"
}
```

Under config, `language`, `tts`, `accent` will enable or disable these capabilities in the app settings screen. `backgroundColor, pFontColor` values will decide the main color and font color of the app settings.

### App Signing & Keystores

Let @btk handle this part, the app will have `debug.keystore` while developing, also if not possible at the time, you can use a personal signing team for Xcode during development.

## Licensing

Will be MIT once we open source all the projects.
