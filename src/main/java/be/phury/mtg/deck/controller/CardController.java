package be.phury.mtg.deck.controller;

import be.phury.mtg.deck.ApiController;
import be.phury.mtg.deck.model.Card;
import be.phury.mtg.deck.provider.CardProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Created by Phury
 */
@ApiController
public class CardController {

    private static final Logger LOGGER = LoggerFactory.getLogger(CardController.class);

    @Autowired
    private CardProvider cardProvider;

    @RequestMapping(path = "/cards/{cardName}")
    public Card getCardByName(@PathVariable String cardName) {
        return cardProvider.getCardByName(cardName);
    }

    @RequestMapping(path = "/cards/type/{cardType}")
    public List<Card> findCardsByType(@PathVariable String cardType) {
        return cardProvider.findCardsByType(cardType);
    }

    @RequestMapping(path = "/cards/search")
    public List<Card> searchCards(@RequestParam("q") String query) {
        return cardProvider.searchCards(query);
    }
}
