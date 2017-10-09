package be.phury.app.mtg.deck;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Phury
 */
public abstract class RestModel {
    private Map<String, String> links = new HashMap<>();

    public Map<String, String> getLinks() {
        return links;
    }

    public void setLinks(Map<String, String> links) {
        this.links = links;
    }

    public void addLink(String rel, String href) {
        links.put(rel, href);
    }

}
