# JS File Manager

A JS web application that uses IndexedDB in order to store files inside of your browser's memory. Designed specifically to replace the Chromebook File Manager.

This app was created for me and my friends to be able to edit code and create websites locally on our school Chromebooks. This was also my submission for my IB Computer Science HL IA.

## Features
* Upload files to the website, and they will be stored (until the browser's memory is fully cleared).
* Create new files / folders
* Rename anything
* Favorite folders and create bookmarks
* Edit any file in a text editor with syntax highlighting
* Everything is stored locally in the browser
* ZIP upload / download and extraction

## Planned Features
I haven't worked on this in a while, but some features I never got around to implementing was the ability to move files (shouldn't be that hard), a hex editor, and a desktop view.

## Installation
This website just needs to be hosted on a server. Once the website is accessed, the user will be able to upload and access their saved files, which are stored **in** the browser's memory, **not** on the server itself.

## Info
Most of the code for this project is located in `scripts/FileStorage.js`.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)