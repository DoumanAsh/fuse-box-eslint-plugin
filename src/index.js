'use strict';

const path = require('path');

/**
 * ESLinter plugin class.
 */
class ESLinter {
    /**
     * Initializes new instance of ESLinter.
     * @param {Object} options - Optional options of plugin
     *
     * ESLint defaults:
     * * cwd - root of your project;
     * * configFile - <root>/.eslintc.js
     */
    constructor(options) {
        this.dependencies = ['eslint'];

        if (options) {
            this.eslint_options = options.eslint;
        }
        else {
            this.eslint_options = {};
        }

        this.root = process.cwd();

        this.eslint_options.cwd = this.eslint_options.cwd || this.root;
        this.eslint_options.configFile = this.eslint_options.configFile || path.join(this.root, '.eslintrc.js');
    }

    init(context) {
        this.inner = new (require('eslint').CLIEngine)(this.eslint_options);

        let report = this.inner.executeOnFiles([context.homeDir]);

        if (report.errorCount === 0 && report.warningCount === 0) {
            return;
        }

        const formatter = this.inner.getFormatter();
        let msg = `${formatter(report.results)}`;
        console.log(msg);
    }
}

module.exports = (options) => new ESLinter(options);
