'use strict';

const path = require('path');
const fs = require('fs');

/**
 * ESLinter plugin class.
 */
class ESLinter {
    /**
     * Initializes new instance of ESLinter.
     * @param {Object} options - Optional options of plugin
     *
     * Plugin defaults:
     * * test = /js$/;
     *
     * ESLint defaults:
     * * cwd - root of your project;
     * * configFile - <root>/.eslintc.js
     */
    constructor(options) {
        this.root = process.cwd();

        const eslint_defaults = {
            cwd: this.root,
            baseConfig: {
                "extends": ["eslint:recommended"],
            },
            configFile: path.join(this.root, '.eslintrc.js')
        };

        const defaults = {
            test: /js$/,
            eslint: eslint_defaults
        };

        if (!fs.existsSync(eslint_defaults.configFile)) {
            eslint_defaults.configFile = null;
        }

        if (!options) {
            Object.assign(this, defaults);
            return;
        }

        this.test = options.pattern || defaults.test;

        if (!options.eslint) {
            this.eslint = eslint_defaults;
            return;
        }

        this.eslint = Object.assign(eslint_defaults, options.eslint);
    }

    init() {
        this.inner = new (require('eslint').CLIEngine)(this.eslint);
    }

    transform(file) {
        if (file.collection.name === file.context.defaultPackageName) {
            const file_path = path.relative(this.root, file.absPath);
            const report = this.inner.executeOnText(file.contents, file_path);

            if (report.errorCount === 0 && report.warningCount === 0) {
                return;
            }

            const formatter = this.inner.getFormatter();
            let msg = `${formatter(report.results)}`;
            console.log(msg);
        }
    }
}

module.exports = (options) => new ESLinter(options);
