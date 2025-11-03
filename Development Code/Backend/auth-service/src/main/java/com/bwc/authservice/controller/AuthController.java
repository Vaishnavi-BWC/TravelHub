package com.bwc.authservice.controller;

import com.bwc.authservice.dto.AuthRequest;
import com.bwc.authservice.dto.AuthResponse;
import com.bwc.authservice.dto.UserRegistrationDTO;
import com.bwc.authservice.entity.AuthUser;
import com.bwc.authservice.security.JwtUtil;
import com.bwc.authservice.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService service;
    private final JwtUtil jwtUtil;

    // ✅ Constants to avoid literal duplication
    private static final String COOKIE_NAME = "auth_token";
//    private static final String DOMAIN = ".brainwaveconsulting.co.in";
    private static final String DOMAIN = "localhost";
    private static final String ROLES_CLAIM = "roles";

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest req, HttpServletResponse response) {
        AuthResponse resp = service.login(req);

        // ✅ Secure cookie creation
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, resp.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .domain(DOMAIN)
                .path("/")
                .maxAge(resp.getExpiresIn())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // ✅ Parse token for role info
        var claims = jwtUtil.parseToken(resp.getAccessToken());
        var roles = (List<String>) claims.getClaim(ROLES_CLAIM);
        String role = (roles != null && !roles.isEmpty()) ? roles.get(0) : "UNKNOWN";

        // ✅ Use logger instead of System.out
        log.info("✅ Cookie sent for domain: {}", DOMAIN);
        log.debug("✅ Set-Cookie Header: {}", cookie);

        return ResponseEntity.ok(Map.of("role", role));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthUser> register(@RequestBody UserRegistrationDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@CookieValue(name = COOKIE_NAME, required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            var claims = jwtUtil.parseToken(token);
            var roles = (List<String>) claims.getClaim(ROLES_CLAIM);
            Map<String, Object> user = Map.of(
                    "userId", claims.getSubject(),
                    "email", claims.getStringClaim("email"),
                    "department", claims.getStringClaim("department"),
                    ROLES_CLAIM, roles
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.warn("❌ Invalid or expired token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .domain(DOMAIN)
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        log.info("🚪 Logout cookie cleared for domain: {}", DOMAIN);
        return ResponseEntity.noContent().build();
    }
}
