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
        private Long collectionId;   
        private Long trackId;        
        private Long artistId;
        private String artistName;
        private String collectionName;
        private String trackName;    
        private Double collectionPrice;
        private String releaseDate;   
        private Integer trackCount;
        private String primaryGenreName;
        private String artworkUrl100;
        private String wrapperType;
        private String collectionType;
    }
}
