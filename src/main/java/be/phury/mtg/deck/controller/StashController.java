package be.phury.mtg.deck.controller;

import be.phury.mtg.deck.ApiController;
import be.phury.mtg.deck.model.Entity;
import be.phury.mtg.deck.model.StashCardRequest;
import be.phury.mtg.deck.provider.StashProvider;
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
public class StashController {

    @Autowired
    private StashProvider stashProvider;

    @RequestMapping(path = "/users/{userId}/stash/")
    public List<Entity> getStashByUser(@PathVariable String userId) {
        // TODO: handle error cases
        return stashProvider
                .getStashByUser(userId)
                .stream()
                .map(d -> createEntity(d))
                .collect(Collectors.toList());
    }

    @RequestMapping(path = "/users/{userId}/stash/", method = RequestMethod.PUT)
    public ResponseEntity<Entity> stashCard(@PathVariable String userId, @RequestBody StashCardRequest request) {
        final StashCardRequest result = stashProvider.stashCard(userId, request);
        // TODO: check null and return 500
        return ResponseEntity.status(HttpStatus.CREATED).body(createEntity(result));
    }

    private Entity createEntity(final StashCardRequest request) {
        return new Entity() {{
            setId(request.getId());
            setType("card");
            setDisplayName(request.getCardName());
            addLink("self", MessageFormat.format("{0}/cards/{1}", ApiController.API_ROOT, request.getCardName()));
            addLink("stash", MessageFormat.format("{0}/users/{1}/stash/", ApiController.API_ROOT, request.getSubmittedBy()));
        }};
    }
}
