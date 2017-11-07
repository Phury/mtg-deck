package be.phury.mtg.deck.model;

import be.phury.mtg.deck.ApiModel;

/**
 * A short version of an entity to reduce size of response. This can be used for:
 *  * returning a list of elements making it shorter to display
 *  * returning a 201 created to link to the entity created
 */
public class Entity extends ApiModel {
    private String id;
    private String displayName;
    private String type;

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
}
