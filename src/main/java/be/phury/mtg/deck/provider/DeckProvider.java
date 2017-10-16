package be.phury.mtg.deck.provider;

import be.phury.mtg.deck.DeckEditRequest;
import be.phury.mtg.deck.IdGenerator;
import be.phury.utils.DocumentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@Service
public class DeckProvider {

    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private MongoProvider mongoProvider;

    @Autowired
    private DocumentMapper<DeckEditRequest> mapper;

    public DeckEditRequest getDeckById(String deckId) {
        return mongoProvider.findByIdInCollection("decks", deckId, mapper);
    }

    public List<DeckEditRequest> getDecksByUser(String userId) {
        return mongoProvider.findAllByPropertyInCollection("decks", "submittedBy", userId, mapper);
    }

    public DeckEditRequest createDeckForUser(String userId, DeckEditRequest deck) {
        deck.setSubmittedBy(userId);
        deck.setId(idGenerator.getNextId());
        sanitizeMainboard(deck);
        return mongoProvider.insertInCollection("decks", deck, mapper);
    }


    public boolean deleteDeck(String deckId) {
        return mongoProvider.deleteById("decks", deckId);
    }

    private void sanitizeMainboard(DeckEditRequest deck) {
        if (deck.getCards() == null) return;
        deck.setCards(deck.getCards()
                .stream()
                .filter(str -> str != null && !str.trim().isEmpty())
                .collect(Collectors.toList()));
    }
}
