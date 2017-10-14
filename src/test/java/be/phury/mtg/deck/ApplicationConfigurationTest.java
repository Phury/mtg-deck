package be.phury.mtg.deck;

import be.phury.utils.MapBuilder;
import be.phury.utils.SystemUtils;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.context.junit4.SpringRunner;

/**
 *
 */
@RunWith(SpringRunner.class)
public class ApplicationConfigurationTest {

    private static final ByteArrayResource JSON_CONFIG = new ByteArrayResource(("{\n" +
            "  \"version\": \"test-version\",\n" +
            "  \"mongoUrl\": \"mongodb://dbuser:dbpassword@dbhost:12345/dbname\",\n" +
            "  \"mongoDatabaseName\": \"test-db\"\n" +
            "}").getBytes());

    private ApplicationConfiguration configuration;

    private void initializeConfiguration() {
        ApplicationConfigurationFactory factory = new ApplicationConfigurationFactory();
        factory.setJsonConfigFile(JSON_CONFIG);
        configuration = factory.applicationConfiguration();
    }

    @Test
    public void testWithResource() {
        initializeConfiguration();
        Assert.assertEquals("test-version", configuration.getVersion());
        Assert.assertEquals("mongodb://dbuser:dbpassword@dbhost:12345/dbname", configuration.getMongoUrl());
        Assert.assertEquals("test-db", configuration.getMongoDatabaseName());
    }

    private void setEnvProperties() {
        SystemUtils.setEnv(new MapBuilder<String, String>()
                .entry("mtgdeck.version", "test-version-env")
                .entry("mtgdeck.mongo.url", "mongodb://dbuser:dbpassword@dbhost:12345/dbname-env")
                .entry("mtgdeck.mongo.dbname", "test-db-env")
                .build());
    }

    @Test
    public void testWithEnvParameters() {
        setEnvProperties();
        initializeConfiguration();
        Assert.assertEquals("test-version-env", configuration.getVersion());
        Assert.assertEquals("mongodb://dbuser:dbpassword@dbhost:12345/dbname-env", configuration.getMongoUrl());
        Assert.assertEquals("test-db-env", configuration.getMongoDatabaseName());
    }

}
