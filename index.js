'use strict';

const gutil = require('gulp-util');
const connect = require('connect');
const compression = require('compression');
const serveStatic = require('serve-static');
const proxy = require('http-proxy-middleware');
const redirects = require('@cfware/middleware-redirects');

const tryStartPort = function(app, port) {
	gutil.log(`Trying to listen on port ${port}`);

	return new Promise((resolve, reject) => {
		const server = app.listen(port, 'localhost', () => {
			const addr = server.address();

			gutil.log(`Example app listening at http://${addr.address}:${addr.port}`);
			resolve(server);
		});

		server.on('error', reject);
	});
};
const tryStartPorts = function(app, port, ...ports) {
	if (typeof port === 'undefined') {
		throw new Error('Failed to start listener.');
	}

	return tryStartPort(app, port)
		.catch(() => tryStartPorts(app, ...ports));
};

const gulpServe = function(options) {
	const app = connect();

	if (!options) {
		throw new Error('options are required');
	}

	if (!options.nocompression) {
		app.use(compression());
	}

	if (options.proxies) {
		for (const uri in options.proxies) {
			if ({}.hasOwnProperty.call(options.proxies, uri)) {
				app.use(uri, proxy(options.proxies[uri]));
			}
		}
	}

	if (options.redirects) {
		app.use(redirects(options.redirects));
	}

	if (options.statics) {
		for (const uri in options.statics) {
			if ({}.hasOwnProperty.call(options.statics, uri)) {
				app.use(uri, serveStatic(options.statics[uri]));
			}
		}
	}

	return new Promise((resolve, reject) => {
		tryStartPorts(app, ...options.ports)
			.then(server => {
				let closing = 0;
				const socks = [];

				server.on('connection', socket => {
					socks.push(socket);

					socket.on('close', () => {
						const idx = socks.indexOf(socket);

						if (idx !== -1) {
							socks.splice(idx, 1);
							if (closing && socks.length === 0) {
								resolve();
							}
						}
					});
				});

				process.on('SIGINT', () => {
					closing = 1;
					server.close();
					socks.forEach(sock => sock.destroy());
				});
			})
			.catch(reject);
	});
};

/**
 * Basic HTTP connect gulp task
 *
 * @param {!Object} options - Options to use for starting the HTTP server.
 * @param {!number[]} options.ports - Array of ports to try listening on, include 0 for random port.
 * @param {boolean} options.nocompression - Set true to disable compression.
 * @param {Object} options.proxies - Key = URI, value = option passed to http-proxy-middleware.
 * @param {Object} options.redirects - Passed to @cfware/middleware-redirects if set.
 * @param {Object} options.statics - Key = URI, value = base path for files to be statically served.
 */
module.exports = function gulpServeTask(options) {
	return () => gulpServe(options);
};
