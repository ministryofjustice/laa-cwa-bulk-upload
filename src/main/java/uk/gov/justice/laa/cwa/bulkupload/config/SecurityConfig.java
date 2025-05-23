package uk.gov.justice.laa.cwa.bulkupload.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2ClientCredentialsGrantRequest;
import org.springframework.security.oauth2.client.endpoint.RestClientClientCredentialsTokenResponseClient;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.web.client.RestClient;

/**
 * Security config for the application.
 */
@Configuration
@EnableWebSecurity
@Profile("!test")
public class SecurityConfig {
    /**
     * Rest client object.
     */
    private RestClient restClient;

    /**
     *  Initialize.
     */
    @PostConstruct
    void initialize() {
        this.restClient = RestClient.builder()
                .messageConverters((messageConverters) -> {
                    messageConverters.clear();
                    messageConverters.add(new FormHttpMessageConverter());
                    messageConverters.add(new OAuth2AccessTokenResponseHttpMessageConverter());
                })
                .defaultStatusHandler(new OAuth2ErrorResponseErrorHandler())
                .build();
    }

    /**
     * OAuth Access token.
     *
     */
    @Bean
    public OAuth2AccessTokenResponseClient<OAuth2ClientCredentialsGrantRequest> clientCredentialsAccessTokenResponseClient() {
        RestClientClientCredentialsTokenResponseClient accessTokenResponseClient =
                new RestClientClientCredentialsTokenResponseClient();
        accessTokenResponseClient.setRestClient(this.restClient);

        return accessTokenResponseClient;
    }

}
