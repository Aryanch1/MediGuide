package com.aryanmouli.mediguide;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/explain — explains a medicine label in plain language.
 *
 * Live path: Gemini (key held server-side). If the key is not set or the
 * AI call fails, the endpoint still answers with the demo explanation
 * (source "demo") instead of failing — the app always says which mode
 * the answer came from.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExplainController {

  private final AiExplainer explainer;

  public ExplainController(AiExplainer explainer) {
    this.explainer = explainer;
  }

  @PostMapping("/explain")
  public ResponseEntity<?> explain(@RequestBody ExplainDtos.ExplainRequest request) {
    String labelText = request == null || request.labelText() == null
        ? "" : request.labelText().trim();
    if (labelText.isEmpty()) {
      return ResponseEntity.badRequest()
          .body(new ExplainDtos.ErrorResponse("labelText must not be empty"));
    }
    if (labelText.length() > 4000) {
      return ResponseEntity.badRequest()
          .body(new ExplainDtos.ErrorResponse("labelText is too long (max 4000 characters)"));
    }
    try {
      ExplainDtos.Explanation explanation = explainer.explain(labelText);
      return ResponseEntity.ok(new ExplainDtos.ExplainResponse(explanation));
    } catch (Exception e) {
      // Live AI unavailable — answer with the honest demo explanation.
      return ResponseEntity.ok(
          new ExplainDtos.ExplainResponse(LabelParser.demoExplanation(labelText)));
    }
  }
}
