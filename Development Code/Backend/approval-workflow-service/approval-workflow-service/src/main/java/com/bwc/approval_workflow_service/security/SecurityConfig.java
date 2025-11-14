package com.bwc.approval_workflow_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	private final GatewaySecurityFilter gatewaySecurityFilter;
	private final GatewayAuthHeaderVerifier gatewayAuthHeaderVerifier;
	private final CorsConfigurationSource corsConfigurationSource;

	public SecurityConfig(GatewaySecurityFilter gatewaySecurityFilter,
			GatewayAuthHeaderVerifier gatewayAuthHeaderVerifier, CorsConfigurationSource corsConfigurationSource) {
		this.gatewaySecurityFilter = gatewaySecurityFilter;
		this.gatewayAuthHeaderVerifier = gatewayAuthHeaderVerifier;
		this.corsConfigurationSource = corsConfigurationSource;
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource))
				.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// 🟢 Allow ALL OPTIONS requests for CORS preflight
						.requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll()

						// 🟢 Public endpoints (no auth)
						.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/swagger-ui.html",
								"/webjars/**", "/swagger-resources/**", "/management/**")
						.permitAll()

						// 🟢 Dashboard endpoints for all authenticated stakeholders
						.requestMatchers("/api/v1/dashboard/**")
						.hasAnyRole("MANAGER", "FINANCE", "HR", "TRAVEL_DESK", "ADMIN", "SERVICE")

						// 🟢 Workflow initiation endpoints (internal service calls + employees)
						.requestMatchers("/api/workflows/initiation/**")
						.hasAnyRole("SERVICE", "EMPLOYEE", "USER", "MANAGER", "FINANCE", "HR", "TRAVEL_DESK", "ADMIN")

						// 🟢 Allow workflow progression endpoints for internal service calls
						.requestMatchers("/api/workflows/*/progress-to-travel-desk")
						.hasAnyRole("SERVICE", "USER", "MANAGER", "TRAVEL_DESK")
						.requestMatchers("/api/workflows/initiate").hasAnyRole("SERVICE", "USER", "MANAGER")
						.requestMatchers("/api/workflows/initiate-with-travel-request")
						.hasAnyRole("SERVICE", "USER", "MANAGER").requestMatchers("/api/workflows/*/upload-booking")
						.hasAnyRole("SERVICE", "USER", "MANAGER", "TRAVEL_DESK")

						// 🟢 Role-based endpoints
						.requestMatchers("/api/manager/**").hasRole("MANAGER")
						.requestMatchers("/api/finance/**").hasRole("FINANCE")
						.requestMatchers("/api/hr/**").hasRole("HR")
						.requestMatchers("/api/travel-desk/**").hasRole("TRAVEL_DESK")
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
						// 🟡 Authenticated workflows - allow SERVICE role for internal calls
						.requestMatchers("/api/workflows/**")
						
						.hasAnyRole("SERVICE", "EMPLOYEE", "USER", "MANAGER", "FINANCE", "HR", "TRAVEL_DESK", "ADMIN")

						// 🔒 Everything else requires auth
						.anyRequest().authenticated())
				// 🧱 Filters order: Gateway → Auth Header → Rest
				.addFilterBefore(gatewaySecurityFilter, UsernamePasswordAuthenticationFilter.class)
				.addFilterAfter(gatewayAuthHeaderVerifier, GatewaySecurityFilter.class);

		return http.build();
	}
}