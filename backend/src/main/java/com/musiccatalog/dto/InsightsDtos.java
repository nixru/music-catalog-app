package com.musiccatalog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class InsightsDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LibraryStats {
        private int totalAlbums;
        private double averageRating;      // across rated albums only
        private int ratedCount;
        private Map<String, Long> genreCounts;      // genre -> count
        private Map<String, Long> releasesByYear;    // year -> count
        private Map<String, Long> ratingDistribution; // "1".."5" -> count
        private List<ArtistCount> topArtists;         // sorted desc, top 8
        private Map<String, Long> decadeCounts;       // "1990s" -> count
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistCount {
        private String artistName;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightsResponse {
        private String summary;      // AI or rule-based natural language paragraph
        private String source;       // "llm" or "rule-based" - shown transparently in UI
        private LibraryStats stats;
    }
}
