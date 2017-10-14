package be.phury.mtg.deck;

import be.phury.utils.JsonMapper;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Created by Phury
 */
@Component
public class ApplicationConfigurationFactory {

    private JsonMapper<ApplicationConfiguration> jsonMapper;
    private Resource jsonConfigFile;

    public ApplicationConfigurationFactory() {
        jsonMapper = new JsonMapper<>(ApplicationConfiguration.class);
        setJsonConfigFile(new ClassPathResource("app-config.json"));
    }

    @Bean
    public ApplicationConfiguration applicationConfiguration() {
        ApplicationConfiguration configuration;
        if (System.getenv("mtgdeck.version") != null) {
            configuration = configureFromEnvironment();
        } else {
            configuration = configureFromJson();
        }
        return configuration;
    }

    private ApplicationConfiguration configureFromJson() {
        Resource configFile = getJsonConfigFile();
        if (configFile.exists()) {
            try(InputStream is = configFile.getInputStream()) {
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                IOUtils.copy(is, os);
                return jsonMapper.fromJson(new String(os.toByteArray(), "UTF-8"));
            } catch (IOException e) {
                throw new ConfigurationException(e);
            }
        }
        throw new ConfigurationException("Configuration file and mongo url environment property not found");
    }

    private ApplicationConfiguration configureFromEnvironment() {
        ApplicationConfiguration configuration = new ApplicationConfiguration();
        if (System.getenv("mtgdeck.version") != null)
            configuration.setVersion(System.getenv("mtgdeck.version"));
        if (System.getenv("mtgdeck.mongo.url") != null)
            configuration.setMongoUrl(System.getenv("mtgdeck.mongo.url"));
        if (System.getenv("mtgdeck.mongo.dbname") != null)
            configuration.setMongoDatabaseName(System.getenv("mtgdeck.mongo.dbname"));
        return configuration;
    }

    public void setJsonConfigFile(Resource jsonConfigFile) {
        this.jsonConfigFile = jsonConfigFile;
    }

    public Resource getJsonConfigFile() {
        return jsonConfigFile;
    }
}
