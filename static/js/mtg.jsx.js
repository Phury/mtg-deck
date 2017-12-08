const {
  HashRouter,
  Switch,
  Route,
  Link,
  Redirect
} = ReactRouterDOM


const Config = {
    host: "",
    appName: "Counterspell",
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

const searchHistory = {};

//PouchDB.debug.enable('*');

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
        console.log({ message: "getCardsInDeck", deck: deck });
        //const cards = [];
        deck.cards.map((elt, i) => {
            const space = elt.indexOf(" ");
            const numberOfCards = parseInt(elt.substring(0, space)) || 1;
            const cardName = elt.substring(space+1, elt.length);
            console.log({numberOfCards: numberOfCards, cardName: cardName});
            CardResource.getCardByName(cardName)
                .then(card => {
                    card.amount = numberOfCards;
                    //cards.push(card);
                    callback([card]);
                })
                .catch(error => {
                    console.log(error+": could not retrieve card "+cardName);
                    // TODO: Handle null fields in CardInfoComponent to be more robust
                    return {amount: numberOfCards, name: cardName, manaCost: "", convertedManaCost: 0, links: {}};
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
                <nav className={"nav-extended "+(this.props.backUrl ? "" : "home")}>
                    {this.props.backgroundImage &&
                        <div className="nav-bg"
                            style={{backgroundImage: "url('"+this.props.backgroundImage+"')"}}>
                        </div>
                    }
                    <div className="nav-wrapper">
                        {this.props.backUrl &&
                            <ul className="left">
                                <li><Link to={this.props.backUrl}><i className="material-icons">arrow_back</i></Link></li>
                            </ul>
                        }
                        {!this.props.backUrl &&
                            <ul className="left">
                                <li>
                                    <a href="#" data-activates="slide-out" className="button-collapse show-on-large">
                                        <i className="material-icons left">menu</i>
                                    </a>
                                </li>
                            </ul>
                        }
                        {this.props.backUrl &&
                            <ul className="right">
                                <li><a href="#search-box" className="search-box-trigger"><i className="material-icons left">search</i>search</a></li>
                            </ul>
                        }
                        <ul className="side-nav" id="slide-out">
                            <li><a href="https://github.com/Phury/mtg-deck" target="_blank">About</a></li>
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
const ColorLabel = React.createClass({
    _colors: {w: "White", u: "Blue", r: "Red", b: "Black", g: "Green"},
    render: function() {
        if (!this.props.color) return null;
        if (this.props.color.indexOf("{") == -1) return (<span>{this.props.color}</span>);
        const elements = this.props.color
            .split(/{(.*?)}/)
            .filter(str => { return str.trim() != ""; })
            .map((elt, i) => {
                return (<span key={i}>{this._colors[elt]}</span>);
            });
        return (
            <span>{elements}</span>
        );
    }
});

const ManaCostLabel = React.createClass({
    render: function() {
        if (!this.props.mc) return null;
        if (this.props.mc.indexOf("{") == -1) return (<span>{this.props.mc}</span>);
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
    componentDidMount: function() {

    },
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
                                searchHistory[e.target.value] = null;
                                this.props.history.push("/search/"+e.target.value);
                                $("#search-box").modal("close");
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
            <div>
                <Navigation
                    title={this.props.match.params.deckId ? "Edit your deck" : "Create a new deck"}
                    backUrl={this.props.match.params.deckId ? "/decks/"+this.props.match.params.deckId : "/"} />
                <main>
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
                                                <label htmlFor="input-deck-name">Deck name</label>
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
                                                <label htmlFor="input-deck-data">Cards</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <input
                                                    id="input-deck-card"
                                                    type="text"
                                                    name="cardName"
                                                    value={this.state.cardName}
                                                    onChange={this.handleChange} />
                                                <label htmlFor="input-card-name">Card search</label>
                                            </div>
                                            <div className="input-field col s6">
                                                <input placeholder="1" id="quantity" type="number" />
                                                <label htmlFor="quantity">Quantity</label>
                                            </div>
                                            <div className="input-field col s6">
                                                <button className="btn btn-wide">Add Card</button>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <button id="preview" className="btn waves-effect waves-light grey lighten-1">Preview</button>
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
                <ModalSearchComponent history={this.props.history} />
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
                    this.props.history.push("/");
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

const CardImageComponent = React.createClass({
    getInitialState: function() {
        return { flipped: false };
    },
    render() {
        return (
            <div className="flip-wrapper">
                <div className={"flip-container "+(this.state.flipped ? "hover" : "")}>
                    <div className="flipper">
                        {this.props.card.links &&
                                <a href={this.props.card.links.image} data-lightbox="deck-1" data-title={this.props.card.name}>
                                    <img className="front card-thumbnail" src={this.props.card.links.image} />
                                </a>
                        }
                        {this.props.card.links.hasOwnProperty('flip_image') &&
                                <img className="back card-thumbnail" src={this.props.card.links.flip_image} />
                        }
                    </div>
                </div>
                {this.props.card.links.hasOwnProperty('flip_image') &&
                    <a className="btn-floating waves-effect waves-light amber"
                        onClick={(evt) => {
                            evt.preventDefault();
                            this.setState({ flipped: !this.state.flipped })
                        }.bind(this)}><i className="ms ms-untap"></i>
                    </a>
                }
            </div>
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
                    <div className="col s4">
                        <CardImageComponent card={this.props.card} />
                    </div>
                    <div className="col s8 oracle">
                        {this.props.card.name &&
                            <h5><Link to={"/cards/"+this.props.card.name}>{this.props.card.name}</Link>{'\u00A0'}<sup><ManaCostLabel mc={this.props.card.manaCost} /></sup></h5>
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

const DeckInfoComponent = React.createClass({
    render() {
        return(
            <div>
                <ul>
                    <li>colors: <ManaCostLabel mc={this.props.deck.colors} /></li>
                </ul>
            </div>
        );
    }
});

const DeckDetailComponent = React.createClass({
    _groupCards(cards, grouping) {
        var cardsGrouped;
        switch (grouping) {
            default:
            case 'type':
                cardsGrouped = cards.reduce((acc, card) => {
                    acc[card.types[0]] = acc[card.types[0]] || [];
                    acc[card.types[0]].push(card);
                    return acc;
                }, []);
            break;
                case 'color':
                cardsGrouped = cards.reduce((acc, card) => {
                    const color = (!card.colors.length ? 'Colorless' : card.colors.length > 1 ? 'Gold' : card.colors[0]);
                    acc[color] = acc[color] || [];
                    acc[color].push(card);
                    return acc;
                }, []);
                break;
            case 'cmc':
                cardsGrouped = cards.reduce((acc, card) => {
                    acc[card.convertedManaCost] = acc[card.convertedManaCost] || [];
                    acc[card.convertedManaCost].push(card);
                    return acc;
                }, []);
                break;
        }
        return cardsGrouped;
    },
    getInitialState: function() {
        return { deck: null, cardGrouping: "type", backgroundImage: null, cards: [], cardsGrouped: [] };
    },
    componentDidMount: function() {
        DeckResource.getDeckById(this.props.match.params.deckId)
            .then((deck) => {
                CardResource.getCardsInDeck(deck, (cards) => {
                    //console.log(cards);
                    const allCards = this.state.cards.concat(cards);
                    this.setState({
                        deck: deck,
                        cardsGrouped: this._groupCards(allCards, this.state.grouping),
                        cards: allCards
                    });
                    if (!this.state.backgroundImage) {
                        this.setState({ backgroundImage: cards[0].links.image });
                    }
                    refreshJqueryComponents();
                });
            });
    },
    handleGroupingChange: function(e, grouping) {
        e.preventDefault();
        this.setState({
            cardGrouping: grouping,
            cardsGrouped: this._groupCards(this.state.cards, grouping)
        });
        refreshJqueryComponents();
    },
    render: function() {
        if (this.state.deck == null) return null;

        var totalCards = 0;
        return (
            <div>
                <ExtendedNavigation
                    title={this.state.deck.name}
                    backUrl={"/"}
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
                                <li className={this.state.cardGrouping === "type" ? "active" : ""}>
                                    <a href="#" onClick={(e) => this.handleGroupingChange(e, 'type')}>Type</a>
                                </li>

                                <li className={this.state.cardGrouping === "color" ? "active" : ""}>
                                    <a href="#" onClick={(e) => this.handleGroupingChange(e, 'color')}>Color</a>
                                </li>

                                <li className={this.state.cardGrouping === "cmc" ? "active" : ""}>
                                    <a href="#" onClick={(e) => this.handleGroupingChange(e, 'cmc')}>Cmc</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <div className="container">
                        <div className="collapsible-group">
                            {Object.keys(this.state.cardsGrouped).map((groupName) => {
                                const cardGroup = this.state.cardsGrouped[groupName];
                                var cardsInGroup = 0;
                                cardGroup.map((card, i) => { cardsInGroup+=card.amount; });
                                return (
                                    <ul className="collapsible popout" data-collapsible="accordion" key={groupName}>
                                        <li>
                                            <div className="collapsible-header disabled"><h6><ColorLabel color={groupName} /> ({cardsInGroup})</h6></div>
                                        </li>
                                        {cardGroup.map((card, i) => {
                                            totalCards+=card.amount;
                                            return (
                                                <li key={i}>
                                                    <div className="collapsible-header">{card.amount}{'\u00A0'}<a>{card.name}</a> <ManaCostLabel mc={card.manaCost} /></div>
                                                    <div className="collapsible-body"><CardInfoComponent card={card} /></div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                );
                            })}
                            <ul className="collapsible popout" data-collapsible="accordion">
                                <li>
                                    <div className="collapsible-header"><h6>{totalCards} cards</h6></div>
                                    <div className="collapsible-body"><DeckInfoComponent deck={this.state.deck} /></div>
                                </li>
                            </ul>
                        </div>
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
                    backUrl="/" />
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

const HomeComponent = React.createClass({
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
                <ExtendedNavigation
                    title={Config.appName} />
                <main>
                    <div className="container">
                        <div className="search-bar-container" >
                            <div id="search-bar" className="card search-bar" >
                                <div className="card-content">
                                    <input
                                        type="search"
                                        className="autocomplete"
                                        id="autocomplete-input-home"
                                        placeholder="search" />
                                </div>
                            </div>
                        </div>

                        <hr />

                        <ul className="collection">
                            {this.state.decks.map((elt, i) => {
                                return (
                                    <li key={i} className="collection-item avatar">
                                        <div style={{backgroundImage: "url('"+elt.links.image+"')"}} alt="" className="circle" />
                                        <span className="title"><Link to={"/decks/"+elt.id}>{elt.displayName}</Link></span>
                                        <span className="secondary-content"><ManaCostLabel mc={elt.colors} /></span>
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

const MtgApp = React.createClass({
    componentDidMount: function() {
        document.title = Config.appName;
        refreshJqueryComponents();
    },
    componentWillReceiveProps: function(newProps) {
        refreshJqueryComponents();
    },
    render: function() {
        return (
            <Switch>
                  <Route exact path="/" component={HomeComponent} />
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

function refreshJqueryComponents() {

    const checkExists = setInterval(() => {
        if (typeof $("#autocomplete-input").autocomplete === "function") {
            clearInterval(checkExists);

            // side navigation
            $(".button-collapse").sideNav();

            // dropdown items
            $("#contextual-dropdown").dropdown();

            // select components
            $("select").material_select();

            // tabs
            $('ul.tabs').tabs();

            // collapsible
            $(".collapsible").collapsible();

            // modals
            const searchBox = $("#search-box");
            searchBox.modal();

            // show modal search-box on search-bar focus
            $(".search-bar input[type='search']").focus(() => {
            //    $(".search-bar-container .search-bar").addClass("focused");
                searchBox.modal("open");
                searchBox.find("#autocomplete-input").focus();
            //}).blur(() => {
            //    $(".search-bar-container .search-bar").removeClass("focused");
            });

            // show modal search-box on search-box-trigger click
            $(".search-box-trigger").on('click', (e) => {
                e.preventDefault();
                searchBox.modal("open");
                searchBox.find("#autocomplete-input").focus();
            });

            // handle auto-complete feature of the search-box
            $("#autocomplete-input").autocomplete({
                data: searchHistory,
                limit: 20,
                onAutocomplete: function(val) {
                    // TODO: call history.push from react router somehow
                    console.log(val);
                    //this.props.history.push("/search/"+val);
                },
                minLength: 0
            });

            jqueryInitialized = true;
            console.log("components refreshed");
        };
    }, 100);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful!');
    }).catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
    });
}