package be.phury.app.mtg.deck;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by Phury
 */
@ApiController
public class SystemController {

    @RequestMapping(path = "/")
    public String index() {
        return "Mtg card server, v0.1";
    }

    @RequestMapping(path = "/ping")
    public String ping() {
        return "pong";
    }

}
