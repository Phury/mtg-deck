package be.phury.mtg.deck.exception;

import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class TechnicalException extends RuntimeException {
    public TechnicalException(String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs));
    }

    public TechnicalException(Throwable cause, String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs), cause);
    }
}
