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
    private static final String MANAGER_ROLE = "MANAGER";

    private final JwtGatewayUtil jwtUtil;

    @Value("${gateway.internal.secret:bwc-secure-gateway}")
    private String internalSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String authHeader = resolveAuthHeader(exchange);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.debug("⚪ [Gateway] No token found for path: {}", path);
            return chain.filter(exchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        try {
            JWTClaimsSet claims = jwtUtil.parseToken(token);
            if (isUnauthorizedManagerAccess(path, claims)) {
                log.warn("🔴 [Gateway] Access denied for non-manager user at {}", path);
                return chain.filter(exchange);
            }

            ServerWebExchange mutated = enrichRequestWithUserHeaders(exchange, claims);
            return chain.filter(mutated);

        } catch (Exception e) {
            log.error("❌ [Gateway] Token parse failed: {}", e.getMessage(), e);
            return chain.filter(exchange);
        }
    }

    private String resolveAuthHeader(ServerWebExchange exchange) {
        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith(BEARER_PREFIX)) {
            return auth;
        }

        List<String> cookieHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.COOKIE);
        if (cookieHeaders != null) {
            for (String cookieHeader : cookieHeaders) {
                for (String cookiePair : cookieHeader.split(";")) {
                    String trimmed = cookiePair.trim();
                    if (trimmed.startsWith(AUTH_COOKIE)) {
                        return BEARER_PREFIX + trimmed.substring(AUTH_COOKIE.length());
                    }
                }
            }
        }
        return null;
    }

    private boolean isUnauthorizedManagerAccess(String path, JWTClaimsSet claims) throws Exception {
        List<String> roles = claims.getStringListClaim("roles");
        return path.startsWith("/api/manager/") && (roles == null || !roles.contains(MANAGER_ROLE));
    }

    private ServerWebExchange enrichRequestWithUserHeaders(ServerWebExchange exchange, JWTClaimsSet claims) throws Exception {
        String userId = claims.getSubject();
        String email = claims.getStringClaim("email");
        List<String> roles = claims.getStringListClaim("roles");

        return exchange.mutate()
                .request(r -> r.headers(headers -> {
                    headers.add("X-User-Id", userId);
                    headers.add("X-Internal-Gateway-Secret", internalSecret);
                    if (email != null) headers.add("X-User-Email", email);
                    if (roles != null && !roles.isEmpty()) {
                        headers.add("X-User-Roles", String.join(",", roles));
                    }
                }))
                .build();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
