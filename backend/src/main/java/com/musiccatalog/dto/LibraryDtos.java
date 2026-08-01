package com.musiccatalog.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LibraryDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LibraryItemRequest {
        @NotNull(message = "appleCatalogId is required")
        private Long appleCatalogId;

        @NotBlank(message = "title is required")
        private String title;

        @NotBlank(message = "artistName is required")
        private String artistName;

        private String genre;

        private LocalDate releaseDate;

        @PositiveOrZero(message = "trackCount must be zero or positive")
        private Integer trackCount;

        private String artworkUrl;

        @Min(value = 1, message = "userRating must be between 1 and 5")
        @Max(value = 5, message = "userRating must be between 1 and 5")
        private Integer userRating;

        @Size(max = 2000, message = "userNotes must be under 2000 characters")
        private String userNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LibraryItemUpdateRequest {
        @Min(value = 1, message = "userRating must be between 1 and 5")
        @Max(value = 5, message = "userRating must be between 1 and 5")
        private Integer userRating;

        @Size(max = 2000, message = "userNotes must be under 2000 characters")
        private String userNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LibraryItemResponse {
        private Long id;
        private Long appleCatalogId;
        private String title;
        private String artistName;
        private String genre;
        private LocalDate releaseDate;
        private Integer trackCount;
        private String artworkUrl;
        private Integer userRating;
        private String userNotes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
