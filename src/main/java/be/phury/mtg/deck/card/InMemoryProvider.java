package be.phury.mtg.deck.card;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

public class InMemoryProvider<T> implements Provider<T> {

    private List<T> database;
    private Class<T> typeOf;

    public InMemoryProvider(List<T> database, Class<T> typeOf) {
        this.database = new ArrayList<>(database);
        this.typeOf = typeOf;
    }

    @Override
    public T findById(String id) {
        return findByProperty("name", id).get(0);
    }

    @Override
    public List<T> findByProperty(String property, Object value) {
        try {
            final Field field = typeOf.getDeclaredField(property);
            final boolean accessible = field.isAccessible();
            field.setAccessible(true);
            final List<T> result = database.stream()
                    .filter(elt -> {
                        try {
                            Object o = field.get(elt);
                            return o.equals(value);
                        } catch (IllegalAccessException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .collect(Collectors.toList());
            field.setAccessible(accessible);
            return result;
        } catch (NoSuchFieldException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public T findFirstByProperty(String property, Object value) {
        return findByProperty(property, value).get(0);
    }

    @Override
    public List<T> list() {
        return Collections.unmodifiableList(database);
    }

    @Override
    public List<T> find(T query) {
        final List<Field> matchers = new LinkedList<>();
        for (Field field : typeOf.getDeclaredFields()) {
            try {
                if (field.get(query) != null) matchers.add(field);
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
        return database.stream()
                .filter(elt -> {
                    for (Field field : matchers) {
                        try {
                            if (!field.get(elt).equals(field.get(query))) return false;
                        } catch (IllegalAccessException e) {
                            throw new RuntimeException(e);
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public T findFirst(T query) {
        return find(query).get(0);
    }
}
