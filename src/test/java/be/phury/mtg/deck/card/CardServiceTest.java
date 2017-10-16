package be.phury.mtg.deck.card;

import be.phury.mtg.deck.Card;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;

public class CardServiceTest {

    private CardService cardService;
    private Card card1, card2, card3;

    @Before
    public void before() {
        card1 = new Card();
        card1.setName("Dark Ritual");
        card1.setConvertedManaCost(1);
        card1.setManaCost("{b}");
        card1.setOracle("Add {b}{b}{b} to your mana pool");
        card1.setType("Ritual");

        card2 = new Card();
        card2.setName("Baron Sengir");
        card2.setConvertedManaCost(8);
        card2.setManaCost("{5}{b}{b}{b}");
        card2.setOracle("Flying");
        card2.setType("Vampire");

        card3 = new Card();
        card3.setName("Vampire Sengir");
        card3.setConvertedManaCost(8);
        card3.setManaCost("{3}{b}{b}");
        card3.setOracle("Flying");
        card3.setPowerToughness("4/4");
        card3.setType("Vampire");

        cardService = new CardService();
        cardService.setProvider(new InMemoryProvider(Arrays.asList(card1, card2, card3), Card.class));
    }

    @Test
    public void testGetCardByName() {
        Card card = cardService.getCardByName("Dark Ritual");
        Assert.assertNotNull(card);
        Assert.assertEquals(card1, card);
    }

    @Test
    public void testGetCardByType() {
        List<Card> cards = cardService.findCardsByType("Vampire");
        Assert.assertNotNull(cards);
        Assert.assertFalse(cards.isEmpty());
        Assert.assertTrue(cards.contains(card2));
        Assert.assertTrue(cards.contains(card3));
        Assert.assertFalse(cards.contains(card1));
    }


}
