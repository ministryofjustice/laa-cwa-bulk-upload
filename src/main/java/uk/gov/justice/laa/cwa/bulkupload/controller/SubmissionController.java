package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import uk.gov.justice.laa.cwa.bulkupload.response.SubmissionResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;
import org.springframework.ui.Model;

@Slf4j
@RequiredArgsConstructor
@Controller
public class SubmissionController {
    private final CwaUploadService cwaUploadService;

    /**
     * Handles the form submission for bulk upload.
     * This method will be called when the user submits the form.
     *
     * @return a redirect to a success page or an error page based on the submission result
     */
    @PostMapping("/submit")
    public String submitForm(String fileId, Model model) {
        // This method will handle the form submission logic
        // For now, we just log the submission and return a success view
        SubmissionResponseDto submissionResponseDto = cwaUploadService.submit(fileId, "TestUser");
        if (submissionResponseDto == null || !"success".equalsIgnoreCase(submissionResponseDto.getStatus())) {
            model.addAttribute("error", "Submission failed");
            log.error("Submission failed: {}", submissionResponseDto != null ? submissionResponseDto.getMessage() : "No response received");
            return "pages/submission-results"; // Redirect to an error page if submission fails
        }
        log.info("Form submitted successfully.");
        return "pages/submission-results"; // Redirect to a success page after submission
    }

}

