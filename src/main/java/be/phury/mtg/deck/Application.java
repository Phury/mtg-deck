package be.phury.mtg.deck;

import be.phury.utils.DocumentMapper;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import javax.annotation.PostConstruct;

/**
 * Created by Phury
 *
 * Exclusion of mongo auto configuration: https://stackoverflow.com/questions/34414367/mongo-tries-to-connect-automatically-to-port-27017localhost
 */
@SpringBootApplication
@EnableAutoConfiguration(exclude = {MongoAutoConfiguration.class, MongoDataAutoConfiguration.class})
public class Application {

    private static final Logger logger = LoggerFactory.getLogger(Application.class);

    @Autowired
    private ApplicationConfiguration configuration;

    @PostConstruct
    private void init(){
        logger.info("Spring Boot - @ConfigurationProperties annotation example");
        logger.info(configuration.toString());
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/cards/**").allowedOrigins("http://localhost:8000");
            }
        };
    }

    @Bean
    public IdGenerator idGenerator() {
        return new IdGenerator();
    }

    @Bean
    public DocumentMapper<DeckEditRequest> deckMapper() {
        abstract class MixIn {
            /*
                see: https://github.com/FasterXML/jackson-docs/wiki/JacksonMixInAnnotations
                mongo uses an internal _id but we have already an Id defined, override the serialization of _id
                and just ignore it
             */
            //@JsonIgnore @JsonProperty("_id") abstract Object getId();
            @JsonProperty("_id") abstract String getId();
        }

        DocumentMapper<DeckEditRequest> modelMapper = new DocumentMapper<>(DeckEditRequest.class);
        modelMapper.addMixIn(MixIn.class);
        return modelMapper;
    }

    /**
     * Heroku uses environment property PORT to set the port of the application.
     * Check if that variable is set, otherwise default to spring's configuration
     */
    @Configuration
    public class HerokuPortConfiguration {
        @Bean
        public EmbeddedServletContainerCustomizer containerCustomizer() {
            return (container -> {
                if (System.getenv("PORT") != null) container.setPort(Integer.parseInt(System.getenv("PORT")));
            });
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
