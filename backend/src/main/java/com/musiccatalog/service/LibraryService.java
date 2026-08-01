package com.musiccatalog.service;

import com.musiccatalog.dto.LibraryDtos.*;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.exception.DuplicateResourceException;
import com.musiccatalog.exception.ResourceNotFoundException;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryItemRepository libraryItemRepository;

    public List<LibraryItemResponse> getLibrary(User user) {
        return libraryItemRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<LibraryItem> getLibraryEntities(User user) {
        return libraryItemRepository.findByUser(user);
    }

    public LibraryItemResponse addItem(User user, LibraryItemRequest request) {
        if (libraryItemRepository.existsByAppleCatalogIdAndUser(request.getAppleCatalogId(), user)) {
            throw new DuplicateResourceException(
                    "This album is already in your library (appleCatalogId=" + request.getAppleCatalogId() + ")");
        }

        LibraryItem item = LibraryItem.builder()
                .appleCatalogId(request.getAppleCatalogId())
                .title(request.getTitle())
                .artistName(request.getArtistName())
                .genre(request.getGenre())
                .releaseDate(request.getReleaseDate())
                .trackCount(request.getTrackCount())
                .artworkUrl(request.getArtworkUrl())
                .userRating(request.getUserRating())
                .userNotes(request.getUserNotes())
                .user(user)
                .build();

        return toResponse(libraryItemRepository.save(item));
    }

    public LibraryItemResponse updateItem(User user, Long id, LibraryItemUpdateRequest request) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found: " + id));

        if (request.getUserRating() != null) {
            item.setUserRating(request.getUserRating());
        }
        if (request.getUserNotes() != null) {
            item.setUserNotes(request.getUserNotes());
        }

        return toResponse(libraryItemRepository.save(item));
    }

    public void deleteItem(User user, Long id) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found: " + id));
        libraryItemRepository.delete(item);
    }

    private LibraryItemResponse toResponse(LibraryItem item) {
        return new LibraryItemResponse(
                item.getId(),
                item.getAppleCatalogId(),
                item.getTitle(),
                item.getArtistName(),
                item.getGenre(),
                item.getReleaseDate(),
                item.getTrackCount(),
                item.getArtworkUrl(),
                item.getUserRating(),
                item.getUserNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
