package com.splitr.repository;

import com.splitr.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))" +
           " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> search(String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.id <> :excludeId")
    Page<User> findAllExcluding(UUID excludeId, Pageable pageable);
}
