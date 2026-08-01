package com.musiccatalog.service;

import com.musiccatalog.dto.ItunesDtos.ItunesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class ItunesService {

    private final RestTemplate restTemplate;

    @Value("${itunes.base-url}")
    private String baseUrl;

    /**
     Searches the iTunes catalog. We focus on entity=album per project scope,
     but "type" is accepted for flexibility (album/song/musicArtist).
     */
    public ItunesResponse search(String query, String type, int limit) {
        String entity = mapEntity(type);

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/search")
                .queryParam("term", query)
                .queryParam("entity", entity)
                .queryParam("limit", limit)
                .toUriString();

        return restTemplate.getForObject(url, ItunesResponse.class);
    }

    private String mapEntity(String type) {
        if (type == null) return "album";
        return switch (type.toLowerCase()) {
            case "song" -> "song";
            case "artist" -> "musicArtist";
            default -> "album";
        };
    }
}
