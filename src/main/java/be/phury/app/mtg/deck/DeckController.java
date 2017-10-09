package be.phury.app.mtg.deck;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@ApiController
public class DeckController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeckController.class);

    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private DeckRepository deckRepository;

    @RequestMapping(path = "/users/{userId}/decks/")
    public List<Deck> listDecksForUser(@PathVariable String userId) {
        return deckRepository
                .listDecksForUser(userId)
                .stream()
                .map(d -> {
                    d.addLink("self", "/users/"+userId+"/decks/"+d.getId());
                    return d;
                })
                .collect(Collectors.toList());
    }

    @RequestMapping(path = "/users/{userId}/decks/", method = RequestMethod.PUT)
    public Deck createDeckForUser(@PathVariable String userId, Deck deck) {
        return deckRepository.createDeckForUser(userId, deck);
    }

}
