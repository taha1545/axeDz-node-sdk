'use strict';

const AxeDz = require('./src/axedz');
const errors = require('./src/core/errors');

module.exports = AxeDz;
module.exports.AxeDz = AxeDz;
module.exports.default = AxeDz;

module.exports.AxeDzError = errors.AxeDzError;
module.exports.AuthenticationError = errors.AuthenticationError;
module.exports.ValidationError = errors.ValidationError;
module.exports.RateLimitError = errors.RateLimitError;
module.exports.NetworkError = errors.NetworkError;
module.exports.ServerError = errors.ServerError;
