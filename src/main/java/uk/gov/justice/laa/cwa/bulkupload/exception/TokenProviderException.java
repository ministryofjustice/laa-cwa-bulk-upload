package uk.gov.justice.laa.cwa.bulkupload.exception;

/** The exception thrown from Token provider. */
public class TokenProviderException extends RuntimeException {

  public TokenProviderException(String message) {
    super(message);
  }
}
