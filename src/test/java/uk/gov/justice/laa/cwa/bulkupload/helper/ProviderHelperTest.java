package uk.gov.justice.laa.cwa.bulkupload.helper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ui.Model;
import uk.gov.justice.laa.cwa.bulkupload.response.VendorDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProviderHelperTest {

    private CwaUploadService cwaUploadService;
    private ProviderHelper providerHelper;
    private Model model;

    @BeforeEach
    void setUp() {
        cwaUploadService = mock(CwaUploadService.class);
        providerHelper = new ProviderHelper(cwaUploadService);
        model = mock(Model.class);
    }

    @Test
    void populateProviders_shouldAddProvidersToModel() {
        List<VendorDto> providers = List.of(new VendorDto());
        when(cwaUploadService.getProviders("TestUser")).thenReturn(providers);

        providerHelper.populateProviders(model);

        verify(cwaUploadService).getProviders("TestUser");
        verify(model).addAttribute("providers", providers);
    }

    @Test
    void populateProviders_shouldAddEmptyListIfNoProviders() {
        when(cwaUploadService.getProviders("TestUser")).thenReturn(Collections.emptyList());

        providerHelper.populateProviders(model);

        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(model).addAttribute(eq("providers"), captor.capture());
        assertThat(captor.getValue()).isEmpty();
    }

    @Test
    void constructor_shouldSetCwaUploadService() {
        assertThat(providerHelper).isNotNull();
    }
}