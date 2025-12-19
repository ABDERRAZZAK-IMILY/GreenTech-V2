package com.greentechinnovators.backend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@Slf4j
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String secretKey;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        log.info("Generating token for user: {} with roles: {}", userPrincipal.getUsername(), roles);
        log.info("Token expiration: {} ms", jwtExpirationMs);

        return JWT.create()
                .withSubject(userPrincipal.getUsername())
                .withClaim("roles", roles)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plusMillis(jwtExpirationMs))
                .sign(Algorithm.HMAC256(secretKey));
    }

    public Boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            log.warn("Token is null or blank");
            return false;
        }

        try {
            JWT.require(Algorithm.HMAC256(secretKey))
                    .build()
                    .verify(token);
            log.debug("Token validated successfully");
            return true;
        } catch (JWTVerificationException e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error validating token: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return JWT.decode(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        return JWT.decode(token).getClaim("roles").asList(String.class);
    }
}
