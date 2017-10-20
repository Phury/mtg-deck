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

const ROUTES = {
    index: "/",
    listDecks: "/deck",
    createDeck: "/deck-edit",
    readDeck: "/deck-edit/",
    updateDeck: "/deck-edit/",
    deleteDeck: "/deck-delete/",
    readCard: "/card/",
    settings: "/card/",
}

const cloneObj = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

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

const autocompleteData = {
  "Cancel": "http://mtg.wtf/cards/xln/47.png",
  "Crush of Tentacles": "http://mtg.wtf/cards_hq/ogw/53.png",
  "Rogue Elephant": "http://mtg.wtf/cards_hq/wl/81.png",
  "Westvale Abbey": "http://mtg.wtf/cards_hq/soi/281a.png"
};

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
    },
    updateDeck: function(deck) {
        const uri = Config.host + Config.userDeckEndpoint;
        return fetch(uri, {
            method: "post",
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

const FabComponent = React.createClass({
    render: function() {
        return (
            <div className="fixed-action-btn">
                <Link to={this.props.to} className="btn-floating btn-large waves-effect waves-light amber">
                    <i className="material-icons">{this.props.icon}</i>
                </Link>
            </div>
        );
    }
});

var DeckEditComponent = React.createClass({
    getInitialState: function() {
        return { deckName: "", deckCards: "" };
    },
    componentDidMount: function() {
        eventBus.send({eventType: "TITLE_CHANGE", title: "Create deck", backUrl: "/"});
        //TODO: handle deck id from params to edit
        if (this.props.match.params.deckId) {
            DeckResource.getDeckById(this.props.match.params.deckId)
                .then((data) => {
                    this.setState({ deckName: data.name, deckCards: data.cards.join("\n"), deckId: data.id });
                    eventBus.send({eventType: "TITLE_CHANGE", title: "Delete deck", backUrl: "/deck"});
                });
        }
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
        const deck = {
            name: this.state.deckName,
            cards: this._parseData(this.state.deckCards),
            submittedBy: "phury",
            deckId: this.state.deckId
        };
        console.log(deck);
        if (this.props.match.params.deckId) {
            DeckResource.updateDeck(deck)
                .then((data) => {
                    console.log("created deck and got response");
                    console.log(data);
                    this.setState(this.getInitialState());
                    this.props.history.push("/deck/"+data.id);
                });
        } else {
            DeckResource.createDeck(deck)
                .then((data) => {
                    console.log("created deck and got response");
                    console.log(data);
                    this.setState(this.getInitialState());
                    this.props.history.push("/deck/"+data.id);
                });
        }

    },
    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <form onSubmit={this.submitDeck} method="post">
                        { this.state.deckId &&
                            <input type="hidden" name="deckId" value={this.state.deckId} />
                        }
                        <div className="row">
                            <div className="input-field col s12">
                                <input
                                    id="input-deck-name"
                                    type="text"
                                    name="deckName"
                                    value={this.state.deckName}
                                    onChange={this.handleChange} />
                                <label htmlFor="input-deck-name">Name your deck</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s10">
                                <input
                                    id="input-deck-name"
                                    type="text"
                                    name="cardName"
                                    value={this.state.cardName}
                                    onChange={this.handleChange} />
                                <label htmlFor="input-card-name">Card search</label>
                            </div>
                            <div className="input-field col s2">
                                <button className="btn waves-effect waves-light">Add</button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <textarea
                                    id="input-deck-data"
                                    name="deckCards"
                                    value={this.state.deckCards}
                                    onChange={this.handleChange}
                                    className="materialize-textarea" />
                                <label htmlFor="input-deck-data">Mainboard</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <input type="submit" className="btn waves-effect waves-light"
                                    value={this.state.deckId ? "Update deck" : "Create deck"} />
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
                eventBus.send({eventType: "TITLE_CHANGE", title: "Delete deck", backUrl: "/deck"});
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
                eventBus.send({eventType: "TITLE_CHANGE", title: this.state.deck.name, backUrl: "/deck"});
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

            // <a href="#" onClick={this.handleViewList} className="waves-effect waves-light"><i className="material-icons">view_list</i></a>
            // <a href="#" onClick={this.handleViewModule} className="waves-effect waves-light"><i className="material-icons">view_module</i></a>

            return (
                <div className="container">
                    <ul className="collapsible" data-collapsible="expandable">
                        {cardElements}
                    </ul>
                    <FabComponent to={"/deck-edit/"+this.state.deck.id} icon="edit" />
                </div>
            );
        }
    }
});

const CardComponent = React.createClass({
    componentDidMount: function() {
        eventBus.send({eventType: "TITLE_CHANGE", title: this.props.match.params.cardName, backUrl: "/deck"});
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
        eventBus.register("TITLE_CHANGE", this.titleChange);
        return {title: Config.appName, to: null};
    },
    componentDidMount: function() {
        // handle toggle of the search bar
        var searchBar = $('div#search-bar'),
            searchInput = searchBar.find('input');
        $('a#toggle-search').click(function() {
            searchBar.is(":visible") ? searchBar.slideUp() : searchBar.slideDown(function() {
                searchInput.focus();
            });
            return false;
        });
        //searchInput.focusout(function() { searchBar.slideUp(); });

        // handle auto-complete feature of the search bar
        /*
        $("#autocomplete-input").autocomplete({
            data: autocompleteData,
            limit: 20,
            onAutocomplete: function(val) {
            },
            minLength: 3
        });
        */
    },
    titleChange: function(evt) {
        console.log(evt);
        this.setState({title: evt.title, backUrl: evt.backUrl});
    },
    render: function() {
        return (
            <div className="app-navigation">
                <nav>
                    <div className="nav-wrapper blue">
                        <ul className="left">
                            {this.state.backUrl &&
                                <li><Link to={this.state.backUrl}><i className="material-icons left">arrow_back</i></Link></li>
                            }
                        </ul>
                        <a href="#" className="brand-logo">{this.state.title}</a>
                        <ul className="right">
                            <li><a id="toggle-search" href="#!"><i className="material-icons">search</i></a></li>
                            <li><a className="dropdown-button" href="#!" data-activates="contextual-dropdown"><i className="material-icons">more_vert</i></a></li>
                        </ul>
                    </div>
                </nav>
                <ul id="contextual-dropdown" className="dropdown-content">
                    <li><Link to="/deck"><i className="material-icons">view_list</i>My Decks</Link></li>
                    <li><Link to="/settings"><i className="material-icons">settings</i>Settings</Link></li>
                </ul>
                <div id="search-bar" className="row white-text grey darken-3" >
                    <div className="container">
                        <div className="input-field col s12">
                            <input type="text" id="autocomplete-input" className="autocomplete" placeholder="search ..." />
                        </div>
                    </div>
                </div>
            </div>
		);
    }
});

const MyDecksComponent = React.createClass({
    getInitialState: function() {
        return {decks: null}
    },
    componentDidMount: function() {
        DeckResource.listDecks()
        .then((data) => {
            this.setState({decks: data});
            eventBus.send({eventType: "TITLE_CHANGE", title: "My decks", backUrl: "/"});
        });
    },
    render: function() {
        if (this.state.decks == null || this.state.decks.error != null || this.state.decks.length <= 0) {
            return null;
        }

        // TODO: "Link to" does not work in the side menu when clicking on one deck then another
        var deckEntries = this.state.decks.map((elt, i) => {
            return (
                <li key={i} className="collection-item avatar">
                    <div style={{backgroundImage: "url('http://mtg.wtf/cards_hq/wwk/26.png')"}} alt="" className="circle" />
                    <span className="title"><Link to={ROUTES.readDeck+elt.id}>{elt.displayName}</Link></span>
                    <span className="secondary-content"><ManaCost mc={"{w}{u}{b}{r}{g}"} /></span>
                </li>
            );
        });
        return (
            <div className="container">
                <ul className="collection">
                    {deckEntries}
                </ul>
                <FabComponent to={"/deck-edit/"} icon="add" />
            </div>
        );
    }
});

const SettingsComponent = React.createClass({
    componentDidMount: function() {
        eventBus.send({eventType: "TITLE_CHANGE", title: "Settings", to: "/"});
    },
    render: function() {
        return (
            <div className="container">
                <h1>Settings</h1>
            </div>
        );
    }
});

const Navigation = React.createClass({
    render: function() {
        return (
            <nav>
                <div className="nav-wrapper blue">
                    <ul className="left">
                        <li><a href="#">{this.props.title}</a></li>
                        {this.props.contextMenu.map((menuItem, i) => {
                            return <li key={i}><Link to={menuItem.link}>{menuItem.title}</Link></li>;
                        })}
                    </ul>
                </div>
            </nav>
        );
    }
});

const HomeComponent = React.createClass({
    render: function() {
        return (
            <div className="container">
                <Navigation
                    title="Home"
                    contextMenu={[
                        {
                            title: "My decks",
                            link: ROUTES.listDecks
                        },
                        {
                            title: "Settings",
                            link: ROUTES.settings
                        }
                    ]} />
                <h1>Hello</h1>
                <p>
                Welcome to the {Config.appName} app.
                Select a deck in your deck list or <Link to={ROUTES.createDeck} className="btn">create</Link> one.
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
                      <Route exact path={ROUTES.index} component={HomeComponent} />
                      <Route exact path={ROUTES.listDecks} component={MyDecksComponent} />
                      <Route exact path={ROUTES.readDeck+":deckId"} component={DeckDetailComponent} />
                      <Route exact path={ROUTES.createDeck} component={DeckEditComponent} />
                      <Route exact path={ROUTES.editDeck+":deckId"} component={DeckEditComponent} />
                      <Route exact path={ROUTES.deleteDeck+":deckId"} component={DeckDeleteComponent} />
                      <Route exact path={ROUTES.readCard+":cardName"} component={CardComponent} />
                      <Route exact path={ROUTES.settings} component={SettingsComponent} />
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