package com.aryanmouli.mediguide;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Calls Google Gemini (gemini-3.5-flash-lite) through the OpenAI-compatible
 * endpoint, asking for a plain-language explanation as strict JSON.
 *
 * The API key comes from the GEMINI_API_KEY environment variable only —
 * it never appears in code, the repo, or the app. When no key is set, or
 * the call fails, the caller falls back to the on-device demo explanation
 * instead of failing the request.
 */
@Service
public class GeminiClient implements AiExplainer {

  private static final String SYSTEM_PROMPT =
      "You explain medicine labels in simple plain language for patients and caregivers. "
          + "Reply with ONLY a JSON object, no markdown fences, no extra text, with exactly these fields: "
          + "medicineName (string), category (one of: tablets, liquid, cream, inhaler, vitamins, other), "
          + "purpose (1-2 simple sentences: what it is for), "
          + "howToTake (2-4 simple sentences: how to take it), "
          + "warnings (array of 2-4 short simple sentences), "
          + "schedule (array of daily times as 24-hour HH:MM strings, e.g. [\"08:00\",\"20:00\"]), "
          + "dose (short string like \"1 tablet\" or \"1-2 puffs\"). "
          + "Use short words a 12-year-old would understand. Never invent a dose or schedule the label "
          + "does not support; if the label is unclear, say so in howToTake and use the label's own wording.";

  private final String apiKey;
  private final String model;
  private final String baseUrl;
  private final HttpClient http;
  private final ObjectMapper mapper;

  // @Autowired is required: the class also has a package-private
  // 5-arg constructor (used by unit tests), so without it Spring
  // falls back to looking for a no-arg constructor and boot fails.
  @Autowired
  public GeminiClient(
      @Value("${mediguide.gemini.api-key:}") String apiKey,
      @Value("${mediguide.gemini.model:gemini-3.5-flash-lite}") String model,
      @Value("${mediguide.gemini.base-url:https://generativelanguage.googleapis.com/v1beta/openai/}")
          String baseUrl) {
    this(apiKey, model, baseUrl, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build(),
        new ObjectMapper());
  }

  GeminiClient(String apiKey, String model, String baseUrl, HttpClient http, ObjectMapper mapper) {
    this.apiKey = apiKey == null ? "" : apiKey.trim();
    this.model = model;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    this.http = http;
    this.mapper = mapper;
  }

  public boolean isConfigured() {
    return !apiKey.isBlank();
  }

  @Override
  public ExplainDtos.Explanation explain(String labelText) throws Exception {
    if (!isConfigured()) {
      throw new IllegalStateException("GEMINI_API_KEY is not set");
    }
    String body = mapper.writeValueAsString(new ChatRequest(
        model,
        List.of(
            new ChatMessage("system", SYSTEM_PROMPT),
            new ChatMessage("user", "Medicine label:\n" + labelText)),
        0.2));
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(baseUrl + "chat/completions"))
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + apiKey)
        .timeout(Duration.ofSeconds(30))
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build();
    HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() < 200 || response.statusCode() >= 300) {
      throw new IllegalStateException("Gemini returned HTTP " + response.statusCode());
    }
    JsonNode root = mapper.readTree(response.body());
    JsonNode content = root.path("choices").path(0).path("message").path("content");
    if (!content.isTextual()) {
      throw new IllegalStateException("Gemini returned no text content");
    }
    String json = content.asText().trim();
    // Tolerate models that wrap the JSON in markdown fences.
    if (json.startsWith("```")) {
      json = json.replaceFirst("(?s)^```(?:json)?\\s*", "").replaceFirst("(?s)\\s*```$", "");
    }
    JsonNode data = mapper.readTree(json);
    List<String> warnings = new ArrayList<>();
    data.path("warnings").forEach(w -> warnings.add(w.asText()));
    List<String> schedule = new ArrayList<>();
    data.path("schedule").forEach(s -> schedule.add(s.asText()));
    if (schedule.isEmpty()) {
      schedule.addAll(LabelParser.parseTimesPerDay(labelText));
    }
    return new ExplainDtos.Explanation(
        "live-" + LabelParser.slug(data.path("medicineName").asText("medicine"))
            + "-" + System.currentTimeMillis(),
        data.path("medicineName").asText(LabelParser.guessName(labelText)),
        labelText,
        data.path("category").asText(LabelParser.guessCategory(labelText)),
        data.path("purpose").asText(""),
        data.path("howToTake").asText(""),
        warnings,
        schedule,
        data.path("dose").asText(LabelParser.parseDose(labelText)),
        "live",
        System.currentTimeMillis());
  }

  private record ChatRequest(String model, List<ChatMessage> messages, double temperature) {}

  private record ChatMessage(String role, String content) {}
}
