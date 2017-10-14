package be.phury.mtg.deck;

import java.text.MessageFormat;

/**
 * Created by Phury
 */
public class ConfigurationException extends RuntimeException {
    public ConfigurationException(String message, Object... messageArgs) {
        super(MessageFormat.format(message, messageArgs));
    }

    public ConfigurationException(Throwable cause) {
        super(cause);
    }
}
