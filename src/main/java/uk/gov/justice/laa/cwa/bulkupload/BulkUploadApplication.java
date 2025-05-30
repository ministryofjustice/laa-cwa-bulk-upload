package uk.gov.justice.laa.cwa.bulkupload;

import jakarta.annotation.PostConstruct;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.security.Security;

/**
 * Entry point for the Bulk Upload application.
 */
@SpringBootApplication
@EnableCaching
public class BulkUploadApplication {
    /**
     * The application main method.
     *
     * @param args the application arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(BulkUploadApplication.class, args);
    }

    /**
     * Add BouncyCastle security provider.
     */
    @PostConstruct
    public void enableBouncyCastle() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

}
