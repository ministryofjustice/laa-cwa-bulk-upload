package uk.gov.justice.laa.cwa.bulkupload.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * Security config for the application.
 */
@Profile("!test") // disable security for test profile
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Security filter for application request.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .saml2Login(withDefaults());

        return http.build();
    }
}