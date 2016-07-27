var actions     = require('../redux/actions.top-frame');
var createStore = require('../redux/createStore.top-frame');

var store = createStore();

store.dispatch(actions.getEntity({ api: 'soundcloud', type: 'content', id: 'same-drugs', account: { id: 'chancetherapper' } }));
