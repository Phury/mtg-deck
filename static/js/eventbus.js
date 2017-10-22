
const eventBus = {
    _map: {},
    send: function(evt) {
        console.log(this._map);
        for (var i = 0; i < this._map[evt.eventType].length; i++) {
            this._map[evt.eventType][i](evt);
        }
    },
    register: function(eventType, evtHandler) {
        console.log("registering " + evtHandler + " to event " + eventType)
        if (!this._map[eventType]) this._map[eventType] = [];
        this._map[eventType].push(evtHandler);
    }
}