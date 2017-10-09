package be.phury.app.mtg.deck;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.*;

/**
 * Created by Phury
 */
@Service
public class DeckRepository {
    @Autowired
    private IdGenerator idGenerator;

    private final Map<String, List<Deck>> database = new HashMap<>();

    @PostConstruct
    public void postConstruct() {
        database.put("phury", Arrays.asList(new Deck(){{
            setId(idGenerator.getNextId());
            setName("Ifnir Cycle");
            setCards(Arrays.asList("4 Flameblade Adept", "3 Firebrand Archer", "3 Archfiend of Ifnir", "4 Horror of the Broken Lands", "4 Desert Cerodon", "3 Faith of the Devoted", "3 Limits of Solidarity", "3 Cut+Ribbons", "4 Tormenting Voice", "4 Magma Spray", "3 Wander in Death", "4 Desert of the Glorified", "4 Desert of the Fervent", "2 Hostile Desert", "7 Swamp", "7 Mountain"));
        }}));
    }

    public List<Deck> listDecksForUser(String userId) {
        return database.get(userId);
    }

    public Deck createDeckForUser(String userId, Deck deck) {
        List<Deck> values;
        if (database.containsKey(userId)) values = database.get(userId);
        else values = new LinkedList<>();
        values.add(deck);
        database.put(userId, values);
        return deck;
    }
}
