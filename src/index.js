const debug = require('debug')('hapi-universal-webpack-plugin');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackHotServerMiddleware = require('webpack-hot-server-middleware');

/**
 * Creates a webpack multicompiler based on the specified configurations.
 *
 * @param clientConfig {{}} Webpack client configuration
 * @param serverConfig {{}} Webpack server configuration
 * @returns {MultiCompiler} Webpack multicompiler
 */
const createCompiler = (clientConfig, serverConfig) => {
    const configurations = [];

    if (!clientConfig) {
        throw new Error(
            'No client config found for webpack.'
        );
    }

    if (clientConfig.name !== 'client') {
        throw new Error(
            'The `name` property of your client config ' +
            'needs to be `client` in order for webpack middlewares to work.'
        );
    }

    configurations.push(clientConfig);

    if (serverConfig) {
        if (serverConfig.name !== 'server') {
            throw new Error(
                'The `name` property of your server config ' +
                'needs to be `server` in order for webpack middlewares to work.'
            );
        }

        configurations.push(serverConfig);
    } else {
        debug('No server config found. Starting in client-only mode.');
    }

    return webpack(configurations);
};

/**
 * Extends the hapi server by webpack middleware.
 *
 * This method is used to start compilation based on the provided webpack
 * configurations using either the dev- or hot-middleware.
 *
 * @param server Hapi server instance
 * @param middleware Webpack middleware instance
 */
const createExtension = (server, middleware) => {
    server.ext({
        type: 'onRequest',
        method: (request, h) => new Promise((resolve, reject) => {
            const { req, res } = request.raw;

            middleware(req, res, err => {
                return err ? reject(err) : resolve(h.continue);
            });
        }),
    });
};

/**
 * Creates a catch-all route handler that makes use of
 * webpack-hot-server-middleware to provide an entrypoint for server-side
 * rendering.
 *
 * This method will only be called, if there is a server configuration for
 * webpack.
 *
 * @param server Hapi server instance
 * @param multiCompiler Webpack multicompiler
 * @param options Options passed to webpack-hot-server-middleware
 */
const createHandler = (server, multiCompiler, options = {}) => {
    server.route({
        method: 'GET',
        path: '/{p*}',
        handler: webpackHotServerMiddleware(multiCompiler, {
            ...options,
            createHandler: (err, serverRenderer) => (req, h) => {
                return new Promise((resolve, reject) => {
                    return err ? reject(err) : resolve(serverRenderer(req, h));
                });
            },
        }),
    });
};

/**
 * Registers the plugin and implements webpack middlewares based on the
 * configurations given.
 *
 * @param server Hapi server instance
 * @param options Plugin options
 */
const register = (server, options) => {
    const {
        clientConfig,
        serverConfig,
        devMiddlewareOptions = {},
        hotMiddlewareOptions = {},
        hotServerMiddlewareOptions = {},
    } = options;
    const multiCompiler = createCompiler(clientConfig, serverConfig);
    const clientCompiler = multiCompiler.compilers.find(
        compiler => compiler.name === 'client'
    );

    const devMiddleware = webpackDevMiddleware(multiCompiler, {
        publicPath: clientConfig.output.publicPath,
        ...devMiddlewareOptions,
    });

    const hotMiddleware = webpackHotMiddleware(
        clientCompiler,
        hotMiddlewareOptions
    );

    createExtension(server, devMiddleware);
    createExtension(server, hotMiddleware);

    if (serverConfig) {
        createHandler(server, multiCompiler, hotServerMiddlewareOptions);
    }

    server.expose({ multiCompiler });
};

module.exports = {
    name: 'hapiUniversalWebpackPlugin',
    version: '1.0.0',
    once: true,
    register,
};
