package be.phury.mtg.deck;

import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class ElementNotFoundException extends RuntimeException {
    public ElementNotFoundException(String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs));
    }
}
