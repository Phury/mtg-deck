var Config = {
    host: "",
    cardEndpoint: "/api/cards/",
    deckEndpoint: "/api/users/phury/decks/",
    logger: {
        level: "DEBUG"
    }
};

function Logger(src) {
    this.source = src;
    this.level = Config.logger.level;
    this.debug = function(str) {
        if (this.level == "DEBUG") console.log(str);
    };
    this.error = function(error) {
        console.error(error);
    };
};

var _logger = new Logger();

var CardComponent = React.createClass({
    getInitialState: function() {
        return { card: null };
    },

    componentDidMount: function() {
        const url = Config.host + Config.cardEndpoint + this.props.cardName;
        
        _logger.debug("loading " + url);

        var self = this;
        fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw Error(response.message);
                }
                return response.json()
            })
            .then(function(data) {
                self.setState({ card: data });
                _logger.debug(self.state);
            }).catch(function(error) {
                self.setState({ error: error });
                _logger.error(error);
            });
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        if (this.state.card == null) return null;
        if (this.state.error != null) {
            return (
                <p className="error">Component could not be loaded</p>
            );
        }

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

var DeckComponent = React.createClass({
    componentDidMount: function() {
        this.jqueryHandle();
    },

    componentWillUnmount: function() {
    },

    jqueryHandle: function() {
        $('.collapsible').collapsible();
    },

    render: function() {
        var cardElements = this.props.deck.cards.map(function(elt, i) {
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
            <div className="deck">
                <h1>{this.props.deck.name}</h1>
                <ul className="collapsible" data-collapsible="expandable">
                    {cardElements}
                </ul>
            </div>
        );
    }
});

var MtgApp = React.createClass({
    
    getInitialState: function() {
        return { decks: [] };
    },

    componentDidMount: function() {
        _logger.debug("loading " + Config.host + Config.deckEndpoint);
        
        var self = this;
        fetch(Config.host + Config.deckEndpoint)
            .then(function(response) {
                return response.json()
            })
            .then(function(data) {
                self.setState({ decks: data });
                _logger.debug(self.state);
            });
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },
    
    render: function() {
        if (this.state.decks.length <= 0) {
            return (
                <div className="screen">
                    <h1>Decks</h1>
                    <p>Welcome to the mtg deck app. You do not seem to have made any deck yet. Start right <a href="#">here</a></p>
                </div>
            );
        }

        var deckElements = this.state.decks.map(function(elt, i) {
            return (
                <DeckComponent key={i} deck={elt} />
            );
        });

        return (
            <div className="screen">
                {deckElements}
            </div>
		);
    }
});


ReactDOM.render(
  <MtgApp />,
  document.getElementById("app")
);