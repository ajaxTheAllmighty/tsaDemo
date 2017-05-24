'use strict';
var m = require('mithril');
window.Globals = require('./components/globals.js')();
var lang = require('./lang/lang.js')();
window.t = lang.t;
var routes = require('./routes.js');
window.Timer = require('./modules/core/timer/timer.js')();
window.GlobalInfoSystemMessage = require('./modules/inform-modal/inform-modal.js')();
window.GlobalSystemMessage = require('./modules/system-message/system-message.js')();
window.GlobalDialogModule = require('./modules/dialog-modal/dialog-modal.js')();
window.GridModule = require('./modules/core/grid/grid.js');
window.CardModule = require('./modules/core/card/card.js');


window.ProductCardColumns = require('./modules/core/grid/products/card_columns.js');
window.ProductColumns = require('./modules/core/grid/products/columns.js');
window.ProductData = require('./modules/core/grid/products/data.js');

window.SalepointCardColumns = require('./modules/core/grid/salepoints/card_columns.js');
window.SalepointColumns = require('./modules/core/grid/salepoints/columns.js');
window.SalepointData = require('./modules/core/grid/salepoints/data.js');

window.UsersCardColumns = require('./modules/core/grid/users/card_columns.js');
window.UsersColumns = require('./modules/core/grid/users/columns.js');
window.UsersData = require('./modules/core/grid/users/data.js');



m.route.mode = "hash";
m.route(document.body, "/", routes());