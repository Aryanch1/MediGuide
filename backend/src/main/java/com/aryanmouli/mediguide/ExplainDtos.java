package com.aryanmouli.mediguide;

import java.util.List;

/** Request/response shapes for POST /api/explain. Mirrors lib/types.ts. */
public final class ExplainDtos {

  private ExplainDtos() {}

  public record ExplainRequest(String labelText) {}

  public record Explanation(
      String id,
      String medicineName,
      String labelText,
      String category,
      String purpose,
      String howToTake,
      List<String> warnings,
      List<String> schedule,
      String dose,
      String source,
      long at) {}

  public record ExplainResponse(Explanation explanation) {}

  public record ErrorResponse(String message) {}
}
