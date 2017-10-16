const {
  HashRouter,
  Switch,
  Route,
  Link,
  Redirect
} = ReactRouterDOM


const Config = {
    host: "",
    appName: "ManaScrewed",
    cardEndpoint: "/api/cards/",
    deckEndpoint: "/api/decks/",
    userDeckEndpoint: "/api/users/phury/decks/",
    logger: {
        level: "DEBUG"
    }
}

const JSON_HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}

const cloneObj = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const Events = {
    TitleChangeEvent: {name: "TITLE_CHANGE"}
}

const EventBus = {
    _map: {},
    send: function(evt) {
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
}

const DeckResource = {
    getDeckById: function(deckId) {
        const uri = Config.host + Config.deckEndpoint + deckId;
        return fetch(uri)
            .then((response) => {
                if (response.ok) {
                    console.log("response from " + uri);
                    return response.json();
                } else {
                    throw new Error("error calling uri "+ uri + " got response status " + response.status);
                }
            });
    },
    listDecks: function() {
        const uri = Config.host + Config.userDeckEndpoint;
        return fetch(uri)
            .then((response) => {
                if (response.ok) {
                    console.log("response from " + uri);
                    return response.json();
                } else {
                    throw new Error("error calling uri "+ uri + " got response status " + response.status);
                }
            });
    },
    deleteDeck: function(deckId) {
        const uri = Config.host + Config.deckEndpoint + deckId;
        return fetch(uri, {
            method: "delete",
            body: {},
            headers: JSON_HEADERS
        })
            .then((response) => {
                if (response.ok) return response.json();
                else throw new Error("error calling uri"+ uri + "got response status " + response.status);
            });
    },
    createDeck: function(deck) {
        const uri = Config.host + Config.userDeckEndpoint;
        return fetch(uri, {
            method: "put",
            body: JSON.stringify(deck),
            headers: JSON_HEADERS
        })
            .then((response) => {
                if (response.ok) return response.json();
                else throw new Error("error calling uri"+ uri + "got response status " + response.status);
            });
    }
}


const CardResource = {
    getCardByName: function(cardName) {
        const uri = Config.host + Config.cardEndpoint + cardName;
        return fetch(uri)
            .then((response) => {
                if (response.ok) {
                    console.log("response from " + uri);
                    return response.json();
                } else {
                    throw new Error("error calling uri "+ uri + " got response status " + response.status);
                }
            });
    }
}

var DeckEditComponent = React.createClass({
    getInitialState: function() {
        return { deckName: "", deckData: "" };
    },
    componentDidMount: function() {
        EventBus.send({name: "TITLE_CHANGE", title: "Create deck", to: "/"});
        //TODO: handle deck id from params to edit
        //this.props.match.params.deckId
    },
    _parseData: function(txt) {
        var jsonStr = "[\""+ (txt.split("\n").join("\",\"")) + "\"]";
        return JSON.parse(jsonStr);
    },
    handleChange: function(e) {
        const target = e.target;
        this.setState({
            [target.name]: target.value
        });
    },
    submitDeck: function(e) {
        e.preventDefault();
        const deck = { "name": this.state.deckName, "cards": this._parseData(this.state.deckData), "submittedBy": "phury"};
        console.log(deck);
        DeckResource.createDeck(deck)
            .then((data) => {
                console.log("created deck and got response");
                console.log(data);
                this.setState(this.getInitialState());
                this.props.history.push("/deck/"+data.id);
            });
    },
    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <form onSubmit={this.submitDeck} method="post">
                        <div className="row">
                            <div className="input-field col s12">
                                <input
                                    id="input-deck-name"
                                    type="text"
                                    name="deckName"
                                    value={this.state.deckName}
                                    onChange={this.handleChange} />
                                <label htmlFor="input-deck-name">Name for your deck</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <textarea
                                    id="input-deck-data"
                                    name="deckData"
                                    value={this.state.deckData}
                                    onChange={this.handleChange}
                                    className="materialize-textarea" />
                                <label htmlFor="input-deck-data">Mainboard</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <input type="submit" className="btn waves-effect waves-light" value="Create deck" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

const DeckDeleteComponent = React.createClass({
    getInitialState: function() {
        return { deckName: "", deck: null, deckId: null };
    },
    componentDidMount: function() {
        const deckId = this.props.match.params.deckId;
        DeckResource.getDeckById(deckId)
            .then((data) => {
                this.setState({ deck: data, deckId: deckId });
                EventBus.send({name: "TITLE_CHANGE", title: "Delete deck", to: "/deck"});
            });
    },
    handleChange: function(e) {
        const target = e.target;
        this.setState({
            [target.name]: target.value
        });
    },
    handleDeleteDeck: function(e) {
        e.preventDefault();
        if (this.state.deckName === this.state.deck.name) {
            DeckResource.deleteDeck(this.state.deck.id)
                .then((data) => {
                    console.log("deleted deck and got response");
                    console.log(data);
                    Materialize.toast("Deck '"+this.state.deck.name+"' deleted", 8000);
                    this.setState(this.getInitialState());
                    this.props.history.push("/deck");
                });
        } else {
            Materialize.toast("Entered deck name '"+this.state.deckName+"' does not match '"+this.state.deck.name+"'", 8000);
            this.setState({ deckName: "" });
        }
    },
    render: function() {
        if (this.state.deck == null) return null;

        return (
            <div className="container">
                <div className="row">
                    <form onSubmit={this.handleDeleteDeck} method="post">
                        <p> You are about to delete deck <em>{this.state.deck.name}</em>. To continue, type the name of the deck:</p>
                        <div className="row">
                            <div className="input-field col s12">
                                <input
                                    id="input-deck-name"
                                    type="text"
                                    name="deckName"
                                    value={this.state.deckName}
                                    onChange={this.handleChange} />
                                <label htmlFor="input-deck-name">Deck to delete</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <input type="submit" className="btn waves-effect waves-light red" value="Delete" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

const ManaCost = React.createClass({
    render: function() {
        const elements = this.props.mc
            .split(/{(.*?)}/)
            .filter((str) => { return str.trim() != ""; })
            .map((elt, i) => {
                return (<i key={i} className={"ms ms-"+elt} ></i>);
            });
        return (
            <div className="mc">{elements}</div>
        );
    }
});

const CardInfoComponent = React.createClass({
    getInitialState: function() {
        return { card: null };
    },
    componentDidMount: function() {
        CardResource.getCardByName(this.props.cardName)
            .then((data) => {
                this.setState({ card: data });
            });
    },
    showModal: function(e) {
        e.preventDefault();
    },
    render: function() {
        if (this.state.card == null) return null;

        return (
            <div className="row">
                <div className="col s4">
                    <img className="card-thumbnail side-a" src={this.state.card.links.image} />
                    {this.state.card.links.hasOwnProperty('flip_image') &&
                        <img className="card-thumbnail side-b" src={this.state.card.links.flip_image} />
                    }
                </div>
                <div className="col s8">
                    <ManaCost mc={this.state.card.manaCost} />
                    <p className="type">{this.state.card.type}</p>
                    <div className="oracle">
                        {this.state.card.oracle.split("\n").map((txt,i) => {
                            return <p key={i}>{txt}</p>;
                        })}
                    </div>
                    {this.state.card.powerToughness &&
                        <div className="powerToughness">
                            <p>{this.state.card.powerToughness}</p>
                        </div>
                    }
                    {this.state.card.links.hasOwnProperty('flip_name') &&
                        <Link to={"/card/"+this.state.card.links.flip_name}>{this.state.card.links.flip_name} <sup>flip</sup></Link>
                    }
                </div>
            </div>
        );
    }
});

const CardTile = React.createClass({
    render: function() {
        return (
            <div className="card card-tile">
                <div className="card-image waves-effect waves-block waves-light">
                    <img className="activator" src="http://mtg.wtf/cards/xln/92.png" />
                </div>
                <div className="card-content">
                    <span className="card-title activator grey-text text-darken-4">Card Title<i className="material-icons right">more_vert</i></span>
                    <p><a href="#">This is a link</a></p>
                </div>
                <div className="card-reveal">
                    <span className="card-title grey-text text-darken-4">Card Title<i className="material-icons right">close</i></span>
                    <p>Here is some more information about this product that is only revealed once clicked on.</p>
                </div>
            </div>
        );
    }
});

const DeckDetailComponent = React.createClass({
    getInitialState: function() {
        return { deck: null, viewMode: "LIST" };
    },
    componentDidMount: function() {
        const uri = Config.host + Config.deckEndpoint + this.props.match.params.deckId;
        fetch(uri)
            .then((response) => { return response.json() })
            .then((data) => {
                this.setState({ deck: data });
                $(".collapsible").collapsible();
                EventBus.send({name: "TITLE_CHANGE", title: this.state.deck.name, to: "/deck"});
            });
    },
    handleViewList: function(e) {
        e.preventDefault();
        this.setState({ viewMode: "LIST" });
    },
    handleViewModule: function(e) {
        e.preventDefault();
        this.setState({ viewMode: "MODULE" });
    },
    render: function() {
        if (this.state.deck == null) return null;

        if (this.state.viewMode === "MODULE") {
            return (
                <div className="container">
                    <div className="row">
                        <div className="col s12">
                            <CardTile />
                            <CardTile />
                            <CardTile />
                            <CardTile />
                        </div>
                    </div>
                </div>
            );
        } else {
            var cardElements = this.state.deck.cards.map((elt, i) => {
                var space = elt.indexOf(" ");
                var numberOfCards = elt.substring(0, space);
                var cardName = elt.substring(space+1, elt.length);
                return (
                    <li key={i}>
                      <div className="collapsible-header">{numberOfCards +"x "+ cardName}</div>
                      <div className="collapsible-body"><CardInfoComponent cardName={cardName}/></div>
                    </li>
                );
            });
            return (
                <div className="container">
                    <ul className="collapsible" data-collapsible="expandable">
                        {cardElements}
                    </ul>
                    <div className="action-bar">
                        <div className="fixed-action-btn toolbar">
                            <a className="btn-floating btn-large red">
                                <i className="material-icons">mode_edit</i>
                            </a>
                            <ul>
                                <li><Link to={"/deck-edit/"+this.state.deck.id} className="waves-effect waves-light"><i className="material-icons">edit</i></Link></li>
                                <li><Link to={"/deck-delete/"+this.state.deck.id} className="waves-effect waves-light"><i className="material-icons">delete</i></Link></li>
                                <li><a href="#" onClick={this.handleViewList} className="waves-effect waves-light"><i className="material-icons">view_list</i></a></li>
                                <li><a href="#" onClick={this.handleViewModule} className="waves-effect waves-light"><i className="material-icons">view_module</i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }


    }
});

const CardComponent = React.createClass({
    componentDidMount: function() {
        EventBus.send({name: "TITLE_CHANGE", title: this.props.match.params.cardName, to: "/deck"});
    },
    render: function() {
        return (
            <div className="container">
                <CardInfoComponent cardName={this.props.match.params.cardName} />
            </div>
        );
    }
});

const NavbarComponent = React.createClass({
    getInitialState: function() {
        EventBus.register(Events.TitleChangeEvent, this.titleChange);
        return {decks: null, title: Config.appName, to: null};
    },
    componentDidMount: function() {
        DeckResource.listDecks()
            .then((data) => {
                this.setState({decks: data});
                $("#mobile-menu-activate").sideNav();
            });
    },
    titleChange: function(evt) {
        console.log("title changed");
        console.log(evt);
        this.setState({title: evt.title, to: evt.to});
    },
    render: function() {
        var deckEntries;
        if (this.state.decks) {
            deckEntries = this.state.decks.map((elt, i) => {
                return (
                    <li key={i}><Link to={"/deck/"+elt.id}>{elt.displayName}</Link></li>
                );
            });
        }

        return (
            <div className="app-navigation">
                <div>
                    <nav>
                        <div className="nav-wrapper">
                            <ul className="left">
                                {this.state.to &&
                                    <li><Link to={this.state.to}><i className="material-icons left">arrow_back</i></Link></li>
                                }
                            </ul>
                            <a href="#" className="brand-logo">{this.state.title}</a>
                            <ul className="right hide-on-med-and-down">
                                <li><Link to="/search"><i className="material-icons left">search</i>Search</Link></li>
                                <li><Link to="/deck"><i className="material-icons left">view_list</i>Decks</Link></li>
                                <li><Link to="/settings"><i className="material-icons left">settings</i>Settings</Link></li>
                            </ul>
                            <ul className="side-nav" id="mobile-menu">
                                <li><Link to="/search"><i className="material-icons left">search</i>Search</Link></li>
                                <li><Link to="/deck"><i className="material-icons left">view_list</i>Decks</Link></li>
                                <li><Link to="/settings"><i className="material-icons left">settings</i>Settings</Link></li>
                            </ul>
                            <a href="#" data-activates="mobile-menu" id="mobile-menu-activate" className="button-collapse right"><i className="material-icons">menu</i></a>
                        </div>
                    </nav>
                </div>
            </div>
		);
    }
});

const MyDecksComponent = React.createClass({
    getInitialState: function() {
        return { decks: null };
    },
    componentDidMount: function() {
        DeckResource.listDecks()
            .then((data) => {
                this.setState({ decks: data });
                EventBus.send({name: "TITLE_CHANGE", title: "My decks", to: "/"});
            });
    },
    render: function() {
        if (this.state.decks == null || this.state.decks.error != null || this.state.decks.length <= 0) {
            return null;
        }

        // TODO: "Link to" does not work in the side menu when clicking on one deck then another
        var deckEntries = this.state.decks.map((elt, i) => {
            return (
                <li key={i} className="collection-item"><Link to={"/deck/"+elt.id}>{elt.displayName}</Link></li>
            );
        });

        return (
            <div className="container">
                <ul className="collection">
                    {deckEntries}
                </ul>
                <div className="action-bar">
                    <div className="fixed-action-btn toolbar">
                        <a className="btn-floating btn-large red">
                            <i className="material-icons">mode_edit</i>
                        </a>
                        <ul>
                            <li><Link to="/deck-edit" className="waves-effect waves-light"><i className="material-icons">create</i></Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
});

const SearchComponent = React.createClass({
    getInitialState: function() {
        return { data: {
             "Cancel": "http://mtg.wtf/cards/xln/47.png",
             "Crush of Tentacles": "http://mtg.wtf/cards_hq/ogw/53.png",
             "Rogue Elephant": "http://mtg.wtf/cards_hq/wl/81.png",
             "Westvale Abbey": "http://mtg.wtf/cards_hq/soi/281a.png"
        }};
    },
    componentDidMount: function() {
        EventBus.send({name: "TITLE_CHANGE", title: "Search", to: "/"});
        $("input.autocomplete").autocomplete({
            data: this.state.data,
            limit: 20,
            onAutocomplete: function(val) {
            },
            minLength: 3
        });
    },
    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col s12">
                        <div className="row">
                            <div className="input-field col s12">
                                <i className="material-icons prefix">search</i>
                                <input type="text" id="autocomplete-input" className="autocomplete" />
                                <label htmlFor="autocomplete-input">Search</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

const SettingsComponent = React.createClass({
    componentDidMount: function() {
        EventBus.send({name: "TITLE_CHANGE", title: "Settings", to: "/"});
    },
    render: function() {
        return (
            <div className="container">
                <h1>Settings</h1>
            </div>
        );
    }
});

const HomeComponent = React.createClass({
    render: function() {
        return (
            <div className="container">
                <h1>Hello</h1>
                <p>
                Welcome to the {Config.appName} app.
                Select a deck in your deck list or <Link to="/deck-edit" className="btn">create</Link> one.
                </p>
            </div>
        );
    }
});

const MtgApp = React.createClass({
    componentDidMount: function() {
        document.title = Config.appName;
    },
    render: function() {
        return (
            <main>
                <NavbarComponent />
                <Switch>
                      <Route exact path="/" component={HomeComponent} />
                      <Route exact path="/deck" component={MyDecksComponent} />
                      <Route exact path="/deck-edit" component={DeckEditComponent} />
                      <Route exact path="/deck-edit/:deckId" component={DeckEditComponent} />
                      <Route exact path="/deck-delete/:deckId" component={DeckDeleteComponent} />
                      <Route exact path="/deck/:deckId" component={DeckDetailComponent} />
                      <Route exact path="/card/:cardName" component={CardComponent} />
                      <Route exact path="/search" component={SearchComponent} />
                      <Route exact path="/settings" component={SettingsComponent} />
                </Switch>
            </main>
		);
    }
});


ReactDOM.render(
    <HashRouter>
        <MtgApp />
    </HashRouter>,
  document.getElementById("app")
);