package be.phury.utils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by Phury
 *
 * Fluent builder interface for Map
 */
public class MapBuilder<K, V> {
    private Map<K, V> map = new HashMap<K, V>();

    /**
     * Adds an entry to the map
     * @param key key to add
     * @param value value to add
     * @return the builder for method chaining
     */
    public MapBuilder<K, V> entry(K key, V value) {
        this.map.put(key, value);
        return this;
    }

    /**
     * Builds the map from all the entries.
     * @return
     */
    public Map<K, V> build() {
        return Collections.unmodifiableMap(this.map);
    }
}
