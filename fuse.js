const fsbx = require('fuse-box');
const eslinter = require('./src');

fsbx.FuseBox.init({
    homeDir: "src/",
    plugins: [
        eslinter({
            eslint: {
                configFile: ".eslintrc.js"
            }
        })
    ],
    outFile: "build/out.js"
}).bundle(">index.ts [**/*.js]");
