package be.phury.mtg.deck.provider;

import be.phury.mtg.deck.model.Card;
import be.phury.mtg.deck.model.DeckEditRequest;
import be.phury.mtg.deck.IdGenerator;
import be.phury.utils.DocumentMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private CardProvider cardProvider;

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
        deck.setColors(StringUtils.join(getDeckColor(deck), ""));
        sanitizeMainboard(deck);
        return mongoProvider.insertInCollection("decks", deck, mapper);
    }

    private Set<String> getDeckColor(DeckEditRequest deck) {
        final Set<String> colors = new HashSet<>();
        for (String cardInfo : deck.getCards()) {
            final Integer space = cardInfo.indexOf(" ");
            final String cardName = cardInfo.substring(space+1, cardInfo.length());
            final Card card = cardProvider.getCardByName(cardName);
            colors.addAll(card.getColors());
        }
        return colors;
    }

    public DeckEditRequest updateDeck(DeckEditRequest deck) {
        sanitizeMainboard(deck);
        return mongoProvider.updateInCollection("decks", deck.getId(), deck, mapper);
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
