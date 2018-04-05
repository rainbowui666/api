const path = require('path');

const Inert = require('inert');
const Vision = require('vision');
const Good = require('good');
const MrHorse = require('mrhorse');
const Routes = require('hapi-plus-routes');
const JWT = require('hapi-auth-jwt2');
const MySql = require('hapi-plugin-mysql');
const Swagger = require('hapi-swagger');
const Nes = require('nes');

const validateFunc = require('./validateJwt.js');
const Pack = require('../package.json');
const config = require('../config.js');

const plugins = [Inert, Vision];

const logSqueezeArgs = [{
    log: '*',
    response: '*',
    request: '*',
    'request-internal': '*'
}];

plugins.push({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: logSqueezeArgs
            }, {
                module: 'good-console',
                args: [{
                    format: 'HH:mm:ss DD.MM.YYYY'
                }]
            }, 'stdout'],
            file: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: logSqueezeArgs
            }, {
                module: 'good-squeeze',
                name: 'SafeJson'
            }, {
                module: 'rotating-file-stream',
                args: [
                    'log',
                    {
                        interval: '1d',
                        compress: 'gzip',
                        path: './logs'
                    }
                ]
            }]
        }
    }
});

plugins.push({
    register: MySql,
    options: config.mySql
});

plugins.push({
    register: Nes
});

plugins.push({
    register: MrHorse,
    options: {
        policyDirectory: path.join(__dirname, 'policies'),
        defaultApplyPoint: 'onPreHandler'
    }
});

plugins.push({
    register: Routes,
    options: {
        routes: './routes/**/*.js'
    }
});

plugins.push({
    register: Swagger,
    options: {
        documentationPage: true, // boolean to enable/disable Swagger
        info: {
            title: 'API Documentation',
            version: Pack.version
        },
        jsonEditor: true,
        host: 'www.coral123.com'
    }
});

module.exports = server => new Promise((resolve, reject) => {
    server.register(JWT, (jwtRegErr) => {
        if(jwtRegErr) {
            reject(jwtRegErr);
        } else {
            server.auth.strategy('jwt', 'jwt', true, {
                key: config.authKey,
                verifyOptions: {
                    algorithms: ['HS256']
                },
                validateFunc
            });

            server.register(plugins, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
});
