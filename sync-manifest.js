const fs = require('fs').promises;
const toJson = (r) => JSON.parse(r);

(async () => {
    const [package, manifestChrome, manifestFirefox] = await Promise.all([
        fs.readFile("package.json", "utf-8").then(toJson),
        fs.readFile("src/manifest-chrome.json", "utf-8").then(toJson),
        fs.readFile("src/manifest-firefox.json", "utf-8").then(toJson)
    ]);
    await fs.writeFile("src/manifest-chrome.json", JSON.stringify({
        ...manifestChrome,
        version: package.version
    }, null, 2));
    await fs.writeFile("src/manifest-firefox.json", JSON.stringify({
        ...manifestFirefox,
        version: package.version
    }, null, 2));
})();
