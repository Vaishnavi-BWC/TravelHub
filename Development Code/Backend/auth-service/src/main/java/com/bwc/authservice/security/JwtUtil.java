package com.bwc.authservice.security;

import com.bwc.authservice.security.exception.JwtGenerationException;
import com.bwc.authservice.security.exception.JwtValidationException;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.DirectDecrypter;
import com.nimbusds.jose.crypto.DirectEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
public class JwtUtil {

    private final byte[] aesKey; // 32 bytes = AES-256
    private final long expirationSeconds;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-seconds}") long expirationSeconds) {
        this.aesKey = Arrays.copyOf(secret.getBytes(StandardCharsets.UTF_8), 32);
        this.expirationSeconds = expirationSeconds;
    }

    /**
     * Generate AES-encrypted JWT (JWE) with extra info inside the payload
     */
    public String generateToken(String userId, String email, String department, Collection<String> roles) {
        try {
            Date now = new Date();
            Date exp = new Date(now.getTime() + expirationSeconds * 1000L);

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .jwtID(UUID.randomUUID().toString())
                    .subject(userId)
                    .claim("email", email)
                    .claim("department", department)
                    .claim("roles", roles)
                    .issueTime(now)
                    .expirationTime(exp)
                    .build();

            JWEHeader header = new JWEHeader.Builder(JWEAlgorithm.DIR, EncryptionMethod.A256GCM)
                    .contentType("JWT")
                    .build();

            EncryptedJWT jwt = new EncryptedJWT(header, claims);
            jwt.encrypt(new DirectEncrypter(aesKey));

            log.debug("JWT generated successfully for user: {}", userId);
            return jwt.serialize();

        } catch (JOSEException e) {
            log.error("Error generating JWT for user: {}", userId, e);
            throw new JwtGenerationException("Failed to generate encrypted token", e);
        }
    }

    /**
     * Decrypt and parse AES-encrypted JWT (JWE)
     */
    public JWTClaimsSet parseToken(String token) {
        try {
            EncryptedJWT jwt = EncryptedJWT.parse(token);
            jwt.decrypt(new DirectDecrypter(aesKey));
            return jwt.getJWTClaimsSet();

        } catch (JOSEException | java.text.ParseException e) {
            log.warn("Invalid or expired JWT: {}", e.getMessage());
            throw new JwtValidationException("Invalid or expired token", e);
        }
    }
}
