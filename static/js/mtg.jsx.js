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
    },
    getCardsInDeck: function(deck) {
        return new Promise((resolve, reject) => {
            const promises = [];
            deck.cards.map((elt, i) => {
                const space = elt.indexOf(" ");
                const numberOfCards = elt.substring(0, space);
                const cardName = elt.substring(space+1, elt.length);
                promises.push(
                    CardResource.getCardByName(cardName)
                        .then(data => {
                            data.amount = numberOfCards;
                            return data;
                        })
                        .catch(error => {
                            console.log(error+": could not retrieve card "+cardName);
                            return {amount: numberOfCards, name: cardName, manaCost: "", convertedManaCost: 0, links: {}};// TODO: Handle null fields in CardInfoComponent to be more robust
                        })
                );
            });
            Promise.all(promises).then(cards => {
                resolve(cards);
            }, error => {
                reject(error+": could not retrieve cards in deck "+deck.name);
            });
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


const Navigation = React.createClass({
    componentDidMount: function() {
        jqueryHandle();
    },
    render: function() {
        return (
            <nav>
                <div className="nav-wrapper blue">
                    <ul className="left">
                        {this.props.backUrl &&
                            <li><Link to={this.props.backUrl}><i className="material-icons left">arrow_back</i></Link></li>
                        }
                    </ul>
                    <a href="#" className="brand-logo">{this.props.title}</a>
                    <ul className="right">
                        {this.props.menuItems && this.props.menuItems.map((menuItem, i) => {
                            return <li key={i}><Link to={menuItem.link}>{menuItem.title}</Link></li>;
                        })}
                        {this.props.contextMenuItems &&
                            <li><a className="dropdown-button" href="#!" data-activates="contextual-dropdown"><i className="material-icons">more_vert</i></a></li>
                        }
                    </ul>
                </div>
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
            </nav>
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
                        <Link to={menuItem.link} className={"modal-trigger btn-floating "+menuItem.color}>
                            <i className="material-icons">{menuItem.icon}</i>
                        </Link>
                        <span className="mobile-fab-tip">{menuItem.name}</span>
                    </li>
                );
            });
            return (
                <div className="fixed-action-btn">
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

var DeckEditorComponent = React.createClass({
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
    },
    submitDeck: function(e) {
        e.preventDefault();
        const deck = {
            name: this.state.deckName,
            cards: this._parseData(this.state.deckCards),
            submittedBy: "phury",
            deckId: this.state.deckId
        };
        if (this.props.match.params.deckId) {
            DeckResource.updateDeck(deck)
                .then((data) => {
                    console.log("created deck and got response");
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
                    backUrl={this.props.match.params.deckId ? "/decks/"+this.props.match.params.deckId : "/decks"}
                    menuItems={[
                        {
                            title: "My decks",
                            link: "/decks"
                        },
                        {
                            title: "Settings",
                            link: "/settings"
                        }
                    ]} />
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
                    backUrl={"/decks/"+this.state.deck.id}
                    menuItems={[
                        {
                            title: "My decks",
                            link: "/decks"
                        },
                        {
                            title: "Settings",
                            link: "/settings"
                        }
                    ]} />
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
                    <div className="col s4">
                        {this.props.card.links &&
                            <Link to="/carousel"><img className="card-thumbnail side-a" src={this.props.card.links.image} /></Link>
                        }
                        {this.props.card.links.hasOwnProperty('flip_image') &&
                            <img className="card-thumbnail side-b" src={this.props.card.links.flip_image} />
                        }
                    </div>
                    <div className="col s8">
                        {this.props.card.type &&
                            <div className="type">
                                <p>{this.props.card.type}</p>
                            </div>
                        }
                        {this.props.card.oracle &&
                            <div className="oracle">
                                {this.props.card.oracle.split("\n").map((txt,i) => {
                                    return <p key={i}><Oracle text={txt} /></p>;
                                })}
                            </div>
                        }
                        {this.props.card.powerToughness &&
                            <div className="powerToughness">
                                <p>{this.props.card.powerToughness}</p>
                            </div>
                        }
                        {this.props.card.links.hasOwnProperty('flip_name') &&
                            <Link to={"/cards/"+this.props.card.links.flip_name}>{this.props.card.links.flip_name} <sup>flip</sup></Link>
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

const CarouselComponent = React.createClass({
    componentDidMount: function() {

    },
    render: function() {
        return (
            <main>
                <Navigation
                    title="Carousel"
                    backUrl="/decks"
                    menuItems={[
                        {
                            title: "My decks",
                            link: "/decks"
                        },
                        {
                            title: "Settings",
                            link: "/settings"
                        }
                    ]} />
                <div className="container">
                    <div className="card">
                        <div className="card-content">
                            <div className="carousel carousel-slider">
                                <a className="carousel-item" href="#one!"><img src="http://mtg.wtf/cards_hq/akh/82.png" /></a>
                                <a className="carousel-item" href="#two!"><img src="http://mtg.wtf/cards_hq/akh/59.png" /></a>
                                <a className="carousel-item" href="#three!"><img src="http://mtg.wtf/cards_hq/akh/136.png" /></a>
                                <a className="carousel-item" href="#four!"><img src="http://mtg.wtf/cards_hq/akh/21.png" /></a>
                                <a className="carousel-item" href="#four!"><img src="http://mtg.wtf/cards_hq/akh/182.png" /></a>
                             </div>
                         </div>
                    </div>
                 </div>
             </main>
         );
    }
});

const DeckDetailComponent = React.createClass({
    getInitialState: function() {
        return { deck: null, viewMode: "LIST" };
    },
    componentDidMount: function() {
        DeckResource.getDeckById(this.props.match.params.deckId)
            .then((data1) => {
                CardResource.getCardsInDeck(data1)
                    .then((data2) => {
                        console.log(data2);
                        this.setState({ deck: data1, cards: data2  });
                        $(".collapsible").collapsible();
                    });
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

            // <a href="#" onClick={this.handleViewList} className="waves-effect waves-light"><i className="material-icons">view_list</i></a>
            // <a href="#" onClick={this.handleViewModule} className="waves-effect waves-light"><i className="material-icons">view_module</i></a>

            return (
                <main>
                    <Navigation
                        title={this.state.deck.name}
                        backUrl="/decks"
                        menuItems={[
                            {
                                title: "My decks",
                                link: "/decks"
                            },
                            {
                                title: "Settings",
                                link: "/settings"
                            }
                        ]} />
                    <div className="container">
                        <ul className="collapsible" data-collapsible="expandable">
                            {this.state.cards.map((card, i) => {
                                return (
                                    <li key={i}>
                                        <div className="collapsible-header">{card.amount +" "+ card.name} <Manacost mc={card.manaCost} /></div>
                                        <div className="collapsible-body"><CardInfoComponent card={card}/></div>
                                    </li>
                                );
                            })}
                        </ul>
                        <FabComponent
                            menuItems={[
                            {
                                link: "/delete/decks/"+this.state.deck.id,
                                icon: "delete",
                                name: "delete",
                                color: "red"
                            },
                            {
                                link: "/editor/decks/"+this.state.deck.id,
                                icon: "edit",
                                name: "edit",
                                color: "blue"
                            }]} />
                    </div>
                </main>
            );
        }
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
    actionStash: function(evt) {
        StashResource.stashCard(this.state.card)
        return false;
    },
    render: function() {
        if (this.state.card == null) return null;
        return (
            <main>
                <Navigation
                    title={this.state.card.name}
                    backUrl="/"
                    contextMenuItems={[
                    {
                        title: "Stash",
                        action: this.actionStash
                    }]}
                    />
                <div className="container">
                    <div className="card">
                        <div className="card-content">
                            <CardInfoComponent card={this.state.card} />
                        </div>
                    </div>
                </div>
            </main>
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
        });
    },
    render: function() {
        if (this.state.decks == null || this.state.decks.error != null || this.state.decks.length <= 0) {
            return null;
        }

        // TODO: "Link to" does not work in the side menu when clicking on one deck then another
        return (
            <main>
                <Navigation
                    title="My decks"
                    backUrl="/"
                    menuItems={[
                        {
                            title: "My decks",
                            link: "/decks"
                        },
                        {
                            title: "Settings",
                            link: "/settings"
                        }
                    ]} />
                <div className="container">
                    <ul className="collection">
                        {this.state.decks.map((elt, i) => {
                            return (
                                <li key={i} className="collection-item avatar">
                                    <div style={{backgroundImage: "url('http://mtg.wtf/cards_hq/wwk/26.png')"}} alt="" className="circle" />
                                    <span className="title"><Link to={"/decks/"+elt.id}>{elt.displayName}</Link></span>
                                    <span className="secondary-content"><Manacost mc={"{w}{u}{b}{r}{g}"} /></span>
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
        );
    }
});

const HomeComponent = React.createClass({
    render: function() {
        return (
            <main>
                <Navigation
                    title="Home"
                    menuItems={[
                        {
                            title: "My decks",
                            link: "/decks"
                        },
                        {
                            title: "Settings",
                            link: "/settings"
                        }
                    ]} />
                <div className="container">
                    <div className="card">
                        <div className="card-content">
                            <span className="card-title">Welcome</span>
                            <h1>Hello brave wizard!</h1>
                            <p>
                            Welcome to the {Config.appName} app.
                            Select a deck in your deck list or <Link to="/editor/decks" className="btn">create</Link> one.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
});

const MtgApp = React.createClass({
    componentDidMount: function() {
        document.title = Config.appName;
    },
    render: function() {
        return (
            <Switch>
                  <Route exact path="/" component={HomeComponent} />
                  <Route exact path="/decks" component={MyDecksComponent} />
                  <Route exact path="/decks/:deckId" component={DeckDetailComponent} />
                  <Route exact path="/editor/decks" component={DeckEditorComponent} />
                  <Route exact path="/editor/decks/:deckId" component={DeckEditorComponent} />
                  <Route exact path="/delete/decks/:deckId" component={DeckDeleteComponent} />
                  <Route exact path="/cards/:cardName" component={CardComponent} />
                  <Route exact path="/carousel" component={CarouselComponent} />
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

function jqueryHandle() {
    console.log("initializing jquery");
    console.log($("#contextual-dropdown"));
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

    // Initialize dropdown items in menu
    $("#contextual-dropdown").dropdown();

    // Initialize carousel
    $('.carousel.carousel-slider').carousel({fullWidth: true});
}