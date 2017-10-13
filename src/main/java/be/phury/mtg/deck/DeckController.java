package be.phury.mtg.deck;

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
    private DeckRepository deckRepository;

    @RequestMapping(path = "/users/{userId}/decks/")
    public List<Entity> getDecksByUser(@PathVariable String userId) {
        // TODO: handle error cases
        return deckRepository
                .getDecksByUser(userId)
                .stream()
                .map(d -> toInfo(d))
                .collect(Collectors.toList());
    }

    @RequestMapping(path = "/decks/{deckId}")
    public DeckEditRequest getDeckById(@PathVariable String deckId) {
        final DeckEditRequest d = deckRepository.getDeckById(deckId);
        // TODO: check null and return 404
        d.addLink("self", MessageFormat.format("{0}/decks/{1}", ApiController.API_ROOT, d.getId()));
        return d;
    }

    @RequestMapping(path = "/users/{userId}/decks/", method = RequestMethod.PUT)
    public ResponseEntity<Entity> createDeckForUser(@PathVariable String userId, @RequestBody DeckEditRequest deck) {
        final DeckEditRequest d = deckRepository.createDeckForUser(userId, deck);
        // TODO: check null and return 500
        return ResponseEntity.status(HttpStatus.CREATED).body(toInfo(d));
    }

    private Entity toInfo(final DeckEditRequest d) {
        return new Entity() {{
            setId(d.getId());
            setType("deck");
            setDisplayName(d.getName());
            setUri(MessageFormat.format("{0}/decks/{1}", ApiController.API_ROOT, d.getId()));
        }};
    }
}
