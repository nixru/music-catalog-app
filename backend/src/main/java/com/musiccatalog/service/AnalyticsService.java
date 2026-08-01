package com.musiccatalog.service;

import com.musiccatalog.dto.InsightsDtos.ArtistCount;
import com.musiccatalog.dto.InsightsDtos.LibraryStats;
import com.musiccatalog.entity.LibraryItem;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    public LibraryStats computeStats(List<LibraryItem> items) {
        int total = items.size();

        List<LibraryItem> rated = items.stream()
                .filter(i -> i.getUserRating() != null)
                .toList();

        double avgRating = rated.isEmpty() ? 0.0 :
                rated.stream().mapToInt(LibraryItem::getUserRating).average().orElse(0.0);

        Map<String, Long> genreCounts = items.stream()
                .map(i -> Optional.ofNullable(i.getGenre()).filter(g -> !g.isBlank()).orElse("Unclassified"))
                .collect(Collectors.groupingBy(g -> g, LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> releasesByYear = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        i -> String.valueOf(i.getReleaseDate().getYear()),
                        TreeMap::new,
                        Collectors.counting()));

        Map<String, Long> ratingDistribution = new LinkedHashMap<>();
        for (int r = 1; r <= 5; r++) {
            final int rating = r; // lambdas require an effectively-final captured variable
            long count = items.stream().filter(i -> Objects.equals(i.getUserRating(), rating)).count();
            ratingDistribution.put(String.valueOf(rating), count);
        }

        List<ArtistCount> topArtists = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(8)
                .map(e -> new ArtistCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Map<String, Long> decadeCounts = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        i -> decadeLabel(i.getReleaseDate()),
                        TreeMap::new,
                        Collectors.counting()));

        return new LibraryStats(total, round(avgRating), rated.size(), genreCounts, releasesByYear,
                ratingDistribution, topArtists, decadeCounts);
    }

    private String decadeLabel(LocalDate date) {
        int decadeStart = (date.getYear() / 10) * 10;
        return decadeStart + "s";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
