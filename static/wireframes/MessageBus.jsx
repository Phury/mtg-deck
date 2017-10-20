
const EventBus = {
    _map: {},
    notify: function(evt) {
        console.log(this._map);
        for (var i = 0; i < this._map[evt.name].length; i++) {
            this._map[evt.name][i](evt);
        }
    },
    register: function(evt, evtHandler) {
        console.log("registering " + evtHandler + " to event " + evt.name)
        if (!this._map[evt.name]) this._map[evt.name] = [];
        this._map[evt.name].push(evtHandler);
    }
};