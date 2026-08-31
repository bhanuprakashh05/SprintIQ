package com.sprintiq.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.List;
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // CORS preflight
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Login/Register
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // Project management
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/projects/**"
                        ).hasRole("ADMIN")

                        // Project members
                        // Project member management

.requestMatchers(
        HttpMethod.POST,
        "/api/projects/*/members/**"
).hasRole("ADMIN")

.requestMatchers(
        HttpMethod.DELETE,
        "/api/projects/*/members/**"
).hasRole("ADMIN")

.requestMatchers(
        HttpMethod.GET,
        "/api/projects/*/members/**"
).authenticated()

                        // Anyone authenticated can view projects
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projects/**"
                        ).authenticated()

                        // Users can be viewed by authenticated users
                        // ADMIN can create member accounts
.requestMatchers(
        HttpMethod.POST,
        "/api/users/members"
).hasRole("ADMIN")

// Other user information can be viewed by authenticated users
.requestMatchers(
        "/api/users/**"
).authenticated()
                        // Task management
.requestMatchers(
        HttpMethod.DELETE,
        "/api/tasks/**"
).hasRole("ADMIN")
// Sprint deletion - ADMIN only
.requestMatchers(
        HttpMethod.DELETE,
        "/api/sprints/**"
).hasRole("ADMIN")

                        // Everything else requires login
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}