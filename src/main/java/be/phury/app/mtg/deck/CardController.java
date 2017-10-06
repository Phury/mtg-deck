package be.phury.app.mtg.deck;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@ApiController
public class CardController {

    private static final Logger LOGGER = LoggerFactory.getLogger(CardController.class);

    @RequestMapping(path = "/cards/type/{cardType}")
    public List<Card> findCardsByType(@PathVariable String cardType) {
        return fetchDom("t:" + cardType)
                .select("div.card_row")
                .stream()
                .map(ElementToCardConverter::toCard)
                .collect(Collectors.toList());
    }

    @RequestMapping(path = "/cards/{cardName}")
    public Card getCardByName(@PathVariable String cardName) {
        return fetchDom(cardName)
                .select("div.card_row")
                .stream()
                .findFirst()
                .map(ElementToCardConverter::toCard)
                .get();
    }

    private Document fetchDom(@PathVariable String query) {
        try {
            Document doc = Jsoup.connect("https://mtg.wtf/card?q=" + urlEncode(query)).get();
            if (doc.select("div.results_summary").text().equals("No cards found")) {
                throw new CardNotFoundException("Card {0} not found", query);
            }
            return doc;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static String urlEncode(String str) {
        try {
            return URLEncoder.encode(str, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    private static class ElementToCardConverter {

        private static Element selectFirst(Element src, String cssQuery) {
            Element elt = new Element("<div/>");
            if (src == null) return elt;
            Elements select = src.select(cssQuery);
            if (select == null || select.isEmpty()) return elt;
            return select.first();
        }

        public static Card toCard(Element elt) {
            Element cardInfo = selectFirst(elt, "div.cardinfo");
            Element image = selectFirst(elt, "img.card_picture");
            Element name = selectFirst(cardInfo, "h3.card_title > a");
            Element cmc = selectFirst(cardInfo, "h3.card_title > .manacost");
            Element type = selectFirst(cardInfo, "div.typeline");
            Element oracle = selectFirst(cardInfo, "div.oracle");
            Element pt = selectFirst(cardInfo, "div.power_toughness");

            final Card card = new Card();
            card.setName(name.text());
            card.addLink("self", "/cards/" + urlEncode(name.text()));
            card.addLink("source", name.absUrl("href"));
            card.addLink("image", image.absUrl("src"));
            card.setCmc(cmc.text());
            card.setType(type.text());
            card.setOracle(oracle.html().replaceAll("<br>", "\n"));
            card.setPowerToughness(pt.text());
            return card;
        }
    }

}
