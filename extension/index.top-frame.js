var actions     = require('../redux/actions.top-frame');
var createStore = require('../redux/createStore.top-frame');

var store = createStore();

store.dispatch(actions.getEntity({ api: 'instagram', type: 'content', id: '6CzVD6EBKw' }));
