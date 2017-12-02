const {
  HashRouter,
  Switch,
  Route,
  Link,
  Redirect
} = ReactRouterDOM


const Config = {
    host: "",
    appName: "Urza's grimoire",
    cardEndpoint: "/api/cards/",
    cardSearchEndpoint: "/api/cards/search?q=",
    deckEndpoint: "/api/decks/",
    createDeckEndpoint: "/api/users/phury/decks/",
    updateDeckEndpoint: "/api/decks/",
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

const origin = "/";

PouchDB.debug.enable('*');

const memoize = function(func, param, cache) {
    return cache.get(param).catch((err) => {
        return func(param).then((json) => {
            json._id = param;
            cache.put(json);
            return new Promise((resolve, reject) => { resolve(json); });
        });
    });
}

const DeckResource = {
    _cache: new PouchDB('decks'),
    _getDeckById: function(deckId) {
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
    getDeckById: function(deckId) {
        return memoize(this._getDeckById, deckId, this._cache);
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
        const uri = Config.host + Config.createDeckEndpoint;
        return fetch(uri, {
            method: "put",
            body: JSON.stringify(deck),
            headers: JSON_HEADERS
        })
            .then((response) => {
                if (response.ok) return response.json();
                else throw new Error("error calling uri ("+ uri + ") got response status " + response.status);
            });
    },
    updateDeck: function(deck) {
        const uri = Config.host + Config.updateDeckEndpoint + deck.id;
        return fetch(uri, {
            method: "post",
            body: JSON.stringify(deck),
            headers: JSON_HEADERS
        })
            .then((response) => {
                if (response.ok) return response.json();
                else throw new Error("error calling uri ("+ uri + ") got response status " + response.status);
            });
    }
}

const CardResource = {
    _cache: new PouchDB('cards'),
    _getCardByName: function(cardName) {
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
    },
    getCardByName: function(cardName) {
        return memoize(this._getCardByName, cardName, this._cache);
    },
    getCardsInDeck: function(deck, callback) {
        const cards = [];
        deck.cards.map((elt, i) => {
            const space = elt.indexOf(" ");
            const numberOfCards = parseInt(elt.substring(0, space)) || 1;
            const cardName = elt.substring(space+1, elt.length);
            CardResource.getCardByName(cardName)
                .then(card => {
                    card.amount = numberOfCards;
                    cards.push(card);
                    callback(cards);
                })
                .catch(error => {
                    console.log(error+": could not retrieve card "+cardName);
                    return {amount: numberOfCards, name: cardName, manaCost: "", convertedManaCost: 0, links: {}};// TODO: Handle null fields in CardInfoComponent to be more robust
                })
        });
    },
    searchCards: function(query) {
        const uri = Config.host + Config.cardSearchEndpoint + query;
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

const StashResource = {
    _stash: [],
    stashCard: function(card) {
        this._stash.push(card);
        console.log("card stashed: ");
        console.log(card);
    }
}

const ExtendedNavigation = React.createClass({
    render: function() {
        return (
            <header>
                <nav className="nav-extended">
                    <div className="nav-bg"
                        style={{backgroundImage: "url('"+this.props.backgroundImage+"')"}}>
                    </div>
                    <div className="nav-wrapper">
                        <ul className="left">
                            <li><Link to={this.props.backUrl}><i className="material-icons">arrow_back</i></Link></li>
                        </ul>
                        <ul className="right">
                            <li><a href="#search-box" className="search-box-trigger"><i className="material-icons left">search</i>search</a></li>
                        </ul>
                    </div>
                    <div className="nav-header">
                        <h1>{this.props.title}</h1>
                    </div>
                </nav>
            </header>
        );
    }
});

const Navigation = React.createClass({
    getDefaultProps() {
        return { navbarColor: "purple" };
    },
    render: function() {
        return (
            <header>
                <nav className={this.props.navbarColor}>
                    <div className="nav-wrapper">
                        <ul className="left">
                            {this.props.backUrl &&
                                <li><Link to={this.props.backUrl}><i className="material-icons">arrow_back</i></Link></li>
                            }
                        </ul>
                        <a href="#" className="brand-logo">{this.props.title}</a>
                        <ul className="right">
                            {this.props.menuItems && this.props.menuItems.map((menuItem, i) => {
                                if (typeof menuItem.link === 'string') {
                                    return (
                                        <li key={i}>
                                            <Link to={menuItem.link}>
                                                {menuItem.icon &&
                                                    <i className="material-icons left">{menuItem.icon}</i>
                                                }
                                                {menuItem.title}
                                            </Link>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li key={i}>
                                            <a href="#" onClick={menuItem.link}>
                                                {menuItem.icon &&
                                                    <i className="material-icons left">{menuItem.icon}</i>
                                                }
                                                {menuItem.title}
                                            </a>
                                        </li>
                                    );
                                }
                            })}
                            <li><a href="#search-box" className="search-box-trigger"><i className="material-icons left">search</i>Search</a></li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }
});

const FabComponent = React.createClass({
    render: function() {
        if (this.props.menuItems.length == 1) {
            return (
                <div className="fixed-action-btn">
                    <Link to={this.props.menuItems[0].link} className="btn-floating btn-large amber">
                       <i className="material-icons">{this.props.menuItems[0].icon}</i>
                    </Link>
                </div>
            );
        } else if (this.props.menuItems.length > 1) {
            const menuItems = this.props.menuItems.map((menuItem, i) => {
                return (
                    <li key={i}>
                        <Link to={menuItem.link} className={"btn-floating "+menuItem.color}>
                            <i className="material-icons">{menuItem.icon}</i>
                        </Link>
                        <span className="mobile-fab-tip">{menuItem.name}</span>
                    </li>
                );
            });
            return (
                <div className="fixed-action-btn horizontal">
                    <a className="btn-floating btn-large amber">
                      <i className="large material-icons">add</i>
                    </a>
                    <ul>
                        {menuItems}
                    </ul>
                </div>
            );
        } else {
            return null;
        }
    }
});


const Manacost = React.createClass({
    render: function() {
        if (!this.props.mc) return null;
        const elements = this.props.mc
            .split(/{(.*?)}/)
            .filter(str => { return str.trim() != ""; })
            .map((elt, i) => {
                return (<i key={i} className={"ms ms-cost ms-"+elt}></i>);
            });
        return (
            <span className="mc">{elements}</span>
        );
    }
});

const Oracle = React.createClass({
    render: function() {
        const elements = this.props.text
            .split(/{(.*?)}/)
            .filter(str => { return str.trim() != ""; })
            .map((elt, i) => {
                switch (elt.toLowerCase()) {
                    case 'w':
                    case 'u':
                    case 'b':
                    case 'r':
                    case 'g':
                    case 'c':
                    case 'p':
                    case 's':
                    case 'x':
                    case 'y':
                    case 'z':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                    case '10':
                    case '11':
                    case '12':
                    case '13':
                    case '14':
                    case '15':
                    case '16':
                    case '17':
                    case '18':
                    case '19':
                    case '20':
                    case 'e':
                        return (
                            <span key={i}>
                                <span className="sr-only">{'{'+elt+'}'}</span>
                                <i className={"ms ms-cost ms-"+elt.toLowerCase()}></i>
                            </span>
                        );
                    case 't':
                        return (
                            <span key={i}>
                                <span className="sr-only">{'{'+elt+'}'}</span>
                                <i className="ms ms-cost ms-tap"></i>
                            </span>
                        );
                    case 'q':
                        return (
                            <span key={i}>
                                <span className="sr-only">{'{'+elt+'}'}</span>
                                <i className="ms ms-cost ms-untap"></i>
                            </span>
                        );
                    default:
                        return <span key={i}>{elt}</span>;
                }
            });
        return (
            <span>{elements}</span>
        );
    }
});

const ModalSearchComponent = React.createClass({
    render: function() {
        return (
            <div id="search-box" className="modal modal-search">
                <div className="input-field">
                    <i className="material-icons prefix">search</i>
                    <input
                        id="autocomplete-input"
                        className="autocomplete search"
                        type="search"
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && e.target.value) {
                                $("#search-box").modal("close");
                                this.props.history.push("/search/"+e.target.value);
                            }
                        }.bind(this)} />
                </div>
            </div>
        );
    }
});


const DeckEditorComponent = React.createClass({
    getInitialState: function() {
        return { deckName: "", deckCards: "" };
    },
    componentDidMount: function() {
        if (this.props.match.params.deckId) {
            DeckResource.getDeckById(this.props.match.params.deckId)
                .then((data) => {
                    this.setState({ deckName: data.name, deckCards: data.cards.join("\n"), deckId: data.id });
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
        Materialize.updateTextFields();
        $("#input-deck-data").trigger("autoresize");// TODO: this does not seem to work
    },
    submitDeck: function(e) {
        e.preventDefault();
        const deck = {
            id: this.state.deckId,
            name: this.state.deckName,
            cards: this._parseData(this.state.deckCards),
            submittedBy: "phury"
        };
        if (this.props.match.params.deckId) {
            DeckResource.updateDeck(deck)
                .then((data) => {
                    console.log("updated deck and got response");
                    console.log(data);
                    this.setState(this.getInitialState());
                    this.props.history.push("/decks/"+data.id);
                });
        } else {
            DeckResource.createDeck(deck)
                .then((data) => {
                    console.log("created deck and got response");
                    console.log(data);
                    this.setState(this.getInitialState());
                    this.props.history.push("/decks/"+data.id);
                });
        }

    },
    render: function() {
        return (
            <main>
                <Navigation
                    title={this.props.match.params.deckId ? "Edit your deck" : "Create a new deck"}
                    backUrl={this.props.match.params.deckId ? "/decks/"+this.props.match.params.deckId : "/decks"} />
                <div className="container">
                    <div className="card">
                        <div className="card-content">
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
                                                id="input-deck-card"
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
                    </div>
                </div>
            </main>
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
                    Materialize.toast("Deck '"+this.state.deck.name+"' deleted", 8000);
                    this.setState(this.getInitialState());
                    this.props.history.push("/decks");
                });
        } else {
            Materialize.toast("Entered deck name '"+this.state.deckName+"' does not match '"+this.state.deck.name+"'", 8000);
            this.setState({ deckName: "" });
        }
    },
    render: function() {
        if (this.state.deck == null) return null;

        return (
            <main>
                <Navigation
                    title={"Delete deck "+this.state.deck.name}
                    backUrl={"/decks/"+this.state.deck.id} />
                <div className="container">
                    <div className="row">
                        <form onSubmit={this.handleDeleteDeck} method="post">
                            <p> You are about to delete deck <strong>{this.state.deck.name}</strong>. To continue, type the name of the deck:</p>
                            <div className="row">
                                <div className="input-field col s12">
                                    <input
                                        id="input-deck-name"
                                        type="text"
                                        name="deckName"
                                        value={this.state.deckName}
                                        onChange={this.handleChange} />
                                    <label htmlFor="input-deck-name">Name of the deck</label>
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
            </main>
        );
    }
});

const CardInfoComponent = React.createClass({
    showModal: function(e) {
        e.preventDefault();
    },
    actionStash: function(e) {
        e.preventDefault();
        StashResource.stashCard(this.props.card);
    },
    render: function() {
        if (this.props.card == null) return null;

        return (
            <div className="mtg-card-info">
                <div className="row">
                    <div id="preview" className="col s4">
                        {this.props.card.links &&
                            <a href={this.props.card.links.image} data-lightbox="deck-1" data-title={this.props.card.name}><img className="card-thumbnail side-a" src={this.props.card.links.image} /></a>
                        }
                        {this.props.card.links.hasOwnProperty('flip_image') &&
                            <img className="card-thumbnail side-b" src={this.props.card.links.flip_image} />
                        }
                    </div>
                    <div id="oracle" className="col s8">
                        {this.props.card.name &&
                            <h5><Link to={"/cards/"+this.props.card.name}>{this.props.card.name}</Link>{'\u00A0'}<sup><Manacost mc={this.props.card.manaCost} /></sup></h5>
                        }
                        {this.props.card.type &&
                            <b>{this.props.card.type}</b>
                        }
                        {this.props.card.oracle &&
                           <span>{this.props.card.oracle.split("\n").map((txt,i) => {
                               return <p key={i}><Oracle text={txt} /></p>;
                           })}</span>
                        }
                        {this.props.card.powerToughness &&
                            <b>{this.props.card.powerToughness}</b>
                        }
                        {this.props.card.links.hasOwnProperty('flip_name') &&
                            <p>card has ohter side: <Link to={{pathname: "/cards/"+this.props.card.links.flip_name}}>{this.props.card.links.flip_name}</Link></p>
                        }
                    </div>
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
        return { deck: null, cardFilter: "type", backgroundImage: "" };
    },
    componentDidMount: function() {
        DeckResource.getDeckById(this.props.match.params.deckId)
            .then((deck) => {
                CardResource.getCardsInDeck(deck, (cards) => {
                    console.log(cards);
                    this.setState({ deck: deck, cards: cards, backgroundImage: cards[0].links.image  });
                    $(".collapsible").collapsible();
                });
            });
    },
    handleCardFilter: function(e) {
        e.preventDefault();
        this.setState({ filter: evt.target.value });
        // TODO: put cards in map with filter as key and render
    },
    handleOrderChange: function(e, order) {
        e.preventDefault();
        console.log(order);
    },
    render: function() {
        if (this.state.deck == null) return null;

        var totalCards = 0;
        return (
            <div>
                <ExtendedNavigation
                    title={this.state.deck.name}
                    backUrl={"/decks"}
                    backgroundImage={this.state.backgroundImage} />
                <div className="nav-action">
                    <FabComponent
                        menuItems={[
                        {
                            link: "/delete/decks/"+this.state.deck.id,
                            icon: "delete",
                            color: "red"
                        },
                        {
                            link: "/editor/decks/"+this.state.deck.id,
                            icon: "edit",
                            color: "blue"
                        }]} />
                </div>
                <main>
                    <nav className="pushpin-target purple">
                        <div className="nav-wrapper">
                            <ul className="">
                                <li>{'\u00A0'}Order by:{'\u00A0'}{'\u00A0'}</li>
                                <li className="active"><a href="#" onClick={(e) => this.handleOrderChange(e, 'type')}>Type</a></li>
                                <li><a href="#" onClick={(e) => this.handleOrderChange(e, 'color')}>Color</a></li>
                                <li><a href="#" onClick={(e) => this.handleOrderChange(e, 'cmc')}>Cmc</a></li>
                            </ul>
                        </div>
                    </nav>
                    <div className="container">
                        <ul className="collapsible" data-collapsible="expandable">
                            {this.state.cards.map((card, i) => {
                                totalCards+=card.amount;
                                return (
                                    <li key={i}>
                                        <div className="collapsible-header">{card.amount}{'\u00A0'}<a>{card.name}</a> <Manacost mc={card.manaCost} /></div>
                                        <div className="collapsible-body"><CardInfoComponent card={card} origin={"/decks/"+this.state.deck.id} /></div>
                                    </li>
                                );
                            })}
                        </ul>
                        total cards: {totalCards}
                    </div>
                </main>
                <ModalSearchComponent history={this.props.history} />
            </div>
        );
    }
});

const CardComponent = React.createClass({
    getInitialState: function() {
        return {card: null};
    },
    componentDidMount: function() {
        CardResource.getCardByName(this.props.match.params.cardName)
            .then(data => {
                this.setState({card: data})
            });
    },
    componentWillReceiveProps: function(newProps) {
        if (newProps.match.params.cardName != this.props.match.params.cardName) {
            // TODO: handle gracefully componentDidMount && componentWillReceiveProps
            CardResource.getCardByName(newProps.match.params.cardName)
                .then(data => {
                    this.setState({card: data})
                });
        }
    },
    actionStash: function(evt) {
        StashResource.stashCard(this.state.card)
        return false;
    },
    render: function() {
        if (this.state.card == null) return null;
        return (
            <div>
                <Navigation
                    title={this.state.card.name}
                    backUrl={this.props.origin} />
                <main>
                    <div className="container">
                        <div className="card">
                            <div className="card-content">
                                <CardInfoComponent card={this.state.card} />
                            </div>
                        </div>
                    </div>
                </main>
                <ModalSearchComponent history={this.props.history} />
            </div>
        );
    }
});


const CardSearchComponent = React.createClass({
    getInitialState: function() {
        return {cards: [], cardQuery: this.props.match.params.cardQuery, value: this.props.match.params.cardQuery};
    },
    componentDidMount: function() {
        CardResource.searchCards(this.state.cardQuery)
            .then(data => {
                this.setState({cards: data})
            });
    },
    handleChange: function(e) {
        // only update value on change, search triggered by 'Enter'
        this.setState({value: e.target.value});
    },
    handleSearch: function(e) {
        this.setState({ cardQuery: e.target.value });
    },
    render: function() {
        return (
            <div>
                <Navigation
                    title="Search results"
                    backUrl="/" />
                <main>
                    <div className="container">
                        Results: {this.state.cards.length}

                        {this.state.cards.map(function(card, i) {
                            return (
                                <div key={i} className="card">
                                    <div className="card-content">
                                        <CardInfoComponent card={card} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
                <ModalSearchComponent history={this.props.history} />
            </div>
        );
    }
});

const MyDecksComponent = React.createClass({
    getInitialState: function() {
        return {decks: []}
    },
    componentDidMount: function() {
        DeckResource.listDecks().then((decks) => {
            console.log(decks);
            this.setState({decks: decks});
        });
    },
    render: function() {
        if (!this.state.decks) return null;

        // TODO: "Link to" does not work in the side menu when clicking on one deck then another
        return (
            <div>
                <header>
                    <Navigation
                        title="My decks"
                        backUrl="/" />
                </header>
                <main>
                    <div className="container">
                        <ul className="collection">
                            {this.state.decks.map((elt, i) => {
                                console.log(elt);
                                return (
                                    <li key={i} className="collection-item avatar">
                                        <div style={{backgroundImage: "url('"+elt.links.image+"')"}} alt="" className="circle" />
                                        <span className="title"><Link to={"/decks/"+elt.id}>{elt.displayName}</Link></span>
                                        <span className="secondary-content"><Manacost mc={elt.colors} /></span>
                                    </li>
                                );
                            })}
                        </ul>
                        <FabComponent
                            menuItems={[
                            {
                                link: "/editor/decks",
                                icon: "add"
                            }]} />
                    </div>
                </main>
                <ModalSearchComponent history={this.props.history} />
            </div>
        );
    }
});

const HomeComponent = React.createClass({
    render: function() {
        return (
            <div>
                <header>
                    <nav className="transparent">
                        <div className="nav-wrapper">
                            <ul className="left">
                                <li><a href="#"><i className="material-icons left">menu</i></a></li>
                            </ul>
                            <a href="#" className="brand-logo center">{Config.appName}</a>
                            <ul className="right">
                                <li><Link to={"/decks"}>My decks</Link></li>
                            </ul>
                        </div>
                    </nav>
                </header>
                <main className="splash">
                    <div className="container">
                        <div id="search-bar" className="row search-bar" >
                            <div className="input-field col s12">
                                <input
                                    type="search"
                                    className="autocomplete"
                                    placeholder="search" />
                            </div>
                        </div>
                    </div>
                </main>
                <ModalSearchComponent history={this.props.history} />
            </div>
        );
    }
});

const MtgApp = React.createClass({
    componentDidMount: function() {
        document.title = Config.appName;
        jqueryHandle();
    },
    componentWillReceiveProps: function(newProps) {
        jqueryHandle();
    },
    render: function() {
        return (
            <Switch>
                  <Route exact path="/" component={HomeComponent} />
                  <Route exact path="/decks" component={MyDecksComponent} />
                  <Route path="/decks/:deckId" component={DeckDetailComponent} />
                  <Route exact path="/editor/decks" component={DeckEditorComponent} />
                  <Route path="/editor/decks/:deckId" component={DeckEditorComponent} />
                  <Route path="/delete/decks/:deckId" component={DeckDeleteComponent} />
                  <Route path="/cards/:cardName" component={CardComponent} />
                  <Route path="/search/:cardQuery" component={CardSearchComponent} />
            </Switch>
		);
    }
});

ReactDOM.render(
    <HashRouter>
        <MtgApp />
    </HashRouter>,
  document.getElementById("app")
);

var jqueryInitialized = false;

function jqueryHandle() {

    const checkExists = setInterval(() => {
        if (typeof $("#autocomplete-input").autocomplete === "function") {
            clearInterval(checkExists);

            // Dropdown items
            $("#contextual-dropdown").dropdown();

            // Select components
            $("select").material_select();

            // Tabs
            $('ul.tabs').tabs();

            // Modals
            const searchBox = $("#search-box");
            searchBox.modal();

            // show modal search-box on search-bar focus
            $(".search-bar input[type='search']").focus(() => {
                searchBox.modal("open");
                searchBox.find("#autocomplete-input").focus();
            });

            // show modal search-box on search-box-trigger click
            $(".search-box-trigger").on('click', (e) => {
                e.preventDefault();
                searchBox.modal("open");
            });

            // handle auto-complete feature of the search bar
            $("#autocomplete-input").autocomplete({
                data: {
                    "Cancel": "http://mtg.wtf/cards/xln/47.png",
                    "Crush of Tentacles": "http://mtg.wtf/cards_hq/ogw/53.png",
                    "Rogue Elephant": "http://mtg.wtf/cards_hq/wl/81.png",
                    "Westvale Abbey": "http://mtg.wtf/cards_hq/soi/281a.png"
                },
                limit: 20,
                onAutocomplete: function(val) {
                    console.log(val);
                },
                minLength: 3
            });

            jqueryInitialized = true;
            console.log("components refreshed");
        };
    }, 100);
}