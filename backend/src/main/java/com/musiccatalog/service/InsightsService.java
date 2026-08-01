package com.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccatalog.dto.InsightsDtos.ArtistCount;
import com.musiccatalog.dto.InsightsDtos.LibraryStats;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.Map;

/**
 AI Feature: Trend summary.
 
 Generates a short natural-language paragraph describing patterns in the
 user's saved library (dominant genres, favorite decades, rating habits,
 most-collected artists).
 
 If `anthropic.api-key` is configured, this calls the Claude API for a
 genuinely LLM-generated summary. Without a key, it falls back to a
 deterministic rule-based summary built from the same stats - so the
 feature works out of the box with zero external dependencies, and can be
 upgraded to a live LLM call by just adding a key. The response tells the
 frontend which path was used via the "source" field, for transparency.
 */
@Service
@RequiredArgsConstructor
public class InsightsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    @Value("${anthropic.model:claude-3-5-haiku-20241022}")
    private String anthropicModel;

    public String[] generateSummary(LibraryStats stats) {
        if (stats.getTotalAlbums() == 0) {
            return new String[]{
                    "Your library is empty. Save a few albums and check back for insights into your taste.",
                    "rule-based"
            };
        }

        if (anthropicApiKey != null && !anthropicApiKey.isBlank()) {
            try {
                return new String[]{callClaude(stats), "llm"};
            } catch (Exception e) {
                // Fail gracefully to the rule-based summary rather than breaking the dashboard.
                return new String[]{buildRuleBasedSummary(stats), "rule-based (LLM call failed)"};
            }
        }

        return new String[]{buildRuleBasedSummary(stats), "rule-based"};
    }

    private String callClaude(LibraryStats stats) throws Exception {
        String prompt = buildPrompt(stats);

        Map<String, Object> body = Map.of(
                "model", anthropicModel,
                "max_tokens", 300,
                "messages", new Object[]{
                        Map.of("role", "user", "content", prompt)
                }
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        String rawResponse = restTemplate.postForObject(
                "https://api.anthropic.com/v1/messages", request, String.class);

        JsonNode root = objectMapper.readTree(rawResponse);
        return root.path("content").get(0).path("text").asText().trim();
    }

    private String buildPrompt(LibraryStats stats) {
        return "You are a music taste analyst. Based on this JSON summary of a user's saved album "
                + "library, write a warm, specific 3-4 sentence paragraph describing their taste and "
                + "listening patterns. Mention genres, eras/decades, and any standout artists by name. "
                + "Do not use bullet points, just flowing prose.\n\n"
                + toJson(stats);
    }

    private String toJson(LibraryStats stats) {
        try {
            return objectMapper.writeValueAsString(stats);
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     Deterministic, template-based summary built directly from the same
     aggregate stats used for the charts - no external dependency required.
     */
    private String buildRuleBasedSummary(LibraryStats stats) {
        StringBuilder sb = new StringBuilder();

        String topGenre = stats.getGenreCounts().entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        String topDecade = stats.getDecadeCounts().entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        ArtistCount topArtist = stats.getTopArtists().isEmpty() ? null : stats.getTopArtists().get(0);

        sb.append("Your library holds ").append(stats.getTotalAlbums())
                .append(stats.getTotalAlbums() == 1 ? " album" : " albums").append(". ");

        if (topGenre != null) {
            long count = stats.getGenreCounts().get(topGenre);
            long pct = Math.round(100.0 * count / stats.getTotalAlbums());
            sb.append(topGenre).append(" is your most-collected genre, making up about ")
                    .append(pct).append("% of your saved albums. ");
        }

        if (topDecade != null) {
            sb.append("You lean heavily toward music from the ").append(topDecade).append(". ");
        }

        if (topArtist != null && topArtist.getCount() > 1) {
            sb.append(topArtist.getArtistName()).append(" is your most-collected artist, with ")
                    .append(topArtist.getCount()).append(" albums saved. ");
        }

        if (stats.getRatedCount() > 0) {
            sb.append("You've rated ").append(stats.getRatedCount())
                    .append(stats.getRatedCount() == 1 ? " album" : " albums")
                    .append(" so far, averaging ").append(stats.getAverageRating()).append(" out of 5 stars.");
        } else {
            sb.append("Try rating a few albums to unlock more personalized insights.");
        }

        return sb.toString();
    }
}
