package com.musiccatalog.security;

import com.musiccatalog.entity.User;
import com.musiccatalog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Google-only accounts have no local password. Use a bcrypt-formatted
        // placeholder that can never match any real input, so a local login
        // attempt fails cleanly (401) instead of throwing on a null/invalid hash.
        String passwordHash = user.getPassword() != null
                ? user.getPassword()
                : "$2a$10$" + "x".repeat(53); // valid-looking bcrypt shape, unmatchable

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(passwordHash)
                .authorities("USER")
                .build();
    }
}
