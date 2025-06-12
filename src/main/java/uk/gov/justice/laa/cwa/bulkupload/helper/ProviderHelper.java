package uk.gov.justice.laa.cwa.bulkupload.helper;

import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import uk.gov.justice.laa.cwa.bulkupload.response.VendorDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import java.util.List;

@Component
public class ProviderHelper {

    private final CwaUploadService cwaUploadService;

    public ProviderHelper(CwaUploadService cwaUploadService) {
        this.cwaUploadService = cwaUploadService;
    }

    public void populateProviders(Model model) {
        List<VendorDto> providers = cwaUploadService.getProviders("TestUser");
        model.addAttribute("providers", providers);
    }
}