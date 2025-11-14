package com.bwc.gateway.filter;

import com.bwc.gateway.security.JwtGatewayUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTH_COOKIE = "auth_token=";

    private final JwtGatewayUtil jwtUtil;

    @Value("${gateway.internal.secret:bwc-secure-gateway}")
    private String internalSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String authHeader = resolveAuthHeader(exchange);

        // 🟢 Skip JWT processing for internal service-to-service calls
        if (isInternalServiceCall(path) || authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.debug("⚪ [Gateway] No token or internal call for path: {}", path);
            
            // For internal calls, preserve existing headers and add gateway secret
            ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate();
            
            // Check if X-User-Id header already exists (from TRMS service)
            String existingUserId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (existingUserId != null && !existingUserId.isBlank()) {
                log.debug("🟢 [Gateway] Preserving existing X-User-Id header: {}", existingUserId);
                // Header will be preserved automatically since we're not removing it
            } else {
                log.debug("⚪ [Gateway] No existing X-User-Id header to preserve");
            }
            
            // Add gateway secret
            ServerHttpRequest mutatedRequest = requestBuilder
                    .header("X-Internal-Gateway-Secret", internalSecret)
                    .build();

            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
            return chain.filter(mutatedExchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        try {
            JWTClaimsSet claims = jwtUtil.parseToken(token);
            ServerWebExchange mutated = enrichRequestWithUserHeaders(exchange, claims);
            return chain.filter(mutated);

        } catch (Exception e) {
            log.error("❌ [Gateway] Token parse failed: {}", e.getMessage(), e);
            return chain.filter(exchange);
        }
    }

    private String resolveAuthHeader(ServerWebExchange exchange) {
        // Check Authorization header first
        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith(BEARER_PREFIX)) {
            return auth;
        }

        // Check cookies
        List<String> cookieHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.COOKIE);
        if (cookieHeaders != null) {
            for (String cookieHeader : cookieHeaders) {
                for (String cookiePair : cookieHeader.split(";")) {
                    String trimmed = cookiePair.trim();
                    if (trimmed.startsWith(AUTH_COOKIE)) {
                        String tokenValue = trimmed.substring(AUTH_COOKIE.length());
                        return BEARER_PREFIX + tokenValue;
                    }
                }
            }
        }
        return null;
    }

    private boolean isInternalServiceCall(String path) {
        return path.contains("/api/workflows/") && 
               (path.contains("/progress-to-travel-desk") || 
                path.contains("/initiate") ||
                path.contains("/submit"));
    }

    private ServerWebExchange enrichRequestWithUserHeaders(ServerWebExchange exchange, JWTClaimsSet claims) throws Exception {
        String userId = claims.getSubject();
        String email = claims.getStringClaim("email");
        List<String> roles = claims.getStringListClaim("roles");

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId != null ? userId : "")
                .header("X-Internal-Gateway-Secret", internalSecret)
                .header("X-User-Email", email != null ? email : "")
                .header("X-User-Roles", roles != null ? String.join(",", roles) : "")
                .build();

        return exchange.mutate().request(mutatedRequest).build();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}