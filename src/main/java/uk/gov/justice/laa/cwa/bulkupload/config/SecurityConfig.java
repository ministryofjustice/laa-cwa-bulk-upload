package uk.gov.justice.laa.cwa.bulkupload.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;


/**
 * Security configuration for the Bulk Upload application. This configuration sets up basic
 * authentication with an in-memory user store.
 */
@Profile("!test") // disable security for test profile
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Creates an in-memory user details service with a single user.
     *
     * @return the UserDetailsService instance
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/assets/**", "/javascripts/**", "/stylesheets/**", "/webjars/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(Customizer.withDefaults());
        return http.build();

    }
}
