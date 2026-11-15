package com.aryanmouli.mediguide;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class LabelParserTest {

  @Test
  void threeTimesDailyGivesThreeTimes() {
    assertEquals(
        List.of("08:00", "14:00", "20:00"),
        LabelParser.parseTimesPerDay("Take one capsule three times daily."));
  }

  @Test
  void twiceDailyGivesMorningAndEvening() {
    assertEquals(
        List.of("08:00", "20:00"),
        LabelParser.parseTimesPerDay("Take 1 tablet twice a day with meals."));
  }

  @Test
  void fourTimesDailyGivesFourTimes() {
    assertEquals(
        List.of("08:00", "12:00", "16:00", "20:00"),
        LabelParser.parseTimesPerDay("Take 5 ml four times daily."));
  }

  @Test
  void onceDailyGivesOneMorningTime() {
    assertEquals(
        List.of("08:00"),
        LabelParser.parseTimesPerDay("Take 1 tablet once daily in the morning."));
  }

  @Test
  void doseParsingFindsTabletsAndPuffs() {
    assertEquals("1 tablet", LabelParser.parseDose("Take 1 tablet twice daily."));
    assertEquals("1–2 puffs", LabelParser.parseDose("Take 1–2 puffs as needed."));
    assertEquals("As directed", LabelParser.parseDose("Apply as directed."));
  }

  @Test
  void categoryGuessingPicksInhalerBeforeTablets() {
    assertEquals("inhaler", LabelParser.guessCategory("Salbutamol 100 mcg inhaler, 1-2 puffs."));
    assertEquals("liquid", LabelParser.guessCategory("Paracetamol 120 mg/5 ml syrup."));
    assertEquals("cream", LabelParser.guessCategory("Hydrocortisone 1% cream."));
    assertEquals("tablets", LabelParser.guessCategory("Amoxicillin 500 mg capsules."));
  }

  @Test
  void demoExplanationKeepsLabelSchedule() {
    var explanation = LabelParser.demoExplanation(
        "Amoxicillin 500 mg capsules. Take one capsule three times daily.");
    assertEquals("demo", explanation.source());
    assertEquals(List.of("08:00", "14:00", "20:00"), explanation.schedule());
    assertTrue(explanation.warnings().size() >= 2);
    assertEquals("tablets", explanation.category());
  }
}
