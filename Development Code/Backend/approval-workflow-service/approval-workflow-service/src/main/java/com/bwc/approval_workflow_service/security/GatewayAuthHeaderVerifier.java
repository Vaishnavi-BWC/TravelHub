package com.bwc.approval_workflow_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@Order(2)
public class GatewayAuthHeaderVerifier extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String rolesHeader = request.getHeader("X-User-Roles");
        String userId = request.getHeader("X-User-Id");
        String userEmail = request.getHeader("X-User-Email");

        log.debug("[Workflow] Path: {}", path);
        log.debug("[Workflow] Received X-User-Id: {}", userId);
        log.debug("[Workflow] Received X-User-Roles: {}", rolesHeader);

        if (userId != null && rolesHeader != null) {
            List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                    .toList();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("[Workflow] Security context set for user: {} with authorities: {}", userId, authorities);
        } else {
            log.warn("[Workflow] No valid user context - setting anonymous authentication");
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken("anonymous", null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/swagger-ui") || 
               path.startsWith("/v3/api-docs") || 
               path.startsWith("/api-docs") ||
               path.equals("/swagger-ui.html") ||
               path.startsWith("/webjars/") ||
               path.startsWith("/swagger-resources") ||
               path.startsWith("/management/");
    }
}