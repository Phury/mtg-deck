package be.phury.mtg.deck;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.util.List;

/**
 * Created by Phury
 */
public class DeckEditRequest extends ApiModel {
    private String id;
    private String name;
    private String submittedBy;
    private List<String> cards;
    private List<String> sideboard;
    private List<String> maybeboard;

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

    public String getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }

    public List<String> getCards() {
        return cards;
    }

    public void setCards(List<String> cards) {
        this.cards = cards;
    }

    public List<String> getSideboard() {
        return sideboard;
    }

    public void setSideboard(List<String> sideboard) {
        this.sideboard = sideboard;
    }

    public List<String> getMaybeboard() {
        return maybeboard;
    }

    public void setMaybeboard(List<String> maybeboard) {
        this.maybeboard = maybeboard;
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
