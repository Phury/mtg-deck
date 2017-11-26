package be.phury.mtg.deck.utils;

import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses MTG color strings
 */
public class Colors {
    private static final Set<String> COLORS = new HashSet<>(Arrays.asList("w", "u", "b", "r", "g", "c", "p", "s"));

    public static Set<String> parse(String colorStr) {
        final Set<String> colors = new HashSet<>();
        final Pattern pattern = Pattern.compile("\\{([^}]*)\\}");
        final Matcher matcher = pattern.matcher(colorStr);
        while (matcher.find()) {
            final String cost = matcher.group(1);
            if (COLORS.contains(cost)) colors.add("{"+cost+"}");
        }
        return colors;
    }
}
