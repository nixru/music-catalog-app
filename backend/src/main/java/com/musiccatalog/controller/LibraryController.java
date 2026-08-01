package com.musiccatalog.controller;

import com.musiccatalog.dto.LibraryDtos.*;
import com.musiccatalog.security.CurrentUserProvider;
import com.musiccatalog.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<LibraryItemResponse>> getLibrary() {
        return ResponseEntity.ok(libraryService.getLibrary(currentUserProvider.getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> addItem(@Valid @RequestBody LibraryItemRequest request) {
        LibraryItemResponse response = libraryService.addItem(currentUserProvider.getCurrentUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody LibraryItemUpdateRequest request) {
        return ResponseEntity.ok(libraryService.updateItem(currentUserProvider.getCurrentUser(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        libraryService.deleteItem(currentUserProvider.getCurrentUser(), id);
        return ResponseEntity.noContent().build();
    }
}
