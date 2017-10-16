package be.phury.mtg.deck.provider;

import be.phury.mtg.deck.Card;
import be.phury.mtg.deck.ElementNotFoundException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Phury
 */
@Service
public class CardProvider {
    public List<Card> findCardsByType(String cardType) {
        return fetchDom("t:" + cardType)
                .select("div.card_row")
                .stream()
                .map(ElementToCardConverter::toCard)
                .collect(Collectors.toList());
    }

    public Card getCardByName(String cardName) {
        String cardNameSanitized = (cardName.contains("+")) ? StringUtils.split(cardName, "+")[0] : cardName;
        return fetchDom(cardNameSanitized)
                .select("div.card_row")
                .stream()
                .findFirst()
                .map(ElementToCardConverter::toCard)
                .get();
    }

    private Document fetchDom(String query) {
        try {
            Document doc = Jsoup.connect("http://mtg.wtf/card?q=!" + urlEncode(query)).get();
            if (doc.select("div.results_summary").text().equals("No cards found")) {
                throw new ElementNotFoundException("Card {0} not found", query);
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
            Element mc = selectFirst(cardInfo, "h3.card_title > .manacost");
            Element type = selectFirst(cardInfo, "div.typeline");
            Element oracle = selectFirst(cardInfo, "div.oracle");
            Element flavor = selectFirst(cardInfo, "div.flavor");
            Element infolabel = selectFirst(cardInfo, "div > span.infolabel");
            Element pt = selectFirst(cardInfo, "div.power_toughness");
            Element edition = selectFirst(elt, "ul.printings_box");

            oracle.children()
                    .stream()
                    .filter(e -> e.is("br"))
                    .forEach(e -> e.replaceWith(new TextNode(":newline", "")));// Text trims all, use ":newline" as a delimiter

            Element doubleFaced = elt.select("img.card_picture.dfc_reverse").first();
            Element aftermath = elt.select("img.card_picture.aftermath").first();

            final Card card = new Card();
            card.setName(name.text());
            card.addLink("self", "/cards/" + name.text());
            card.addLink("source", name.absUrl("href"));
            card.addLink("image", image.absUrl("src"));
            card.setManaCost(mc.text());
            card.setConvertedManaCost(mc.text().replaceAll("[\\{\\}]", "").replaceAll("[wubrg]", "1").chars().reduce(0, (sum, cost) -> sum += Character.getNumericValue(cost)));
            card.setType(type.text());
            card.setOracle(oracle.text().replaceAll(":newline", "\n"));
            card.setFlavor(flavor.text());
            card.setPowerToughness(pt.text());
            card.setEditions(edition.select("li").eachText());

            if (doubleFaced != null) {
                String flipName = infolabel.select("a").first().text();
                //String flipUrl = flipSource.substring(flipSource.lastIndexOf('/')+1, flipSource.length());
                card.addLink("flip_name", flipName);
                card.addLink("flip_url", "/cards/" + flipName);
                card.addLink("flip_image", doubleFaced.absUrl("src"));
            }
            if (aftermath != null) {
                String aftermathName = infolabel.select("a").first().absUrl("href");
                //String flipUrl = flipSource.substring(flipSource.lastIndexOf('/'), flipSource.length());
                card.addLink("aftermath_name", aftermathName);
                card.addLink("aftermath_url", "/cards/" + aftermathName);
                card.addLink("aftermath_image", aftermath.absUrl("src"));
            }
            return card;
        }
    }
}
