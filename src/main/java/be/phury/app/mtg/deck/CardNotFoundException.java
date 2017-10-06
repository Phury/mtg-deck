package be.phury.app.mtg.deck;

import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class CardNotFoundException extends RuntimeException {
    public CardNotFoundException(String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs));
    }
}
