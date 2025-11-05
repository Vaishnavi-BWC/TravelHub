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
        
        // 🟢 Skip authentication setup for public endpoints
        if (isPublicEndpoint(path)) {
            log.debug("[Workflow] Skipping auth setup for public endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        // 🟢 Handle internal service calls for workflow progression
        if (isWorkflowProgressionCall(path)) {
            log.debug("[Workflow] Internal service call for workflow progression - setting service authentication");
            
            // For internal calls, set a SERVICE role authentication
            String userId = request.getHeader("X-User-Id");
            if (userId != null) {
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SERVICE"));
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            "service-" + userId, // Use service prefix to distinguish
                            null, 
                            authorities
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("[Workflow] Set service authentication for internal call from user: {}", userId);
            } else {
                // If no user ID, still set basic service authentication
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SERVICE"));
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            "internal-service", 
                            null, 
                            authorities
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("[Workflow] Set generic service authentication for internal call");
            }
            
            filterChain.doFilter(request, response);
            return;
        }

        String rolesHeader = request.getHeader("X-User-Roles");
        String userId = request.getHeader("X-User-Id");
        String userEmail = request.getHeader("X-User-Email");

        // 🟢 DEBUG LOGS
        log.debug("[Workflow] Path: {}", path);
        log.debug("[Workflow] Received X-User-Id: {}", userId);
        log.debug("[Workflow] Received X-User-Email: {}", userEmail);
        log.debug("[Workflow] Received X-User-Roles: {}", rolesHeader);

        // For other internal service calls (no user context), set service authentication
        if (userId == null && rolesHeader == null) {
            log.debug("[Workflow] No user context - setting service authentication for internal call");
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SERVICE"));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken("internal-service", null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
            return;
        }

        // If we have user info but missing roles, create basic USER authentication
        if (userId != null && rolesHeader == null) {
            log.warn("[Workflow] User ID present but no roles - creating basic USER authentication");
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("[Workflow] Set basic authentication for user: {}", userId);
            filterChain.doFilter(request, response);
            return;
        }

        if (rolesHeader != null && !rolesHeader.trim().isEmpty()) {
            List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .toList();

            // Create authentication token with principal as user ID
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("[Workflow] Security context set for user: {} with authorities: {}", userId, authorities);
        } else {
            log.warn("[Workflow] No valid roles - setting anonymous authentication");
            // Ensure we have at least anonymous authentication
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken("anonymous", null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
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

    private boolean isWorkflowProgressionCall(String path) {
        return path.contains("/api/workflows/") && 
               (path.contains("/progress-to-travel-desk") || 
                path.contains("/initiate") ||
                path.contains("/submit") ||
                path.contains("/advance") ||
                path.contains("/complete") ||
                path.contains("/reject"));
    }
}