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
    decksForUserEndpoint: "/api/users/phury/decks/",
    logger: {
        level: "DEBUG"
    }
}

const DeckResource = {
    listDecks: function() {
        const uri = Config.host + Config.decksForUserEndpoint;
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

const CardComponent = React.createClass({
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
                    <img className="cardImage sideA" src={this.state.card.links.image} />
                    {this.state.card.links.hasOwnProperty('other_side_image') &&
                        <img className="cardImage sideB" src={this.state.card.links.other_side_image} />
                    }
                </div>
                <div className="col s8">
                    <h4>{this.state.card.name} <span className="manaCost">{this.state.card.manaCost}</span></h4>
                    <p className="type">{this.state.card.type}</p>
                    <div className="oracle">
                        {this.state.card.oracle.split("\n").map((txt,i) => {
                            return <p key={i}>{txt}</p>;
                        })}
                    </div>
                    {this.state.card.links.hasOwnProperty('other_side') &&
                        <p>Card has other side: {this.state.card.links.other_side}</p>
                    }
                </div>
            </div>
        );
    }
});

var DeckEditComponent = React.createClass({
    _parseData: function(txt) {
        var jsonStr = "[\""+ (txt.split("\n").join("\",\"")) + "\"]";
        return JSON.parse(jsonStr);
    },
    getInitialState: function() {
        return { deckName: "", deckData: "", redirect: false };
    },
    handleChange: function(e) {
        const target = e.target;
        this.setState({
            [target.name]: target.value
        });
    },
    submitDeck: function(e) {
        e.preventDefault();
        const uri = Config.host + Config.decksForUserEndpoint;
        const data = { "name": this.state.deckName, "cards": this._parseData(this.state.deckData)};
        console.log("DeckEditComponent.submitDeck >>>");
        console.log(data);
        fetch(uri, {
            method: "put",
            body: JSON.stringify(data),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response.ok) return response.json();
                else throw new Error("error calling uri"+ uri + "got response status " + response.status);
            })
            .then((data) => {
                console.log("DeckEditComponent.submitDeck.fetch.then from uri "+uri+" >>>");
                console.log("got data from uri " + uri);
                console.log(data);
                this.setState(this.getInitialState());
                this.props.history.push("/deck/"+data.id);
            });
    },
    render: function() {
        return (
            <div className="container">
                <br />
                <h1>Create your deck <span className="right"><Link to="/" className="waves-effect waves-teal btn-flat">back</Link></span></h1>
                <div className="row">
                    <form onSubmit={this.submitDeck}>
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
                                <input type="submit" className="btn waves-effect waves-light" value="Submit" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

const DeckDetailComponent = React.createClass({
    getInitialState: function() {
        return { deck: null };
    },
    componentDidMount: function() {
        const uri = Config.host + Config.deckEndpoint + this.props.match.params.deckId;
        fetch(uri)
            .then((response) => { return response.json() })
            .then((data) => {
                this.setState({ deck: data });
                $(".collapsible").collapsible();
            });

    },

    render: function() {
        if (this.state.deck == null) return null;

        var cardElements = this.state.deck.cards.map((elt, i) => {
            var space = elt.indexOf(" ");
            var numberOfCards = elt.substring(0, space);
            var cardName = elt.substring(space+1, elt.length);
            return (
                <li key={i}>
                  <div className="collapsible-header">{numberOfCards +"x "+ cardName}</div>
                  <div className="collapsible-body"><CardComponent cardName={cardName}/></div>
                </li>
            );
        });

        return (
            <div className="container">
                <h1>{this.state.deck.name} <span className="right"><Link to="/deck" className="waves-effect waves-teal btn-flat">back</Link></span></h1>
                <ul className="collapsible" data-collapsible="expandable">
                    {cardElements}
                </ul>
            </div>
        );
    }
});

const NavbarComponent = React.createClass({
    getInitialState: function() {
        return { decks: null };
    },
    componentDidMount: function() {
        DeckResource.listDecks()
            .then((data) => {
                this.setState({ decks: data });
                $(".button-collapse").sideNav();
                $(".collapsible").collapsible();
                $('.collapsible').collapsible('open', 0);
            });
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
                            <a href="#" className="brand-logo center">{Config.appName}</a>
                            <a href="#" className="button-collapse show-on-large" data-activates="side-menu"><i className="material-icons">menu</i></a>
                            <ul className="right hide-on-med-and-down">
                                <li><Link to="/deck"><i className="material-icons left">view_list</i>My decks</Link></li>
                                <li><Link to="/settings"><i className="material-icons">settings</i></Link></li>
                            </ul>
                            <ul id="side-menu" className="side-nav">
                                <li className="no-padding">
                                    <ul className="collapsible collapsible-accordion">
                                        <li>
                                            <a className="collapsible-header">My decks<i className="material-icons">arrow_drop_down</i></a>
                                            <div className="collapsible-body">
                                                <ul>
                                                    {deckEntries}
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="fixed-action-btn">
                    <a className="btn-floating btn-large red">
                        <i className="material-icons">menu</i>
                    </a>
                    <ul>
                        <li><Link to="/" className="btn-floating blue"><i className="material-icons">home</i></Link></li>
                        <li><Link to="/deck-edit" className="btn-floating green"><i className="material-icons">create</i></Link></li>
                    </ul>
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
                <h1>My decks</h1>
                 <ul className="collection">
                    {deckEntries}
                 </ul>
                 <Link to="/deck-edit" className="btn">Create new deck</Link>
            </div>
        );
    }
});

const SettingsComponent = React.createClass({
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
                      <Route exact path="/deck-edit" component={DeckEditComponent} />
                      <Route exact path="/deck" component={MyDecksComponent} />
                      <Route path="/deck/:deckId" component={DeckDetailComponent} />
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