package com.greentechinnovators.backend.security;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String secretKey;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public  String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return JWT.create()
                .withSubject(userPrincipal.getUsername())
                .withClaim("roles" , roles)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plusSeconds(jwtExpirationMs))
                .sign(Algorithm.HMAC256(secretKey));
    }


    public Boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            JWT.require(Algorithm.HMAC256(secretKey))
                    .build()
                    .verify(token);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
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
