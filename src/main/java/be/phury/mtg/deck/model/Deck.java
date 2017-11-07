package be.phury.mtg.deck.model;

import be.phury.mtg.deck.ApiModel;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.util.List;
import java.util.Map;

/**
 * Created by Phury
 */
public class Deck extends ApiModel {
    private String id;
    private String name;
    private Map<String, List<Card>> cards;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, List<Card>> getCards() {
        return cards;
    }

    public void setCards(Map<String, List<Card>> cards) {
        this.cards = cards;
    }

    public List<Card> getMainboard() {
        return getCards().get("mainboard");
    }

    public List<Card> geSideboard() {
        return getCards().get("sideboard");
    }

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

    @Override
    public boolean equals(Object obj) {
        return EqualsBuilder.reflectionEquals(this, obj);
    }
}
