package be.phury.mtg.deck;

import be.phury.utils.MapBuilder;
import be.phury.utils.DocumentMapper;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.text.StrSubstitutor;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by Phury
 *
 * A template class that handles MongoDB databases.
 */
@Service
public class MongoProvider {
    private static final Logger logger = LoggerFactory.getLogger(MongoProvider.class);

    @Autowired
    private MongoDatabase mongoDatabase;

    public MongoCollection<Document> getCollection(String collectionName) {
        return mongoDatabase.getCollection(collectionName);
    }

    public <T> T findByIdInCollection(String collectionName, String itemId, DocumentMapper<T> mapper) {
        return findAllByPropertyInCollection(collectionName, "_id", itemId, mapper).get(0);
    }

    public <T> List<T> findAllByPropertyInCollection(String collectionName, String property, String value, DocumentMapper<T> mapper) {
        final MongoCollection<Document> collection = mongoDatabase.getCollection(collectionName);
        final MongoCursor<Document> cursor = collection.find(new Document(property, value)).iterator();

        final List<T> result = new LinkedList<T>();
        while (cursor.hasNext()) {
            result.add(mapper.fromDocument(cursor.next()));
        }
        return result;
    }

    public <T> T insertInCollection(String collectionName, T toInsert, DocumentMapper<T> mapper) {
        final MongoCollection<Document> collection = mongoDatabase.getCollection(collectionName);
        collection.insertOne(mapper.toDocument(toInsert));
        return toInsert; // TODO: handle mongodb internal _id vs generated uuid
    }
}
