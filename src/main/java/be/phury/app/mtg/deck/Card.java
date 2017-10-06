package be.phury.app.mtg.deck;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by Phury
 */
public class Card {
    private String name;
    private String type;
    private String cmc;
    private String oracle;
    private String powerToughness;
    private List<Link> links;

    public Card() {
        links = new LinkedList<>();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCmc() {
        return cmc;
    }

    public void setCmc(String cmc) {
        this.cmc = cmc;
    }

    public String getOracle() {
        return oracle;
    }

    public void setOracle(String oracle) {
        this.oracle = oracle;
    }

    public String getPowerToughness() {
        return powerToughness;
    }

    public void setPowerToughness(String powerToughness) {
        this.powerToughness = powerToughness;
    }

    public List<Link> getLinks() {
        return links;
    }

    public void setLinks(List<Link> links) {
        this.links = links;
    }

    public void addLink(String rel, String href) {
        links.add(Link.create(rel, href));
    }
}
