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
            "  \"mongo\": {\n" +
            "    \"dbuser\": \"testuser\",\n" +
            "    \"dbpassword\": \"testpassword\",\n" +
            "    \"hostName\": \"testhost\",\n" +
            "    \"port\": \"1234\",\n" +
            "    \"dbName\": \"test-db\"\n" +
            "  }\n" +
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
        Assert.assertEquals("testuser", configuration.getMongo().getDbuser());
        Assert.assertEquals("testpassword", configuration.getMongo().getDbpassword());
        Assert.assertEquals("testhost", configuration.getMongo().getHostName());
        Assert.assertEquals(1234, configuration.getMongo().getPort());
        Assert.assertEquals("test-db", configuration.getMongo().getDbName());
    }

    private void setEnvProperties() {
        SystemUtils.setEnv(new MapBuilder<String, String>()
                .entry("mtgdeck.version", "test-version-env")
                .entry("mtgdeck.mongo.dbuser", "testuser-env")
                .entry("mtgdeck.mongo.dbpassword", "testpassword-env")
                .entry("mtgdeck.mongo.hostname", "testhost-env")
                .entry("mtgdeck.mongo.port", "1235")
                .entry("mtgdeck.mongo.dbname", "test-db-env")
                .build());
    }

    @Test
    public void testWithEnvParameters() {
        setEnvProperties();
        initializeConfiguration();
        Assert.assertEquals("test-version-env", configuration.getVersion());
        Assert.assertEquals("testuser-env", configuration.getMongo().getDbuser());
        Assert.assertEquals("testpassword-env", configuration.getMongo().getDbpassword());
        Assert.assertEquals("testhost-env", configuration.getMongo().getHostName());
        Assert.assertEquals(1235, configuration.getMongo().getPort());
        Assert.assertEquals("test-db-env", configuration.getMongo().getDbName());
    }

}
