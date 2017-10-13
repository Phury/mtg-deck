package be.phury.mtg.deck;

/**
 * A short version of an entity to reduce size of response. This can be used for:
 *  * returning a list of elements making it shorter to display
 *  * returning a 201 created to link to the entity created
 */
public class Entity {
    private String id;
    private String displayName;
    private String type;
    private String uri;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }
}
