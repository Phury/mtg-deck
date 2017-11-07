package be.phury.mtg.deck;

import be.phury.mtg.deck.model.DeckEditRequest;
import be.phury.utils.DocumentMapper;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.*;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Arrays;
import java.util.UUID;

/**
 * Created by Phury
 */
@RunWith(SpringRunner.class)
@Ignore
public class MLabConnectionTest {

    private static final Logger logger = LoggerFactory.getLogger(MLabConnectionTest.class);

    @Autowired
    private MongoDatabase database;

    @Autowired
    private DocumentMapper<DeckEditRequest> deckMapper;

    private MongoCollection<Document> deckCollection;

    private DeckEditRequest deck;

    @Before
    public void before() {

        deckCollection = database.getCollection("decks");

//        abstract class MixIn {
//            /*
//                see: https://github.com/FasterXML/jackson-docs/wiki/JacksonMixInAnnotations
//                mongo uses an internal _id but we have already an Id defined, override the serialization of _id
//                and just ignore it
//             */
//            //@JsonIgnore @JsonProperty("_id") abstract Object getId();
//            @JsonProperty("_id") abstract String getId();
//        }
//
//        objectMapper = new ObjectMapper();
//        objectMapper.addMixIn(DeckEditRequest.class, MixIn.class);

        deck = new DeckEditRequest();
        deck.setId(UUID.randomUUID().toString());
        deck.setName("Aggro Vehicles");
        deck.setSubmittedBy("phury");
        deck.setCards(Arrays.asList(
                "4 Blight Keeper",
                "4 Fourth Bridge Prowler",
                "4 Night Market Lookout",
                "4 Pain Seer",
                "4 Dhund Operative",
                "4 Desperate Castaways",
                "4 Ovalchase Dragster",
                "4 Untethered Express",
                "4 Harsh Scrutiny",
                "4 Walk the Plank",
                "20 Swamp"
        ));
    }

    @After
    public void after() {
        deckCollection.deleteMany(new Document());
    }

    @Test
    public void test() {
        Assert.assertEquals(0, deckCollection.count());
        deckCollection.insertOne(deckMapper.toDocument(deck));
        final Document doc = deckCollection.find(new Document("name", deck.getName())).first();
        final DeckEditRequest actualDeck = deckMapper.fromDocument(doc);
        Assert.assertEquals(deck, actualDeck);
    }
}
