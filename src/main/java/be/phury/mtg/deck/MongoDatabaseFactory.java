package be.phury.mtg.deck;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;

/**
 * Created by Phury
 */
@Component
public class MongoDatabaseFactory {

    // TODO: allow for in memory Map based implementation if the MongoDatabase configuration is not set

    @Autowired
    private ApplicationConfiguration configuration;

    private MongoClient mongoClient;

    @Bean
    public MongoDatabase mongoDatabase() {
        if (configuration.getMongoUrl() == null) {
            return null;
        }
        MongoClientURI uri = new MongoClientURI(configuration.getMongoUrl());
        mongoClient = new MongoClient(uri);
        return mongoClient.getDatabase(configuration.getMongoDatabaseName());
    }

    @PreDestroy
    public void preDestroy() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }
}
