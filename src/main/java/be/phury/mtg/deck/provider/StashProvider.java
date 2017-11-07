package be.phury.mtg.deck.provider;

import be.phury.mtg.deck.IdGenerator;
import be.phury.mtg.deck.exception.ElementNotFoundException;
import be.phury.mtg.deck.exception.ValidationException;
import be.phury.mtg.deck.model.DeckEditRequest;
import be.phury.mtg.deck.model.StashCardRequest;
import be.phury.utils.DocumentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Created by Phury
 */
@Service
public class StashProvider {
    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private MongoProvider mongoProvider;

    @Autowired
    private CardProvider cardProvider;

    @Autowired
    private DocumentMapper<StashCardRequest> mapper;

    public List<StashCardRequest> getStashByUser(String userId) {
        return mongoProvider.findAllByPropertyInCollection("stash", "submittedBy", userId, mapper);
    }

    public StashCardRequest stashCard(String userId, StashCardRequest request) {
        validateRequest(request);
        request.setId(idGenerator.getNextId());
        request.setSubmittedBy(userId);
        return mongoProvider.insertInCollection("stash", request, mapper);
    }

    private void validateRequest(@RequestBody StashCardRequest request) {
        try {
            cardProvider.getCardByName(request.getCardName());
        } catch (ElementNotFoundException e) {
            throw new ValidationException(e, "The card {0} is not valid; {1}", request.getCardName(), e.getMessage());
        }
    }
}
