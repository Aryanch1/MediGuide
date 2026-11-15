package com.aryanmouli.mediguide;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Pure label parsing — no network, fully unit-tested.
 *
 * Turns the wording on a medicine label ("take one tablet three times
 * daily", "1–2 tablets every 4–6 hours") into a daily schedule, a dose
 * string, and a best-guess medicine form. The same rules power the
 * app's on-device demo mode, so live and demo answers agree on shape.
 */
public final class LabelParser {

  private LabelParser() {}

  /** Suggested daily times (24-hour clock) from the label wording. */
  public static List<String> parseTimesPerDay(String labelText) {
    String hay = labelText.toLowerCase(Locale.ROOT);
    if (hay.contains("four times") || hay.contains("4 times")
        || hay.contains("qid") || hay.contains("q.i.d")) {
      return List.of("08:00", "12:00", "16:00", "20:00");
    }
    if (hay.contains("three times") || hay.contains("3 times")
        || hay.contains("tid") || hay.contains("t.i.d")
        || hay.contains("thrice")) {
      return List.of("08:00", "14:00", "20:00");
    }
    if (hay.contains("twice") || hay.contains("two times") || hay.contains("2 times")
        || hay.contains("bid") || hay.contains("b.i.d")) {
      return List.of("08:00", "20:00");
    }
    if (hay.contains("every 4") || hay.contains("every four")
        || hay.contains("4-6 hours") || hay.contains("every 6") || hay.contains("every six")) {
      return List.of("08:00", "14:00", "20:00");
    }
    if (hay.contains("once daily") || hay.contains("once a day") || hay.contains("daily")
        || hay.contains("every day") || hay.contains("as needed") || hay.contains("when needed")
        || hay.contains("prn")) {
      return List.of("08:00");
    }
    return List.of("08:00");
  }

  /** Dose text such as "1 tablet" or "1–2 puffs", or "As directed". */
  public static String parseDose(String labelText) {
    var matcher = java.util.regex.Pattern.compile(
            "(\\d+(?:[–-]\\d+)?)\\s*(tablets?|capsules?|puffs?|ml|drops?|sprays?)",
            java.util.regex.Pattern.CASE_INSENSITIVE)
        .matcher(labelText);
    if (matcher.find()) {
      String unit = matcher.group(2).toLowerCase(Locale.ROOT);
      return matcher.group(1) + " " + unit;
    }
    return "As directed";
  }

  /** Best-guess medicine form from the label wording. */
  public static String guessCategory(String labelText) {
    String hay = labelText.toLowerCase(Locale.ROOT);
    if (hay.contains("inhaler") || hay.contains("puff")) return "inhaler";
    if (hay.contains("syrup") || hay.contains("suspension") || hay.contains("drops")
        || hay.contains("liquid") || hay.contains("solution") || hay.contains(" ml")) {
      return "liquid";
    }
    if (hay.contains("cream") || hay.contains("ointment") || hay.contains("gel")
        || hay.contains("lotion") || hay.contains("topical")) {
      return "cream";
    }
    if (hay.contains("vitamin") || hay.contains("supplement") || hay.contains("calcium")
        || hay.contains("zinc")) {
      return "vitamins";
    }
    if (hay.contains("tablet") || hay.contains("capsule") || hay.contains("pill")
        || hay.contains("mg")) {
      return "tablets";
    }
    return "other";
  }

  /** First sentence of the label as a display name, or a fallback. */
  public static String guessName(String labelText) {
    String first = labelText.split("[.\\n]")[0].trim();
    if (first.length() > 4 && first.length() < 80) return first;
    return "Your medicine";
  }

  /** Slug for stable explanation ids. */
  public static String slug(String text) {
    String s = text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    return s.length() > 48 ? s.substring(0, 48) : s;
  }

  /**
   * Generic demo-style explanation for a label the AI did not answer —
   * honest about its limits, with the schedule parsed from the label.
   */
  public static ExplainDtos.Explanation demoExplanation(String labelText) {
    List<String> schedule = parseTimesPerDay(labelText);
    String timesWord = schedule.size() == 1 ? "once a day" : schedule.size() + " times a day";
    return new ExplainDtos.Explanation(
        "demo-" + slug(guessName(labelText)) + "-" + System.currentTimeMillis(),
        guessName(labelText),
        labelText,
        guessCategory(labelText),
        "This looks like a medicine label. The exact purpose is not in the built-in library, "
            + "so check the box or ask your pharmacist what this medicine is for.",
        "The label says to take it " + timesWord + ". Follow the times below, take it exactly "
            + "as the label says, and do not take extra doses to catch up if you miss one — "
            + "ask your pharmacist what to do.",
        List.of(
            "Read the whole label and the leaflet inside the box.",
            "Tell your doctor or pharmacist about every other medicine you take.",
            "If you notice a new rash, swelling or trouble breathing, get urgent help."),
        new ArrayList<>(schedule),
        parseDose(labelText),
        "demo",
        System.currentTimeMillis());
  }
}
