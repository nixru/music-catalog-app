package com.musiccatalog;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class MusicCatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicCatalogApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        for (HttpMessageConverter<?> converter : restTemplate.getMessageConverters()) {
            if (converter instanceof MappingJackson2HttpMessageConverter jacksonConverter) {
                List<MediaType> supportedMediaTypes = new ArrayList<>(jacksonConverter.getSupportedMediaTypes());
                supportedMediaTypes.add(new MediaType("text", "javascript"));
                supportedMediaTypes.add(new MediaType("application", "javascript"));
                jacksonConverter.setSupportedMediaTypes(supportedMediaTypes);
            }
        }

        return restTemplate;
    }

    @Bean
    CommandLineRunner checkEntities(EntityManagerFactory emf) {
        return args -> {
            System.out.println("========== ENTITIES ==========");
            emf.getMetamodel().getEntities()
                    .forEach(e -> System.out.println(e.getName()));
            System.out.println("==============================");
        };
    }
}