var _ = require('underscore');

module.exports = {
	options: {
		imgur: {
			account: { enabled: true },
			content: { enabled: true }
		},
		instagram: {
			account: { enabled: true },
			content: { enabled: true }
		},
		reddit: {
			account: { enabled: true },
			content: { enabled: true }
		},
		soundcloud: {
			account: { enabled: true },
			content: { enabled: true }
		},
		twitter: {
			account: { enabled: true },
			content: { enabled: true }
		},
		youtube: {
			account: { enabled: true },
			content: { enabled: true }
		}
	}
};

module.exports.options.keys = function optionKeys(object, prefix) {
	object = object || _.omit(module.exports.options, 'keys');
	prefix = prefix || '';
	return _.chain(object)
		.pairs()
		.reduce(
			function(keys, entry) {
				if (_.isObject(entry[1]) && !_.isArray(entry[1])) {
					return keys.concat(optionKeys(entry[1], prefix + entry[0] + '.'));
				}
				keys.push(prefix + entry[0]);
				return keys;
			},
			[]
		)
		.value();
};
