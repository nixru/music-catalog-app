package com.musiccatalog.repository;

import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {

    List<LibraryItem> findByUser(User user);

    Optional<LibraryItem> findByIdAndUser(Long id, User user);

    Optional<LibraryItem> findByAppleCatalogIdAndUser(Long appleCatalogId, User user);

    boolean existsByAppleCatalogIdAndUser(Long appleCatalogId, User user);
}
