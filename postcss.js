module.exports = {
	"use": ["postcss-import", "autoprefixer", "postcss-color-rgba-fallback", "postcss-class-prefix", "postcss-reporter"],
	"postcss-import": {
		"glob": true,
		"onImport": function(sources) {
			console.log('postcss', sources);
			global.watchCSS(sources);
		}
	},
	"postcss-class-prefix": "__MSG_@@extension_id__-"
};
