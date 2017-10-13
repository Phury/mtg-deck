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
        jsonMapper = new JsonMapper<ApplicationConfiguration>(ApplicationConfiguration.class);
        setJsonConfigFile(new ClassPathResource("app-config.json"));
    }

    @Bean
    public ApplicationConfiguration applicationConfiguration() {
        try(InputStream is = getJsonConfigFile().getInputStream()) {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            IOUtils.copy(is, os);
            ApplicationConfiguration configuration = jsonMapper.fromJson(new String(os.toByteArray(), "UTF-8"));
            return overrideWithEnvProperties(configuration);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private ApplicationConfiguration overrideWithEnvProperties(ApplicationConfiguration configuration) {
        if (System.getenv("mtgdeck.version") != null)
            configuration.setVersion(System.getenv("mtgdeck.version"));
        if (System.getenv("mtgdeck.mongo.dbuser") != null)
            configuration.getMongo().setDbuser(System.getenv("mtgdeck.mongo.dbuser"));
        if (System.getenv("mtgdeck.mongo.dbpassword") != null)
            configuration.getMongo().setDbpassword(System.getenv("mtgdeck.mongo.dbpassword"));
        if (System.getenv("mtgdeck.mongo.hostname") != null)
            configuration.getMongo().setHostName(System.getenv("mtgdeck.mongo.hostname"));
        if (System.getenv("mtgdeck.mongo.port") != null)
            configuration.getMongo().setPort(Integer.parseInt(System.getenv("mtgdeck.mongo.port")));
        if (System.getenv("mtgdeck.mongo.dbname") != null)
            configuration.getMongo().setDbName(System.getenv("mtgdeck.mongo.dbname"));
        return configuration;
    }

    public void setJsonConfigFile(Resource jsonConfigFile) {
        this.jsonConfigFile = jsonConfigFile;
    }

    public Resource getJsonConfigFile() {
        return jsonConfigFile;
    }
}
