package be.phury.mtg.deck.card;

import java.util.List;

public interface Provider<T> {
    T findById(String id);
    List<T> findByProperty(String property, Object value);
    T findFirstByProperty(String property, Object value);
    List<T> list();
    List<T> find(T query);
    T findFirst(T query);
}
