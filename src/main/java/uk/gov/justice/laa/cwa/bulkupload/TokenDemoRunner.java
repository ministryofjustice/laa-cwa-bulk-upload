package uk.gov.justice.laa.cwa.bulkupload;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import uk.gov.justice.laa.cwa.bulkupload.service.TokenService;

@Component
public class TokenDemoRunner implements CommandLineRunner {

    private final TokenService tokenService;

    @Autowired
    public TokenDemoRunner(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Get access token from Entra ID");

        try {
            String accessToken = tokenService.getAccessToken();
            System.out.println("Access token: " + accessToken);
        } catch (Exception e) {
            System.err.println("Error obtaining token: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
