package com.musiccatalog.controller;

import com.musiccatalog.dto.InsightsDtos.InsightsResponse;
import com.musiccatalog.dto.InsightsDtos.LibraryStats;
import com.musiccatalog.security.CurrentUserProvider;
import com.musiccatalog.service.AnalyticsService;
import com.musiccatalog.service.InsightsService;
import com.musiccatalog.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class AnalyticsController {

    private final LibraryService libraryService;
    private final AnalyticsService analyticsService;
    private final InsightsService insightsService;
    private final CurrentUserProvider currentUserProvider;

    // GET /api/library/stats - aggregate data for the charts
    @GetMapping("/stats")
    public ResponseEntity<LibraryStats> getStats() {
        var items = libraryService.getLibraryEntities(currentUserProvider.getCurrentUser());
        return ResponseEntity.ok(analyticsService.computeStats(items));
    }

    // GET /api/library/insights - AI-generated (or rule-based fallback) trend summary
    @GetMapping("/insights")
    public ResponseEntity<InsightsResponse> getInsights() {
        var items = libraryService.getLibraryEntities(currentUserProvider.getCurrentUser());
        LibraryStats stats = analyticsService.computeStats(items);
        String[] result = insightsService.generateSummary(stats); // [summary, source]
        return ResponseEntity.ok(new InsightsResponse(result[0], result[1], stats));
    }
}
