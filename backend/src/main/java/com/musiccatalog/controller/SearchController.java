package com.musiccatalog.controller;

import com.musiccatalog.dto.ItunesDtos.ItunesResponse;
import com.musiccatalog.service.ItunesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ItunesService itunesService;

    // GET /api/search?query=abc&type=album&limit=25
    @GetMapping
    public ResponseEntity<ItunesResponse> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "album") String type,
            @RequestParam(defaultValue = "25") int limit) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query parameter must not be empty");
        }
        if (limit < 1 || limit > 200) {
            throw new IllegalArgumentException("limit must be between 1 and 200");
        }

        return ResponseEntity.ok(itunesService.search(query, type, limit));
    }
}
