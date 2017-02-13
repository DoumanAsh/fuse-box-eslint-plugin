const fsbx = require('fuse-box');
const eslinter = require('./src');

fsbx.FuseBox.init({
    homeDir: "src/",
    sourceMap: {
         bundleReference: "./sourcemaps.js.map",
         outFile: "sourcemaps.js.map",
    },
    plugins: [
        eslinter()
    ],
    outFile: "build/out.js"
}).bundle(">index.ts");
