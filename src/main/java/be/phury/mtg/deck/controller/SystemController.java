package be.phury.mtg.deck.controller;

import be.phury.mtg.deck.ApiController;
import org.springframework.web.bind.annotation.RequestMapping;

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
