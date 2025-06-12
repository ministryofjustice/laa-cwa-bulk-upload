package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import uk.gov.justice.laa.cwa.bulkupload.helper.ProviderHelper;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.ValidateResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import java.util.List;

/**
 * Controller for handling the submission of bulk upload.
 */

@Slf4j
@RequiredArgsConstructor
@Controller
public class SearchController {
    private final CwaUploadService cwaUploadService;
    private final ProviderHelper providerHelper;

    /**
     * Handles the searching of file id in bulk upload.
     * @param provider  the provider to be used for the search.
     * @param searchTerm the search term to be used for the search.
     * @param model the model to be populated with providers and error messages.
     * @return the upload page with providers or an error message if the provider is not selected.
     */
    @PostMapping("/search")
    public String submitForm( String provider, String searchTerm, Model model) {

        if (!StringUtils.hasText(provider)) {
            model.addAttribute("error", "Please select a provider");
            providerHelper.populateProviders(model);
            return "pages/upload";
        }
        if (!StringUtils.hasText(searchTerm)) {
            model.addAttribute("error", "Please enter file reference to search");
            providerHelper.populateProviders(model);
            return "pages/upload";
        }

        List<CwaUploadSummaryResponseDto> summary = cwaUploadService.getUploadSummary(searchTerm,"TestUser", provider);
        model.addAttribute("summary", summary);
        List<CwaUploadErrorResponseDto> errors = cwaUploadService.getUploadErrors(searchTerm,"TestUser", provider);
        model.addAttribute("errors", errors);
        log.info("File uploaded successfully with ID: {}", searchTerm);
        return "pages/submission-results"; // Redirect to a success page after submission
    }
}

