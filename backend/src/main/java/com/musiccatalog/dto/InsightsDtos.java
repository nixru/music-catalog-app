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
        private double averageRating;      
        private int ratedCount;
        private Map<String, Long> genreCounts;      
        private Map<String, Long> releasesByYear;    
        private Map<String, Long> ratingDistribution; 
        private List<ArtistCount> topArtists;         
        private Map<String, Long> decadeCounts;       
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
        private String summary;      
        private String source;       
        private LibraryStats stats;
    }
}
