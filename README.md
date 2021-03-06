# +Sub Browser Extension
![build(chrome)](https://github.com/plussub/plussub/workflows/build%20and%20deploy(chrome)/badge.svg)
![build(firefox)](https://github.com/plussub/plussub/workflows/build%20and%20deploy(firefox)/badge.svg)

is an extension which adds subtitle to HTML <video> tags via file or subtitle search powered by tmbd & opensubtitles.org.

### Install local build in Chrome
```
# install dependencies
npm install
npm run gen

# build chrome (dev)
npm run start:chrome
```

1) Type in Chrome address bar: chrome://extensions/
2) Activate developer mode
3) Load unpacked extension...
4) Select plussub-root-folder/dist-chrome

### Install local build in Firefox
```
# install dependencies
npm install
npm run gen

# build firefox (dev)
npm run start:firefox
```

1) Type in Firefox address bar: about:debugging
2) Click "This Firefox"
3) Load Temporary Add-on...
4) Select plussub-root-folder/dist-firefox

## Run tests
```
npm run test
```

### chrome webstore 

```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=52192900965-tc6m9a3r0mrc66l406lht14gvt4kc5ji.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```
