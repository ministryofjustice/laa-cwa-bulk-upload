package uk.gov.justice.laa.cwa.bulkupload.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service class for getting an access token.
 */
@Service
public class TokenService {

    private final OAuth2AuthorizedClientManager authorizedClientManager;
    private OAuth2AccessToken accessToken;

    @Autowired
    public TokenService(OAuth2AuthorizedClientManager authorizedClientManager) {
        this.authorizedClientManager = authorizedClientManager;
    }

    /**
     * Get access token.
     *
     * @return the access token
     */
    public String getAccessToken() {
        if (accessToken != null && accessToken.getExpiresAt() != null
                && accessToken.getExpiresAt().isAfter(Instant.now().plusSeconds(60))) {
            return accessToken.getTokenValue();
        }

        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId("azure")
                .principal("service")
                .build();

        OAuth2AuthorizedClient authorizedClient = authorizedClientManager.authorize(authorizeRequest);
        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            throw new RuntimeException("Failed to obtain access token");
        }

        accessToken = authorizedClient.getAccessToken();
        return accessToken.getTokenValue();
    }
}
