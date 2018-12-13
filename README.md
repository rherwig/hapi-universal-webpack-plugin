# Hapi Universal Webpack Plugin
This plugin integrates [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware), 
[webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) and 
[webpack-hot-server-middleware](https://github.com/60frames/webpack-hot-server-middleware)
into [hapi](https://hapijs.com) in order to provide hot-reloading of universal apps (i.e. apps
that run on the client and the server).

## Prerequisites
The following two packages are a peer dependency for this plugin.
 * Hapi (tested on >= 17.0)
 * webpack (tested on >= 4.0)

## Installation
```bash
$ npm i -D hapi-universal-webpack-plugin
```

## Usage
The following steps are required for you to implement the plugin and make
it work.

### Hapi
Before you start the server, you want to register the plugin. Provided you
have webpack configurations for client and server, the following snippet
will get you up and running.

```js
const HapiUniversalWebpackPlugin = require('hapi-universal-webpack-plugin');
const clientConfig = require('path/to/webpack/config');
const serverConfig = require('path/to/webpack/config');

server.register({
    plugin: HapiUniversalWebpackPlugin,
    options: {
        clientConfig,
        serverConfig,
    },
});
```

#### Options
The `options` object from the example above accepts the following values:

| Key                        | Type   | Default   | Required | Description                                                                                                                                                                  |
|----------------------------|--------|-----------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| clientConfig               | Object | undefined | yes      | webpack configuration for processing the client-side code.                                                                                                                   |
| serverConfig               | Object | undefined | no       | webpack configuration for processing the server-side code. Without this, the plugin will run in client-only mode, which is fine if you do not need server-side rendering.    |
| devMiddlewareOptions       | Object | {}        | no       | Options that get passed down to [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware). See their documentation for further information.                |
| hotMiddlewareOptions       | Object | {}        | no       | Options that get passed down to [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware). See their documentation for further information.        |
| hotServerMiddlewareOptions | Object | {}        | no       | Options that get passed down to [webpack-hot-server-middleware](https://github.com/60frames/webpack-hot-server-middleware). See their documentation for further information. |

### Webpack
A more detailed documentation on how to setup your webpack
configurations is coming very soon.
In the meantime, just refer to the `examples/` directory of this
repository, to see the plugin in action using the example of a universally
rendered VueJS application.

## Acknowledgement
[hapi-webpack-plugin](https://github.com/SimonDegraeve/hapi-webpack-plugin)
is a great solution if you do not need the server-side rendering part this
plugin provides. It also served as great inspiration for this implementation.

[webpack-hot-server-middleware](https://github.com/60frames/webpack-hot-server-middleware)
is the package that provides us with webpack-integration for server-side 
bundling.

## License
MIT
