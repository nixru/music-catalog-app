package com.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccatalog.dto.AuthDtos.AuthResponse;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.UserRepository;
import com.musiccatalog.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.client-id:}")
    private String googleClientId;

    /**
     Verifies a Google ID token by calling Google's tokeninfo endpoint (simplest
     approach - no extra SDK dependency needed). Confirms the token's audience
     matches our configured OAuth client ID, then finds or creates a local User
     record keyed by the verified email, and issues our own JWT so the rest of
     the app (JwtAuthFilter, protected endpoints, etc.) doesn't need to know
     Google was involved at all.
     */
    public AuthResponse authenticateWithGoogle(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException(
                    "Google sign-in is not configured on the server. Set google.client-id in application.properties.");
        }

        JsonNode payload = verifyIdToken(idToken);

        String audience = payload.path("aud").asText("");
        if (!googleClientId.equals(audience)) {
            throw new IllegalArgumentException("Google token was not issued for this application.");
        }

        boolean emailVerified = payload.path("email_verified").asBoolean(false);
        if (!emailVerified) {
            throw new IllegalArgumentException("Google account email is not verified.");
        }

        String email = payload.path("email").asText();

        User user = userRepository.findByUsername(email).orElseGet(() -> {
            User newUser = User.builder()
                    .username(email)
                    .password(null) // no local password - Google-only account
                    .authProvider("GOOGLE")
                    .build();
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(jwt, user.getUsername());
    }

    private JsonNode verifyIdToken(String idToken) {
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            String response = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(response);
        } catch (RestClientException e) {
            // Google returns 400 for an invalid/expired token, which RestTemplate surfaces as an exception.
            throw new IllegalArgumentException("Invalid or expired Google token.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not verify Google token.");
        }
    }
}