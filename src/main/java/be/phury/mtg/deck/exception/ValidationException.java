package be.phury.mtg.deck.exception;

import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs));
    }

    public ValidationException(Throwable cause, String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs), cause);
    }
}
