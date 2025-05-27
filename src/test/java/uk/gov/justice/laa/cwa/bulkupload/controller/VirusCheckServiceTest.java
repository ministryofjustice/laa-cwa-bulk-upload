
package uk.gov.justice.laa.cwa.bulkupload.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import uk.gov.justice.laa.cwa.bulkupload.response.UploadResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.TokenService;
import uk.gov.justice.laa.cwa.bulkupload.service.VirusCheckService;

@ExtendWith(MockitoExtension.class)
class VirusCheckServiceTest {

    @Mock
    private RestClient restClient;

    @Mock
    private TokenService tokenService;

    private VirusCheckService virusCheckService;

    @BeforeEach
    void setUp() {
        virusCheckService = new VirusCheckService(restClient, tokenService);
    }

    @Test
    void shouldSuccessfullyCheckVirusInFile() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "test content".getBytes()
        );
        String mockToken = "mock-token";
        UploadResponseDto expectedResponse = new UploadResponseDto();

        RestClient.RequestBodyUriSpec requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec requestBodySpec = mock(RestClient.RequestBodySpec.class);
        RestClient.ResponseSpec responseSpec = mock(RestClient.ResponseSpec.class);

        when(tokenService.getAccessToken()).thenReturn(mockToken);
        when(restClient.put()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/virus_check_file")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.MULTIPART_FORM_DATA)).thenReturn(requestBodySpec);
        when(requestBodySpec.header("Authorization", "Bearer " + mockToken)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(MultiValueMap.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(UploadResponseDto.class)).thenReturn(expectedResponse);

        // When
        UploadResponseDto result = virusCheckService.checkVirus(file);

        // Then
        assertThat(result).isEqualTo(expectedResponse);
        verify(requestBodySpec).contentType(MediaType.MULTIPART_FORM_DATA);
        verify(requestBodySpec).header("Authorization", "Bearer " + mockToken);
        verify(requestBodySpec).body(any(MultiValueMap.class));
    }

    @Test
    void shouldHandleNullFile() {
        // When/Then
        assertThatThrownBy(() -> virusCheckService.checkVirus(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File cannot be null");
    }

    @Test
    void shouldHandleRestClientException() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "test content".getBytes()
        );

        RestClient.RequestBodyUriSpec requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec requestBodySpec = mock(RestClient.RequestBodySpec.class);

        when(tokenService.getAccessToken()).thenReturn("mock-token");
        when(restClient.put()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/virus_check_file")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(any(), any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(MultiValueMap.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve())
                .thenThrow(new RestClientException("Failed to connect to server"));

        // When/Then
        assertThatThrownBy(() -> virusCheckService.checkVirus(file))
                .isInstanceOf(RestClientException.class)
                .hasMessage("Failed to connect to server");
    }

    @Test
    void shouldHandleIOException() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "test content".getBytes()
        );

        RestClient.RequestBodyUriSpec requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec requestBodySpec = mock(RestClient.RequestBodySpec.class);

        when(tokenService.getAccessToken()).thenReturn("mock-token");
        when(restClient.put()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/virus_check_file")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(any(), any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(MultiValueMap.class)))
                .thenThrow(new IOException("Failed to read file"));

        // When/Then
        assertThatThrownBy(() -> virusCheckService.checkVirus(file))
                .isInstanceOf(IOException.class)
                .hasMessage("Failed to read file");
    }
}

