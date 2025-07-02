package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaSubmissionResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import java.security.Principal;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Controller for handling the submission of bulk upload.
 */

@Slf4j
@RequiredArgsConstructor
@Controller
public class SubmissionController {

    @Value("${cwa-api.timeout}")
    private int cwaApiTimeout;

    private final CwaUploadService cwaUploadService;

    /**
     * Handles the submission of a file for bulk upload.
     * This method processes the file submission, validates it, and returns the results.
     *
     * @param fileId   the ID of the file to be submitted.
     * @param provider the provider to be used for the submission.
     * @param model    the model to be populated with providers and error messages.
     * @return the submission results page or an error page if validation fails.
     */
    @PostMapping("/submit")
    public String submitFile(String fileId, String provider, Model model, Principal principal, String selectedUser) {
        String username = getUsername(principal, selectedUser);

        CwaSubmissionResponseDto cwaSubmissionResponseDto;
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            Future<CwaSubmissionResponseDto> future = executor.submit(() -> cwaUploadService.processSubmission(fileId,
                    username, provider));
            cwaSubmissionResponseDto = future.get(cwaApiTimeout, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            // Handle timeout
            log.error("Submission timeout after {} secs with message {}", cwaApiTimeout, e.getMessage());
            model.addAttribute("fileId", fileId);
            return "pages/submission-timeout";
        } catch (Exception e) {
            // Handle other exceptions
            log.error("Submission error with message: {}", e.getMessage());
            return "pages/submission-failure";
        } finally {
            executor.shutdown();
        }

        try {
            List<CwaUploadSummaryResponseDto> summary = cwaUploadService.getUploadSummary(fileId, username, provider);
            model.addAttribute("summary", summary);
        } catch (Exception e) {
            log.error("Error retrieving upload summary: {}", e.getMessage());
            return "pages/submission-failure";
        }

        if (cwaSubmissionResponseDto == null || !"success".equalsIgnoreCase(cwaSubmissionResponseDto.getStatus())) {
            try {
                List<CwaUploadErrorResponseDto> errors = cwaUploadService.getUploadErrors(fileId, username, provider);
                model.addAttribute("errors", errors);
            } catch (Exception e) {
                log.error("Error retrieving upload errors: {}", e.getMessage());
                return "pages/submission-failure";
            }
        }
        return "pages/submission-results";
    }

    private String getUsername(Principal principal, String selectedUser) {
        // @TODO: Uncomment the line below when the principal is ready to use
        // String username = ((DefaultOidcUser) ((OAuth2AuthenticationToken) principal).getPrincipal())
        // .getIdToken().getClaims().get("name");

        // @TODO: revise when LASSIE is integrated
        return selectedUser;
    }

}

