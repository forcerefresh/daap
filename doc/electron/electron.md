Notes related to electron

# Where should I store the data?

Typically data is stored in the user’s “app data” folder.
Where this directory is varies by operating system.

- **Mac OS:** ~/Library/Application Support/<Your App Name (taken from the name property in package.json)>
- **Windows:** C:\Users\<you>\AppData\Local\<Your App Name> (local: C:\Users\<you>\AppData\Roaming\<Your App Name> )
- **Linux:** ~/.config/<Your App Name>

Electron provides app.getPath which returns the right directory, depending on your platform.


app specific pass: Wb Slider : khwp-yajw-uwfo-ypit

