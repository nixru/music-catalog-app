package com.musiccatalog;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EntityScan(basePackages = "com.musiccatalog.entity")
@EnableJpaRepositories(basePackages = "com.musiccatalog.repository")
public class MusicCatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicCatalogApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        for (HttpMessageConverter<?> converter : restTemplate.getMessageConverters()) {
            if (converter instanceof MappingJackson2HttpMessageConverter jacksonConverter) {
                List<MediaType> supportedMediaTypes =
                        new ArrayList<>(jacksonConverter.getSupportedMediaTypes());

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
            emf.getMetamodel()
                    .getEntities()
                    .forEach(entity -> System.out.println(entity.getName()));
            System.out.println("==============================");
        };
    }

    @Bean
    CommandLineRunner showJpaSettings(Environment env) {
        return args -> {
            System.out.println("========== JPA SETTINGS ==========");
            System.out.println("ddl-auto = "
                    + env.getProperty("spring.jpa.hibernate.ddl-auto"));
            System.out.println("generate-ddl = "
                    + env.getProperty("spring.jpa.generate-ddl"));
            System.out.println("==============================");
        };
    }
}