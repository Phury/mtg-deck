package be.phury.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;

import java.io.IOException;
import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class JsonMapper<T> {

    private Class<T> typeOf;
    private ObjectMapper objectMapper;

    public JsonMapper(Class<T> typeOf) {
        this.typeOf = typeOf;
        this.objectMapper = new ObjectMapper();
    }

    public void addMixIn(Class<?> mixin) {
        this.objectMapper.addMixIn(typeOf, mixin);
    }

    public String toJson(T t) {
        try {
            final String json = objectMapper.writeValueAsString(t);
            return json;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public T fromJson(String json) {
        try {
            final T t = objectMapper.readValue(json, this.typeOf);
            return t;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
