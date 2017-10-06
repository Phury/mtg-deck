package be.phury.app.mtg.deck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Created by Phury
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/cards/**").allowedOrigins("http://localhost:8000");
            }
        };
    }

    /**
     * Heroku uses environment property PORT to set the port of the application.
     * Check if that variable is set, otherwise default to spring's configuration
     */
    @Configuration
    public class HerokuPortConfiguration {
        @Bean
        public EmbeddedServletContainerCustomizer containerCustomizer() {
            return (container -> {
                if (System.getenv("PORT") != null) container.setPort(Integer.parseInt(System.getenv("PORT")));
            });
        }
    }


//    @Configuration
//    public class StaticResourceConfiguration extends WebMvcConfigurerAdapter {
//        @Override
//        public void addResourceHandlers(ResourceHandlerRegistry registry) {
//            registry.addResourceHandler("/**").addResourceLocations("file:/www/");
//        }
//    }
}
