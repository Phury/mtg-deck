package be.phury.mtg.deck;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * Created by Phury
 */
//@Configuration
//@ConfigurationProperties
//@ConfigurationProperties(prefix="app.mtgdeck")
public class ApplicationConfiguration {

    private String version;
    private String mongoUrl;
    private String mongoDatabaseName;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getMongoUrl() {
        return mongoUrl;
    }

    public String getMongoDatabaseName() {
        return mongoDatabaseName;
    }

    public void setMongoDatabaseName(String mongoDatabaseName) {
        this.mongoDatabaseName = mongoDatabaseName;
    }

    public void setMongoUrl(String mongoUrl) {
        this.mongoUrl = mongoUrl;
    }

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

}
