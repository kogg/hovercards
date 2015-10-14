module.exports = {
	"use": ["postcss-import", "postcss-class-prefix", "postcss-color-rgba-fallback", "autoprefixer", "postcss-reporter"],
	"postcss-import": {
		onImport: function(sources) {
			console.log('postcss', sources);
			global.watchCSS(sources);
		}
	},
	"postcss-class-prefix": "__MSG_@@extension_id__-"
};
