package be.phury.mtg.deck;

import be.phury.utils.MapBuilder;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.text.StrSubstitutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;

/**
 * Created by Phury
 */
@Component
public class MongoDatabaseFactory {

    @Autowired
    private ApplicationConfiguration configuration;

    private MongoClient mongoClient;

    @Bean
    public MongoDatabase mongoDatabase() {
        MongoClientURI uri = new MongoClientURI(getMongoUri());
        mongoClient = new MongoClient(uri);
        return mongoClient.getDatabase(configuration.getMongo().getDbName());
    }

    private String getMongoUri() {
        final String mongoUri = StrSubstitutor.replace("mongodb://${dbuser}:${dbpassword}@${hostName}:${port}/${dbName}",
                new MapBuilder<String, String>()
                        .entry("dbuser", configuration.getMongo().getDbuser())
                        .entry("dbpassword", configuration.getMongo().getDbpassword())
                        .entry("hostName", configuration.getMongo().getHostName())
                        .entry("port", configuration.getMongo().getPort()+"")
                        .entry("dbName", configuration.getMongo().getDbName())
                        .build()
        );
        return mongoUri;
    }


    @PreDestroy
    public void preDestroy() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }
}
