package be.phury.mtg.deck.card;

import be.phury.mtg.deck.Card;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class CardService {

    @Autowired
    private Provider<Card> cardProvider;

    public Card getCardByName(String cardName){
        return cardProvider.findFirstByProperty("name", cardName);
    }

    public List<Card> findCardsByType(String type) {
        return cardProvider.findByProperty("type", type);
    }

    public void setProvider(Provider<Card> cardProvider) {
        this.cardProvider = cardProvider;
    }
}
