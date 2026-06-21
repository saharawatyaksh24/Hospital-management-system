package com.hms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * DELIBERATELY MINIMAL. Everything is open right now so you can build and
 * test CRUD endpoints without fighting auth first.
 *
 * TODO (do this yourself, as its own module, after CRUD + appointments work):
 *  1. Add a User entity with a role field (ADMIN / DOCTOR / PATIENT).
 *  2. Add login + JWT (or session) authentication.
 *  3. Replace anyRequest().permitAll() below with real rules, e.g.
 *     .requestMatchers("/api/admin/**").hasRole("ADMIN")
 *     .requestMatchers("/api/doctors/**").hasAnyRole("ADMIN","DOCTOR")
 *  Do not skip this step - "Patient/doctor CRUD... validation" in your
 *  brief implies access control, not just open endpoints.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
