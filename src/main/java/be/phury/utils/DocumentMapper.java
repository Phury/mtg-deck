package be.phury.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class DocumentMapper<T> {
    private static final Logger LOGGER = LoggerFactory.getLogger(DocumentMapper.class);

    private Class<T> typeOf;
    private ObjectMapper objectMapper;

    public DocumentMapper(Class<T> typeOf) {
        this.typeOf = typeOf;
        this.objectMapper = new ObjectMapper();
    }

    public void addMixIn(Class<?> mixin) {
        this.objectMapper.addMixIn(typeOf, mixin);
    }

    public Document toDocument(T t) {
        try {
            final String json = objectMapper.writeValueAsString(t);
            LOGGER.debug(MessageFormat.format("converted object: {0} to json: {1}", t, json));
            return Document.parse(json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public T fromDocument(Document doc) {
        try {
            final String json = doc.toJson();
            final T t = objectMapper.readValue(json, this.typeOf);
            LOGGER.debug(MessageFormat.format("converted json: {0} to object: {1}", json, t));
            return t;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
