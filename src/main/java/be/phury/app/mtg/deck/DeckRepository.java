package be.phury.app.mtg.deck;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@Service
public class DeckRepository {
    @Autowired
    private IdGenerator idGenerator;

    private final Map<String, Deck> database = new HashMap<>();

    public Deck getDeckById(String deckId) {
        return database.get(deckId);
    }

    public List<Deck> getDecksByUser(String userId) {
        return database.values()
                .stream()
                .filter(d -> d.getSubmittedBy().equals(userId))
                .collect(Collectors.toList());
    }

    public Deck createDeckForUser(String userId, Deck deck) {
        deck.setSubmittedBy(userId);
        deck.setId(idGenerator.getNextId());
        sanitizeMainboard(deck);
        database.put(deck.getId(), deck);
        return deck;
    }

    private void sanitizeMainboard(Deck deck) {
        if (deck.getCards() == null) return;
        deck.setCards(deck.getCards()
                .stream()
                .filter(str -> str != null && !str.trim().isEmpty())
                .collect(Collectors.toList()));
    }

}
