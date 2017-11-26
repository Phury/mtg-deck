package be.phury.mtg.deck.controller;

import be.phury.mtg.deck.ApiController;
import be.phury.mtg.deck.model.Card;
import be.phury.mtg.deck.model.DeckEditRequest;
import be.phury.mtg.deck.provider.CardProvider;
import be.phury.mtg.deck.provider.DeckProvider;
import be.phury.mtg.deck.model.Entity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@ApiController
public class DeckController {

    private static final Logger logger = LoggerFactory.getLogger(DeckController.class);

    @Autowired
    private DeckProvider deckProvider;

    @Autowired
    private CardProvider cardProvider;

    @RequestMapping(path = "/users/{userId}/decks/")
    public List<Entity> getDecksByUser(@PathVariable String userId) {
        // TODO: handle error cases
        return deckProvider
                .getDecksByUser(userId)
                .stream()
                .map(d -> createEntity(d))
                .collect(Collectors.toList());
    }

    @RequestMapping(path = "/decks/{deckId}", method = RequestMethod.GET)
    public DeckEditRequest getDeckById(@PathVariable String deckId) {
        final DeckEditRequest d = deckProvider.getDeckById(deckId);
        // TODO: check null and return 404
        d.addLink("self", MessageFormat.format("{0}/decks/{1}", ApiController.API_ROOT, d.getId()));
        return d;
    }

    @RequestMapping(path = "/users/{userId}/decks/", method = RequestMethod.PUT)
    public ResponseEntity<Entity> createDeck(@PathVariable String userId, @RequestBody DeckEditRequest deck) {
        final DeckEditRequest d = deckProvider.createDeckForUser(userId, deck);
        // TODO: check null and return 500
        return ResponseEntity.status(HttpStatus.CREATED).body(createEntity(d));
    }

    @RequestMapping(path = "/decks/{deckId}", method = RequestMethod.DELETE)
    public ResponseEntity<Entity> deleteDeck(@PathVariable String deckId) {
        final DeckEditRequest deletedDeck = getDeckById(deckId);
        if (deckProvider.deleteDeck(deckId)) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(createEntity(deletedDeck));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createEntity(deckId, MessageFormat.format("could not delete deck with id {0}", deckId)));
        }
    }

    @RequestMapping(path = "/decks/{deckId}", method = RequestMethod.POST)
    public ResponseEntity<Entity> updateDeck(@PathVariable String deckId, @RequestBody DeckEditRequest toUpdate) {
        final DeckEditRequest updatedDeck = deckProvider.updateDeck(toUpdate);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(createEntity(updatedDeck));
    }

    private Entity createEntity(final String id, final String message) {
        return new Entity() {{
            setId(id);
            setDisplayName(message);
        }};
    }

    private Entity createEntity(final DeckEditRequest request) {

        final class CardEntity extends Entity {
            private String colors;

            public String getColors() {
                return colors;
            }

            public void setColors(String colors) {
                this.colors = colors;
            }
        }

        final String uri = MessageFormat.format("{0}/decks/{1}", ApiController.API_ROOT, request.getId());
        final Card firstCard = getFirstCard(request);
        final CardEntity cardEntity = new CardEntity();
        cardEntity.setId(request.getId());
        cardEntity.setType("deck");
        cardEntity.setColors(request.getColors());
        cardEntity.setDisplayName(request.getName());
        cardEntity.addLink("self", uri);
        cardEntity.addLink("image", firstCard.getLinks().get("image"));
        return cardEntity;
    }

    private Card getFirstCard(DeckEditRequest request) {
        final String cardInfo = request.getCards().get(0);
        final Integer space = cardInfo.indexOf(" ");
        final String cardName = cardInfo.substring(space+1, cardInfo.length());
        return cardProvider.getCardByName(cardName);
    }
}
