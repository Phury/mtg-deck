package be.phury.app.mtg.deck;

/**
 * Created by Phury
 */
public class Link {
    private String rel;
    private String href;

    /**
     * Constructor method
     * @param rel
     * @param href
     * @return
     */
    public static Link create(String rel, String href) {
        final Link link = new Link();
        link.setRel(rel);
        link.setHref(href);
        return link;
    }

    public String getRel() {
        return rel;
    }

    public void setRel(String rel) {
        this.rel = rel;
    }

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }
}
