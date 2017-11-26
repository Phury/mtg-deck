package be.phury.mtg.deck.utils;

import be.phury.mtg.deck.utils.Colors;
import org.junit.Assert;
import org.junit.Test;

import java.util.*;

public class ColorsTest {
    @Test
    public void test() {
        Assert.assertEquals(asSet("{u}"), Colors.parse("1{u}{u}"));
        Assert.assertEquals(asSet("{u}", "{b}"), Colors.parse("1{u}{b}"));
        Assert.assertEquals(asSet("{r}", "{g}", "{b}", "{w}", "{u}"), Colors.parse("3{r}{g}{b}{w}{u}"));
    }

    private Set<String> asSet(String ... s) {
        return new HashSet<>(Arrays.asList(s));
    }
}
