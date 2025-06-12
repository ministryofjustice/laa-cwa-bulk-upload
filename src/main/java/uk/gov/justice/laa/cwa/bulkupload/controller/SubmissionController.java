package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.ValidateResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

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
    private final CwaUploadService cwaUploadService;

    /**
     * Handles the submission of the file upload form.
     *
     * @param fileId   the ID of the file to be submitted.
     * @param provider the provider associated with the file.
     * @param model    the model to be populated with submission results.
     * @return the view name for submission results.
     */
    @PostMapping("/submit")
    public String submitFile(String fileId, String provider, Model model) {
        // This method will handle the form submission logic
        // For now, we just log the submission and return a success view
        ValidateResponseDto validateResponseDto = null;
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            Future<ValidateResponseDto> future = executor.submit(() -> cwaUploadService.processSubmission(fileId, "TestUser", provider));
            // Timeout after 5 seconds
            validateResponseDto = future.get(10, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            // Handle timeout
            model.addAttribute("fileId", fileId);
            return "pages/submission-timeout";
        } catch (Exception e) {
            // Handle other exceptions
            model.addAttribute("error", "An error occurred while processing the submission");
            return "pages/submission-failed";
        } finally {
            executor.shutdown();
        }
        List<CwaUploadSummaryResponseDto> summary = cwaUploadService.getUploadSummary(fileId,"TestUser", provider);
        model.addAttribute("summary", summary);
        if (validateResponseDto == null || !"success".equalsIgnoreCase(validateResponseDto.getStatus())) {
            List<CwaUploadErrorResponseDto> errors = cwaUploadService.getUploadErrors(fileId,"TestUser", provider);
            log.error("Validation failed: {}", validateResponseDto.getMessage());
            model.addAttribute("errors", errors);
        }
        return "pages/submission-results";// Redirect to a success page after submission
    }

}

