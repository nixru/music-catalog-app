package com.musiccatalog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

public class ItunesDtos {

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItunesResponse {
        private int resultCount;
        private List<ItunesResult> results;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItunesResult {
        private Long collectionId;   // apple_catalog_id for albums
        private Long trackId;        // present for songs
        private Long artistId;
        private String artistName;
        private String collectionName; // album title
        private String trackName;      // song title
        private Double collectionPrice;
        private String releaseDate;    // ISO string, parse to LocalDate
        private Integer trackCount;
        private String primaryGenreName;
        private String artworkUrl100;
        private String wrapperType;
        private String collectionType;
    }
}
